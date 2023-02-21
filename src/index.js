const { handleBuild } = require('./build');
const { handleAliOssCDN } = require('./cdn/ali-oss');
const { handleHuaweiObsCDN } = require('./cdn/huawei-obs');
const { handleSSH } = require('./ssh');
const { chalkSUCCESS, chalkERROR } = require('./utils/chalkTip');
const { generateDeployFile, deleteDeployFile } = require('./utils/git');
const { handleNuxtTip } = require('./utils/nuxtTip');

async function main({ env, config }) {
  if (!config || !env) {
    console.log(chalkERROR('缺少env或config！'));
    return;
  }
  if (!['prod', 'beta'].includes(env)) {
    console.log(chalkERROR(`env错误,env必须是: "prod"或"beta"`));
    return;
  }
  if (!['huawei', 'ali', 'none'].includes(config.use)) {
    console.log(
      chalkERROR(`config.use错误,config.use必须是"huawei"或"ali"或"none"`)
    );
    return;
  }
  try {
    await handleBuild({ env, config });
    generateDeployFile();
    await handleSSH({ env, config });
    if (config.use === 'huawei') {
      await handleHuaweiObsCDN({ env, config });
    } else if (config.use === 'ali') {
      await handleAliOssCDN({ env, config });
    }
    deleteDeployFile();
    console.log(chalkSUCCESS(`构建${env}成功`));
    handleNuxtTip({ env, config });
  } catch (error) {
    console.log(chalkERROR(`构建${env}出错`), error);
  }
}

module.exports.deploy = main;
