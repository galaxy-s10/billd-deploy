import fs from 'fs';
import path from 'path';

import OSS from 'ali-oss';

import { BilldDeploy } from '../interface';
import { chalkERROR, chalkSUCCESS, chalkINFO } from '../utils/chalkTip';
import Queue from '../utils/queue';

export const handleAliOssCDN = function (data: BilldDeploy) {
  const { aliOssConfig, aliOssFileConfig } = data.config;

  function findFile(inputDir) {
    const res = [];
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

    let inputDirArr = [];

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
    const allFile = []; // 所有需要上传的文件

    const fileConfig = aliOssFileConfig(data);

    const client = new OSS({
      // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: aliOssConfig.region,
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: aliOssConfig.accessKeyId,
      accessKeySecret: aliOssConfig.accessKeySecret,
      // 填写Bucket名称。
      bucket: aliOssConfig.bucket,
      // 当前的oss前缀
      prefix: aliOssConfig.prefix,
    });

    // 添加fileConfig目录
    allFile.push(...findFile(fileConfig.dir.local));

    fileConfig.file.local.forEach((item) => {
      // 添加fileConfig的文件
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
      const uploadQueue = new Queue({ max: 5, done: () => resolve() });

      allFile.forEach((filePath) => {
        if (fileConfig.file.local.includes(filePath)) {
          const filename = filePath.split(path.sep).pop();
          const ossFlieName = path.join(aliOssConfig.prefix, filename);
          uploadQueue.addTask(() =>
            put(
              path.sep === '/' ? ossFlieName : ossFlieName.replace(/\\/g, '/'),
              filePath
            )
          );
        } else {
          const dirName = fileConfig.dir.local.split(path.sep).pop();
          const ossFlieName =
            aliOssConfig.prefix +
            filePath.replace(fileConfig.dir.local, path.sep + dirName);
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
