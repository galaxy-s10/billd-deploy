import fs from 'fs';
import path from 'path';

import { chalkWARN } from './chalkTip';
import { BilldDeploy } from '../interface';

export const handleNuxtTip = (data: BilldDeploy) => {
  const nuxtConfigFile = [
    fs.existsSync(path.resolve(process.cwd(), 'nuxt.config.ts')),
    fs.existsSync(path.resolve(process.cwd(), 'nuxt.config.js')),
  ].includes(true);

  if (nuxtConfigFile) {
    console.log(chalkWARN(`当前是nuxt项目，请执行以下操作：`));
    console.log(
      chalkWARN(
        `1.进入${data.config.sshConfig.host}服务器，再进入对应的项目路径，然后重新安装依赖（如果没影响package.json的可忽略）`
      )
    );
    console.log(
      chalkWARN(
        `2.根据当前项目的ecosystem.config.js，重启对应的pm2服务（如果是首次部署,则执行pm2 start ecosystem.config.js）`
      )
    );
  }
};
