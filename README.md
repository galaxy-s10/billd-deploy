<p align="center">
  <a href="">
    <img
      width="200"
      src="https://resource.hsslive.cn/image/1613141138717Billd.webp"
      alt="billd-deploy logo"
    />
  </a>
</p>

<h1 align="center">
  billd-deploy
</h1>

<p align="center">
部署脚本,支持阿里云oss、腾讯云cos、华为云obs、七牛云
</p>

<div align="center">
<a href="https://www.npmjs.com/package/billd-deploy"><img src="https://img.shields.io/npm/v/billd-deploy.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/billd-deploy"><img src="https://img.shields.io/npm/dw/billd-deploy.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/billd-deploy"><img src="https://img.shields.io/npm/l/billd-deploy.svg" alt="License"></a>
</div>

# 简介

该插件主要帮你把本地项目部署到线上,做了以下事情：

- 根据你传入的 env,判断
  - 如果是 `prod`,则检测 git 状态,是否已经将本地的代码都提交到远程仓库,如果没有,则报错（确保你部署到线上的代码都在远程仓库有一个提交记录,方便出问题回退）,如果有,则执行 `npm run release`,然后执行 `git push --follow-tags`。
  - 如果是 `beta`,则不检测 git 状态,也不执行 `npm run release`,直接下一步。
- 根据你传入的 env,执行 `npm run build:beta` 或 `npm run build:prod`（此时应该输出静态资源目录）。
- 在你的项目根目录生成一个临时的 deploy.json 文件,它记录了此时的 git 信息、pkg 信息、构建时间。
- 根据你的 ssh 配置,将你配置的文件目录和文件（此时应该配置输出的静态资源目录和 deploy.json 文件）上传到服务器。
- 根据你的 cdn 配置,将你配置的文件目录和文件（此时应该配置输出的静态资源目录和 deploy.json 文件）上传到阿里云 oss / 华为云 obs / 七牛云,也可以配置不使用 cdn
- 删除临时的 deploy.json 文件
- 检测是否是 node 项目（ecosystem.config.js）,如果是的话则显示提示（进入服务器重新安装依赖、重启 pm2）

> ssh 和 cdn 操作都是执行的 put 操作,不会删除文件

# 安装

```bash
npm i billd-deploy
```

# 使用

## esm 方式引入

```js
import { deploy } from 'billd-deploy';

const myconfig = {
  env: 'beta', // 要求是'prod'或'beta'
  config: {
    // 这个data就是你传入deploy的配置,即myconfig
    cdn: (data) => (data.env === 'beta' ? 'none' : 'huawei'), // 使用哪种cdn,要求返回'huawei'或'ali'或'qiniu'或'none'
    // 这个data就是你传入deploy的配置,即myconfig
    ssh: (data) => false, // 是否使用ssh,要求返回true或者false
    // 这个data就是你传入deploy的配置,即myconfig
    sshConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    sshFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuFileConfig: (data) => {},
  },
};
deploy(myconfig);
```

## commonjs 方式引入

```js
const { deploy } = require('billd-deploy');

const myconfig = {
  env: 'beta', // 要求是'prod'或'beta'
  config: {
    // 这个data就是你传入deploy的配置,即myconfig
    cdn: (data) => (data.env === 'beta' ? 'none' : 'huawei'), // 要求返回'huawei'或'ali'或'qiniu'或'none'
    // 这个data就是你传入deploy的配置,即myconfig
    ssh: (data) => true, // 是否使用ssh,要求返回true或者false
    // 这个data就是你传入deploy的配置,即myconfig
    sshConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    sshFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuFileConfig: (data) => {},
  },
};
deploy(myconfig);
```

# 配置项

config 里面的所有配置项都需要返回特定的配置,具体请看：

[https://github.com/galaxy-s10/billd-deploy/blob/master/src/interface.ts](https://github.com/galaxy-s10/billd-deploy/blob/master/src/interface.ts)

```js
{
  env: 'beta', // 要求是'prod'或'beta'
  config: {
    // 这个data就是你传入deploy的配置,即myconfig
    cdn: (data) => (data.env === 'beta' ? 'none' : 'huawei'), // 要求返回'huawei'或'ali'或'qiniu'或'none'
    // 这个data就是你传入deploy的配置,即myconfig
    ssh: (data) => true, // 是否使用ssh,要求返回true或者false
    // 这个data就是你传入deploy的配置,即myconfig
    sshConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    sshFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    huaweiObsFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    aliOssFileConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuConfig: (data) => {},
    // 这个data就是你传入deploy的配置,即myconfig
    qiniuFileConfig: (data) => {},
  },
}
```

# 案例

## 配置

在你的项目的 package.json 新增：

```json
{
  // ...
  "scripts": {
    // ...
    "build:beta": "nuxt build",
    "build:prod": "nuxt build",
    "deploy:beta": "node ./deploy/index.js --beta",
    "deploy:prod": "node ./deploy/index.js --prod",
    "release": ""
  }
}
```

在你的项目新增：deploy/index.js：

```js
const path = require('path');

const { deploy } = require('billd-deploy');

const env = process.argv.includes('--prod') ? 'prod' : 'beta';

deploy({
  env,
  config: {
    cdn: (data) => (data.env === 'beta' ? 'none' : 'huawei'),

    ssh: (data) => true,

    sshConfig: () => {
      return {
        host: 'xxxx',
        username: 'xxxx',
        password: 'xxxxx',
      };
    },

    sshFileConfig: (data) => {
      const outDir = data.env === 'prod' ? 'h5' : 'h5beta';
      return {
        // 将本地的目录上传到服务端目录
        dir: {
          local: path.resolve(__dirname, `../${outDir}`),
          remote: '/data/apps/html/xdyun',
        },
        // 将本地的文件上传到服务端目录
        file: {
          local: [
            path.resolve(__dirname, '../.npmrc'),
            path.resolve(__dirname, '../README.md'),
            path.resolve(__dirname, '../deploy.json'),
          ],
          remote: `/data/apps/html/xdyun/${outDir}`,
        },
      };
    },

    huaweiObsConfig: (data) => {
      const outDir = data.env === 'prod' ? 'h5' : 'h5beta';
      return {
        access_key_id: 'xxxxx',
        secret_access_key: 'xxxxx',
        server: 'obs.cn-east-3.myhuaweicloud.com', // 华为obs browser+客户端里面,桶列表,找到对应的桶,看旁边的操作栏里面基本信息,找到Endpoint
        bucket: 'ldres',
        prefix: `ldq_website/xdyun-web-app-${outDir}`, // obsPrefix的最前面不能带/
      };
    },

    huaweiObsFileConfig: (data) => {
      const outDir = data.env === 'prod' ? 'h5' : 'h5beta';
      return {
        // 将本地的目录上传到cdn目录（包括这个目录）
        dir: {
          local: path.resolve(__dirname, `../${outDir}`),
        },
        // 将本地的文件上传到cdn目录（注意不要将敏感信息上传到cdn！！！）
        file: {
          local: [path.resolve(__dirname, '../deploy.json')],
        },
      };
    },
  },
});
```

## 部署测试环境

```bash
npm run deploy:beta
```

## 部署正式环境

```bash
npm run deploy:prod
```

# 注意

从简介可以看出,你的 package.json 必须得存在以下脚本：

```json
{
  // ...
  "scripts": {
    // ...
    "build:beta": "",
    "build:prod": "",
    "release": ""
  }
}
```

# 调试

- 在本地的 billd-deploy 项目目录下执行：

```bash
pnpm link --global --dir=./
```

- 启动项目：

```bash
npm run dev
```

- 在用到 billd-deploy 的项目目录下执行：

```bash
pnpm link --global billd-deploy
```

# 源码

github：[https://github.com/galaxy-s10/billd-deploy](https://github.com/galaxy-s10/billd-deploy),欢迎 star or fork！

```

```
