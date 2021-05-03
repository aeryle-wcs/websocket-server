const { inspect } = require('util');
const chalk = require('chalk');

module.exports = class Logger {
  static get debugInfos() {
    const e = new Error();
    const frame = e.stack.split('\n')[3]; // change to 3 for grandparent func
    const fileName = frame
      .trim()
      .replace('at init (', '')
      .replace(')', '')
      .replace(/:\d+:\d+/, '')
      .replace(
        new RegExp(
          `${process.cwd()}`
        ),
        ''
      )
      .split('(')[1]
    const lineNumber = +frame.split(':')[1];
    const functionName = frame.split(' ')[5];

    return {
      fileName,
      lineNumber,
      functionName
    };
  }

  info(...str) {
    console.log(chalk.blue('[INFO]'), ...str);
  }

  debug(...str) {
    const fileName = chalk.blueBright(Logger.debugInfos.fileName);
    const functionName = chalk.blueBright(Logger.debugInfos.functionName);
    const lineNumber = chalk.blueBright(Logger.debugInfos.lineNumber);

    console.log(
      `[${fileName} @ ${functionName}:${lineNumber} ]`,
      ...str.map(s => typeof s === 'string' ? s : inspect(s, { colors: true, depth: 3 }))
    );
  }

  warn(...str) {
    console.log(chalk.yellow('[WARN]'), ...str);
  }

  error(err) {
    const str = err.message.replace('Error : ', '');
    const functionName = chalk.blueBright(Logger.debugInfos.functionName);
    const lineNumber = chalk.blueBright(Logger.debugInfos.lineNumber);

    console.log(`[${chalk.red('ERROR')} @ ${functionName}:${lineNumber}] ${str[0].toUpperCase() + str.slice(1)}`);
  }
};
