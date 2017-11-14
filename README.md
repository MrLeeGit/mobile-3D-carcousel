# @mfelibs/carousel

3D旋转木马，适配H5移动端页面，欢迎大家踊跃的提出bug

## 运行
```bash
npm run dev
```

## 打包
```bash
npm run build
```

## 安装
```bash
cnpm install @mfelibs/carousel --save
```

通过 `imort` 导入
```javascript
import carousel from '@mfelibs/carousel'
```


## 使用
```javascript
const config = {
    boxDom : $("#carouselBox"),   //动画父容器
    animationDom : $(".carousel"), //动画容器
    itemClass : 'carousel-item',   //动画子容器类名
    duration: 200, // ms
    hasSkew : false //是否重力感应
}
carousel.init(config);
```
config不传入值的话会走默认程序
