/**
 * functions.js —— 表白页通用函数（原生 JS，无 jQuery 依赖）
 * - typewriter : 打字机逐字显示
 * - timeElapse : 渲染“在一起”时长
 * - fadeIn     : 简单的透明度淡入
 * - fitStage   : 按视口宽度对 1100px 舞台等比缩放并居中
 * - stageScale : 全局只读的当前缩放比（供指针坐标换算）
 */
(function (window) {
  "use strict";

  var doc = document;

  /* ---------------- 打字机效果 ---------------- */
  function typewriter(el) {
    if (!el) return;
    var str = el.innerHTML;
    var progress = 0;

    el.innerHTML = "";
    var timer = setInterval(function () {
      if (progress >= str.length) {
        clearInterval(timer);
        return;
      }
      var cur = str.charAt(progress);
      if (cur === "<") {
        // 标签一次性跳过，避免动画中出现半个标签
        progress = str.indexOf(">", progress) + 1;
      } else {
        progress += 1;
      }
      el.innerHTML = str.substring(0, progress) + (progress & 1 ? "_" : "");
    }, 75);
  }

  /* ---------------- 在一起时长 ---------------- */
  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function timeElapse(together) {
    var clock = doc.getElementById("clock");
    if (!clock || !together) return;

    var total = Math.max(0, Math.floor((Date.now() - together.getTime()) / 1000));
    var days = Math.floor(total / 86400);
    var hours = Math.floor((total % 86400) / 3600);
    var minutes = Math.floor((total % 3600) / 60);
    var seconds = total % 60;

    clock.innerHTML =
      '第 <span class="digit">' +
      days +
      "</span> 天 " +
      '<span class="digit">' +
      pad2(hours) +
      "</span> 小时 " +
      '<span class="digit">' +
      pad2(minutes) +
      "</span> 分钟 " +
      '<span class="digit">' +
      pad2(seconds) +
      "</span> 秒";
  }

  /* ---------------- 淡入 ---------------- */
  function fadeIn(el, ms) {
    if (!el) return;
    el.style.display = "block";
    el.style.transition = "opacity " + (ms || 500) + "ms ease";
    el.style.opacity = "0";
    void el.offsetWidth; // 强制回流，触发过渡
    el.style.opacity = "1";
  }

  /* ---------------- 响应式缩放 ---------------- */
  var BASE_WIDTH = 1100; // 设计稿宽度（画布逻辑尺寸不变）
  var stageScale = 1; // 当前缩放比，供指针坐标换算使用

  function fitStage() {
    var wrap = doc.getElementById("wrap");
    if (!wrap) return stageScale;

    var vw = doc.documentElement.clientWidth;
    var vh = doc.documentElement.clientHeight;
    stageScale = Math.min(1, (vw - 16) / BASE_WIDTH);

    if (stageScale < 1) {
      // 先清除缩放，测量舞台未缩放时的布局几何
      wrap.style.transform = "";
      var box = wrap.getBoundingClientRect();
      var visH = box.height * stageScale; // 缩放后的实际视觉高度

      // 视觉高度高于视口：不做上移，保持从顶部可滚动看到全部内容
      //（负位移会把内容顶出滚动区外，永远无法滚回）；
      // 视觉高度不高于视口：垂直居中，并隐藏页面滚动条消除底部空白滚动区
      var shiftY = visH > vh ? 0 : vh / 2 - (box.top + box.height / 2);
      wrap.style.transformOrigin = "center center";
      wrap.style.transform = "translateY(" + shiftY + "px) scale(" + stageScale + ")";
      doc.documentElement.style.overflow = visH > vh ? "" : "hidden";
    } else {
      wrap.style.transform = "";
      doc.documentElement.style.overflow = "";
    }
    return stageScale;
  }

  window.addEventListener("resize", fitStage);
  window.addEventListener("orientationchange", function () {
    setTimeout(fitStage, 200); // 等手机转屏后布局稳定再计算
  });

  // 对外暴露
  window.Confession = {
    typewriter: typewriter,
    timeElapse: timeElapse,
    fadeIn: fadeIn,
    fitStage: fitStage,
  };
  // stageScale：对外暴露当前缩放比（main.js 换算指针坐标时读取）
  Object.defineProperty(window, "stageScale", {
    get: function () {
      return stageScale;
    },
    set: function (v) {
      stageScale = v;
    },
  });
})(window);
