import { execSync } from 'child_process';

import { cache } from './utils/cache';
import { chalkERROR, chalkSUCCESS } from './utils/chalkTip';

export const handleBuild = (buildCmd = '') => {
  if (buildCmd === '') {
    console.log(chalkERROR(`buildCmd为空！`));
    return;
  }
  try {
    execSync(buildCmd, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(chalkSUCCESS(`构建完成`));
  } catch (error) {
    console.log(chalkERROR(`构建失败`));
    console.log(error);
    cache.build = 'error';
  }
};
