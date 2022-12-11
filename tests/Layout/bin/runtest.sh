#!/usr/bin/env bash
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

run_test () {
    LAYOUTFILE=$1
    echo  'exports = {};' > $TESTJS
    cat  $LAYOUTFILE >> $TESTJS
    echo  ';' >> $TESTJS
    echo  'Layout = exports;' >> $TESTJS
    echo 'Bangle = { setUI : function(){}, appRect:{x:0,y:0,w:176,h:176,x2:175,y2:175} };BTN1=0;process.env = process.env;process.env.HWVERSION=2;' >> $TESTJS
    echo 'g = Graphics.createArrayBuffer(176,176,4);' >> $TESTJS
    cat $SRCJS >> $TESTJS  || exit 1
    echo 'layout.render()' >> $TESTJS
    #echo 'layout.debug()' >> $TESTJS
    echo 'require("fs").writeFileSync("'$TESTBMP'",g.asBMP())' >> $TESTJS
    echo =============================================
    echo TESTING  $LAYOUTFILE $SRCJS
    bin/espruino $TESTJS || exit 1
    if ! cmp $TESTBMP $SRCBMP >/dev/null 2>&1
    then
      echo =============================================
      echo $LAYOUTFILE
      echo $TESTBMP $SRCBMP differ
      echo ==============================================
      convert "+append" $TESTBMP $SRCBMP testresult.bmp
      display testresult.bmp
      exit 1
    else
      echo Files are the same
      exit 0
    fi
}

run_test ../../modules/Layout.js
run_test ../../modules/Layout.min.js
