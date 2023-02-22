export interface ISSHConfig {
  host: string;
  username: string;
  password: string;
}

export interface IAliOssConfig {
  /** yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。 */
  region: string;
  /** 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。 */
  accessKeyId: string;
  accessKeySecret: string;
  /** 填写Bucket名称。 */
  bucket: string;
  prefix: string;
}

export interface IHuaweiObsConfig {
  /** Provide your Access Key */
  access_key_id: string;
  /** Provide your Secret Key */
  secret_access_key: string;
  /** https://your-endpoint */
  server: string;
  bucket: string;
  prefix: string;
}

export interface IQiniuConfig {
  todo: any;
}

export interface IBilldDeployConfig {
  /** 使用cdn */
  use: 'ali' | 'huawei' | 'qiniu' | 'none';

  /** ssh配置 */
  sshConfig: ISSHConfig;

  /** https://help.aliyun.com/document_detail/111265.html */
  aliOssConfig: IAliOssConfig;

  /** https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0404.html */
  huaweiObsConfig: IHuaweiObsConfig;

  /** 七牛云配置 */
  qiniuConfig: IQiniuConfig;

  /** 上传到ssh的文件、目录 */
  sshFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
      remote: string;
    };
    file: {
      local: string[];
      remote: string;
    };
  };

  /** 上传到阿里云oss的文件、目录 */
  aliOssFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };

  /** 上传到华为云obs的文件、目录 */
  huaweiObsFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };

  /** 上传到七牛云的文件、目录 */
  qiniuFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };
}

export interface BilldDeploy {
  env: 'prod' | 'beta';
  config: IBilldDeployConfig;
}
