#!/bin/bash
# Requires Linux x64 (for ./espruino)
# Also imagemagick for display

cd `dirname $0`/..
if [ "$#" -ne 1 ]; then
    echo "USAGE:"
    echo "  bin/runtest.sh tests/testxyz.js"
    exit 1
fi

# temporary test files
TESTJS=bin/tmp.js
TESTBMP=bin/tmp.bmp
# actual source files
SRCDIR=tests
SRCJS=$1
SRCBMP=$SRCDIR/`basename $SRCJS .js`.bmp
echo "TEST $SRCJS ($SRCBMP)"

cat  ../../modules/Layout.js > $TESTJS
echo 'Bangle = { setUI : function(){} };BTN1=0;process.env = process.env;process.env.HWVERSION=2;' >> $TESTJS
echo 'g = Graphics.createArrayBuffer(176,176,4);' >> $TESTJS
cat $SRCJS >> $TESTJS  || exit 1
echo 'layout.render()' >> $TESTJS
#echo 'layout.debug()' >> $TESTJS
echo 'require("fs").writeFileSync("'$TESTBMP'",g.asBMP())' >> $TESTJS

bin/espruino $TESTJS || exit 1
if ! cmp $TESTBMP $SRCBMP >/dev/null 2>&1
then
  echo =============================================
  echo $TESTBMP $SRCBMP differ
  echo ==============================================
  convert "+append" $TESTBMP $SRCBMP testresult.bmp
  display testresult.bmp
  exit 1
else
  echo Files are the same
  exit 0
fi
