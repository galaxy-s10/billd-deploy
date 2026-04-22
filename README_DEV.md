# 发版报错 npm ERR! 403 403 Forbidden - PUT https://registry.npmjs.org/billd-deploy - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.

解决：https://juejin.cn/post/7623954414522712116

# 本地调试

> 本地调试不会构建 umd

```bassh
pnpm run dev
```

1.在 billd-deploy 项目目录执行：

```bash
pnpm link --global
```

2.进入你的项目目录执行：

```bash
pnpm link --global billd-deploy
```

3.在你的项目目录导入包测试：

```js
import { isBrowser } from 'billd-deploy';

console.log(isBrowser());
```

4.测试完成后，取消链接
4.1 在 billd-deploy 项目目录执行：

```bash
pnpm unlink
```

4.2 在你的项目目录执行：

```bash
# 查看已全局链接的包
pnpm list -g
# 取消链接
pnpm uninstall -g billd-deploy
```
