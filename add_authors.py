#!/usr/bin/env python3
"""
add_authors.py — BangleApps metadata.json author backfiller
============================================================
For every app in the 'apps/' directory that has a metadata.json,
finds the *first* git commit that touched that app folder, looks up
the committer's *current* GitHub username via the public API (no key
needed), and writes  "author": "<username>"  into metadata.json.

Rules:
  • NEVER writes a real name — only the GitHub login (username).
  • If a user has since renamed their GitHub account, the API returns
    the new username automatically.
  • Already-present "author" fields are skipped by default (use
    --force to overwrite).
  • The public GitHub API allows 60 unauthenticated requests/hour;
    the script auto-throttles and waits if it hits the rate limit.
  • A local cache file (.author_cache.json) saves sha→username
    mappings so re-runs don't repeat API calls.

Usage:
    python3 add_authors.py [--dry-run] [--force] [--apps APP [APP ...]]

Options:
    --dry-run           Print what would be done; don't write any files.
    --force             Overwrite existing "author" values.
    --apps APP [APP …]  Process only the listed app folder names.
    --cache FILE        Path to the sha→username cache (default: .author_cache.json).
"""

import argparse
import json
import os
import re
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


def _make_ssl_context() -> ssl.SSLContext:
    """
    Build an SSL context that works on macOS python.org builds,
    which ship without system CA certificates bundled.
    Priority:
      1. certifi (if installed: pip install certifi)
      2. macOS built-in certificate installer
         (/Applications/Python 3.x/Install Certificates.command)
      3. Fallback: trust the OS keychain via create_default_context()
    """
    # Try certifi first — most reliable cross-platform fix
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
        return ctx
    except ImportError:
        pass

    # Try the default context; on macOS with the cert installer this just works
    ctx = ssl.create_default_context()
    if ctx.verify_mode == ssl.CERT_REQUIRED:
        try:
            # Probe a well-known host to see if certs actually work
            import socket
            with socket.create_connection(("api.github.com", 443), timeout=5) as sock:
                with ctx.wrap_socket(sock, server_hostname="api.github.com"):
                    pass
            return ctx
        except ssl.SSLError:
            pass

    # Last resort: disable verification with a loud warning
    print(
        "⚠️  WARNING: SSL certificate verification is DISABLED.\n"
        "   Install certifi to fix this properly:\n"
        "     pip3 install certifi\n"
        "   Or run the macOS cert installer:\n"
        "     open /Applications/Python\\ 3.*/Install\\ Certificates.command\n",
        file=sys.stderr,
    )
    ctx = ssl._create_unverified_context()  # noqa: SLF001
    return ctx


_SSL_CONTEXT = _make_ssl_context()

# ─── Helpers ────────────────────────────────────────────────────────────────

def run(cmd, **kwargs):
    return subprocess.run(cmd, capture_output=True, text=True, **kwargs)

def get_repo_root():
    r = run(['git', 'rev-parse', '--show-toplevel'])
    if r.returncode != 0:
        sys.exit("ERROR: Not inside a git repository.")
    return Path(r.stdout.strip())

def get_remote_url():
    r = run(['git', 'remote', 'get-url', 'origin'])
    if r.returncode != 0:
        sys.exit("ERROR: No 'origin' remote found. Is this a GitHub clone?")
    return r.stdout.strip()

def parse_github_owner_repo(url):
    """
    Handles:
      https://github.com/owner/repo.git
      git@github.com:owner/repo.git
    """
    patterns = [
        r'https://github\.com/([^/]+)/([^/.]+?)(?:\.git)?$',
        r'git@github\.com:([^/]+)/([^/.]+?)(?:\.git)?$',
    ]
    for pat in patterns:
        m = re.match(pat, url)
        if m:
            return m.group(1), m.group(2)
    sys.exit(
        f"ERROR: Cannot parse a GitHub owner/repo from remote URL:\n  {url}\n"
        "Make sure 'origin' points to a GitHub repository."
    )

def first_commit_sha(app_path_rel: str) -> str | None:
    """Return the SHA of the very first commit that touched app_path_rel."""
    r = run(['git', 'log', '--reverse', '--format=%H', '--', app_path_rel])
    lines = r.stdout.strip().splitlines()
    return lines[0] if lines else None

# ─── GitHub API ─────────────────────────────────────────────────────────────

def api_get(url: str) -> dict | None:
    """
    GET a GitHub API URL, honouring rate-limit headers.
    Returns parsed JSON or None on 404.
    Raises on other errors.
    """
    headers = {
        'User-Agent': 'BangleApps-Author-Script/1.0',
        'Accept': 'application/vnd.github+json',
    }
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    while True:
        try:
            with urllib.request.urlopen(req, timeout=15, context=_SSL_CONTEXT) as resp:
                remaining = int(resp.headers.get('X-RateLimit-Remaining', 1))
                if remaining == 0:
                    reset_ts = int(resp.headers.get('X-RateLimit-Reset', time.time() + 61))
                    wait = max(reset_ts - int(time.time()) + 2, 1)
                    print(f"  ⏳ Rate limit hit — waiting {wait}s …")
                    time.sleep(wait)
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code in (403, 429):
                reset_ts = int(e.headers.get('X-RateLimit-Reset', time.time() + 61))
                wait = max(reset_ts - int(time.time()) + 2, 1)
                print(f"  ⏳ Rate-limited (HTTP {e.code}) — waiting {wait}s …")
                time.sleep(wait)
                # retry
            else:
                raise

def github_username_for_sha(owner: str, repo: str, sha: str) -> str | None:
    """
    Return the *current* GitHub login for the author of 'sha'.
    GitHub resolves the login against the current account, so renamed
    users automatically get their new username here.
    Never returns a real name — only the login field.
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    data = api_get(url)
    if not data:
        return None

    # Prefer commit author; fall back to committer (e.g. web-flow merges)
    for role in ('author', 'committer'):
        user_block = data.get(role)          # top-level GitHub user object
        if user_block and user_block.get('login'):
            login = user_block['login']
            # Hard safety: reject anything that looks like a real name
            # (GitHub logins cannot contain spaces; real names often do)
            if ' ' not in login:
                return login

    return None

# ─── JSON helpers ────────────────────────────────────────────────────────────

def read_file(path: Path) -> str | None:
    try:
        return path.read_text(encoding='utf-8')
    except OSError as e:
        print(f"  ⚠️  Cannot read file ({e}) — skipping")
        return None

def validate_json(text: str) -> dict | None:
    """Parse JSON just for validation/field-checking; we never write from this dict."""
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"  ⚠️  Invalid JSON ({e}) — skipping")
        return None

def remove_existing_author(text: str) -> str:
    """Strip an existing \"author\": \"...\" field from raw JSON text (for --force)."""
    # Trailing-comma form:  ,\n  "author": "..."
    result = re.sub(r',[ \t]*\n[ \t]*"author"\s*:\s*"[^"]*"', '', text)
    if result != text:
        return result
    # Leading-comma form:  "author": "...",\n
    result = re.sub(r'[ \t]*"author"\s*:\s*"[^"]*",[ \t]*\n', '', text)
    if result != text:
        return result
    # No-comma form (sole field)
    return re.sub(r'[ \t]*"author"\s*:\s*"[^"]*"', '', text)

def append_author(text: str, username: str) -> str:
    """
    Append  "author": "<username>"  as the last field before the closing brace,
    preserving every byte of the original file's formatting.
    """
    indent = '  '  # sensible default
    m = re.search(r'\n([ \t]+)"', text)
    if m:
        indent = m.group(1)

    last_brace = text.rfind('}')
    before = text[:last_brace].rstrip()
    after  = text[last_brace:]

    comma = '' if before.endswith(',') else ','
    return f'{before}{comma}\n{indent}"author": "{username}"\n{after}'

# ─── Cache ──────────────────────────────────────────────────────────────────

class ShaCache:
    def __init__(self, path: Path):
        self.path = path
        self.data: dict[str, str | None] = {}
        if path.exists():
            try:
                with open(path) as f:
                    self.data = json.load(f)
            except Exception:
                pass  # corrupt cache → start fresh

    def get(self, sha: str) -> str | None | bool:
        """
        Returns the cached login, or False when the sha isn't cached yet.
        Cached None means 'we tried but couldn't get a username'.
        """
        return self.data[sha] if sha in self.data else False

    def set(self, sha: str, login: str | None):
        self.data[sha] = login
        try:
            with open(self.path, 'w') as f:
                json.dump(self.data, f, indent=2)
        except Exception:
            pass  # non-fatal

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--dry-run', action='store_true', help="Show changes without writing files")
    parser.add_argument('--force', action='store_true', help="Overwrite existing 'author' values")
    parser.add_argument('--apps', nargs='+', metavar='APP', help="Process only these app folder names")
    parser.add_argument('--token', metavar='TOKEN', help="GitHub personal access token (or set GITHUB_TOKEN env var). No scopes needed for public repos.")
    parser.add_argument('--cache', default='.author_cache.json', metavar='FILE', help="sha→username cache file (default: .author_cache.json)")
    args = parser.parse_args()

    repo_root = get_repo_root()
    os.chdir(repo_root)  # all git commands run from here

    apps_dir = repo_root / 'apps'
    if not apps_dir.exists():
        sys.exit(f"ERROR: 'apps/' directory not found under {repo_root}")

    remote_url = get_remote_url()
    owner, repo_name = parse_github_owner_repo(remote_url)
    print(f"📦 Repository : {owner}/{repo_name}")
    print(f"🗂  Apps dir   : {apps_dir}")
    if args.dry_run:
        print("🔍 DRY RUN — no files will be written\n")

    cache = ShaCache(repo_root / args.cache)

    # Discover apps
    if args.apps:
        app_dirs = [apps_dir / a for a in args.apps]
        missing = [d for d in app_dirs if not d.is_dir()]
        if missing:
            sys.exit(f"ERROR: App directories not found: {[str(d) for d in missing]}")
    else:
        app_dirs = sorted(d for d in apps_dir.iterdir() if d.is_dir())

    app_dirs = [d for d in app_dirs if (d / 'metadata.json').exists()]
    print(f"🔎 Apps with metadata.json : {len(app_dirs)}")
    # Resolve token: --token flag wins, then GITHUB_TOKEN env var
    token = args.token or os.environ.get('GITHUB_TOKEN')
    if token:
        os.environ['GITHUB_TOKEN'] = token  # api_get reads from here
        print("🔑 GitHub token set — 5,000 req/hour limit\n")
    else:
        print("⚠️  No token — limited to 60 req/hour (script will pause when the ceiling is hit)")
        print("   Pass one with: --token ghp_yourtoken")
        print("   (No scopes needed for public repos)\n")

    stats = {'updated': 0, 'skipped_exists': 0, 'skipped_no_sha': 0, 'skipped_no_user': 0, 'skipped_invalid': 0}
    # No artificial throttle — the script respects X-RateLimit-* headers instead

    for app_dir in app_dirs:
        app_name = app_dir.name
        metadata_path = app_dir / 'metadata.json'

        raw = read_file(metadata_path)
        if raw is None:
            stats['skipped_invalid'] += 1
            print(f"[SKIP ⚠️ ] {app_name}")
            continue

        metadata = validate_json(raw)
        if metadata is None:
            stats['skipped_invalid'] += 1
            print(f"[SKIP ⚠️ ] {app_name}")
            continue

        if 'author' in metadata and not args.force:
            stats['skipped_exists'] += 1
            print(f"[SKIP ✓] {app_name}  (author already = '{metadata['author']}')")
            continue

        # First commit SHA for this app
        sha = first_commit_sha(f"apps/{app_name}")
        if not sha:
            stats['skipped_no_sha'] += 1
            print(f"[SKIP ❓] {app_name}  (no commits found in git log)")
            continue

        # Lookup username (with cache)
        cached = cache.get(sha)
        if cached is not False:
            username = cached
        else:
            username = github_username_for_sha(owner, repo_name, sha)
            cache.set(sha, username)

        if not username:
            stats['skipped_no_user'] += 1
            print(f"[FAIL ❌] {app_name}  (commit {sha[:8]} has no associated GitHub account)")
            continue

        # Sanity check: must be a valid GitHub username (no spaces, no real names)
        if re.search(r'\s', username):
            stats['skipped_no_user'] += 1
            print(f"[FAIL ❌] {app_name}  (resolved value '{username}' looks like a real name — skipping)")
            continue

        # Build updated raw text — strip existing author if --force, then append
        updated_raw = remove_existing_author(raw) if 'author' in metadata else raw
        updated_raw = append_author(updated_raw, username)

        action = "WOULD SET" if args.dry_run else "SET"
        existing_note = f" (was '{metadata['author']}')" if 'author' in metadata else ""
        print(f"[{action} ✅] {app_name}  →  author = \"{username}\"{existing_note}")

        if not args.dry_run:
            metadata_path.write_text(updated_raw, encoding='utf-8')
        stats['updated'] += 1

    # Summary
    print(f"""
{'─'*55}
Results
  ✅  Updated / would update : {stats['updated']}
  ✓   Already had author      : {stats['skipped_exists']}
  ❓  No commits in git log   : {stats['skipped_no_sha']}
  ❌  No GitHub account found : {stats['skipped_no_user']}
  ⚠️   Invalid metadata.json  : {stats['skipped_invalid']}
{'─'*55}""")

    if args.dry_run:
        print("(Dry run — rerun without --dry-run to apply changes)")

if __name__ == '__main__':
    main()