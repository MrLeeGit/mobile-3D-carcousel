# @mfelibs/carousel

3D旋转木马，适配H5移动端页面，欢迎大家踊跃的提出bug

## run
```bash
npm run dev
```

## build
```bash
npm run build
```

## dependent
```bash
zepto
```


## use
```javascript
const config = {
    boxDom : $("#carouselBox"),   //father animation Dom
    animationDom : $(".carousel"), //animation Dom
    itemClass : 'carousel-item',   //item class name
    duration: 200, // run time ms
    hasSkew : false //gravity
}
carousel.init(config);
```
