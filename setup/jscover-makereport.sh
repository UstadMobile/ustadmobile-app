

if [ -e coverage_report/jscoverage.json ]; then
    java -cp $JSCOVERJAR jscover.report.Main --format=LCOV ./coverage_report/ $SRCDIR/js/
    cd coverage_report
    genhtml jscover.lcov
    cd ..
    #Update documentation
    jsdoc -d=./jsdoc_output $SRCDIR/js

else
    echo "Coverage results NOT found"
    #does not work on Windows - be more forgiving
    #exit 2
fi

