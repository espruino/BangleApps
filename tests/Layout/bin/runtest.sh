#!/bin/bash
# Requires Linux x64 (for ./espruino)
# Also imagemagick for display
 
cd `dirname $0`
if [ "$#" -ne 1 ]; then
    echo "USAGE:"
    echo "  bin/runtest.sh testxyz.js"
    exit 1
fi

# temporary test files
TESTJS=tmp.js
TESTBMP=tmp.bmp
# actual source files
SRCDIR=../tests/
SRCJS=$1
SRCBMP=`basename $SRCJS .js`.bmp
echo "TEST $SRCJS ($SRCBMP)"

cat  ../../../modules/Layout.js > $TESTJS
echo 'g = Graphics.createArrayBuffer(176,176,4);' >> $TESTJS
cat $SRCDIR/$SRCJS >> $TESTJS  || exit 1
echo 'layout.render()' >> $TESTJS
echo 'layout.debug()' >> $TESTJS
echo 'require("fs").writeFileSync("'$TESTBMP'",g.asBMP())' >> $TESTJS

./espruino $TESTJS || exit 1
if ! cmp $TESTBMP $SRCDIR/$SRCBMP >/dev/null 2>&1
then
  echo Files differ
  convert "+append" $TESTBMP $SRCDIR/$SRCBMP ../testresult.bmp
  display ../testresult.bmp
  exit 1
else
  echo Files are the same
  exit 0
fi


