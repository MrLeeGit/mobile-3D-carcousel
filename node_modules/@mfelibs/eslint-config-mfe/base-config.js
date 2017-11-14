module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true, // 浏览器全局变量(window, document...)
    node: true, // node全局变量(global)
    commonjs: true, // CMD规范(require, export)
    jquery: true, // jQuery全局变量($)
    amd: true, // AMD规范(define(), require())
    mocha: true, // 单元测试全局变量
    es6: true // ES6 API
  },

  plugins: ['import', 'react'],

  globals: {
    SINA_NEWS: false // sina 全局变量，不允许被重写
  },

  extends: [
    'eslint:recommended', // 继承基本配置(https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js)
    'plugin:react/recommended'
  ],

  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true // 对象展开运算符 `...`
    }
  },

  rules: {
    indent: [
      // 缩进
      'error',
      2, // 缩进大小
      {
        VariableDeclarator: {
          // 变量声明符缩进
          var: 2,
          let: 2,
          const: 3
        },
        SwitchCase: 1
      }
    ],
    'no-unused-vars': [
      // 检查已定义未使用变量
      'warn',
      {
        vars: 'local', // 变量范围 [本地 | 全局]
        args: 'none' // 不检查参数使用
      }
    ],
    quotes: ['error', 'single'], // 引号风格
    semi: ['error', 'never'], // 分号风格
    eqeqeq: ['warn'], // 使用全等(===)
    'no-console': 'off', // 禁用 console
    'no-empty': 'off', // 禁止空代码块
    'semi-spacing': [
      // 分号与空格
      'error',
      {
        before: false, // 分号前出现空格
        after: true // 分号后出现空格
      }
    ],
    'comma-spacing': [
      // 逗号与空格
      'error',
      {
        before: false, // 逗号前出现空格
        after: true // 逗号后出现空格
      }
    ],
    'space-before-blocks': 'error', // 语句块之前加空格
    'spaced-comment': ['warn', 'always'], // 注释符与文本加一个空格
    'linebreak-style': ['error', 'unix'], // 换行风格
    'react/prop-types': 'off' // 校验 props 类型 （https://facebook.github.io/react/docs/typechecking-with-proptypes.html）
  }
}
