import { BilldDeploy } from '../interface';

export const handleQiniuCDN = function (data: BilldDeploy) {
  const { qiniuConfig: cdnConfig, qiniuFileConfig: cdnFileConfig } =
    data.config;
  if (!cdnConfig || !cdnFileConfig) return;

  const qiniuConfig = cdnConfig(data);
  const qiniuFileConfig = cdnFileConfig(data);
  console.log(qiniuConfig, qiniuFileConfig);
};
