import fs from 'fs';
import path from 'path';

import COS from 'cos-nodejs-sdk-v5';

import { BilldDeploy } from '../interface';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '../utils/chalkTip';
import Queue from '../utils/queue';

export const handleTencentOssCDN = function (data: BilldDeploy) {
  const { tencentCosConfig: cdnConfig, tencentCosFileConfig: cdnFileConfig } =
    data.config;
  if (!cdnConfig || !cdnFileConfig) return;

  const tencentCosConfig = cdnConfig(data);
  const tencentCosFileConfig = cdnFileConfig(data);

  function findFile(inputDir) {
    const res: string[] = [];
    function loop(dirArr) {
      for (let i = 0; i < dirArr.length; i += 1) {
        const file = dirArr[i];
        const filePath = path.resolve(inputDir, file);
        const stat = fs.statSync(filePath);
        const isDir = stat.isDirectory();
        if (!isDir) {
          res.push(filePath);
        } else {
          loop(fs.readdirSync(filePath).map((key) => path.join(file, key)));
        }
      }
    }

    let inputDirArr: string[] = [];

    try {
      inputDirArr = fs.readdirSync(inputDir);
    } catch (error) {
      // eslint-disable-next-line
      console.log(chalkERROR(`${inputDir},路径不存在！`));
      // eslint-disable-next-line
      throw new Error(`${inputDir},路径不存在！`);
    }

    loop(inputDirArr);

    return res;
  }

  try {
    const uploadOkRecord = new Map(); // 上传成功记录
    const uploadErrRecord = new Map(); // 上传失败记录
    const allFile: string[] = []; // 所有需要上传的文件

    const client = new COS({
      SecretId: tencentCosConfig.SecretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://www.tencentcloud.com/document/product/598/37140?from_cn_redirect=1
      SecretKey: tencentCosConfig.SecretKey, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://www.tencentcloud.com/document/product/598/37140?from_cn_redirect=1
    });

    // 添加tencentCosFileConfig目录
    allFile.push(...findFile(tencentCosFileConfig.dir.local));

    tencentCosFileConfig.file.local.forEach((item) => {
      // 添加tencentCosFileConfig的文件
      allFile.push(item);
    });

    // eslint-disable-next-line
    async function put(ossFlieName, filePath) {
      try {
        const result = await client.put(
          ossFlieName,
          filePath,
          // 自定义headers
          {
            headers: {
              // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。设置为false，表示允许覆盖同名Object。
              'x-oss-forbid-overwrite': 'false',
            },
          }
        );
        // const result = { res: { status: 200 } };
        const status = result.res.status;
        if (status === 200) {
          uploadOkRecord.set(filePath, status);
          console.log(
            chalkSUCCESS(
              // eslint-disable-next-line
              `cdn上传成功(${uploadOkRecord.size}/${allFile.length}): ${filePath} ===> ${ossFlieName}`
            )
          );
        } else {
          uploadErrRecord.set(filePath, status);
          console.log(
            filePath,
            `cdn上传失败：${uploadErrRecord.size}/${allFile.length}`
          );
          console.log(result);
        }
        const progress = uploadOkRecord.size + uploadErrRecord.size;
        if (progress === allFile.length) {
          console.log(
            chalkINFO(
              `所有文件上传cdn完成。成功：${uploadOkRecord.size}/${allFile.length}；失败：${uploadErrRecord.size}/${allFile.length}`
            )
          );

          if (uploadErrRecord.size) {
            console.log(chalkERROR('上传cdn失败数据'), uploadErrRecord);
          }
        }
      } catch (error) {
        console.log(chalkERROR('上传cdn错误'), error);
      }
    }

    return new Promise((resolve) => {
      // 这里需要限制并发数
      const uploadQueue = new Queue({
        max: 5,
        done: () => resolve('all done~'),
      });
      allFile.forEach((filePath) => {
        if (tencentCosFileConfig.file.local.includes(filePath)) {
          const filename = filePath.split(path.sep).pop();
          const ossFlieName = path.join(tencentCosConfig.prefix, filename);
          uploadQueue.addTask(() =>
            put(
              path.sep === '/' ? ossFlieName : ossFlieName.replace(/\\/g, '/'),
              filePath
            )
          );
        } else {
          const dirName = tencentCosFileConfig.dir.local.split(path.sep).pop();
          const ossFlieName =
            tencentCosConfig.prefix +
            filePath.replace(
              tencentCosFileConfig.dir.local,
              path.sep + dirName
            );
          uploadQueue.addTask(() =>
            put(
              path.sep === '/' ? ossFlieName : ossFlieName.replace(/\\/g, '/'),
              filePath
            )
          );
        }
      });
    });
  } catch (error) {
    console.log(chalkERROR('cdn脚本错误'), error);
  }
};
