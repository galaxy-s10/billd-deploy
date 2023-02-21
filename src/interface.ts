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
  bucket: string;
  prefix: string;
}

export interface IHuaweiObsConfig {
  access_key_id: string;
  secret_access_key: string;
  server: string;
}

export interface IQiniuConfig {
  todo: any;
}

export interface IBilldDeployConfig {
  use: 'ali' | 'huawei' | 'qiniu' | 'none';
  sshConfig: ISSHConfig;
  aliOssConfig: IAliOssConfig;
  huaweiObsConfig: IHuaweiObsConfig;
  qiniuConfig: IQiniuConfig;

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

  aliOssFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };

  huaweiObsFileConfig: (data: BilldDeploy) => {
    dir: {
      local: string;
      remote: {
        obsBucket: string;
        obsPrefix: string;
      };
    };
    file: {
      local: string[];
      remote: {
        obsBucket: string;
        obsPrefix: string;
      };
    };
  };

  qiniuFileConfig: (data: BilldDeploy) => any;
}

export interface BilldDeploy {
  env: 'prod' | 'beta';
  config: IBilldDeployConfig;
}
