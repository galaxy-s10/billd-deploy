import fs from 'fs';
import path from 'path';

import { NodeSSH } from 'node-ssh';

import { BilldDeploy } from './interface';
import { chalkSUCCESS, chalkERROR } from './utils/chalkTip';

export const handleSSH = async function (data: BilldDeploy) {
  const { sshFileConfig, sshConfig } = data.config;
  const serverConfig = sshFileConfig(data);
  const ssh = new NodeSSH();

  async function connectServer() {
    await ssh.connect(sshConfig);
    console.log(chalkSUCCESS(`ssh连接${data.config.sshConfig.host}成功`));
  }

  async function uploadFiles() {
    const dirName = serverConfig.dir.local.split(path.sep).pop();
    if (!fs.existsSync(serverConfig.dir.local)) {
      console.log(chalkERROR(`${serverConfig.dir.local},不存在！`));
      return;
    }
    const localDirectory = serverConfig.dir.local;
    // 服务器路径直接写死（因为服务器的路径一定是/aa/bb/ccc这样的），如果用path.resolve或者join处理的话，win环境下会出问题。
    // 将传入的remote最后的/替换掉，防止出错
    const oldRemote = serverConfig.dir.remote.replace(/\/$/, '');
    const oldRemoteDirectory = `${oldRemote}/${dirName}`;
    const remoteDirectory =
      path.sep === '/'
        ? oldRemoteDirectory
        : oldRemoteDirectory.replace(/\\/g, '/');

    const dirUploadStatus = await ssh.putDirectory(
      localDirectory,
      path.sep === '/' ? remoteDirectory : remoteDirectory.replace(/\\/g, '/'),
      {
        recursive: true, // 递归
        concurrency: 10, // 并发
      }
    );

    console.log(
      chalkSUCCESS(
        `将本地的目录: ${localDirectory}, 上传到${
          data.config.sshConfig.host
        }服务器目录${remoteDirectory}${dirUploadStatus ? '成功' : '失败'}`
      )
    );

    const arr = [];
    serverConfig.file.local.forEach((item) => {
      const filename = item.split(path.sep).pop();
      // 服务器路径直接写死（因为服务器的路径一定是/aa/bb/ccc这样的），如果用path.resolve或者join处理的话，win环境下会出问题。
      // 将传入的remote最后的/替换掉，防止出错
      const oldRemote1 = serverConfig.file.remote.replace(/\/$/, '');
      const oldRemote2 = `${oldRemote1}/${filename}`;
      const newRemote =
        path.sep === '/' ? oldRemote2 : oldRemote2.replace(/\\/g, '/');

      arr.push({
        local: item,
        remote: newRemote,
      });
    });

    await ssh.putFiles(arr);
    console.log(
      chalkSUCCESS(
        `将本地的文件: ${serverConfig.file.local}, 上传到${data.config.sshConfig.host}服务器目录${serverConfig.file.remote}成功`
      )
    );
  }

  // 连接服务器
  await connectServer();

  // 上传文件到服务器
  await uploadFiles();

  // 关闭ssh
  ssh.dispose();
  console.log(chalkSUCCESS(`关闭${data.config.sshConfig.host}的ssh`));
};
