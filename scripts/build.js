const { execSync } = require('child_process');

const { chalkERROR } = require('./chalkTip');

const watch = process.argv.includes('--watch');

// rollup打包
const rollupBuild = () => {
  // 必须得用pnpm，如果用npm的话，--watch不会带过去
  execSync(`pnpm run build:rollup${watch ? ' --watch' : ''}`, {
    stdio: 'inherit',
  });
};

(() => {
  try {
    rollupBuild();
    // npm publish默认会带上根目录的LICENSE、README.md、package.json
    // copyFile();
  } catch (error) {
    console.log(chalkERROR(`！！！本地构建失败！！！`));
    console.log(error);
    console.log(chalkERROR(`！！！本地构建失败！！！`));
  }
})();
