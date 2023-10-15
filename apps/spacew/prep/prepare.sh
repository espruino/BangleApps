#!/bin/bash

# http://bboxfinder.com/#0.000000,0.000000,0.000000,0.000000
Z=
# Czech republic -- hitting internal limit in nodejs
#BBOX=10,60,20,30
#Z="--maxz 9"
# No Moravia -- ascii conversion takes 43min, "Error: Cannot create a string longer than 0x3fffffe7 characters"
#BBOX=10,60,17.75,30
#Z="--maxz 9"
# Just Moravia -- 266MB delme.pbf -- FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
#BBOX=16.13,60,35,30
#Z="--maxz 9"
# Roudnice az Kutna hora -- band 1.1 deg -- 145MB delme.pbf, 5m cstocs, 40+m split.
#                        -- band 0.1 deg -- 13MB delme.pbf, 13s split, 21k result.
#BBOX=14.20,50.45,15.32,49.20
#Z="--maxz 9"
# Roudnice az... -- band 0.5 deg --  91MB delme.pbf, 200k result.
# Roudnice az... -- band 0.8 deg -- 120MB delme.pbf, 2.5GB while splitting, 260k result.
#BBOX=14.20,50.45,15.0,49.20
#Z="--maxz 9"
# Prague; 1.2MB map, not really useful
#BBOX=14.25,50.17,14.61,49.97
#Z="--maxz 14"
# Zernovka small -- 3.5 delme.pbf, ~850K result.
BBOX=14.7,49.9,14.8,50.1
# Zernovka big
#BBOX=14.6,49.7,14.9,50.1

if [ ".$1" == ".-f" ]; then
    I=/data/gis/osm/dumps/czech_republic-2023-07-24.osm.pbf
    #I=/data/gis/osm/dumps/zernovka.osm.bz2
    O=cr.geojson
    rm delme.pbf $O
    ls -alh $I
    time osmium extract $I --bbox $BBOX -f pbf -o delme.pbf
    ls -alh delme.pbf
    time osmium export delme.pbf -c prepare.json -o $O
    ls -alh $O
    # ~.5G in 15min
    echo "Converting to ascii"
    time cstocs utf8 ascii cr.geojson  > cr_ascii.geojson
    mv -f cr_ascii.geojson delme.json
fi
rm -r delme/; mkdir delme
time ./split.js $Z
./minitar.js
ls -lS delme/*.json  | head -20
cat delme/* | wc -c
ls -l delme.mtar
