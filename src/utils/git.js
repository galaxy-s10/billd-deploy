const fs = require('fs');
const path = require('path');

const { logData } = require('billd-html-webpack-plugin');

const { chalkSUCCESS } = require('./chalkTip');

const generateDeployFile = () => {
  fs.writeFileSync(
    path.resolve(process.cwd(), 'deploy.json'),
    JSON.stringify(logData(), {}, 2)
  );
  console.log(chalkSUCCESS('生成临时deploy.json文件完成'));
};

const deleteDeployFile = () => {
  fs.rmSync(path.resolve(process.cwd(), 'deploy.json'));
  console.log(chalkSUCCESS('删除临时deploy.json文件完成'));
};

exports.generateDeployFile = generateDeployFile;
exports.deleteDeployFile = deleteDeployFile;
