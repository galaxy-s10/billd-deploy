import { execSync } from 'child_process';

import { BilldDeploy } from './interface';
import { chalkSUCCESS } from './utils/chalkTip';

export const handleBuild = (data: BilldDeploy) => {
  execSync(`npm run build:${data.env === 'prod' ? 'prod' : 'beta'}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log(chalkSUCCESS(`构建${data.env}完成`));
};
