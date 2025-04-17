import chalk from 'chalk';

export const chalkINFO = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  INFO    `;
  return `${chalk.bgBlueBright.black(prefix)} ${chalk.blueBright(v)}`;
};
export const chalkSUCCESS = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  SUCCESS `;
  return `${chalk.bgGreenBright.black(prefix)} ${chalk.greenBright(v)}`;
};
export const chalkERROR = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  ERROR   `;
  return `${chalk.bgRedBright.black(prefix)} ${chalk.redBright(v)}`;
};
export const chalkWARN = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  WARN    `;
  return `${chalk.bgHex('#FFA500').black(`${prefix}`)} ${chalk.hex('#FFA500')(
    v
  )}`;
};
