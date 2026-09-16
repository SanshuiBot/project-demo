/**
 * main.js —— 3D CSS3D 元素周期表
 * 依赖本地脚本（加载顺序见 index.html）：
 *   three.min.js / tween.min.js / TrackballControls.js / CSS3DRenderer.js / element-data.js（元素数据表）
 * 功能：TABLE / SPHERE / HELIX / GRID 四种排列布局，可拖拽旋转缩放。
 */
/* global THREE, TWEEN, ELEMENTS, ELEMENT_EXTRAS, ELEMENT_MORE, ELEMENT_PHYS, DATA_UPDATED */
(function () {
  "use strict";

  // 数据文件自检失败（或 element-data.js 未加载）时拒绝启动：页面会显示 element-data.js 给出的明确诊断，
  // 避免在 init() 深处以 "Cannot read properties of undefined" 之类难以定位的方式崩溃
  if (typeof ELEMENT_DATA_OK === "undefined" || !ELEMENT_DATA_OK) {
    return;
  }

  /* 分类 → 卡片底色。11 类按色环均分色相（红→橙→金→黄绿→绿→青→蓝→紫→品红），
     易混对（稀有气体/锕系）改用明度对比区分；alpha 0.92 减少紫色页面背景透色导致的糊化。
     须与 index.html 图例色板保持一致 */
  var CAT_COLORS = {
    碱金属: "rgba(224, 64, 56, 0.92)",   // 正红（色相 0°）
    碱土金属: "rgba(232, 130, 30, 0.92)",// 橙（~26°）
    卤素: "rgba(217, 179, 36, 0.92)",    // 金黄（~47°）
    类金属: "rgba(156, 191, 46, 0.92)",  // 黄绿（~72°）
    主族金属: "rgba(47, 158, 99, 0.92)", // 深绿（~148°）
    非金属: "rgba(24, 184, 201, 0.92)",  // 青（~188°）
    过渡金属: "rgba(58, 111, 216, 0.92)",// 蓝（~218°）
    稀有气体: "rgba(166, 120, 232, 0.92)",// 浅紫（~268°，明度亮）
    镧系元素: "rgba(232, 87, 159, 0.92)",// 品红/粉（~322°）
    锕系元素: "rgba(84, 37, 140, 0.95)", // 深紫（与浅紫靠明度对比区分）
    放射性: "rgba(74, 74, 74, 0.95)",    // 深灰
  };

  /* 常温状态 → 卡片内小徽章显示文字（放射性元素徽章显示"放射性"） */
  var STATE_LABELS = { 固: "固体", 液: "液体", 气: "气体", 放射性: "放射性" };

  var camera, scene, renderer, controls;
  var objects = [];
  var targets = { table: [], sphere: [], helix: [], grid: [] };
  var rafId = 0;

  /* ---------------- 初始化 ---------------- */
  function init() {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // 桌面排列：先随机散落，之后由 transform() 归位
    for (var i = 0; i < ELEMENTS.length; i++) {
      var el = ELEMENTS[i];
      var extra = ELEMENT_EXTRAS[el.sym]; // 按符号一一对应，绝不依赖行序
      var element = document.createElement("div");
      element.className = "element";

      // 分类着色：底色与左侧图例色板一一对应
      element.style.backgroundColor = CAT_COLORS[extra.cat] || "rgba(0,127,127,0.5)";

      // 放射性元素：红色角标 + 白色虚线描边
      if (extra.state === "放射性") {
        element.classList.add("radioactive");
      }

      element.title = el.zh + "（" + el.pinyin + "） · " + el.name + "（双击查看详情）";

      var number = document.createElement("div");
      number.className = "number";
      number.textContent = i + 1;
      element.appendChild(number);

      var symbol = document.createElement("div");
      symbol.className = "symbol";
      symbol.textContent = el.sym;
      element.appendChild(symbol);

      // 底部信息区：固定两行（中文名+拼音 / 质量+状态徽章），不换行防止上溢
      var details = document.createElement("div");
      details.className = "details";

      var line1 = document.createElement("div");
      line1.className = "el-line";
      var zhSpan = document.createElement("span");
      zhSpan.className = "el-zh";
      zhSpan.textContent = el.zh;
      line1.appendChild(zhSpan);
      var pySpan = document.createElement("span");
      pySpan.className = "el-pinyin";
      pySpan.textContent = el.pinyin;
      line1.appendChild(pySpan);
      details.appendChild(line1);

      var line2 = document.createElement("div");
      line2.className = "el-line";
      line2.appendChild(document.createTextNode(el.mass));
      // 状态徽章：液体 / 气体 / 固体 / 放射性
      var stateBadge = document.createElement("span");
      stateBadge.className = "el-state";
      if (extra.state === "放射性") {
        stateBadge.classList.add("s-radioactive");
      }
      stateBadge.textContent = STATE_LABELS[extra.state] || extra.state;
      line2.appendChild(stateBadge);
      details.appendChild(line2);
      element.appendChild(details);

      var object = new THREE.CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);
      objects.push(object);

      // 表格排列目标位置：主表用 period 1~7；
      // 镧系（period 9）/ 锕系（period 10）作为独立两行排在主表下方，中间空一行
      var target = new THREE.Object3D();
      target.position.x = el.group * 140 - 1330;
      target.position.y = -(el.period * 180) + 990;
      targets.table.push(target);
    }

    buildSphereTargets();
    buildHelixTargets();
    buildGridTargets();

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener("change", render);

    // 菜单按钮：统一事件绑定
    var menu = document.getElementById("menu");
    menu.addEventListener("click", function (e) {
      var btn = e.target;
      if (btn && btn.dataset && targets[btn.dataset.mode]) {
        transform(targets[btn.dataset.mode], 2000);
      }
    });

    window.addEventListener("resize", onWindowResize);

    // 图例底部展示数据更新时间（常量 DATA_UPDATED 定义在 element-data.js，更新数据时同步修改）
    var updatedEl = document.getElementById("data-updated");
    if (updatedEl) updatedEl.textContent = DATA_UPDATED;

    setupDetailPanel();

    // 首屏聚拢动画期间给容器加 .intro 剥离辉光阴影（见 index.html 样式说明），
    // 动画最长约 2.75s，3.2s 后恢复，兼顾余量
    var container = document.getElementById("container");
    container.classList.add("intro");
    setTimeout(function () {
      container.classList.remove("intro");
    }, 3200);

    transform(targets.table, 2200, TWEEN.Easing.Cubic.Out); // 初始动画：快速聚拢为表格
  }

  /* ---------------- 元素详情面板（双击卡片弹出） ---------------- */
  function setupDetailPanel() {
    var panel = document.getElementById("detail");
    if (!panel) return;

    // 区块归属：按族/周期推导（镧系 57-71、锕系 89-103 单列 f 区）
    function blockOf(num, el) {
      if (num >= 57 && num <= 71) return "f 区（镧系）";
      if (num >= 89 && num <= 103) return "f 区（锕系）";
      if (el.group === 1 || el.group === 2) return "s 区";
      if (el.group >= 13 && el.group <= 18) return "p 区";
      return "d 区";
    }

    function show(index) {
      var el = ELEMENTS[index];
      var extra = ELEMENT_EXTRAS[el.sym]; // 按符号一一对应
      if (!el || !extra) return;

      panel.querySelector(".d-symbol").textContent = el.sym;
      panel.querySelector(".d-zh").textContent = el.zh;
      panel.querySelector(".d-pinyin").textContent = el.pinyin;
      panel.querySelector(".d-name").textContent = el.name;
      panel.querySelector(".v-number").textContent = index + 1;
      panel.querySelector(".v-mass").textContent = el.mass;
      panel.querySelector(".v-group").textContent = el.group;
      // 周期显示：把内部占位行 9/10（镧系/锕系）还原为第 6/7 周期，避免误导
      var displayPeriod = el.period === 9 ? 6 : el.period === 10 ? 7 : el.period;
      panel.querySelector(".v-period").textContent = displayPeriod;
      panel.querySelector(".v-cat").textContent = extra.cat;
      panel.querySelector(".v-state").textContent = STATE_LABELS[extra.state] || extra.state;
      panel.querySelector(".v-block").textContent = blockOf(index + 1, el);
      var more = ELEMENT_MORE[el.sym] || {};
      var phys = ELEMENT_PHYS[el.sym] || {};
      panel.querySelector(".v-disc").textContent = more.disc || "—";
      panel.querySelector(".d-desc").textContent = extra.desc;
      panel.querySelector(".d-use").textContent = more.use || "—";
      panel.querySelector(".v-mp").textContent = phys.mp || "—";
      panel.querySelector(".v-bp").textContent = phys.bp || "—";
      panel.querySelector(".v-den").textContent = phys.den || "—";

      panel.classList.add("open");
    }

    function hide() {
      panel.classList.remove("open");
    }

    // 双击元素卡片打开详情（事件委托，卡片在 3D 变换中动态跟踪）
    renderer.domElement.addEventListener("dblclick", function (e) {
      var target = e.target;
      while (target && target !== renderer.domElement) {
        if (target.classList && target.classList.contains("element")) {
          var index = objects.findIndex(function (o) {
            return o.element === target;
          });
          if (index !== -1) show(index);
          return;
        }
        target = target.parentNode;
      }
    });

    // 关闭交互：关闭按钮 / 点击遮罩 / Esc 键
    panel.querySelector(".d-close").addEventListener("click", hide);
    panel.addEventListener("click", function (e) {
      if (e.target === panel) hide();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide();
    });
  }

  /* 球面排列 */
  function buildSphereTargets() {
    var vector = new THREE.Vector3();
    for (var i = 0, l = objects.length; i < l; i++) {
      var phi = Math.acos(-1 + (2 * i) / l);
      var theta = Math.sqrt(l * Math.PI) * phi;

      var object = new THREE.Object3D();
      object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
      object.position.z = 800 * Math.cos(phi);

      vector.copy(object.position).multiplyScalar(2);
      object.lookAt(vector);

      targets.sphere.push(object);
    }
  }

  /* 螺旋排列 */
  function buildHelixTargets() {
    for (var i = 0, l = objects.length; i < l; i++) {
      var phi = i * 0.175 + Math.PI;

      var object = new THREE.Object3D();
      object.position.x = 900 * Math.sin(phi);
      object.position.y = -(i * 8) + 450;
      object.position.z = 900 * Math.cos(phi);

      var vector = new THREE.Vector3(
        object.position.x * 2,
        object.position.y,
        object.position.z * 2
      );
      object.lookAt(vector);

      targets.helix.push(object);
    }
  }

  /* 网格排列 */
  function buildGridTargets() {
    for (var i = 0; i < objects.length; i++) {
      var object = new THREE.Object3D();
      object.position.x = (i % 5) * 400 - 800;
      object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800;
      object.position.z = Math.floor(i / 25) * 1000 - 2000;
      targets.grid.push(object);
    }
  }

  /* 布局切换：为每个元素补间位置与旋转。
     easing 可选：初次进入用 Cubic.Out（一启动就明显在动），布局按钮用默认 Exponential.InOut */
  function transform(targetList, duration, easing) {
    var ease = easing || TWEEN.Easing.Exponential.InOut;
    TWEEN.removeAll();

    for (var i = 0; i < objects.length; i++) {
      var object = objects[i];
      var target = targetList[i];

      new TWEEN.Tween(object.position)
        .to(
          { x: target.position.x, y: target.position.y, z: target.position.z },
          duration * (0.75 + Math.random() * 0.5)
        )
        .easing(ease)
        .start();

      new TWEEN.Tween(object.rotation)
        .to(
          { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          duration * (0.75 + Math.random() * 0.5)
        )
        .easing(ease)
        .start();
    }

    // 过渡期间持续重绘（时长需覆盖最慢的补间：duration * 1.25）
    new TWEEN.Tween({})
      .to({}, duration * 1.3)
      .onUpdate(render)
      .start();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  /* ---------------- 动画循环（页面不可见时自动暂停） ---------------- */
  function loop() {
    rafId = requestAnimationFrame(loop);
    TWEEN.update();
    controls.update();
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopLoop();
    } else if (!rafId) {
      loop();
    }
  });

  function render() {
    renderer.render(scene, camera);
  }

  init();
  loop();
})();
