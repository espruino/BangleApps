#!/bin/sh

set -e

usage(){
	echo >&2 "Usage: $0"
	exit 2
}

if test $# -ne 0
then usage
fi

cd "$(dirname "$0")"

npm run build

find ../apps -iname '*.ts' |
	sed 's/\.ts$/.js/' |
	grep -E 'clkinfo|setting' |
	xargs perl -i -pe 's/;$// if eof'
