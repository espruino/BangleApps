#!/bin/bash
zoom() {
    VAL=`cat delme/z$1-* | wc -c`
    echo "Zoom $1 -- " $[$VAL/1024]
}

echo "Total data"
cat delme/* | wc -c
echo "M..k..."
zoom 18
zoom 17
zoom 16
zoom 15
zoom 14
zoom 13
zoom 12
zoom 11
zoom 9
zoom 8
zoom 7
zoom 6
zoom 5
zoom 4
zoom 3
zoom 2
zoom 1
zoom 0

echo "Zoom 1..9"
cat delme/z?-* | wc -c
echo "M..k..."
