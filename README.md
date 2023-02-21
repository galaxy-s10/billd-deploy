# 简介

| 包名                                                           | 版本                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [ldcloud-deploy](https://www.npmjs.com/package/ldcloud-deploy) | [![npm](https://img.shields.io/npm/v/ldcloud-deploy)](https://www.npmjs.com/package/ldcloud-deploy) |

该插件主要帮你把本地项目部署到线上，做了以下事情：

- 根据你传入的 env，判断
  - 如果是 `prod`，则检测 git 状态，是否已经将本地的代码都提交到远程仓库，如果没有，则报错（确保你部署到线上的代码都在远程仓库有一个提交记录，方便出问题回退），如果有，则执行 `npm run release`，然后执行 `git push --follow-tags`。
  - 如果是 `beta`，则不检测 git 状态，也不执行 `npm run release`，直接下一步。
- 根据你传入的 env，执行 `npm run build:beta` 或 `npm run build:prod`（此时应该输出静态资源目录）。
- 在你的项目根目录生成一个临时的 deploy.json 文件，它记录了此时的 git 信息、pkg 信息、构建时间。
- 根据你的 ssh 配置，将你配置的文件目录和文件（此时应该配置输出的静态资源目录和 deploy.json 文件）上传到服务器。
- 根据你的 cdn 配置，将你配置的文件目录和文件（此时应该配置输出的静态资源目录和 deploy.json 文件）上传到阿里云 oss 或者华为云 obs（允许配置不使用 cdn）
- 删除临时的 deploy.json 文件
- 检测是否是 nuxt 项目，如果是的话则显示提示（进入服务器重新安装依赖、重启 pm2）

> ssh 和 cdn 操作都是执行的 put 操作，不会删除文件

## 注意

从简介可以看出，你的 package.json 必须得存在以下脚本：

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

# 安装

1.设置仓库

```sh
npm config set registry=https://packages.aliyun.com/5f05a0346207a1a8b17f4aaf/npm/npm-registry/
```

2.安装

```sh
npm i ldcloud-deploy
```

# 最佳实践

## nuxt2 项目

### 配置

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

> 目前 ldcloud-deploy 只支持通过 require 导入（node 环境），不能使用 import 导入

```js
const { deploy } = require('ldcloud-deploy');

const env = process.argv.includes('--prod') ? 'prod' : 'beta';

deploy({
  env, //只能是：prod或beta
  config: {
    use: 'huawei', //只能是：huawei/ali/none，当huawei时，使用huawei的cdn配置；当ali时，使用ali的cdn配置；当是none时，不使用cdn
    huaweiObsConfig: {
      access_key_id: 'xxxxx',
      secret_access_key: 'xxxxx',
      server: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
    huaweiObsFileConfig: (data) => {
      return {
        // 将本地的目录上传到cdn目录（包括这个目录）
        dir: {
          local: path.resolve(__dirname, '../dist/dist/client'),
          remote: {
            obsBucket: 'ldres',
            obsPrefix: 'ldq_website/xiaodiyun-web-cp', // obsPrefix的最前面不能带/
          },
        },
        // 将本地的文件上传到cdn目录（注意不要将敏感信息上传到cdn！！！）
        file: {
          local: [
            path.resolve(__dirname, '../deploy.json'),
            path.resolve(__dirname, '../src/static/favicon.ico'),
          ],
          remote: {
            obsBucket: 'ldres',
            obsPrefix: 'ldq_website/xiaodiyun-web-cp', // obsPrefix的最前面不能带/
          },
        },
      };
    },
    aliOssConfig: {
      // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: 'xxxxx',
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: 'xxxxx',
      accessKeySecret: 'xxxxx',
      bucket: 'xxxxx',
      prefix: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
    aliOssFileConfig: (data) => {
      return {
        // 将本地的目录上传到cdn目录（包括这个目录）
        dir: {
          local: path.resolve(__dirname, '../dist/dist/client'),
        },
        // 将本地的文件上传到cdn目录（注意不要将敏感信息上传到cdn！！！）
        file: {
          local: [
            path.resolve(__dirname, '../deploy.json'),
            path.resolve(__dirname, '../src/static/favicon.ico'),
          ],
        },
      };
    },

    sshConfig: {
      host: 'xxxxx',
      username: 'xxxxx',
      password: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
    sshFileConfig: (data) => {
      return {
        // 将本地的目录上传到服务端目录
        dir: {
          local: path.resolve(__dirname, '../dist'),
          remote: '/data/apps/html/xdyun/xiaodiyun-web-cp',
        },
        // 将本地的文件上传到服务端目录
        file: {
          local: [
            path.resolve(__dirname, '../package.json'),
            path.resolve(__dirname, '../package-lock.json'),
            path.resolve(__dirname, '../nuxt.config.js'),
            path.resolve(__dirname, '../ecosystem.config.js'),
            path.resolve(__dirname, '../.npmrc'),
            path.resolve(__dirname, '../README.md'),
            path.resolve(__dirname, '../deploy.json'),
          ],
          remote: '/data/apps/html/xdyun/xiaodiyun-web-cp',
        },
      };
    },
  },
});
```

### 部署测试环境

```sh
npm run deploy:beta
```

### 部署正式环境

```sh
npm run deploy:prod
```

## vuecli 项目

### 配置

在你的项目的 package.json 新增：

```json
{
  // ...
  "scripts": {
    // ...
    "build:beta": "vue-cli-service build",
    "build:prod": "vue-cli-service build",
    "deploy:beta": "node ./deploy/index.js --beta",
    "deploy:prod": "node ./deploy/index.js --prod",
    "release": ""
  }
}
```

在你的项目新增：deploy/index.js：

> 目前 ldcloud-deploy 只支持通过 require 导入（node 环境），不能使用 import 导入

```js
const { deploy } = require('ldcloud-deploy');

const env = process.argv.includes('--prod') ? 'prod' : 'beta';

deploy({
  env, //只能是：prod或beta
  config: {
    use: 'huawei', //只能是：huawei/ali/none，当huawei时，使用huawei的cdn配置；当ali时，使用ali的cdn配置；当是none时，不使用cdn
    huaweiObsConfig: {
      access_key_id: 'xxxxx',
      secret_access_key: 'xxxxx',
      server: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
    huaweiObsFileConfig: (data) => {
      const outDir = data.env === 'prod' ? 'h5' : 'h5beta';
      return {
        // 将本地的目录上传到cdn目录（包括这个目录）
        dir: {
          local: path.resolve(__dirname, `../${outDir}`),
          remote: {
            obsBucket: 'ldres',
            obsPrefix: `ldq_website/xdyun-web-app-${outDir}`, // obsPrefix的最前面不能带/
          },
        },
        // 将本地的文件上传到cdn目录（注意不要将敏感信息上传到cdn！！！）
        file: {
          local: [path.resolve(__dirname, '../deploy.json')],
          remote: {
            obsBucket: 'ldres',
            obsPrefix: `ldq_website/xdyun-web-app-${outDir}`, // obsPrefix的最前面不能带/
          },
        },
      };
    },

    aliOssConfig: {
      // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: 'xxxxx',
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: 'xxxxx',
      accessKeySecret: 'xxxxx',
      bucket: 'xxxxx',
      prefix: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
    aliOssFileConfig: (data) => {
      return {
        // 将本地的目录上传到cdn目录（包括这个目录）
        dir: {
          local: path.resolve(__dirname, '../dist/dist/client'),
        },
        // 将本地的文件上传到cdn目录（注意不要将敏感信息上传到cdn！！！）
        file: {
          local: [
            path.resolve(__dirname, '../deploy.json'),
            path.resolve(__dirname, '../src/static/favicon.ico'),
          ],
        },
      };
    },

    sshConfig: {
      host: 'xxxxx',
      username: 'xxxxx',
      password: 'xxxxx',
    },
    // 这个data就是你传入deploy的参数，这里你可以拿到它
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
  },
});
```

### 部署测试环境

```sh
npm run deploy:beta
```

### 部署正式环境

```sh
npm run deploy:prod
```

## 其他项目

以此类推

# 应用项目

- cloudphone_ldcloud_browser
- cloudphone_ldcloud_baike
- cloudphone_ldcloud_community
- cloudphone_ldcloud_web_os
- cloudphone_ldcloud_web_cs
- cloudphone_ldcloud_new_cp
- cloudphone_ldcloud_web_app
- cloudphone_xiaodiyun_web_cp
- cloudphone_xiaodiyun_web_app
- cloudphone_frontend_api
