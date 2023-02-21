const fs = require('fs');
const path = require('path');

const OBS = require('esdk-obs-nodejs');

const { chalkERROR, chalkSUCCESS, chalkINFO } = require('../utils/chalkTip');
const Queue = require('../utils/queue');

module.exports.handleHuaweiObsCDN = function (
  data = { env: 'prod', config: {} }
) {
  const { huaweiObsConfig, huaweiObsFileConfig } = data.config;

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

    const fileConfig = huaweiObsFileConfig(data);

    // https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0404.html
    const client = new OBS({
      access_key_id: huaweiObsConfig.access_key_id,
      secret_access_key: huaweiObsConfig.secret_access_key,
      // server : 'https://your-endpoint'
      server: huaweiObsConfig.server, // 华为obs browser+客户端里面，桶列表，找到对应的桶，看旁边的操作栏里面基本信息，找到Endpoint
    });

    // 添加fileConfig目录
    allFile.push(...findFile(fileConfig.dir.local));

    fileConfig.file.local.forEach((item) => {
      // 添加fileConfig的文件
      allFile.push(item);
    });

    // eslint-disable-next-line
    async function put(obsBucket, obsFlieName, filePath) {
      try {
        const result = await new Promise((resolve) => {
          client.putObject(
            {
              Bucket: obsBucket,
              Key: obsFlieName,
              SourceFile: filePath,
            },
            // eslint-disable-next-line
            (err, result) => {
              if (err) {
                return resolve({ code: 500, err });
              }
              resolve({ code: 200, result });
            }
          );
        });
        // const result = { code: 200 }
        const status = result.code;
        if (status === 200) {
          uploadOkRecord.set(filePath, status);
          console.log(
            chalkSUCCESS(
              // eslint-disable-next-line
              `cdn上传成功(${uploadOkRecord.size}/${allFile.length}): ${filePath} ===> ${obsFlieName}`
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
          const obsFlieName = path.join(
            fileConfig.file.remote.obsPrefix,
            filename
          );
          uploadQueue.addTask(() =>
            put(
              fileConfig.file.remote.obsBucket,
              path.sep === '/' ? obsFlieName : obsFlieName.replace(/\\/g, '/'),
              filePath
            )
          );
        } else {
          const dirName = fileConfig.dir.local.split(path.sep).pop();
          const obsFlieName =
            fileConfig.dir.remote.obsPrefix +
            filePath.replace(fileConfig.dir.local, path.sep + dirName);
          uploadQueue.addTask(() =>
            put(
              fileConfig.file.remote.obsBucket,
              path.sep === '/' ? obsFlieName : obsFlieName.replace(/\\/g, '/'),
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