# VMCompiler

An L(VMP) compiler written in javascript in order to properly solve those General Computer Science 2 assignments. 
Improved from the original version by smirea.

[Live Demo](http://tkw1536.github.io/VMCompiler)

Has been successfully tested in 

* Google Chrome 26
* Mozilla Firefox 20

## The L(VMP) Language

The  L(VMP) is a language that is running on a virtual (register) machine which has the following elements: 

  * A stack (memory segment) operating as a "last-in-first-out" LIFO sequence. It only contains numbers in this implementation. 
  * A program store which contains the programs as read only memory. 
  * A virtual program counter (VPC)  that points to the current instruction in the program store. 
  * The initial state is a stack with one element containing zero. 

An instruction is of the form **COMMAND ARGUMENT ARGUMENT** where both the command and the argument are counted as 1 token. The following commands are available: 

| Command 				| Effect 																																																		|
| ------- 				| ------ 																																																		|
| peek x				| pushes the a copy of the x-th element on top of the stack. (x is zero-based. )																																|
| poke x				| pops a, then replaces the x-th element on the stack with a. (x is zero-based. )																																|
| con x					| `push(x)` 																																																	|
| add					| `pop(a)`, `pop(b)`, `push(a+b)`																																												|
| sub					| `pop(a)`, `pop(b)`, `push(a-b)`																																												|
| mul					| `pop(a)`, `pop(b)`, `push(a*b)`																																												|
| leq					| `pop(a)`, `pop(b)`, `push(a<=b ? 1 : 0 )`																																										|
| jp x					| Jump x tokens( not lines ) or to a certain label. 																																							|
| cjp x					| Jump x tokens or to a certain label if `pop(a)`, `a == 0`																																						|
| proc a l				| Contains information about the number a of arguments and the length l of the procedure in the number of words needed to store it. The command proc a l simply jumps l words ahead (l may also be a label). 	|
| arg i					| Pushes the ith argument from the current frame to the stack 																																					|
| call p				| pushes the current program address (opens a new frame), and jumps to the program address p. p may also be a label. 																							|
| return				| Takes the current frame from the stack, jumps to2 previous program address. 																																	|
| halt					| Stops the execution 																																															|
| labelName: command 	| Adds a label with the name labelName at the current  position. Labels consist of letters, numbers, $  and _ . They may not start with a number. 																|

You can also add comments to your code. They can be in any common format: 

```
// Comment
# Comment
; Comment
% Comment
(* Comment *)
/* Comment */
```

### An example program
Here is a rather inefficient way to check if a number is odd or even: 

```
even: proc 1 odd (* procedure even(x)*)
    arg 1
    cjp even0 (* if x==0 *)
    con 1
    arg 1
    sub (* x-1 *)
    cjp even1 (* if x==1 *)
    con 1
    arg 1
    sub (* x-1 *)
    call odd (* return odd(x-1) *)
    return
    even0: con 1 return (* x==0 => return 1 *)
    even1: con 0 return (* x==1 => return 0 *)

odd: proc 1 end (* procedure odd(x)*)
    arg 1
    cjp odd0 (* if x==0 *)
    con 1
    arg 1
    sub (* x-1 *)
    cjp odd1 (* if x==1 *)
    con 1 
    arg 1
    sub (* x-1 *)
    call even (* return even(x-1) *)
    return
    odd0: con 0 return (* x==0 => return 0 *)
    odd1: con 1 return (* x==1 => return 1 *)    

end: 
    con 50 (* x=50 *)
    call even  (* even(50) *)
    halt
```

## Using the Compiler

The interpreter allows you to run arbitrary L(VMP) programs. 

To run a program simply enter it in the main text box, then press `Execute`. 
Then the compiler will display a stack trace below the text box. 

Sometimes it is necessary to remove all labels from the code. In this case the button `Compile (delabelize)` can be used. Afterwards the original code can be restored. 

It is also possible to run the compiler in step-by-step mode. For this use the step-by-step button. 

In case of compiling errors or runtime errors, the compiler will display a message. 

## TODO
* update peek and poke to work properly within functions
* make return have only 1 return value

## Sources & Used Libraries

* [http://kwarc.info/teaching/GenCS2/notes.pdf](http://kwarc.info/teaching/GenCS2/notes.pdf) accessed 1st April 2013

Used Libraries: 

* [jQuery 1.9.1](http://jquery.com) licensed under [MIT license](https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt)
* [jQuery Lined Textarea Plugin ](http://alan.blog-city.com/jquerylinedtextarea.htm) licensed under [MIT license](http://www.opensource.org/licenses/mit-license.php)
