module.exports = {
  extends: [
    '@mfelibs/eslint-config-mfe/base-config',  // 继承基本配置
  ],
  rules: {
    indent: 'off',  // 缩进
    quotes: 'off',  // 引号风格
    semi: 'off',  // 分号风格
    eqeqeq: ['warn'],  // 使用全等(===)
    'semi-spacing': 'off',  // 分号与空格
    'comma-spacing': 'off',  // 逗号与空格
    'space-before-blocks': 'off',  // 语句块之前加空格
    'spaced-comment': 'off'  // 注释符与文本加一个空格
  }
}
