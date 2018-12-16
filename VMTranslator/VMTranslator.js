const readline = require('readline');
const fs = require('fs');
const file = process.argv[2];

const outfile_name = file
    .split('/')
    .find((file) => file.includes('.vm'))
    .replace(/.vm/, '.asm');

out_file = fs.openSync(outfile_name, 'w');

const init = init_read_file();
init();

function init_read_file () {
    const rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
    });
    const all_vm = [];
    let line_count = 0;

    async function write_file(all_vm) {
        for (const vm_line of all_vm) {
            const asm = translate_vm_to_asm(vm_line);
            try {
                await write_line(asm);
            } catch(e) {
                console.log(`error writing parsed asm: ${e}`);
            }
        }
    }

    return function read_file() {
        rl.on('line', (vm_line) => {
            if (should_ignore_line(vm_line)) return;
    
            line_count += 1;
            all_vm.push(vm_line);
        }).on('close', () => {
            write_file(all_vm);
        });
    }
}

function push_constant_to_stack(vm_line) {
    const [, , address] = vm_line.split(' ');
    return `// ${vm_line}` +
            `\n@${address}` +
            '\nD=A' +
            '\n@SP' +
            '\nA=M' +
            '\nM=D' +
            '\n@SP' +
            '\nM=M+1\n';
}

const mem_segment_asm = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
};

function pop_to_segment(vm_line) {
    const [, mem_segment_vm, address] = vm_line.split(' ');
    const mem_segment = mem_segment_asm[mem_segment_vm];
    // pop = 1. add top of stack to mem_segment[address] 2. decrease SP
    return `// ${vm_line}` +
            `\n@${address}` +
            '\nD=A' +
            `\n@${mem_segment}` + // get pointer to pop address
            '\nA=M' +
            '\nD=D+A' + 
            `\n@${mem_segment}` +
            '\nM=D' +
            '\n@SP' + // SP -= 1
            '\nM=M-1' +
            '\nA=M' +
            '\nD=M' +
            `\n@${mem_segment}` + // update mem_segment[address]
            '\nA=M' +
            '\nM=D' +
            `\n@${address}` +
            '\nD=A' +
            `\n@${mem_segment}` +
            '\nA=M' +
            '\nD=A-D' +
            `\n@${mem_segment}` +
            '\nM=D\n';
}

function handle_temp(vm_line) {
    const [, , address] = vm_line.split(' ');
    let temp_mem_start = 5;
    let temp_address = Number(address) + temp_mem_start;
    if (vm_line.includes('pop')) {
        // decrease SP - add to temp[address]
        return `//${vm_line}` +
            '\n@SP' +
            '\nM=M-1' +
            '\nA=M' +
            '\nD=M' +
            `\n@${temp_address}` +
            '\nM=D\n';
    }
    if (vm_line.includes('push')) {
        // increase SP - add temp[address] to stack
        return `// ${vm_line}` +
        `\n@${temp_address}` +
        '\nD=M' +
        '\n@SP' +
        '\nA=M' +
        '\nM=D' +
        '\n@SP' +
        '\nM=M+1\n';
    }
}

function push_to_stack(vm_line) {
    const [, mem_segment_vm, address] = vm_line.split(' ');
    const mem_segment = mem_segment_asm[mem_segment_vm];
    // increment SP, add segment_vm[address] to top of stack
    return `// ${vm_line}` +
        `\n@${address}` +
        '\nD=A' +
        `\n@${mem_segment}` +
        '\nA=M' +
        '\nD=D+A' +
        '\nA=D' +
        '\nD=M' +
        '\n@SP' +
        '\nA=M' +
        '\nM=D' +
        '\n@SP' +
        '\nM=M+1\n';
}

function handle_logic(vm_line) {
    // add, sub, neg, eq, gt, lt, and, or, not
    let asm;
    switch(vm_line) {
        case 'add':
            asm = math('add', vm_line);
            break;
        case 'sub':
            asm = math('sub', vm_line);
            break;
        case 'neg':
            asm = neg_not(vm_line, '-');
            break;
        case 'eq':
            asm = compare(vm_line, 'JEQ');
            break;
        case 'gt':
            asm = compare(vm_line, 'JGT');
            break;
        case 'lt':
            asm = compare(vm_line, 'JLT');
            break;
        case 'and':
            asm = and_or(vm_line, '&');
            break;
        case 'or':
            asm = and_or(vm_line, '|');
            break;
        case 'not':
            asm = neg_not(vm_line, '!');
            break;
        default:
            console.log(`logic command not found: ${vm_line}`);
    }
    return asm;
}

function and_or(vm_line, type) {
    return `// ${vm_line}` +
        '\n@SP' +
        '\nA=M' +
        '\nA=A-1' +
        '\nA=A-1' +
        '\nD=M' +
        '\nA=A+1' +
        `\nD=D${type}M` +
        '\n@SP' +
        '\nM=M-1' +
        '\nM=M-1' +
        '\nA=M' +
        '\nM=D' +
        '\n@SP' +
        '\nM=M+1\n';
}

var counter = 0;
function compare(vm_line, type) {
    counter += 1; // use counter as unique label
    return `// ${vm_line}` +
    '\n@SP' +
    '\nA=M' +
    '\nA=A-1' +
    '\nA=A-1' +
    '\nD=M' +
    '\nA=A+1' +
    '\nD=D-M' +
    '\n@SP' +
    '\nM=M-1' +
    '\nM=M-1' +
    `\n@TRUE${counter}` +
    `\nD;${type}` +
    '\n@SP' +
    '\nA=M' +
    '\nM=0' +
    `\n@END${counter}` +
    '\n0;JMP' +

    `\n\n(TRUE${counter})` +
    '\n@SP' +
    '\nA=M' +
    '\nM=-1' +

    `\n\n(END${counter})` +
    '\n@SP' +
    '\nM=M+1\n';
}

function neg_not(vm_line, type) {
    // get top of stack and negate/not
    return `// ${vm_line}` +
        '\n@SP' +  // M = 256
        '\nM=M-1' + // M = 255 - decrease pointer
        '\nA=M' +  // pointer A
        `\nM=${type}M` + // RAM[255] = -RAM[255] 
        '\n@SP' +
        '\nM=M+1\n'; 
}

function math(type, vm_line) {
    const sign = type === 'add' ? '+' : '-';
    // replace top of stack with top of stack {type +, -} top of stack -1
    return `// ${vm_line}` +
        '\n@SP' +
        '\nA=M' +
        '\nA=A-1' +
        '\nA=A-1' +
        '\nD=M' +
        '\nA=A+1' +
        `\nD=D${sign}M` +
        '\n@SP' +
        '\nM=M-1' +
        '\nM=M-1' +
        '\nA=M' +
        '\nM=D' +
        '\n@SP' +
        '\nM=M+1\n';
}

function handle_pointer(vm_line) {
    // pointer segment keeps track of this and that segments
    const is_push = vm_line.includes('push');
    const [, , address] = vm_line.split(' ');
    // THAT = 1, THIS = 0
    const this_or_that = Number(address) === 1 ? 'THAT' : 'THIS';

    if (is_push) {
        return `// ${vm_line}` +
        `\n@${this_or_that}` +
        '\nD=M' +
        '\n@SP' +
        '\nA=M' +
        '\nM=D' +
        '\n@SP' +
        '\nM=M+1\n';
    }
    // is_pop
    return `// ${vm_line}` +
    '\n@SP' +
    '\nM=M-1' +
    '\nA=M' +
    '\nD=M' +
    `\n@${this_or_that}` +
    '\nM=D\n';
}

function handle_mem_access(vm_line) {
    let asm;
    if (vm_line.includes('constant')) {
        asm = push_constant_to_stack(vm_line);
    } else if (vm_line.includes('temp')) {
        asm = handle_temp(vm_line);
    } else if (vm_line.includes('pointer')) {
        asm = handle_pointer(vm_line);
    } else if (vm_line.includes('pop')) {
        asm = pop_to_segment(vm_line)
    } else if (vm_line.includes('push')) {
        asm = push_to_stack(vm_line)
    } else {
        asm = 'Not identified: ' + vm_line;
    }
    return asm;
}
function handle_branching(vm_line) {
    console.log('branching: ', vm_line);
    return vm_line;
}

function translate_function(vm_line, function_name) {
    return `// ${vm_line}` +
    `\n(${function_name})` + // initialize local variables
    '\n@SP' +
    '\nA=M' +
    '\nM=0' +
    '\n@SP' +
    '\nM=M+1' +
    '\n@SP' +
    '\nA=M' +
    '\nM=0' +
    '\n@SP' +
    '\nM=M+1\n';
}

function translate_return(vm_line) {
    return `// ${vm_line}` +
    '\n@LCL' +
    '\nD=M' +
    '\n@FRAME' +
    '\nM=D' +
    '\n@5' +
    '\nD=D-A' +
    '\nA=D' +
    '\nD=M' +
    '\n@RET' + // return address (frame - 5)
    '\nM=D' +
    '\n@SP' +
    '\nM=M-1' +
    '\nA=M' +
    '\nD=M' +
    '\n@ARG' +
    '\nA=M' +
    '\nM=D' +
    '\n@ARG' +
    '\nD=M+1' +
    '\n@SP' +
    '\nM=D' +
    '\n@FRAME' +
    '\nD=M' +
    '\n@1' +
    '\nD=D-A' +
    '\nA=D' +
    '\nD=M' +
    '\n@THAT' + // restore that of caller
    '\nM=D' +
    '\n@FRAME' +
    '\nD=M' +
    '\n@2' +
    '\nD=D-A' +
    '\nA=D' +
    '\nD=M' +
    '\n@THIS' + // restore this of caller
    '\nM=D' +
    '\n@FRAME' +
    '\nD=M' +
    '\n@3' +
    '\nD=D-A' +
    '\nA=D' +
    '\nD=M' +
    '\n@ARG' +
    '\nM=D' +
    '\n@FRAME' +
    '\nD=M' +
    '\n@4' +
    '\nD=D-A' +
    '\nA=D' +
    '\nD=M' +
    '\n@LCL' + // restore LCL of caller
    '\nM=D' +
    '\n@RET' +
    '\nA=M' +
    '\n0;JMP\n'; // GOTO return address
}

function handle_function(vm_line) {
    const [, function_name, ] = vm_line.split(' ');
    let asm;
    if (vm_line.includes('function')) {
        asm = translate_function(vm_line, function_name);
    } else if (vm_line.includes('return')) {
        asm = translate_return(vm_line);
    }
    return asm;
}
function translate_vm_to_asm(vm_line) {
    let asm;
    const commands = vm_line.split(' ');
    const is_logic_command = commands.length === 1;
    const is_branching_command = commands.length === 2;
    const function_commands = ['function', 'call', 'return'];
    const is_function_command = function_commands.some((function_command) => commands.includes(function_command));

    if (is_function_command) {
        asm = handle_function(vm_line);
    } else if (is_branching_command) {
        asm = handle_branching(vm_line);
    } else if (is_logic_command) {
        asm = handle_logic(vm_line);
    } else {
        asm = handle_mem_access(vm_line);
    }
    return asm;
}

function write_line(parsed_asm) {
    return new Promise((resolve, reject) => {
        fs.write(out_file, `${parsed_asm}\n`, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function should_ignore_line(asm_line) {
    return is_comment(asm_line) || asm_line === '';
}

function is_comment(asm_line) {
    const comment_re = /^\/\//;
    return comment_re.test(asm_line);
}