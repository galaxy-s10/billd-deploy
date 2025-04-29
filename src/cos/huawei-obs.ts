import fs from 'fs';
import path from 'path';

import OBS from 'esdk-obs-nodejs';

import { BilldDeploy } from '../interface';
import { cache } from '../utils/cache';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '../utils/chalkTip';
import Queue from '../utils/queue';

export const handleHuaweiObs = function (data: BilldDeploy) {
  const { huaweiObsConfig: cosConfig, huaweiObsFileConfig: cosFileConfig } =
    data.config;
  if (!cosConfig || !cosFileConfig) {
    console.log(chalkERROR(`华为云obs配置错误！`));
    return;
  }

  const huaweiObsConfig = cosConfig(data);
  const huaweiObsFileConfig = cosFileConfig(data);
  const { bucket: obsBucket, prefix: obsPrefix } = huaweiObsConfig;

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

    // https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0404.html
    const client = new OBS({
      access_key_id: huaweiObsConfig.access_key_id,
      secret_access_key: huaweiObsConfig.secret_access_key,
      // server : 'https://your-endpoint'
      server: huaweiObsConfig.server, // 华为obs browser+客户端里面，桶列表，找到对应的桶，看旁边的操作栏里面基本信息，找到Endpoint
    });

    if (huaweiObsFileConfig.dir) {
      // 添加huaweiObsFileConfig目录
      allFile.push(...findFile(huaweiObsFileConfig.dir.local));
    } else {
      console.log(chalkWARN('没有配置上传本地目录到huawei-obs目录'));
    }

    if (huaweiObsFileConfig.file) {
      huaweiObsFileConfig.file.local.forEach((item) => {
        // 添加huaweiObsFileConfig的文件
        allFile.push(item);
      });
    } else {
      console.log(chalkWARN('没有配置上传本地文件到huawei-obs目录'));
    }

    // eslint-disable-next-line
    async function put(obsBucket, obsFlieName, filePath) {
      try {
        const result = await new Promise<{ code: number; result?; err? }>(
          (resolve) => {
            client.putObject(
              {
                Bucket: obsBucket,
                Key: obsFlieName,
                SourceFile: filePath,
              },
              // eslint-disable-next-line
              (err, result) => {
                if (err) {
                  return resolve({ code: 500, result, err });
                }
                resolve({ code: 200, result });
              }
            );
          }
        );
        // const result = { code: 200 }
        const status = result.code;
        if (status === 200) {
          uploadOkRecord.set(filePath, status);
          console.log(
            chalkSUCCESS(
              `上传huawei-obs成功(${
                uploadOkRecord.size
                // eslint-disable-next-line
              }/${allFile.length}): ${filePath} ===> ${obsFlieName}`
            )
          );
        } else {
          uploadErrRecord.set(filePath, status);
          console.log(result);
          cache.cos = 'error';
          console.log(
            chalkERROR(
              // eslint-disable-next-line
              `上传huawei-obs失败(${uploadErrRecord.size}/${allFile.length}): ${filePath} ===> ${obsFlieName}`
            )
          );
        }
        const progress = uploadOkRecord.size + uploadErrRecord.size;
        if (progress === allFile.length) {
          console.log(
            chalkINFO(
              `所有文件上传huawei-obs完成。成功：${uploadOkRecord.size}/${allFile.length}；失败：${uploadErrRecord.size}/${allFile.length}`
            )
          );

          if (uploadErrRecord.size) {
            cache.cos = 'error';
            console.log(chalkERROR(`上传huawei-obs失败数据`), uploadErrRecord);
          }
        }
      } catch (error) {
        cache.cos = 'error';
        console.log(chalkERROR(`上传huawei-obs错误`), error);
      }
    }

    return new Promise((resolve) => {
      // 这里需要限制并发数
      const uploadQueue = new Queue({
        max: 5,
        done: () => resolve('all done~'),
      });
      allFile.forEach((filePath) => {
        if (huaweiObsFileConfig.file) {
          if (huaweiObsFileConfig.file.local.includes(filePath)) {
            const filename = filePath.split(path.sep).pop() || '';
            const obsFlieName = path.join(obsPrefix, filename);
            uploadQueue.addTask(() =>
              put(
                obsBucket,
                path.sep === '/'
                  ? obsFlieName
                  : obsFlieName.replace(/\\/g, '/'),
                filePath
              )
            );
          } else {
            if (huaweiObsFileConfig.dir) {
              const dirName =
                huaweiObsFileConfig.dir.local.split(path.sep).pop() || '';
              const ignoreDir = huaweiObsFileConfig.dir.ignoreDir;
              const obsFlieName =
                obsPrefix +
                filePath.replace(
                  huaweiObsFileConfig.dir.local,
                  ignoreDir ? '' : path.sep + dirName
                );
              uploadQueue.addTask(() =>
                put(
                  obsBucket,
                  path.sep === '/'
                    ? obsFlieName
                    : obsFlieName.replace(/\\/g, '/'),
                  filePath
                )
              );
            }
          }
        }
      });
    });
  } catch (error) {
    console.log(chalkERROR(`cdn脚本错误`), error);
  }
};
