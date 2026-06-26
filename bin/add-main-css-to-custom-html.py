#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys


REPO_ROOT = Path(__file__).resolve().parent.parent
APPS_DIR = REPO_ROOT / "apps"
SPECTRE_LINK = '<link rel="stylesheet" href="../../css/spectre.min.css">'
MAIN_LINK = '<link rel="stylesheet" href="../../css/main.css">'


def iter_custom_html_files(base_dir: Path):
    for path in base_dir.rglob("custom.html"):
        if path.is_file():
            yield path


def update_file(file_path: Path, dry_run: bool) -> tuple[bool, str | None]:
    original = file_path.read_text(encoding="utf-8")

    if MAIN_LINK in original:
        return False, "already has main.css"

    line_ending = "\r\n" if "\r\n" in original else "\n"
    spectre_pattern = re.compile(
        rf"^([ \t]*){re.escape(SPECTRE_LINK)}$",
        re.MULTILINE,
    )
    match = spectre_pattern.search(original)
    if not match:
        return False, "no matching spectre link"

    updated = spectre_pattern.sub(
        lambda found: f"{found.group(0)}{line_ending}{found.group(1)}{MAIN_LINK}",
        original,
        count=1,
    )

    if updated == original:
        return False, "no content change"

    if not dry_run:
        file_path.write_text(updated, encoding="utf-8")

    return True, None


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Insert main.css after spectre.min.css in app custom.html files."
    )
    parser.add_argument("--dry-run", action="store_true", help="Show matches without writing files.")
    args = parser.parse_args(argv)

    changed_count = 0
    skipped_count = 0

    for file_path in iter_custom_html_files(APPS_DIR):
        changed, reason = update_file(file_path, args.dry_run)
        if changed:
            changed_count += 1
            print(f"{'would update' if args.dry_run else 'updated'} {file_path}")
        else:
            skipped_count += 1

    print(f"{'Dry run' if args.dry_run else 'Done'}: {changed_count} updated, {skipped_count} skipped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))