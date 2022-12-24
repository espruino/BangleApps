#!/bin/bash
[ -z "$1" ] && echo Give gpx file name


xmlstarlet select -t -m '//_:trkpt' \
  --if '_:name and _:ele' -o D \
    --elif '_:ele and not(_:name)' -o C \
    --elif 'not(_:ele) and _:name' -o B \
    --else -o A -b \
  -v 'format-number(@lat,"+00.0000000;-00.0000000")' \
  -v 'format-number(@lon,"+000.0000000;-000.0000000")' \
  --if '_:ele' -v 'format-number(_:ele,"+00000;-00000")' -b \
  --if _:name -v 'format-number(string-length(_:name),"00")' -v '_:name' -b \
  -n "$1" | iconv -f utf8 -t iso8859-1 > "$(basename "$1" | sed -e "s|.gpx||").trf"
