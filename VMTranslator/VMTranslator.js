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
    return `//${vm_line}` +
            `\n@${address}` +
            '\nD=M' +
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
            '\nD=M' +
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
    let temp_mem = 5;
    let temp_address = Number(address) + temp_mem;
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
        return `//${vm_line}` +
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
    return `//${vm_line}` +
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
    console.log(vm_line);
    return vm_line;
}

function handle_mem_access(vm_line) {
    let asm;
    if (vm_line.includes('constant')) {
        asm = push_constant_to_stack(vm_line);
    } else if (vm_line.includes('temp')) {
        asm = handle_temp(vm_line);
    } else if (vm_line.includes('pop')) {
        asm = pop_to_segment(vm_line)
    } else if (vm_line.includes('push')) {
        asm = push_to_stack(vm_line)
    } else {
        asm = 'Not identified: ' + vm_line;
    }
    return asm;
}

function translate_vm_to_asm(vm_line) {
    let asm;
    let is_logic_command = vm_line.split(' ').length === 1;

    if (is_logic_command) {
        asm = handle_logic(vm_line);
    } else {
        asm = handle_mem_access(vm_line);
    }
    return asm;
}

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