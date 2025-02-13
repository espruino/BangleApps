/*
  Before you run Golf GPS, you need to save your favourite golf course data into the storage area. 
  Download this script and open it from Espruino Web IDE (https://www.espruino.com/ide/) and enter your course data and run in RAM mode. 
  With this script, you can create, overwrite or append golf course GPS data.

  You can put any number of course data. 
  Once the data file is created in the storage area, you can add more data to the same file using append ("a" ) mode with the same script. 
  Just replace the data and change the mode to "a" and run in RAM mode.

  One tip to wrap each line with "----\n"+ is using the built-in edit feature of the Web IDE. 
  In the Web IDE editor, enter GPS cordinates and par per hole, and then SHFT-ALT drag all lines including the course name, 
  and hit HOME and type " and hit END and type \n"+.
*/
 
const Storage = require("Storage");
const f = Storage.open("course-data", "a"); // "w" to create or overwrite, "a" to append
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
