const chalk = require('chalk');
const emoji = require('node-emoji');

const chalkINFO = (v) =>
  `${chalk.bgBlueBright.black(
    `[${new Date().toLocaleString()}]  INFO   `
  )} ${chalk.blueBright(v)}`;
const chalkSUCCESS = (v) =>
  `${chalk.bgGreenBright.black(
    `[${new Date().toLocaleString()}] SUCCESS `
  )} ${chalk.greenBright(v)}`;
const chalkERROR = (v) =>
  `${chalk.bgRedBright.black(
    `[${new Date().toLocaleString()}]  ERROR  `
  )} ${chalk.redBright(v)}`;
const chalkWARN = (v) =>
  `${chalk
    .bgHex('#FFA500')
    .black(`[${new Date().toLocaleString()}]  WARN   `)} ${chalk.hex('#FFA500')(
    v
  )}`;

// 注意：js的对象是引用类型，exports指向module.exports，这里只是将exposts指向了另一个对象，并没有改变原本的module.exports
// exports = { chalkINFO, chalkSUCCESS, chalkERROR };

// module.exports和exports操作的是同一块内存，最终暴露的是module.exports。
// 这里虽然module.exports的exports指向了另一个对象，但node找的的module.exports的引用，所以还是会找到module.exports指向的新对象
module.exports = {
  chalk,
  emoji,
  chalkINFO,
  chalkSUCCESS,
  chalkERROR,
  chalkWARN,
};
