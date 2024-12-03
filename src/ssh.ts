import fs from 'fs';
import path from 'path';

import { NodeSSH } from 'node-ssh';

import { BilldDeploy } from './interface';
import { chalkERROR, chalkSUCCESS, chalkWARN } from './utils/chalkTip';

export const handleSSH = async function (data: BilldDeploy) {
  const { sshFileConfig, sshConfig } = data.config;
  if (!sshConfig || !sshFileConfig) return;

  const serverConfig = sshConfig(data);
  const serverFile = sshFileConfig(data);

  const ssh = new NodeSSH();

  async function connectServer() {
    await ssh.connect(serverConfig);
    console.log(chalkSUCCESS(`ssh连接${serverConfig.host}成功`));
  }

  async function uploadFiles() {
    if (serverFile.dir) {
      const dirName = serverFile.dir.local.split(path.sep).pop() || '';
      if (!fs.existsSync(serverFile.dir.local)) {
        console.log(chalkERROR(`${serverFile.dir.local},不存在！`));
        return;
      }
      const localDirectory = serverFile.dir.local;
      // 服务器路径直接写死（因为服务器的路径一定是/aa/bb/ccc这样的），如果用path.resolve或者join处理的话，win环境下会出问题。
      // 将传入的remote最后的/替换掉，防止出错
      const oldRemote = serverFile.dir.remote.replace(/\/$/, '');
      let oldRemoteDirectory = '';
      if (serverFile.dir.ignoreDir) {
        oldRemoteDirectory = `${oldRemote}`;
      } else {
        oldRemoteDirectory = `${oldRemote}/${dirName}`;
      }

      const remoteDirectory =
        path.sep === '/'
          ? oldRemoteDirectory
          : oldRemoteDirectory.replace(/\\/g, '/');

      const dirUploadStatus = await ssh.putDirectory(
        localDirectory,
        path.sep === '/'
          ? remoteDirectory
          : remoteDirectory.replace(/\\/g, '/'),
        {
          recursive: true, // 递归
          concurrency: 10, // 并发
        }
      );

      console.log(
        chalkSUCCESS(
          `将本地的目录: ${localDirectory}, 上传到${
            serverConfig.host
          }服务器目录${remoteDirectory}${dirUploadStatus ? '成功' : '失败'}`
        )
      );
    } else {
      console.log(chalkWARN('没有配置上传本地目录到服务器目录'));
    }

    const arr: any[] = [];

    if (serverFile.file) {
      serverFile.file.local.forEach((item) => {
        const filename = item.split(path.sep).pop() || '';
        // 服务器路径直接写死（因为服务器的路径一定是/aa/bb/ccc这样的），如果用path.resolve或者join处理的话，win环境下会出问题。
        // 将传入的remote最后的/替换掉，防止出错
        if (serverFile.file) {
          const oldRemote1 = serverFile.file.remote.replace(/\/$/, '');
          const oldRemote2 = `${oldRemote1}/${filename}`;
          const newRemote =
            path.sep === '/' ? oldRemote2 : oldRemote2.replace(/\\/g, '/');

          arr.push({
            local: item,
            remote: newRemote,
          });
        }
      });
      await ssh.putFiles(arr);
      console.log(
        chalkSUCCESS(
          `将本地的文件: ${serverFile.file.local.join()}, 上传到${
            serverConfig.host
          }服务器目录${serverFile.file.remote}成功`
        )
      );
    } else {
      console.log(chalkWARN('没有配置上传文件目录到服务器目录'));
    }
  }

  // 连接服务器
  await connectServer();

  // 上传文件到服务器
  await uploadFiles();

  // 关闭ssh
  ssh.dispose();
  console.log(chalkSUCCESS(`关闭${serverConfig.host}的ssh`));
};
