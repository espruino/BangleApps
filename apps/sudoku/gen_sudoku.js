/* 
Call this to generate the data files needed.

npm install sudoku-gen 

*/

var getSudoku = require('sudoku-gen').getSudoku;

//  (easy, medium, hard, expert)
function gen(difficulty) {
    console.log("Generate", difficulty);
    // Get a sudoku of specific difficulty
    let result = "";
    for (let i=0;i<200;i++) {
        const sudoku = getSudoku('easy');
        result += sudoku.puzzle + sudoku.solution+"\n";
    }
    require("fs").writeFileSync("sudoku."+difficulty+".txt", result);
}

gen("easy");
gen("medium");
gen("hard");
