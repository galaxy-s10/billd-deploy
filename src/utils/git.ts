import fs from 'fs';
import path from 'path';

import { logData } from 'billd-html-webpack-plugin';

import { chalkSUCCESS } from './chalkTip';

export const generateDeployFile = () => {
  fs.writeFileSync(
    path.resolve(process.cwd(), 'deploy.json'),
    JSON.stringify(logData(), {}, 2)
  );
  console.log(
    chalkSUCCESS(`${new Date().toLocaleString()}，生成临时deploy.json文件完成`)
  );
};

export const deleteDeployFile = () => {
  fs.rmSync(path.resolve(process.cwd(), 'deploy.json'));
  console.log(
    chalkSUCCESS(`${new Date().toLocaleString()}，删除临时deploy.json文件完成`)
  );
};
