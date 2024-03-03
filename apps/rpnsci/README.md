# Scientific calculator

This is a reverse polish notation scientific calculator with memory function.

## General operation

In order to fit all of the functions, the calculator only displays 12 keys at a time. The top right of these keys is always a mode button. This will take you into number mode if you are in operation mode, and operation mode if you are in any other mode. The calculator starts out in number mode, where you can enter numbers. Operation mode lets you perform basic operations and RPN stack manipulation. In operation mode, you can press "Sci" to switch to Scientific mode. This provides trigonometric, logarithmic, and memory operations, as well as the constants e and pi.

In any mode, the calculator also accepts swipes. A swipe up or down will function as the enter key (see below), and a swipe left will delete the last character if entry has not been terminated (see below) or function as the clear key if it has.

The calculator will vibrate when performing an operation. If the operation is invalid, it will do a long vibration.

## Reverse polish notation

To save keystrokes and avoid the need for parentheses keys while still allowing you to control the order of operations, this calculator uses Reverse Polish Notation (RPN). There is a stack of 4 registers: x (the displayed value), y, z, and t (top). Pressing Enter will lift the stack. The value of z will be copied to t, y to z, and x to y. (The old value of t is lost.) This also terminates input, making the next numerical key press clear the value in x before typing its value. This enables you to enter a value into the stack multiple times by pressing Enter multiple times.

Performing an operation will also terminate entry, and can either simply replace the value of x (if it is a one-number operation), or drop the stack (if it is a two number operation). Dropping the stack causes the existing values of x and y to be lost, replacing x with the result of the operation, y with the old value of z, and z with the old value of t. t remains the same.

Effectively, to do an operation, you type the first operand, press Enter, and then type the second operand. If you want to do multiple operations, start with the one that you want to do first, and then continue operating on the result without pressing enter. For example, 3 Enter 2 Times 1 Plus computes (3\*2) + 1. 3 Enter 1 Plus 2 Times computes (3+1) \* 2. If you wish to compute something independently, simply press enter before starting the independent operation. For example, to compute (3 \* 2) + (4 \* 5), first compute 3 \* 2. Then press enter and compute 4 \* 5. You will have 6 in the y register and 20 in the x register. Press Plus to add them.

You can also rotate the stack down with the Rot key. x gets set to the value of y, y gets set to the value of z, z gets set to the value of t, and t gets set to the old value of x. And you can swap x and y with Swp. I find this to be most handy when I want to subtract the result of an operation from another value, but I forget to enter another value first. For example, 20 - (2 \* 3) should usually be computed as 20 Enter 2 Enter 3 Times Minus. But if you compute 2 \* 3 first, you can enter 20, swap the values, and then subtract. (I do this more often than I would like to admit.)

## Memory
The calculator has 10 variables that you can store values in. In Scientific mode, press Sto to store the value of the x register in one of the values (which you then choose by pressing a number), or Rcl to read a value (which you choose by pressing a number) into the x register. These values are preserved when the calculator is closed.

## Clearing

A swipe left will delete one character, unless the number is already zero in which case it will emulate a press of the clear button (Clr). The clear button will set the value of x to 0 if it is not zero. If x=0, y, z, and t will be cleared to zero. And if they are already zero, pressing Clear again will clear the memory.

## Limitations

* This calculator uses Javascript's floating point numbers. These are fast, space efficient, and less complicated to code for (producing a smaller app), but they sacrifice some precision. You might see stuff like 0.1 + 0.2 adding to 0.30000000000000004, or the sine of pi being a very low value but not quite zero.

* This calculator performs trigonometric operations in radians. If you wish to convert degrees to radians, multiply by (pi/180). If you wish to convert radians to degrees, multiply by (180 / pi).

* This calculator performs logarithms in base 10. If you would like to perform logarithms in another base, divide the log of the number by the log of the base. For example, to compute log base 2 of 8, divide log(8) by log(2). (To get the natural log or ln, divide by log(e)).

* This calculator considers 0^0 to be 1, a behavior inherited from Javascripts Math.pow() function. In reality, it is undefined because two mathematical rules give conflicting answers: anything^0 = 1, but 0^anything = 0.