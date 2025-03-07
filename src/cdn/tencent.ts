import { cdn } from 'tencentcloud-sdk-nodejs-cdn';

import { BilldDeploy } from '../interface';
import { chalkERROR, chalkSUCCESS } from '../utils/chalkTip';

export const handleTencentCdn = async function (data: BilldDeploy) {
  const { tencentCdnConfig: cdnConfig, tencentCdnJob: cdnJob } = data.config;
  if (!cdnConfig || !cdnJob) {
    console.log(chalkERROR(`CDN配置错误！`));
    return;
  }

  const { SecretId, SecretKey } = cdnConfig(data);
  const { Purge } = cdnJob(data);

  try {
    const CdnClient = cdn.v20180606.Client;
    const client = new CdnClient({
      // 为了保护密钥安全，建议将密钥设置在环境变量中或者配置文件中，请参考本文凭证管理章节。
      // 硬编码密钥到代码中有可能随代码泄露而暴露，有安全隐患，并不推荐。
      credential: {
        secretId: SecretId,
        secretKey: SecretKey,
      },
    });
    if (Purge.urls) {
      let errmsg = '';
      try {
        await client.PurgeUrlsCache(Purge.urls, (err) => {
          if (err) {
            errmsg = err;
          }
        });
        console.log(chalkSUCCESS(`提交URL刷新成功：${Purge.urls.Urls.join()}`));
      } catch (error: any) {
        console.error(error);
        errmsg = error;
      }
      if (errmsg !== '') {
        console.log(chalkERROR('提交URL刷新失败'));
        console.log(chalkERROR(errmsg));
      }
    }
    if (Purge.paths) {
      let errmsg = '';
      try {
        await client.PurgePathCache(Purge.paths, (err) => {
          if (err) {
            errmsg = err;
          }
        });
        console.log(
          chalkSUCCESS(`提交目录刷新成功：${Purge.paths.Paths.join()}`)
        );
      } catch (error: any) {
        console.error(error);
        errmsg = error;
      }
      if (errmsg !== '') {
        console.log(chalkERROR('提交目录刷新失败'));
        console.log(chalkERROR(errmsg));
      }
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};
