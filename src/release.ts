import { exec, execSync } from 'child_process';

import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from './utils/chalkTip';

function isInstalledGit() {
  return new Promise((resolve, reject) => {
    exec(
      // 'git -v',
      'git --version',
      {
        cwd: process.cwd(),
      },
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(chalkERROR('未安装git'));
          console.log('error', error);
          console.log('stderr', stderr);
          reject(error || stderr);
        }
        if (stdout.length) {
          console.log(chalkINFO('已安装git'), stdout);
          resolve('ok');
        } else {
          console.log(chalkINFO('已安装git'), stdout);
          resolve('ok');
        }
      }
    );
  });
}

function gitIsClean() {
  return new Promise((resolve, reject) => {
    exec(
      'git status -s',
      {
        cwd: process.cwd(),
      },
      (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error || stderr);
        }

        if (stdout.length) {
          reject(new Error(`【提交commit到本地仓库】请确保git工作区干净！`));
        } else {
          resolve('ok');
        }
      }
    );
  });
}

function hasRemoteBranch() {
  return new Promise((resolve, reject) => {
    const commitBranch = execSync('git branch --show-current', {
      cwd: process.cwd(),
    })
      .toString()
      .trim();
    const remoteBranch = execSync('git ls-remote', {
      cwd: process.cwd(),
    })
      .toString()
      .trim();
    if (remoteBranch.search(`refs/heads/${commitBranch}`) === -1) {
      reject(
        new Error(
          `【提交分支到远程仓库】远程仓库不存在${commitBranch}分支，请将${commitBranch}分支提交到远程仓库！`
        )
      );
    } else {
      resolve('ok');
    }
  });
}

function diffRemote() {
  return new Promise((resolve, reject) => {
    const commitBranch = execSync('git branch --show-current', {
      cwd: process.cwd(),
    })
      .toString()
      .trim();
    exec(
      `git diff --stat ${commitBranch} origin/${commitBranch}`,
      {
        cwd: process.cwd(),
      },
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(error);
          console.log(stderr);
          reject(error || stderr);
        }
        if (stdout.length) {
          reject(
            new Error(
              `【提交commit到远程仓库】本地的${commitBranch}分支的git提交和远程仓库的${commitBranch}分支的git提交不一致！`
            )
          );
        } else {
          resolve('ok');
        }
      }
    );
  });
}

export const handleRelease = async (verifyGit, shouldRelease) => {
  if (verifyGit) {
    await isInstalledGit();
    await gitIsClean();
    await hasRemoteBranch();
    await diffRemote();
  } else {
    console.log(chalkWARN('不验证git'));
  }
  if (shouldRelease) {
    execSync(`npm run release`, { stdio: 'inherit', cwd: process.cwd() });
    console.log(chalkSUCCESS('更新版本完成'));
    execSync(`git push --follow-tags`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(chalkSUCCESS('提交tag完成'));
  } else {
    console.log(chalkWARN('不执行release'));
  }
};
