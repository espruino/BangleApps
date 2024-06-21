/*
 A script to create, overwrite or append golf course GPS data
 Format: latitude (6 decimal places), longitude (6 decimal places), par
 There are two course data in below code, but you can put any number of course data.
 
 Save this file to your computer and open it from Espruino Web IDE (https://www.espruino.com/ide/)
 and run in RAM mode
 
 Tip: In the Web IDE editor, enter GPS cordinates and par per hole, and then SHFT-ALT drag all line, hit HOME and type " and hit END and type \n"+
*/

f = require("Storage").open("course-data","a"); // "r" to create or overwrite, "a" to append
f.write(
"course name\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"course name\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"+
"00.000000,00.000000,0\n"
);
