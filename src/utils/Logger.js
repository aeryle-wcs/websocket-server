const { inspect } = require('util');
const chalk = require('chalk');

module.exports = class Logger {
  constructor(filename) {
    this.filename = filename;
  }

  static get debugInfos() {
    let e = new Error();
    let frame = e.stack.split('\n')[3]; // change to 3 for grandparent func
    let lineNumber = +frame.split(':')[1];
    let functionName = frame.split(' ')[5];

    return {
      lineNumber,
      functionName
    };
  }

  info(...str) {
    console.log(`${chalk.blue('[INFO]')} ${str.join(' ')}`);
  }

  debug(...str) {
    const functionName = chalk.blueBright(Logger.debugInfos.functionName);
    const lineNumber = chalk.blueBright(Logger.debugInfos.lineNumber);

    console.log(`[${chalk.blueBright(this.filename.replace(process.cwd(), ''))} @ ${functionName}:${lineNumber}] ${inspect(str.join(' '), {
      colors: true,
      depth: Infinity
    })}`);
  }

  warn(str) {
    console.log(`${chalk.blue('[WARN]')} ${str}`);
  }

  error(err) {
    const str = err.message.replace('Error : ', '');
    const functionName = chalk.blueBright(Logger.debugInfos.functionName);
    const lineNumber = chalk.blueBright(Logger.debugInfos.lineNumber);

    console.log(`[${chalk.red('ERROR')} @ ${functionName}:${lineNumber}] ${str[0].toUpperCase() + str.slice(1)}`);
  }
};
