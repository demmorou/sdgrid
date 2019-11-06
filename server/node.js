const io = require('socket.io-client');
const socket = io.connect('http://10.180.58.181:9510');

const os = require('os-utils');

os.cpuUsage( (v) => {
	console.log( 'CPU Usage (%): ' + v );
});

os.cpuFree( (v) => {
	console.log( 'CPU Free:' + v );
});

console.log('Free memory (%): '+os.freememPercentage()*100);

// const cpus = os.cpus();
// const memory = os.freemem();

// for(var i = 0, len = cpus.length; i < len; i++) {
//     console.log("CPU %s:", i);
//     var cpu = cpus[i], total = 0;

//     for(var type in cpu.times) {
//         total += cpu.times[type];
//     }

//     for(type in cpu.times) {
//         console.log("\t", type, Math.round(100 * cpu.times[type] / total));
//     }
// }

// console.log('memory: '+(memory/1024)/1024);

socket.on('connect', () => {
    console.log('Successfully conected!');
});

socket.on('task', (dados) => {
    console.log(dados.message);
});

// const arr = [1,2,3,4,5,6,,12,1,21,1,3342,43,54,45,23,23,65,43,32,21,676,31,235,98,7,8,9,10];
// arr.reverse();

// let arre = Array(1e6).fill("some string");
// arre.reverse();
// const used = process.memoryUsage().heapUsed / 1024 / 1024;
// console.log(process.cpuUsage());
// console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);