/**
 * main.js —— 表白页动画主控（原生 async/await 版，无 jscex / 无 eval）
 * 动画由 love.js 的 Canvas 引擎完成，本文件只负责“时序编排”、交互与重新播放。
 * 用户可配置项只有四个字段（见同目录 config.js）：to / from / time / text；
 * 其余参数（动画节奏、绘制几何、音乐）均为内部常量，
 * 如需微调请直接改下方对应字面量。
 */
/* global Confession, Tree */
(function () {
  "use strict";

  /* ================= 元素与基础检测 ================= */
  var canvas = document.getElementById("canvas");
  var wrap = document.getElementById("wrap");
  var errorBox = document.getElementById("error");
  var guide = document.getElementById("guide");
  var code = document.getElementById("code");
  var clockBox = document.getElementById("clock-box");
  var replayBtn = document.getElementById("replay");

  if (!canvas || !canvas.getContext) {
    if (errorBox) errorBox.style.display = "block";
    return;
  }

  var width = canvas.clientWidth || 1100;
  var height = canvas.clientHeight || 680;
  canvas.width = width;
  canvas.height = height;

  /* ================= 内部默认值 =================
   * 仅当 config.js 缺失或对应字段非法时逐项回退到这里；
   * config.js 正常时始终以配置为准（两份内容一致是故意的：
   * 保证配置被误删/写坏时页面仍能完整运行）。 */
  var DEFAULTS = {
    to: "×××", // 亲爱的谁
    from: "×××", // 爱你的谁
    time: { year: 2026, month: 1, day: 15, hour: 16, minute: 53, second: 0 },
    text: [
      "你对我来说",
      "就是早晨的面包",
      "晚上的香蕉",
      "山东人的大蒜",
      "四川人的辣椒",
      "每一天都想和你在一起",
    ],
  };

  var LINE_LIMIT = 50; // 情书正文行数上限
  var LINE_MAX_LEN = 600; // 单行长度上限
  var NAME_MAX_LEN = 50; // 名字长度上限

  /* HTML 转义：人名与情书最终都会进 innerHTML，必须转义，
   * 防止名字/文案里含 < > & " 时被当作标签解析（脚本注入的第一道闸） */
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* 数字清洗：字符串数字自动转换；NaN/非数字 → 默认；夹到 [min, max]；可选取整 */
  function num(v, def, min, max, integer) {
    var n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    if (typeof n !== "number" || !isFinite(n)) n = def;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    if (integer) n = Math.round(n);
    return n;
  }

  /* 当月天数：防止“2 月 30 日”被 Date 静默顺延到下个月 */
  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /* 组装 Date：setFullYear 修正 1~99 年被 JS 误解析为 19xx 的问题 */
  function buildDate(y, m, d, h, mi, s) {
    var date = new Date(y, m - 1, d, h, mi, s);
    date.setFullYear(y);
    return date;
  }

  /* 名字清洗：非字符串 / 空串 / 纯空白 → null（由调用方决定回退默认值） */
  function readName(v) {
    if (typeof v !== "string" || !v.trim()) return null;
    var n = v.trim();
    return n.length > NAME_MAX_LEN ? n.slice(0, NAME_MAX_LEN) : n;
  }

  /* ================= 读取配置（to / from 为两个独立字段，互不影响） ================= */
  function readConfig() {
    var raw = window.LoveTreeConfig;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      if (window.console) {
        console.warn("[love-tree] 未找到有效配置（assets/config.js），已使用默认文案");
      }
      raw = {};
    }

    /* 1 & 2. 两个人名：各自独立校验，一方缺失/非法只回退自己，绝不串用对方 */
    var to = readName(raw.to);
    if (to === null) to = DEFAULTS.to;
    var from = readName(raw.from);
    if (from === null) from = DEFAULTS.from;

    /* 3. 时间：逐字段独立兜底 + 范围夹取，写错任何一项都不影响其他项 */
    var t = raw.time && typeof raw.time === "object" && !Array.isArray(raw.time) ? raw.time : {};
    var year = num(t.year, DEFAULTS.time.year, 1, 9999, true); // 上限同时防 Date 溢出为 NaN
    var month = num(t.month, DEFAULTS.time.month, 1, 12, true);
    var day = num(t.day, DEFAULTS.time.day, 1, daysInMonth(year, month), true);
    var hour = num(t.hour, DEFAULTS.time.hour, 0, 23, true);
    var minute = num(t.minute, DEFAULTS.time.minute, 0, 59, true);
    var second = num(t.second, DEFAULTS.time.second, 0, 59, true);

    /* 4. 情书正文：非数组 / 空数组 → 默认；逐行过滤非字符串并替换 {to} {from} 占位 */
    var src = Array.isArray(raw.text) ? raw.text : [];
    var lines = [];
    for (var i = 0; i < src.length && lines.length < LINE_LIMIT; i++) {
      var line = src[i];
      if (typeof line !== "string") continue;
      if (line.length > LINE_MAX_LEN) line = line.slice(0, LINE_MAX_LEN);
      if (line.indexOf("{to}") !== -1) line = line.split("{to}").join(to);
      if (line.indexOf("{from}") !== -1) line = line.split("{from}").join(from);
      lines.push(line);
    }
    if (!lines.length) lines = DEFAULTS.text.slice();

    return {
      to: to,
      from: from,
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      second: second,
      lines: lines,
    };
  }

  var CFG = readConfig();

  /* 组装“在一起的时刻”；极端情况下解析失败则退回默认时间（倒计时从第 0 天开始） */
  var together = buildDate(CFG.year, CFG.month, CFG.day, CFG.hour, CFG.minute, CFG.second);
  if (isNaN(together.getTime())) {
    together = buildDate(
      DEFAULTS.time.year,
      DEFAULTS.time.month,
      DEFAULTS.time.day,
      DEFAULTS.time.hour,
      DEFAULTS.time.minute,
      DEFAULTS.time.second
    );
  }

  /* ================= 情书注入 =================
   * 结构：亲爱的{to}，我爱你 / 正文逐行 / —— 爱你的{from}
   * LETTER_HTML 缓存一份完整内容，重新播放时先恢复再打字，避免打到一半被重放。
   * 每一行的文本（含人名）都经 escapeHtml 转义，配置里写 HTML 标签会被当纯文本显示；
   * 页面自有的 <span class="say"> / <span class="space"> 标记在转义之后拼接，不受影响。 */
  function sayLine(text) {
    return '<span class="say">' + escapeHtml(text) + "</span>";
  }

  var LETTER_HTML = [sayLine("亲爱的" + CFG.to + "，我爱你")]
    .concat(CFG.lines.map(sayLine))
    // 署名行自带 .space 右对齐标记：先拼自有标记，再拼转义后的文本
    .concat([
      '<span class="say"><span class="space"></span>' + escapeHtml("—— 爱你的" + CFG.from) + "</span>",
    ])
    .join("<br />");
  if (code) code.innerHTML = LETTER_HTML;

  /* ================= Canvas 引擎参数（内部常量，与初版一致） ================= */
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

  var tree, seed, foot;
  var genNo = 0; // 动画代际号：每次（重新）播放 +1，旧循环靠它自行退出，互不干扰

  /* 等待 n 毫秒（等价于原 jscex 的 Jscex.Async.sleep） */
  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /* 引导环显隐：集中一处写，避免多处散落的状态赋值互相打架 */
  function showGuide() {
    if (guide) guide.style.display = "";
  }

  function hideGuide() {
    if (guide) guide.style.display = "none";
  }

  /* ================= 重置舞台并重建引擎（供首次播放与重新播放共用） ================= */
  function resetStage() {
    genNo += 1; // 作废此前所有正在运行的动画循环
    if (wrap) wrap.style.backgroundImage = "none"; // 清掉上一轮“树转背景图”
    if (canvas) canvas.style.background = "";
    // 先停掉上一轮可能还在跑的打字机，防止旧计时器与新计时器交替写同一节点
    if (window.Confession && Confession.stopTypewriter) Confession.stopTypewriter();
    if (code) {
      code.style.display = "none";
      code.innerHTML = LETTER_HTML; // 恢复完整情书（可能上一轮还没打完）
    }
    if (clockBox) {
      clockBox.style.display = "none"; // 计时区收起，由 textAnimate 重新淡入
      clockBox.style.opacity = "0";
    }
    showGuide(); // 回到“等待点击心形种子”的初始状态
    canvas.classList.remove("hand");

    tree = new Tree(canvas, width, height, opts); // 全新引擎：种子回到初始位置与大小
    seed = tree.seed;
    foot = tree.footer;
    tree.ctx.clearRect(0, 0, width, height);
    seed.draw();
  }

  /* ================= 点击交互：等待点击“心形种子” ================= */
  var clickResolve = null;

  function newWaitClick() {
    return new Promise(function (resolve) {
      clickResolve = resolve;
    });
  }

  function toCanvas(e) {
    var rect = canvas.getBoundingClientRect();
    var s = window.stageScale || 1;
    return {
      x: (e.clientX - rect.left) / (s || 1),
      y: (e.clientY - rect.top) / (s || 1),
    };
  }

  function onCanvasMove(e) {
    var p = toCanvas(e);
    canvas.classList.toggle("hand", seed.hover(p.x, p.y));
  }

  function onCanvasClick(e) {
    var p = toCanvas(e);
    if (!seed.hover(p.x, p.y)) return;

    // 动画开始，收掉引导提示并解绑监听
    hideGuide();
    detachSeedClick();
    canvas.classList.remove("hand");
    if (clickResolve) {
      var resolve = clickResolve;
      clickResolve = null;
      resolve();
    }
  }

  function attachSeedClick() {
    canvas.addEventListener("mousemove", onCanvasMove);
    canvas.addEventListener("click", onCanvasClick);
  }

  function detachSeedClick() {
    canvas.removeEventListener("mousemove", onCanvasMove);
    canvas.removeEventListener("click", onCanvasClick);
  }

  /* ================= 四幕动画（thisGen 为本次播放的代际号） =================
   * 每个 await 之后都先校验 thisGen === genNo 再碰引擎，保证重新播放时
   * 旧循环立即退出、绝不污染新一届的树。 */
  function playActs(thisGen, waitForSeedClick) {
    return (async function () {
      /* 第一幕：心形种子下坠入土（重播时用户已点过“重新播放”，无需再点种子） */
      if (waitForSeedClick) {
        await newWaitClick();
        if (thisGen !== genNo) return;
        hideGuide();
        detachSeedClick();
      }
      while (thisGen === genNo && seed.canScale()) {
        // 心形缩小
        seed.scale(0.95);
        await sleep(10);
      }
      if (thisGen !== genNo) return;
      while (thisGen === genNo && seed.canMove()) {
        // 心形下坠
        seed.move(0, 2);
        foot.draw();
        await sleep(10);
      }
      if (thisGen !== genNo) return;

      /* 第二幕：种子长成大树 */
      while (thisGen === genNo) {
        tree.grow();
        await sleep(10);
        if (thisGen !== genNo || !tree.canGrow()) break;
      }
      if (thisGen !== genNo) return;

      /* 第三幕：满树开花 */
      while (thisGen === genNo) {
        tree.flower(2);
        await sleep(10);
        if (thisGen !== genNo || !tree.canFlower()) break;
      }
      if (thisGen !== genNo) return;

      /* 过渡：整树平移到画布中央，并转为背景图避免闪烁 */
      tree.snapshot("p1", 240, 0, 610, 680);
      while (thisGen === genNo && tree.move("p1", 500, 0)) {
        foot.draw();
        await sleep(10);
      }
      if (thisGen !== genNo) return;
      foot.draw();

      // 上一版此处会有闪烁，这里将整棵树转为背景图承载，避免闪烁
      wrap.style.backgroundImage = "url(" + tree.toDataURL("image/png") + ")";
      canvas.style.background = "#ffe";
      await sleep(300);
      if (thisGen !== genNo) return;
      canvas.style.background = "";

      /* 第四幕：树下花瓣持续飘落（永不结束，直到下一次重新播放） */
      textAnimate(thisGen); // 情书 + 计时（并行启动）
      await jumpAnimate(thisGen);
    })().catch(function (err) {
      console.error("动画异常:", err);
    });
  }

  /** 第四幕：树下花瓣持续飘落 */
  async function jumpAnimate(thisGen) {
    while (thisGen === genNo) {
      tree.ctx.clearRect(0, 0, width, height);
      tree.jump();
      foot.draw();
      await sleep(25);
    }
  }

  /** 情书打字机 + 相恋计时（与第四幕并行） */
  async function textAnimate(thisGen) {
    if (!code || !clockBox) return;

    code.style.display = "block";
    Confession.typewriter(code);
    Confession.fadeIn(clockBox, 500);

    while (thisGen === genNo) {
      Confession.timeElapse(together);
      await sleep(1000);
    }
  }

  /* ================= 重新播放 ================= */
  function replay() {
    resetStage(); // 作废旧循环 + 清场 + 重建树
    // 重播为免点击自动播放，引导环（“轻轻点它”）没有存在意义，直接收起，
    // 避免长成大树后还悬浮在画面中央造成误导
    hideGuide();
    playActs(genNo, false); // 本届代际号，免点击直接重播四幕
  }

  if (replayBtn) {
    replayBtn.addEventListener("click", replay);
  }

  /* ================= 背景音乐（自动播放策略需要用户手势） ================= */
  var bgm = document.getElementById("bgm");
  var soundBtn = document.getElementById("sound");
  var MUSIC_ON = "❚❚";
  var MUSIC_OFF = "🎵";

  if (bgm && soundBtn) {
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
    // 音频加载失败时静默兜底（隐藏按钮，不影响其他动画）
    bgm.addEventListener("error", function () {
      soundBtn.style.display = "none";
    });

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

    reflectMusic();
  }

  /* ================= 启动 ================= */
  Confession.fitStage();

  resetStage();
  attachSeedClick();
  playActs(genNo, true); // 首播等点击心形种子
})();
