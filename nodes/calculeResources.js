var os = require('os-utils');

function checkCpu(callback) {
    os.cpuFree(function (cpu) {
        return callback(cpu);
    });
}

checkMemory = () => {
    return os.totalmem();
}

module.exports = { checkCpu, checkMemory }