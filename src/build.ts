import { execSync } from 'child_process';

import { chalkERROR, chalkSUCCESS } from './utils/chalkTip';

export const handleBuild = (buildCmd = '') => {
  if (buildCmd === '') {
    console.log(chalkERROR(`buildCmd为空！`));
    return;
  }
  execSync(buildCmd, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log(chalkSUCCESS(`构建完成`));
};
