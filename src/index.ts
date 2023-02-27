import { handleBuild } from './build';
import { handleAliOssCDN } from './cdn/ali-oss';
import { handleHuaweiObsCDN } from './cdn/huawei-obs';
import { handleQiniuCDN } from './cdn/qiniu';
import { BilldDeploy, EnvEnum, CdnEnum } from './interface';
import { handleSSH } from './ssh';
import { chalkSUCCESS, chalkERROR } from './utils/chalkTip';
import { generateDeployFile, deleteDeployFile } from './utils/git';
import { handlePm2Tip } from './utils/pm2Tip';

export * from './interface';

export const deploy = async function (data: BilldDeploy) {
  const { env, config } = data;
  if (!config || !env) {
    console.log(chalkERROR('缺少env或config！'));
    return;
  }

  const allowEnv = Object.keys(EnvEnum);
  if (!allowEnv.includes(env)) {
    console.log(chalkERROR(`env错误, env必须是: ${allowEnv.toString()}之一`));
    return;
  }

  const allowCdn = Object.keys(CdnEnum);
  if (!allowCdn.includes(config.cdn(data))) {
    console.log(
      chalkERROR(`config.cdn错误, config.cdn必须是: ${allowCdn.toString()}之一`)
    );
    return;
  }

  try {
    await handleBuild(data);
    generateDeployFile();
    switch (config.cdn(data)) {
      case CdnEnum.huawei:
        await handleHuaweiObsCDN(data);
        break;
      case CdnEnum.ali:
        await handleAliOssCDN(data);
        break;
      case CdnEnum.qiniu:
        await handleQiniuCDN(data);
        break;
    }
    await handleSSH(data);
    deleteDeployFile();
    console.log(chalkSUCCESS(`构建${env}成功`));
    handlePm2Tip(data);
  } catch (error) {
    console.log(chalkERROR(`构建${env}出错`), error);
  }
};
