import { handleBuild } from './build';
import { handleAliOssCDN } from './cdn/ali-oss';
import { handleHuaweiObsCDN } from './cdn/huawei-obs';
import { BilldDeploy } from './interface';
import { handleSSH } from './ssh';
import { chalkSUCCESS, chalkERROR } from './utils/chalkTip';
import { generateDeployFile, deleteDeployFile } from './utils/git';
import { handleNuxtTip } from './utils/nuxtTip';

export const deploy = async function ({ env, config }: BilldDeploy) {
  if (!config || !env) {
    console.log(chalkERROR('缺少env或config！'));
    return;
  }
  if (!['prod', 'beta'].includes(env)) {
    console.log(chalkERROR(`env错误,env必须是: "prod"或"beta"`));
    return;
  }
  if (!['huawei', 'ali', 'none'].includes(config.use)) {
    console.log(
      chalkERROR(`config.use错误,config.use必须是"huawei"或"ali"或"none"`)
    );
    return;
  }
  try {
    await handleBuild({ env, config });
    generateDeployFile();
    await handleSSH({ env, config });
    if (config.use === 'huawei') {
      await handleHuaweiObsCDN({ env, config });
    } else if (config.use === 'ali') {
      await handleAliOssCDN({ env, config });
    }
    deleteDeployFile();
    console.log(chalkSUCCESS(`构建${env}成功`));
    handleNuxtTip({ env, config });
  } catch (error) {
    console.log(chalkERROR(`构建${env}出错`), error);
  }
};
