/**
 * main.js —— 表白页动画主控（原生 async/await 版，无 jscex / 无 eval）
 * 动画由 love.js 的 Canvas 引擎完成，本文件只负责“时序编排”与交互；
 * 页面文案与“在一起”的时间可在下方 TOGETHER 中修改。
 */
/* global Confession, Tree */
(function () {
  "use strict";

  /* ================= 可配置项（改这里） ================= */
  var TOGETHER = {
    year: 2026,
    month: 1,
    day: 15, // 在一起的那一天（年月日）
    hour: 16,
    minute: 53,
    second: 0, // 在一起的那一刻（时分秒）
  };

  /* ================= 元素与基础检测 ================= */
  var canvas = document.getElementById("canvas");
  var wrap = document.getElementById("wrap");
  var errorBox = document.getElementById("error");

  if (!canvas || !canvas.getContext) {
    if (errorBox) errorBox.style.display = "block";
    return;
  }

  var width = canvas.clientWidth || 1100;
  var height = canvas.clientHeight || 680;
  canvas.width = width;
  canvas.height = height;

  var opts = {
    seed: {
      x: width / 2 - 20,
      color: "rgb(190, 26, 37)",
      scale: 2,
    },
    branch: [
      [
        535,
        680,
        570,
        250,
        500,
        200,
        30,
        100,
        [
          [540, 500, 455, 417, 340, 400, 13, 100, [[450, 435, 434, 430, 394, 395, 2, 40]]],
          [550, 445, 600, 356, 680, 345, 12, 100, [[578, 400, 648, 409, 661, 426, 3, 80]]],
          [539, 281, 537, 248, 534, 217, 3, 40],
          [
            546,
            397,
            413,
            247,
            328,
            244,
            9,
            80,
            [
              [427, 286, 383, 253, 371, 205, 2, 40],
              [498, 345, 435, 315, 395, 330, 4, 60],
            ],
          ],
          [546, 357, 608, 252, 678, 221, 6, 100, [[590, 293, 646, 277, 648, 271, 2, 80]]],
        ],
      ],
    ],
    bloom: {
      num: 700,
      width: 1080,
      height: 650,
    },
    footer: {
      width: 1200,
      height: 5,
      speed: 10,
    },
  };

  var tree = new Tree(canvas, width, height, opts);
  var seed = tree.seed;
  var foot = tree.footer;

  /* 等待 n 毫秒（等价于原 jscex 的 Jscex.Async.sleep） */
  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /* ================= 点击交互：等待点击“心形种子” ================= */
  var waitClick = new Promise(function (resolve) {
    function toCanvas(e) {
      var rect = canvas.getBoundingClientRect();
      var s = window.stageScale || 1;
      return {
        x: (e.clientX - rect.left) / s,
        y: (e.clientY - rect.top) / s,
      };
    }

    function onCanvasMove(e) {
      var p = toCanvas(e);
      canvas.classList.toggle("hand", seed.hover(p.x, p.y));
    }

    function onCanvasClick(e) {
      var p = toCanvas(e);
      if (!seed.hover(p.x, p.y)) return;

      var hint = document.getElementById("hint");
      if (hint) hint.style.display = "none";
      canvas.removeEventListener("click", onCanvasClick);
      canvas.removeEventListener("mousemove", onCanvasMove);
      canvas.classList.remove("hand");
      resolve();
    }

    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("click", onCanvasClick);

    // 点击引导浮层直接启动动画（防止提示事件冒泡到 canvas）
    var hint = document.getElementById("hint");
    if (hint) {
      hint.addEventListener("click", function (e) {
        e.stopPropagation();
        hint.style.display = "none";
        resolve();
      });
    }
  });

  /* ================= 四幕动画（每幕为一段 async 协程，时序与旧版逐帧一致） ================= */

  /** 第一幕：心形种子下坠入土 */
  async function seedAnimate() {
    seed.draw();
    await waitClick; // 等待点击（等价旧版 while(hold) sleep(10)）
    while (seed.canScale()) {
      // 心形缩小
      seed.scale(0.95);
      await sleep(10);
    }
    while (seed.canMove()) {
      // 心形下坠
      seed.move(0, 2);
      foot.draw();
      await sleep(10);
    }
  }

  /** 第二幕：种子长成大树 */
  async function growAnimate() {
    do {
      tree.grow();
      await sleep(10);
    } while (tree.canGrow());
  }

  /** 第三幕：满树开花 */
  async function flowAnimate() {
    do {
      tree.flower(2);
      await sleep(10);
    } while (tree.canFlower());
  }

  /** 过渡：整树平移到画布中央，并转为背景图避免闪烁 */
  async function moveAnimate() {
    tree.snapshot("p1", 240, 0, 610, 680);
    while (tree.move("p1", 500, 0)) {
      foot.draw();
      await sleep(10);
    }
    foot.draw();

    // 上一版此处会有闪烁，这里将整棵树转为背景图承载，避免闪烁
    wrap.style.backgroundImage = "url(" + tree.toDataURL("image/png") + ")";
    canvas.style.background = "#ffe";
    await sleep(300);
    canvas.style.background = "";
  }

  /** 第四幕：树下花瓣持续飘落（永不结束） */
  async function jumpAnimate() {
    while (true) {
      tree.ctx.clearRect(0, 0, width, height);
      tree.jump();
      foot.draw();
      await sleep(25);
    }
  }

  /** 情书打字机 + 相恋计时（与第四幕并行，永不结束） */
  async function textAnimate() {
    var together = new Date(
      TOGETHER.year,
      TOGETHER.month - 1,
      TOGETHER.day,
      TOGETHER.hour,
      TOGETHER.minute,
      TOGETHER.second
    );

    var code = document.getElementById("code");
    code.style.display = "block";
    Confession.typewriter(code);
    Confession.fadeIn(document.getElementById("clock-box"), 500);

    while (true) {
      Confession.timeElapse(together);
      await sleep(1000);
    }
  }

  /* ================= 背景音乐（自动播放策略需要用户手势） ================= */
  var bgm = document.getElementById("bgm");
  var soundBtn = document.getElementById("sound");
  var MUSIC_ON = "❚❚";
  var MUSIC_OFF = "🎵";

  function reflectMusic() {
    soundBtn.textContent = bgm.paused ? MUSIC_OFF : MUSIC_ON;
  }

  soundBtn.addEventListener("click", function () {
    if (bgm.paused) {
      bgm.play().catch(function () {});
    } else {
      bgm.pause();
    }
    reflectMusic();
  });

  bgm.addEventListener("ended", reflectMusic);

  // 首次任意点击/触摸时尝试自动播放（满足浏览器自动播放策略）
  document.addEventListener(
    "pointerdown",
    function startBgm() {
      bgm.play().catch(function () {});
      reflectMusic();
      document.removeEventListener("pointerdown", startBgm);
    },
    { passive: true }
  );

  /* ================= 启动 ================= */
  Confession.fitStage();

  (async function run() {
    await seedAnimate(); // 第一幕：等点击 → 心形落地
    await growAnimate(); // 第二幕：长成大树
    await flowAnimate(); // 第三幕：开花
    await moveAnimate(); // 过渡：树移入画布中央

    textAnimate(); // 情书 + 计时（并行启动）
    await jumpAnimate(); // 第四幕：花瓣飘落（永续）
  })().catch(function (err) {
    console.error("动画异常:", err);
  });
})();
