console.log(
  "\033[0;37;44m INFO \033[0m",
  "\033[0;;34m " +
    `读取了: ${__filename.slice(__dirname.length + 1)}` +
    " \033[0m"
);

module.exports = {
  root: true,
  settings: {},
  env: {
    node: true,
    es2022: true, //ES2022 为类的实例属性，又规定了一种新写法。
  },
  extends: [
    // 'airbnb-base', // airbnb的eslint规范，它会对import和require进行排序，挺好的。如果不用它的话，需要在env添加node:true
    "eslint:recommended",
    "plugin:import/recommended", // https://github.com/import-js/eslint-plugin-import#installation
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2022,
  },
  plugins: ["import"],
  // overrides: [],
  // rules会覆盖extends里面的规则（https://eslint.org/docs/latest/user-guide/migrating-to-6.0.0#-overrides-in-an-extended-config-file-can-now-be-overridden-by-a-parent-config-file）
  // rules里面的规则不会对overrides里面的文件生效
  rules: {
    /**
     * 0 => off
     * 1 => warn
     * 2 => error
     */
    camelcase: 1, // 强制执行驼峰命名约定
    "no-console": 0, // 此规则不允许调用console对象的方法。
    "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }], // 该规则强制注释中 // 或 /* 后空格的一致性
    "no-var": 2, // 要求let或const代替var
    "no-shadow": 2, // 禁止变量声明与外层作用域的变量同名
    "no-param-reassign": 2, // 禁止对 function 的参数进行重新赋值
    "no-nested-ternary": 2, // 禁止嵌套三元
    "no-plusplus": 2, // 禁用一元操作符 ++ 和 --
    "no-unused-vars": 2, // 禁止出现未使用过的变量
    "vars-on-top": 2, // 要求所有的 var 声明出现在它们所在的作用域顶部
    "prefer-const": 2, // 要求使用 const 声明那些声明后不再被修改的变量
    "prefer-template": 2, // 要求使用模板字符串代替字符串连接
    "new-cap": 2, // 要求构造函数名称以大写字母开头
    "no-restricted-syntax": [
      // 禁用一些语法
      "error",
      // 'ForInStatement',
      // 'ForOfStatement',
      {
        selector: "ForInStatement",
        /**
         * 用 map() / every() / filter() / find() / findIndex() / reduce() / some() / ... 遍历数组，
         * 和使用 Object.keys() / Object.values() / Object.entries() 迭代你的对象生成数组。
         * 拥有返回值得纯函数比这个更容易解释
         */
        message:
          "for in会迭代遍历原型链(__proto__)，建议使用map/every/filter等遍历数组，使用Object.{keys,values,entries}等遍历对象",
      },
      {
        selector: "ForOfStatement",
        message:
          "建议使用map/every/filter等遍历数组，使用Object.{keys,values,entries}等遍历对象",
      },
    ], // https://github.com/BingKui/javascript-zh#%E8%BF%AD%E4%BB%A3%E5%99%A8%E5%92%8C%E5%8F%91%E7%94%9F%E5%99%A8
    "no-iterator": 2, // 禁止使用__iterator__迭代器
    "require-await": 2, // 禁止使用不带 await 表达式的 async 函数
    "no-empty": 2, // 禁止空块语句
    "guard-for-in": 2, // 要求for-in循环包含if语句
    "global-require": 2, // 此规则要求所有调用require()都在模块的顶层，此规则在 ESLint v7.0.0中已弃用。请使用 中的相应规则eslint-plugin-node：https://github.com/mysticatea/eslint-plugin-node
    "no-underscore-dangle": 1, // 此规则不允许在标识符中使用悬空下划线。
    "class-methods-use-this": 0, // 类方法如果不使用this的话会报错
    "no-unused-expressions": [
      2,
      {
        allowShortCircuit: true, // 允许短路
        allowTernary: true, // 允许三元
      },
    ], // 禁止未使用的表达式，即let a = true && console.log(1)允许，但是true && console.log(1)不行
    "object-shorthand": ["error", "always"], // （默认）希望尽可能使用速记。var foo = {x:x};替换为var foo = {x};
    "no-useless-escape": 2, // 禁止不必要的转义字符

    // eslint-plugin-import插件
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["sibling", "parent"],
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always", // 强制或禁止导入组之间的新行：
        // 根据导入路径按字母顺序对每个组内的顺序进行排序
        alphabetize: {
          order: "asc" /* 按升序排序。选项：['ignore', 'asc', 'desc'] */,
          caseInsensitive: false /* 忽略大小写。选项：[true, false] */,
        },
      },
    ],
    "import/newline-after-import": 2, // 强制在最后一个顶级导入语句或 require 调用之后有一个或多个空行
    "import/no-extraneous-dependencies": 2, // 禁止导入未在package.json中声明的外部模块。
    "import/named": 2, // 如：import { version } from 'vuex'，会验证vuex有没有具名导出version
    /**
     * a.js
     * export const version = '1.0.0';
     * export const bar = { name: 'bar', version };
     * export default bar;
     * b.js
     * import bar from './a';
     * console.log(bar.version); // 检测到你使用的version有具名导出，import/no-named-as-default-member就会提示`import {version} from './a'`
     */
    "import/no-named-as-default-member": 1, // https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default-member.md
    "import/prefer-default-export": 0, // 当模块只有一个导出时，更喜欢使用默认导出而不是命名导出。
    "import/extensions": 0, // 确保在导入路径中一致使用文件扩展名。在js/ts等文件里引其他文件都不能带后缀（比如.css和.jpg），因此关掉
    "import/no-unresolved": 0, // 不能解析带别名的路径的模块，但实际上是不影响代码运行的。找不到解决办法，暂时关掉。
    /**
     * a.js
     * export const bar = 'bar';
     * export const foo = 'foo';
     * export default foo;
     * b.js
     * import bar from './a'; // import/no-named-as-default规则会报错，因为import/no-named-as-default规则误以为你将具名导出的bar作为了默认导出来使用，但是实际上可能我就是想用默认导出的foo
     * // import barr from './a'; // 改个名字import/no-named-as-default规则就不会报错了。
     * // 不幸的是，React + Redux 是最常见的场景。但是，还有很多其他情况，HOC 会迫使开发人员关闭此规则。https://github.com/import-js/eslint-plugin-import/issues/544#issuecomment-245082471
     */
    "import/no-named-as-default": 0, // https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default.md
  },
};
