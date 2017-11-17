# @mfelibs/carousel

一句话介绍项目摘要。


#### demo
<a href="http://unpkg.smfe.sina.cn/@mfelibs/carousel/dist/demo.html" target="blank">http://unpkg.smfe.sina.cn/@mfelibs/carousel/dist/demo.html</a>


## 安装

```bash
cnpm install @mfelibs/carousel --save
```

通过 `imort` 导入
```javascript
import carousel from '@mfelibs/carousel'
```

## 使用

调用 `Foo` 构造函数，实例化组件对象:
```javascript
const config = {
    boxDom : $("#carouselBox"),   //动画父容器
    animationDom : $(".carousel"), //动画容器
    itemClass : 'carousel-item',   //动画子容器类名
    duration: 100, // ms
    animation :'ease', //滚动动画类型
    hasSkew : false //是否重力感应
}
carousel.init(config);
```
## 实际效果
匀速运动
<br />
<img src="src/images/carousel1.gif" />
<br />
加速运动
<br />
<img src="src/images/carousel2.gif" />
