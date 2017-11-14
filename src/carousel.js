(function(window) {
    var lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      i = vendors.length;
  
    // try to un-prefix existing raf
    while (--i >= 0 && !requestAnimationFrame) {
      requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
      cancelAnimationFrame = window[vendors[i] + 'CancelRequestAnimationFrame'];
    }
  
    // polyfill with setTimeout fallback
    // heavily inspired from @darius gist mod: https://gist.github.com/paulirish/1579671#comment-837945
    if (!requestAnimationFrame || !cancelAnimationFrame) {
      requestAnimationFrame = function(callback) {
        var now = +Date.now(),
          nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function() {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
  
      cancelAnimationFrame = clearTimeout;
    }
  
    // export to window
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
  }(window));
  
  var getTime = (Date.now || function () {
    return new Date().getTime();
  });
  
  var Materialize = {
    objectSelectorString : function(obj) {
      var tagStr = obj.prop('tagName') || '';
      var idStr = obj.attr('id') || '';
      var classStr = obj.attr('class') || '';
      return (tagStr + idStr + classStr).replace(/\s/g,'');
    },
    throttle: function(func, wait, options){
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function () {
        previous = options.leading === false ? 0 : getTime();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      };
      return function () {
        var now = getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    }
  }
  var carousel = {
    init : function(options) {
      var defaults = {
        boxDom : $("#carouselBox"),   //动画父容器
        animationDom : $(".carousel"), //动画容器
        itemClass : 'carousel-item',   //动画子容器类名
        duration: 200, // ms
        dist: -100, // zoom scale TODO: make this more intuitive as an option
        shift: 0, // spacing for center image
        padding: 0, // Padding between non center items
        fullWidth: false, // Change to full width styles
        indicators: false, // Toggle indicators
        noWrap: false, // Don't wrap around and cycle through items.
        onCycleTo: null, // Callback for when a new slide is cycled to.
        hasSkew : false //  是否重力感应
      };
      options = $.extend(defaults, options);
      var namespace = Materialize.objectSelectorString(options.animationDom);
      return options.animationDom.each(function(i) {
  
        var images, item_width, item_height, offset, center, pressed, dim, count,
            reference, referenceY, amplitude, target, velocity, scrolling,
            xform, frame, timestamp, ticker, dragged, vertical_dragged,isTouchClick,isTouch,tweenedOpacity,zTranslation;
        var scrollingTimeout = null;
        var oneTimeCallback = null;
  
        //重力感应滚动
        if (window.DeviceMotionEvent && options.hasSkew) {
          window.addEventListener('devicemotion',function(eventData){
            if(isTouch) return false;
            var acceleration = eventData.accelerationIncludingGravity;
            var rawAcceleration = Math.floor(acceleration.x * 100)/100;
            var flag = false;
            setTimeout(function(){
              if(isTouch || flag) return false;
              scroll(rawAcceleration);
              flag = true;
            },300)
          }, false);
          setInterval(function(){
            isTouch = false;
          },5000)
        }
  
        // Initialize
        var view = $(this);
        var hasMultipleSlides = view.find('.'+options.itemClass).length > 1;
        var showIndicators = options.indicators && hasMultipleSlides;
        var noWrap = options.noWrap || !hasMultipleSlides;
        var uniqueNamespace = view.attr('data-namespace') || namespace+i;
        view.attr('data-namespace', uniqueNamespace);
  
  
        // Options
        var setCarouselHeight = function(imageOnly) {
          var firstSlide = view.find('.'+options.itemClass+'.active').length ? view.find('.'+options.itemClass+'.active').first() : view.find('.'+options.itemClass).first();
          var firstImage = firstSlide.find('img').first();
          if (firstImage.length) {
            if (firstImage[0].complete) {
              // If image won't trigger the load event
              var imageHeight = firstImage.height();
              if (imageHeight > 0) {
                view.css('height', firstImage.height());
              } else {
                // If image still has no height, use the natural dimensions to calculate
                var naturalWidth = firstImage[0].naturalWidth;
                var naturalHeight = firstImage[0].naturalHeight;
                var adjustedHeight = (view.width() / naturalWidth) * naturalHeight;
                view.css('height', adjustedHeight);
              }
            } else {
              // Get height when image is loaded normally
              firstImage.on('load', function(){
                view.css('height', $(this).height());
              });
            }
          } else if (!imageOnly) {
            var slideHeight = firstSlide.height();
            view.css('height', slideHeight);
          }
        };
  
        if (options.fullWidth) {
          options.dist = 0;
          setCarouselHeight();
        }
  
  
        // Don't double initialize.
        if (view.hasClass('initialized')) {
          // Recalculate variables
          $(window).trigger('resize');
  
          // Redraw carousel.
          view.trigger('carouselNext', [0.000001]);
          return true;
        }
  
  
        view.addClass('initialized');
        pressed = false;
        offset = target = 0;
        images = [];
        item_width = window.getComputedStyle(view.find('.'+options.itemClass).first()[0]).width.replace("px","");
        item_height = window.getComputedStyle(view.find('.'+options.itemClass).first()[0]).height.replace("px","");
        dim = item_width * 2 + options.padding;
  
        view.find('.'+options.itemClass).each(function (i) {
          images.push($(this)[0]);
        });
  
        count = images.length;
  
        //绑定事件
        function setupEvents() {
          if (typeof window.ontouchstart !== 'undefined') {
            options.boxDom.get(0).addEventListener('touchstart', tap);
            options.boxDom.get(0).addEventListener('touchmove', drag);
            options.boxDom.get(0).addEventListener('touchend', release);
          }
          view[0].addEventListener('mousedown', tap);
          view[0].addEventListener('mousemove', drag);
          view[0].addEventListener('mouseup', release);
          view[0].addEventListener('mouseleave', release);
          view[0].addEventListener('click', click);
        }
  
        function xpos(e) {
          // touch event
          if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientX;
          }
  
          // mouse event
          return e.clientX;
        }
  
        function ypos(e) {
          // touch event
          if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
          }
  
          // mouse event
          return e.clientY;
        }
  
        function wrap(x) {
          return (x >= count) ? (x % count) : (x < 0) ? wrap(count + (x % count)) : x;
        }
        
        function scroll(x) {
          // Track scrolling state
          
          scrolling = true;
          if (!view.hasClass('scrolling')) {
            view.addClass('scrolling');
          }
          if (scrollingTimeout != null) {
            window.clearTimeout(scrollingTimeout);
          }
          
          scrollingTimeout = window.setTimeout(function() {
            scrolling = false;
            view.removeClass('scrolling');
          }, options.duration);
  
          // Start actual scroll
          var i, half, delta, dir, tween, el, alignment, xTranslation;
          var lastCenter = center;
          
          offset = (typeof x === 'number') ? x : offset;
          center = Math.floor((offset + dim / 2) / dim);
          delta = offset - center * dim;
          dir = (delta < 0) ? 1 : -1;
          tween = -dir * delta * 2 / dim;
          half = count >> 1;
  
          if (!options.fullWidth) {
            alignment = 'translateX(' + (view[0].clientWidth - item_width) / 2 + 'px) ';
            alignment += 'translateY(' + (view[0].clientHeight - item_height) / 2 + 'px)';
          } else {
            alignment = 'translateX(0)';
          }
  
          // center
          // Don't show wrapped items.
          if (!noWrap || (center >= 0 && center < count)) {
            el = images[wrap(center)];
  
            // Add active class to center item.
            if (!$(el).hasClass('active')) {
              view.find('.'+options.itemClass).removeClass('active');
              $(el).addClass('active');
            }
            
            el.style[xform] = alignment +
              ' translateX(' + (-delta / 2) + 'px)' +
              // ' translateX(' + (dir * options.shift * tween * i) + 'px)' +
              ' translateZ(' + (options.dist * tween) + 'px)';
            el.style.zIndex = 0;
            if (options.fullWidth) { tweenedOpacity = 1; }
            else { tweenedOpacity = 1 - 0.2 * tween; }
            el.style.opacity = tweenedOpacity;
            el.style.display = 'block';
          }
  
          for (i = 1; i <= half; ++i) {
            // right side
            if (options.fullWidth) {
              zTranslation = options.dist;
              tweenedOpacity = (i === half && delta < 0) ? 1 - tween : 1;
            } else {
              zTranslation = options.dist * (i * 2 + tween * dir);
              tweenedOpacity = 1 - 0.2 * (i * 2 + tween * dir);
            }
            // Don't show wrapped items.
            if (!noWrap || center + i < count) {
              el = images[wrap(center + i)];
              el.style[xform] = alignment +
                ' translateX(' + (options.shift + (dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + zTranslation + 'px)';
              el.style.zIndex = -i;
              el.style.opacity = tweenedOpacity;
              el.style.display = 'block';
            }
            
  
            // left side
            if (options.fullWidth) {
              zTranslation = options.dist;
              tweenedOpacity = (i === half && delta > 0) ? 1 - tween : 1;
            } else {
              zTranslation = options.dist * (i * 2 - tween * dir);
              tweenedOpacity = 1 - 0.2 * (i * 2 - tween * dir);
            }
            // Don't show wrapped items.
            if (!noWrap || center - i >= 0) {
              el = images[wrap(center - i)];
              el.style[xform] = alignment +
                ' translateX(' + (-options.shift + (-dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + zTranslation + 'px)';
              el.style.zIndex = -i;
              el.style.opacity = tweenedOpacity;
              el.style.display = 'block';
            }
          }
  
          // center
          // Don't show wrapped items.
          if (!noWrap || (center >= 0 && center < count)) {
            el = images[wrap(center)];
            el.style[xform] = alignment +
              ' translateX(' + (-delta / 2) + 'px)' +
              // ' translateX(' + (dir * options.shift * tween) + 'px)' +
              ' translateZ(' + (options.dist * tween) + 'px)';
            el.style.zIndex = 0;
            if (options.fullWidth) { tweenedOpacity = 1; }
            else { tweenedOpacity = 1 - 0.2 * tween; }
            el.style.opacity = tweenedOpacity;
            el.style.display = 'block';
          }
  
          // onCycleTo callback
          if (lastCenter !== center &&
              typeof(options.onCycleTo) === "function") {
            var $curr_item = view.find('.'+options.itemClass).eq(wrap(center));
            options.onCycleTo.call(this, $curr_item, dragged);
          }
  
          // One time callback
          if (typeof(oneTimeCallback) === "function") {
            oneTimeCallback.call(this, $curr_item, dragged);
            oneTimeCallback = null;
          }
        }
  
        function track() {
          var now, elapsed, delta, v;
  
          now = Date.now();
          elapsed = now - timestamp;
          timestamp = now;
          delta = offset - frame;
          frame = offset;
  
          v = 1000 * delta / (1 + elapsed);
          velocity = 0.8 * v + 0.2 * velocity;
        }
  
        function autoScroll() {
          var elapsed, delta;
          if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = amplitude * Math.exp(-elapsed / options.duration);
            if (delta > 2 || delta < -2) {
                scroll(target - delta);
                requestAnimationFrame(autoScroll);
            } else {
                scroll(target);
            }
          }
        }
  
        function click(e) {
          // Disable clicks if carousel was dragged.
          if (dragged) {
            e.preventDefault();
            e.stopPropagation();
            return false;
  
          } else if (!options.fullWidth) {
            var clickedIndex = $(e.target).closest('.'+options.itemClass).index();
            var diff = wrap(center) - clickedIndex;
  
            // Disable clicks if carousel was shifted by click
            if (diff !== 0) {
              e.preventDefault();
              e.stopPropagation();
            }
            cycleTo(clickedIndex);
          }
        }
  
        function cycleTo(n) {
          var diff = (center % count) - n;
  
          // Account for wraparound.
          if (!noWrap) {
            if (diff < 0) {
              if (Math.abs(diff + count) < Math.abs(diff)) { diff += count; }
  
            } else if (diff > 0) {
              if (Math.abs(diff - count) < diff) { diff -= count; }
            }
          }
  
          // Call prev or next accordingly.
          if (diff < 0) {
            view.trigger('carouselNext', [Math.abs(diff)]);
  
          } else if (diff > 0) {
            view.trigger('carouselPrev', [diff]);
          }
        }
  
        function tap(e) {
          // Fixes firefox draggable image bug
          isTouch = true;
          if (e.type === 'mousedown' && $(e.target).is('img')) {
            e.preventDefault();
          }
          // debugger
          pressed = true;
          dragged = false;
          vertical_dragged = false;
          reference = xpos(e);
          referenceY = ypos(e);
  
          velocity = amplitude = 0;
          frame = offset;
          timestamp = Date.now();
          clearInterval(ticker);
          ticker = setInterval(track, 100);
        }
  
        function drag(e) {
          var x, y, delta, deltaY;
          isTouch = true;
          if (pressed) {
            x = xpos(e);
            y = ypos(e);
            delta = reference - x;
            deltaY = Math.abs(referenceY - y);
            if (deltaY < 30 && !vertical_dragged) {
              // If vertical scrolling don't allow dragging.
              if (delta > 2 || delta < -2) {
                dragged = true;
                reference = x;
                scroll(offset + delta);
              }
  
            } else if (dragged) {
              // If dragging don't allow vertical scroll.
              e.preventDefault();
              e.stopPropagation();
              return false;
  
            } else {
              // Vertical scrolling.
              vertical_dragged = true;
            }
          }
  
          if (dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
  
        function release(e) {
          isTouch = true;
          if (pressed) {
            pressed = false;
          } else {
            return;
          }
          
          clearInterval(ticker);
          target = offset;
          if (velocity > 10 || velocity < -10) {
            amplitude = 0.9 * velocity;
            target = offset + amplitude;
          }
          target = Math.round(target / dim) * dim;
  
          // No wrap of items.
          if (noWrap) {
            if (target >= dim * (count - 1)) {
              target = dim * (count - 1);
            } else if (target < 0) {
              target = 0;
            }
          }
          amplitude = target - offset;
          timestamp = Date.now();
          requestAnimationFrame(autoScroll);
  
          if (dragged) {
            e.preventDefault();
            e.stopPropagation();
          }
          
          return false;
        }
  
        xform = 'transform';
        ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
          var e = prefix + 'Transform';
          if (typeof document.body.style[e] !== 'undefined') {
            xform = e;
            return false;
          }
          return true;
        });
  
  
        var throttledResize = Materialize.throttle(function() {
            scroll();
        }, 200);
        $(window)
          .off('resize.carousel-'+uniqueNamespace)
          .on('resize.carousel-'+uniqueNamespace, throttledResize);
  
        setupEvents();
        scroll(offset);
  
        $(this).on('carouselNext', function(e, n, callback) {
          if (n === undefined) {
            n = 1;
          }
          if (typeof(callback) === "function") {
            oneTimeCallback = callback;
          }
  
          target = (dim * Math.round(offset / dim)) + (dim * n);
          if (offset !== target) {
            amplitude = target - offset;
            timestamp = Date.now();
            requestAnimationFrame(autoScroll);
          }
        });
  
        $(this).on('carouselPrev', function(e, n, callback) {
          if (n === undefined) {
            n = 1;
          }
          if (typeof(callback) === "function") {
            oneTimeCallback = callback;
          }
  
          target = (dim * Math.round(offset / dim)) - (dim * n);
          if (offset !== target) {
            amplitude = target - offset;
            timestamp = Date.now();
            requestAnimationFrame(autoScroll);
          }
        });
  
        $(this).on('carouselSet', function(e, n, callback) {
          if (n === undefined) {
            n = 0;
          }
          if (typeof(callback) === "function") {
            oneTimeCallback = callback;
          }
  
          cycleTo(n);
        });
  
      });
    },
    next : function(n, callback) {
      $(this).trigger('carouselNext', [n, callback]);
    },
    prev : function(n, callback) {
      $(this).trigger('carouselPrev', [n, callback]);
    },
    set : function(n, callback) {
      $(this).trigger('carouselSet', [n, callback]);
    },
    destroy : function() {
      var uniqueNamespace = $(this).attr('data-namespace');
      $(this).removeAttr('data-namespace');
      $(this).removeClass('initialized');
      $(this).find('.indicators').remove();
  
      // Remove event handlers
      $(this).off('carouselNext carouselPrev carouselSet');
      $(window).off('resize.carousel-'+uniqueNamespace);
      if (typeof window.ontouchstart !== 'undefined') {
        $(this).off('touchstart.carousel touchmove.carousel touchend.carousel');
      }
      $(this).off('mousedown.carousel mousemove.carousel mouseup.carousel mouseleave.carousel click.carousel');
    }
  };
  
  export default carousel;