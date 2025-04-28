import { handleBuild } from './build';
import { handleTencentCdn } from './cdn/tencent';
import { handleAliOss } from './cos/ali-oss';
import { handleHuaweiObs } from './cos/huawei-obs';
import { handleQiniuKodo } from './cos/qiniu-kodo';
import { handleTencentCos } from './cos/tencent-cos';
import { BilldDeploy, CdnEnum, CosEnum } from './interface';
import { handleRelease } from './release';
import { handleSSH } from './ssh';
import { calculateRemainingTime } from './utils';
import { cache } from './utils/cache';
import { chalkERROR, chalkSUCCESS, chalkWARN } from './utils/chalkTip';
import { deleteDeployFile, generateDeployFile } from './utils/git';
import { handlePm2Tip } from './utils/pm2Tip';

export * from './interface';

function checkHasError() {
  Object.keys(cache).forEach((key) => {
    if (cache[key] === 'error') {
      console.log(chalkERROR(`${key}失败`));
      process.exit(1);
    }
  });
}

export const deploy = async function (data: BilldDeploy) {
  console.log(chalkSUCCESS(`开始部署`));
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

  if (config.cdn) {
    const allowCdn = Object.keys(CdnEnum);
    if (!allowCdn.includes(config.cdn(data))) {
      console.log(
        chalkERROR(
          `config.cdn错误, config.cdn必须是: ${allowCdn.toString()}之一`
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
      checkHasError();
    } else {
      console.log(chalkWARN('没有配置打包'));
    }
    generateDeployFile();

    if (config.cos && config.cos(data)) {
      console.log(chalkWARN('配置了cos对象存储,开始执行cos对象存储操作'));
      if (config.cos(data) === CosEnum.none) {
        console.log(chalkWARN('配置了cos对象存储为none，不执行'));
      } else {
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
      checkHasError();
    } else {
      console.log(chalkWARN('没有配置对象存储'));
    }

    if (config.cdn && config.cdn(data)) {
      console.log(chalkWARN('配置了cdn内容分发,开始执行cdn内容分发操作'));
      if (config.cdn(data) === CdnEnum.none) {
        console.log(chalkWARN('配置了cdn内容分发为none，不执行'));
      } else {
        switch (config.cdn(data)) {
          case CdnEnum.tencent:
            await handleTencentCdn(data);
            break;
        }
      }
      checkHasError();
    } else {
      console.log(chalkWARN('没有配置cdn内容分发'));
    }

    if (config.ssh && config.ssh(data)) {
      console.log(chalkWARN('配置了SSH,开始执行SSH操作'));
      if (config.ssh(data) === false) {
        console.log(chalkWARN('配置了SSH为false，不执行'));
      } else {
        await handleSSH(data);
      }
      checkHasError();
    } else {
      console.log(chalkWARN('没有配置SSH'));
    }

    deleteDeployFile();
    const endTime = new Date().getTime();
    handlePm2Tip(data);
    console.log(
      chalkSUCCESS(
        `部署完成，总耗时：${calculateRemainingTime({
          startTime,
          endTime,
        })}`
      )
    );
    deployDoneCb?.({ err: false });
  } catch (error) {
    console.log(chalkERROR(`部署出错`), error);
    deployDoneCb?.({ err: true });
    process.exit(1);
  }
};
