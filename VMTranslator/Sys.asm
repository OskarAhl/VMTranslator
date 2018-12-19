// function Sys.init 0
(Sys.init)

// push constant 4
@4
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Main.fibonacci 1
@RETURN#1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
D=M
@l
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@a
0;JMP
(RETURN#1)

// label WHILE
(Sys.init#WHILE)
// goto WHILE
@Sys.init#WHILE
