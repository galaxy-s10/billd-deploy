import { StorageClass } from 'cos-nodejs-sdk-v5';
import {
  PurgePathCacheRequest,
  PurgeUrlsCacheRequest,
} from 'tencentcloud-sdk-nodejs-cdn/tencentcloud/services/cdn/v20180606/cdn_models';

export interface ISSHConfig {
  host: string;
  username: string;
  password: string;
}

export interface ITencentCosConfig {
  SecretId: string;
  SecretKey: string;
  Bucket: string;
  Region: string;
  StorageClass: StorageClass;
  prefix?: string;
}

export interface ITencentCdnConfig {
  SecretId: string;
  SecretKey: string;
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

export interface IQiniuKodoConfig {
  accessKey: string;
  secretKey: string;
  bucket: string;
  prefix: string;
  /** https://developer.qiniu.com/kodo/1289/nodejs#general-uptoken，qiniu.zone.Zone_z2代表华南 */
  zone: string;
}

export enum CosEnum {
  ali = 'ali',
  huawei = 'huawei',
  qiniu = 'qiniu',
  tencent = 'tencent',
  none = 'none',
}

export enum CdnEnum {
  tencent = 'tencent',
  none = 'none',
}

export type CosType = keyof typeof CosEnum;

export interface IBilldDeployConfig {
  /** 使用哪个对象存储 */
  cos?: (data: BilldDeploy) => CosEnum;

  /** 使用哪个cdn */
  cdn?: (data: BilldDeploy) => CdnEnum;

  /** 是否使用ssh */
  ssh?: (data: BilldDeploy) => boolean;

  /** ssh配置 */
  sshConfig?: (data: BilldDeploy) => ISSHConfig;

  /** https://help.aliyun.com/document_detail/111265.html */
  aliOssConfig?: (data: BilldDeploy) => IAliOssConfig;

  /** https://support.huaweicloud.com/sdk-nodejs-devg-obs/obs_29_0404.html */
  huaweiObsConfig?: (data: BilldDeploy) => IHuaweiObsConfig;

  /** https://www.tencentcloud.com/zh/document/product/436/8629 */
  tencentCosConfig?: (data: BilldDeploy) => ITencentCosConfig;

  /** 七牛云配置 */
  qiniuKodoConfig?: (data: BilldDeploy) => IQiniuKodoConfig;

  tencentCdnConfig?: (data: BilldDeploy) => ITencentCdnConfig;

  /** 上传到阿里云oss的文件、目录 */
  aliOssFileConfig?: (data: BilldDeploy) => {
    dir?: {
      local: string;
      ignoreDir?: boolean;
    };
    file?: {
      local: string[];
    };
  };

  /** 上传到华为云obs的文件、目录 */
  huaweiObsFileConfig?: (data: BilldDeploy) => {
    dir?: {
      local: string;
      ignoreDir?: boolean;
    };
    file?: {
      local: string[];
    };
  };

  /** 上传到腾讯云cos的文件、目录 */
  tencentCosFileConfig?: (data: BilldDeploy) => {
    dir?: {
      local: string;
      ignoreDir?: boolean;
    };
    file?: {
      local: string[];
    };
  };

  /** 上传到七牛云的文件、目录 */
  qiniuKodoFileConfig?: (data: BilldDeploy) => {
    dir?: {
      local: string;
      ignoreDir?: boolean;
    };
    file?: {
      local: string[];
    };
  };

  /** 上传到ssh的文件、目录 */
  sshFileConfig?: (data: BilldDeploy) => {
    dir?: {
      local: string;
      remote: string;
      ignoreDir?: boolean;
    };
    file?: {
      local: string[];
      remote: string;
    };
  };

  /** 腾讯云cdn操作 */
  tencentCdnJob?: (data: BilldDeploy) => {
    Purge: {
      /** URL刷新 */
      urls?: PurgeUrlsCacheRequest;
      /** 目录刷新 */
      paths?: PurgePathCacheRequest;
    };
  };
}

export interface BilldDeploy {
  config: IBilldDeployConfig;
  verifyGit?: boolean;
  shouldRelease?: boolean;
  shouldBuild?: boolean;
  buildCmd?: string;
  deployDoneCb?: (data: { err: boolean }) => void;
}
