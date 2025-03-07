import { CdnEnum } from 'dist';
import { handleBuild } from './build';
import { handleTencentCdn } from './cdn/tencent';
import { handleAliOss } from './cos/ali-oss';
import { handleHuaweiObs } from './cos/huawei-obs';
import { handleQiniuKodo } from './cos/qiniu-kodo';
import { handleTencentCos } from './cos/tencent-cos';
import { BilldDeploy, CosEnum } from './interface';
import { handleRelease } from './release';
import { handleSSH } from './ssh';
import { calculateRemainingTime } from './utils';
import { chalkERROR, chalkSUCCESS, chalkWARN } from './utils/chalkTip';
import { deleteDeployFile, generateDeployFile } from './utils/git';
import { handlePm2Tip } from './utils/pm2Tip';

export * from './interface';

export const deploy = async function (data: BilldDeploy) {
  const startTime = new Date().getTime();
  const {
    shouldBuild = true,
    buildCmd,
    verifyGit = true,
    shouldRelease = true,
    config,
    deployDoneCb,
  } = data;
  if (!config) {
    console.log(chalkERROR('缺少config！'));
    return;
  }

  if (config.cos) {
    const allowCos = Object.keys(CosEnum);
    if (!allowCos.includes(config.cos(data))) {
      console.log(
        chalkERROR(
          `config.cos错误, config.cos必须是: ${allowCos.toString()}之一`
        )
      );
      return;
    }
  }

  try {
    await handleRelease(verifyGit, shouldRelease);
    if (shouldBuild) {
      console.log(chalkWARN('配置了打包,开始执行打包命令'));
      handleBuild(buildCmd);
    }
    generateDeployFile();

    if (config.cos && config.cos(data)) {
      console.log(chalkWARN('配置了cos对象存储,开始执行cos对象存储操作'));
      switch (config.cos(data)) {
        case CosEnum.huawei:
          await handleHuaweiObs(data);
          break;
        case CosEnum.ali:
          await handleAliOss(data);
          break;
        case CosEnum.qiniu:
          await handleQiniuKodo(data);
          break;
        case CosEnum.tencent:
          await handleTencentCos(data);
          break;
      }
    }
    if (config.cdn && config.cdn(data)) {
      console.log(chalkWARN('配置了cdn内容分发,开始执行cdn内容分发操作'));
      switch (config.cdn(data)) {
        case CdnEnum.tencent:
          await handleTencentCdn(data);
          break;
      }
    }
    if (config.ssh && config.ssh(data)) {
      console.log(chalkWARN('配置了SSH,开始执行SSH操作'));
      await handleSSH(data);
    }
    deleteDeployFile();
    const endTime = new Date().getTime();
    handlePm2Tip(data);
    console.log(
      chalkSUCCESS(
        `构建成功，总耗时：${calculateRemainingTime({
          startTime,
          endTime,
        })}`
      )
    );
    deployDoneCb?.({ err: false });
  } catch (error) {
    console.log(chalkERROR(`构建出错`), error);
    deployDoneCb?.({ err: true });
  }
};
