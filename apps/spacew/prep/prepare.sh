#!/bin/bash
if [ ".$1" == "-f" ]; then
    I=/data/gis/osm/dumps/czech_republic-2023-07-24.osm.pbf
    #I=/data/gis/osm/dumps/zernovka.osm.bz2
    O=cr.geojson
    rm delme.pbf $O
    time osmium extract $I --bbox 14.7,49.9,14.8,50.1 -f pbf -o delme.pbf
    time osmium export delme.pbf -c prepare.json -o $O
    echo "Converting to ascii"
    time cstocs utf8 ascii cr.geojson  > cr_ascii.geojson
    mv -f cr_ascii.geojson delme.json
fi
rm -r delme/; mkdir delme
./split.js
./minitar.js
ls -lS delme/*.json  | head -20
cat delme/* | wc -c
ls -l delme.mtar
