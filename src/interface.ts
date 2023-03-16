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
  accessKey: string;
  secretKey: string;
  bucket: string;
  prefix: string;
  /** https://developer.qiniu.com/kodo/1289/nodejs#general-uptoken，qiniu.zone.Zone_z2代表华南 */
  zone: string;
}

export enum EnvEnum {
  prod = 'prod',
  beta = 'beta',
}

export enum CdnEnum {
  ali = 'ali',
  huawei = 'huawei',
  qiniu = 'qiniu',
  none = 'none',
}

export type CdnType = keyof typeof CdnEnum;
export type EnvType = keyof typeof EnvEnum;

export interface IBilldDeployConfig {
  /** 使用哪个cdn */
  cdn: (data: BilldDeploy) => CdnType;

  /** 是否使用ssh */
  ssh: (data: BilldDeploy) => boolean;

  /** ssh配置 */
  sshConfig?: (data: BilldDeploy) => ISSHConfig;

  /** https://help.aliyun.com/document_detail/111265.html */
  aliOssConfig?: (data: BilldDeploy) => IAliOssConfig;

  /** https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0404.html */
  huaweiObsConfig?: (data: BilldDeploy) => IHuaweiObsConfig;

  /** 七牛云配置 */
  qiniuConfig?: (data: BilldDeploy) => IQiniuConfig;

  /** 上传到ssh的文件、目录 */
  sshFileConfig?: (data: BilldDeploy) => {
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
  aliOssFileConfig?: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };

  /** 上传到华为云obs的文件、目录 */
  huaweiObsFileConfig?: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };

  /** 上传到七牛云的文件、目录 */
  qiniuFileConfig?: (data: BilldDeploy) => {
    dir: {
      local: string;
    };
    file: {
      local: string[];
    };
  };
}

export interface BilldDeploy {
  env: EnvType;
  config: IBilldDeployConfig;
}
