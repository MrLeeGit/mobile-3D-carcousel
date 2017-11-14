module.exports = {
  extends: [
    '@mfelibs/eslint-config-mfe/base-config',  // 继承基本配置
  ],
  rules: {
    indent: [  // 缩进
      'error',
      2,  // 缩进大小
      {
        VariableDeclarator: {  // 变量声明符缩进
          var: 2,
          let: 2,
          const: 3
        },
        SwitchCase: 1
      }
    ],
    quotes: ['error', 'single'],  // 引号风格
    semi: ['error', 'never'],  // 分号风格
    'semi-spacing': [  // 分号与空格
      'error',
      {
        before: false,  // 分号前出现空格
        after: true  // 分号后出现空格
      }
    ],
    'comma-spacing': [  // 逗号与空格
      'error',
      {
        before: false,  // 逗号前出现空格
        after: true  // 逗号后出现空格
      }
    ],
    'space-before-blocks': 'error',  // 语句块之前加空格
    'spaced-comment': ['warn', 'always']  // 注释符与文本加一个空格
  }
}
