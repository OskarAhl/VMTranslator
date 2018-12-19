// function Sys.init 0
(Sys.init)

// push constant 4000
@4000
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 0
@SP
M=M-1
A=M
D=M
@THIS
M=D

// push constant 5000
@5000
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 1
@SP
M=M-1
A=M
D=M
@THAT
M=D

// call Sys.main 0
@RETURN1
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
(RETURN1)

//pop temp 1
@SP
M=M-1
A=M
D=M
@6
M=D

// label LOOP
(Sys.initLOOP)

// goto LOOP
@Sys.initLOOP
0;JMP

// function Sys.main 5
(Sys.main)
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1

// push constant 4001
@4001
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 0
@SP
M=M-1
A=M
D=M
@THIS
M=D

// push constant 5001
@5001
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 1
@SP
M=M-1
A=M
D=M
@THAT
M=D

// push constant 200
@200
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop local 1
@1
D=A
@LCL
A=M
D=D+A
@LCL
M=D
@SP
M=M-1
A=M
D=M
@LCL
A=M
M=D
@1
D=A
@LCL
A=M
D=A-D
@LCL
M=D

// push constant 40
@40
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop local 2
@2
D=A
@LCL
A=M
D=D+A
@LCL
M=D
@SP
M=M-1
A=M
D=M
@LCL
A=M
M=D
@2
D=A
@LCL
A=M
D=A-D
@LCL
M=D

// push constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop local 3
@3
D=A
@LCL
A=M
D=D+A
@LCL
M=D
@SP
M=M-1
A=M
D=M
@LCL
A=M
M=D
@3
D=A
@LCL
A=M
D=A-D
@LCL
M=D

// push constant 123
@123
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Sys.add12 1
@RETURN2
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
(RETURN2)

//pop temp 0
@SP
M=M-1
A=M
D=M
@5
M=D

// push local 0
@0
D=A
@LCL
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// push local 1
@1
D=A
@LCL
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// push local 2
@2
D=A
@LCL
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// push local 3
@3
D=A
@LCL
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// push local 4
@4
D=A
@LCL
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// add
@SP
A=M
A=A-1
A=A-1
D=M
A=A+1
D=D+M
@SP
M=M-1
M=M-1
A=M
M=D
@SP
M=M+1

// add
@SP
A=M
A=A-1
A=A-1
D=M
A=A+1
D=D+M
@SP
M=M-1
M=M-1
A=M
M=D
@SP
M=M+1

// add
@SP
A=M
A=A-1
A=A-1
D=M
A=A+1
D=D+M
@SP
M=M-1
M=M-1
A=M
M=D
@SP
M=M+1

// add
@SP
A=M
A=A-1
A=A-1
D=M
A=A+1
D=D+M
@SP
M=M-1
M=M-1
A=M
M=D
@SP
M=M+1

// return
@LCL
D=M
@FRAME
M=D
@5
D=D-A
A=D
D=M
@RET
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@FRAME
D=M
@1
D=D-A
A=D
D=M
@THAT
M=D
@FRAME
D=M
@2
D=D-A
A=D
D=M
@THIS
M=D
@FRAME
D=M
@3
D=D-A
A=D
D=M
@ARG
M=D
@FRAME
D=M
@4
D=D-A
A=D
D=M
@LCL
M=D
@RET
A=M
0;JMP

// function Sys.add12 0
(Sys.add12)

// push constant 4002
@4002
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 0
@SP
M=M-1
A=M
D=M
@THIS
M=D

// push constant 5002
@5002
D=A
@SP
A=M
M=D
@SP
M=M+1

// pop pointer 1
@SP
M=M-1
A=M
D=M
@THAT
M=D

// push argument 0
@0
D=A
@ARG
A=M
D=D+A
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1

// push constant 12
@12
D=A
@SP
A=M
M=D
@SP
M=M+1

// add
@SP
A=M
A=A-1
A=A-1
D=M
A=A+1
D=D+M
@SP
M=M-1
M=M-1
A=M
M=D
@SP
M=M+1

// return
@LCL
D=M
@FRAME
M=D
@5
D=D-A
A=D
D=M
@RET
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M+1
@SP
M=D
@FRAME
D=M
@1
D=D-A
A=D
D=M
@THAT
M=D
@FRAME
D=M
@2
D=D-A
A=D
D=M
@THIS
M=D
@FRAME
D=M
@3
D=D-A
A=D
D=M
@ARG
M=D
@FRAME
D=M
@4
D=D-A
A=D
D=M
@LCL
M=D
@RET
A=M
0;JMP

