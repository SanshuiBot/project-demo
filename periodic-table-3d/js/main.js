/**
 * main.js —— 3D CSS3D 元素周期表
 * 依赖本地脚本（加载顺序见 index.html）：
 *   three.min.js / tween.min.js / TrackballControls.js / CSS3DRenderer.js
 * 功能：TABLE / SPHERE / HELIX / GRID 四种排列布局，可拖拽旋转缩放。
 */
/* global THREE, TWEEN */
(function () {
  "use strict";

  /* ---------------- 元素数据 ---------------- */
  // 118 个元素（符号 / 英文名 / 相对原子质量 / 族 / 周期）；
  // 质量值带括号表示无稳定同位素元素的半衰期最长同位素质量
  var ELEMENTS = [
  { sym: "H", name: "Hydrogen", mass: "1.00794", group: 1, period: 1 },
  { sym: "He", name: "Helium", mass: "4.002602", group: 18, period: 1 },
  { sym: "Li", name: "Lithium", mass: "6.941", group: 1, period: 2 },
  { sym: "Be", name: "Beryllium", mass: "9.012182", group: 2, period: 2 },
  { sym: "B", name: "Boron", mass: "10.811", group: 13, period: 2 },
  { sym: "C", name: "Carbon", mass: "12.0107", group: 14, period: 2 },
  { sym: "N", name: "Nitrogen", mass: "14.0067", group: 15, period: 2 },
  { sym: "O", name: "Oxygen", mass: "15.9994", group: 16, period: 2 },
  { sym: "F", name: "Fluorine", mass: "18.9984032", group: 17, period: 2 },
  { sym: "Ne", name: "Neon", mass: "20.1797", group: 18, period: 2 },
  { sym: "Na", name: "Sodium", mass: "22.98977", group: 1, period: 3 },
  { sym: "Mg", name: "Magnesium", mass: "24.305", group: 2, period: 3 },
  { sym: "Al", name: "Aluminium", mass: "26.9815386", group: 13, period: 3 },
  { sym: "Si", name: "Silicon", mass: "28.0855", group: 14, period: 3 },
  { sym: "P", name: "Phosphorus", mass: "30.973762", group: 15, period: 3 },
  { sym: "S", name: "Sulfur", mass: "32.065", group: 16, period: 3 },
  { sym: "Cl", name: "Chlorine", mass: "35.453", group: 17, period: 3 },
  { sym: "Ar", name: "Argon", mass: "39.948", group: 18, period: 3 },
  { sym: "K", name: "Potassium", mass: "39.0983", group: 1, period: 4 },
  { sym: "Ca", name: "Calcium", mass: "40.078", group: 2, period: 4 },
  { sym: "Sc", name: "Scandium", mass: "44.955912", group: 3, period: 4 },
  { sym: "Ti", name: "Titanium", mass: "47.867", group: 4, period: 4 },
  { sym: "V", name: "Vanadium", mass: "50.9415", group: 5, period: 4 },
  { sym: "Cr", name: "Chromium", mass: "51.9961", group: 6, period: 4 },
  { sym: "Mn", name: "Manganese", mass: "54.938045", group: 7, period: 4 },
  { sym: "Fe", name: "Iron", mass: "55.845", group: 8, period: 4 },
  { sym: "Co", name: "Cobalt", mass: "58.933195", group: 9, period: 4 },
  { sym: "Ni", name: "Nickel", mass: "58.6934", group: 10, period: 4 },
  { sym: "Cu", name: "Copper", mass: "63.546", group: 11, period: 4 },
  { sym: "Zn", name: "Zinc", mass: "65.38", group: 12, period: 4 },
  { sym: "Ga", name: "Gallium", mass: "69.723", group: 13, period: 4 },
  { sym: "Ge", name: "Germanium", mass: "72.63", group: 14, period: 4 },
  { sym: "As", name: "Arsenic", mass: "74.9216", group: 15, period: 4 },
  { sym: "Se", name: "Selenium", mass: "78.96", group: 16, period: 4 },
  { sym: "Br", name: "Bromine", mass: "79.904", group: 17, period: 4 },
  { sym: "Kr", name: "Krypton", mass: "83.798", group: 18, period: 4 },
  { sym: "Rb", name: "Rubidium", mass: "85.4678", group: 1, period: 5 },
  { sym: "Sr", name: "Strontium", mass: "87.62", group: 2, period: 5 },
  { sym: "Y", name: "Yttrium", mass: "88.90585", group: 3, period: 5 },
  { sym: "Zr", name: "Zirconium", mass: "91.224", group: 4, period: 5 },
  { sym: "Nb", name: "Niobium", mass: "92.90628", group: 5, period: 5 },
  { sym: "Mo", name: "Molybdenum", mass: "95.96", group: 6, period: 5 },
  { sym: "Tc", name: "Technetium", mass: "(98)", group: 7, period: 5 },
  { sym: "Ru", name: "Ruthenium", mass: "101.07", group: 8, period: 5 },
  { sym: "Rh", name: "Rhodium", mass: "102.9055", group: 9, period: 5 },
  { sym: "Pd", name: "Palladium", mass: "106.42", group: 10, period: 5 },
  { sym: "Ag", name: "Silver", mass: "107.8682", group: 11, period: 5 },
  { sym: "Cd", name: "Cadmium", mass: "112.411", group: 12, period: 5 },
  { sym: "In", name: "Indium", mass: "114.818", group: 13, period: 5 },
  { sym: "Sn", name: "Tin", mass: "118.71", group: 14, period: 5 },
  { sym: "Sb", name: "Antimony", mass: "121.76", group: 15, period: 5 },
  { sym: "Te", name: "Tellurium", mass: "127.6", group: 16, period: 5 },
  { sym: "I", name: "Iodine", mass: "126.90447", group: 17, period: 5 },
  { sym: "Xe", name: "Xenon", mass: "131.293", group: 18, period: 5 },
  { sym: "Cs", name: "Caesium", mass: "132.9054", group: 1, period: 6 },
  { sym: "Ba", name: "Barium", mass: "137.327", group: 2, period: 6 },
  { sym: "La", name: "Lanthanum", mass: "138.90547", group: 4, period: 9 },
  { sym: "Ce", name: "Cerium", mass: "140.116", group: 5, period: 9 },
  { sym: "Pr", name: "Praseodymium", mass: "140.90765", group: 6, period: 9 },
  { sym: "Nd", name: "Neodymium", mass: "144.242", group: 7, period: 9 },
  { sym: "Pm", name: "Promethium", mass: "(145)", group: 8, period: 9 },
  { sym: "Sm", name: "Samarium", mass: "150.36", group: 9, period: 9 },
  { sym: "Eu", name: "Europium", mass: "151.964", group: 10, period: 9 },
  { sym: "Gd", name: "Gadolinium", mass: "157.25", group: 11, period: 9 },
  { sym: "Tb", name: "Terbium", mass: "158.92535", group: 12, period: 9 },
  { sym: "Dy", name: "Dysprosium", mass: "162.5", group: 13, period: 9 },
  { sym: "Ho", name: "Holmium", mass: "164.93032", group: 14, period: 9 },
  { sym: "Er", name: "Erbium", mass: "167.259", group: 15, period: 9 },
  { sym: "Tm", name: "Thulium", mass: "168.93421", group: 16, period: 9 },
  { sym: "Yb", name: "Ytterbium", mass: "173.054", group: 17, period: 9 },
  { sym: "Lu", name: "Lutetium", mass: "174.9668", group: 18, period: 9 },
  { sym: "Hf", name: "Hafnium", mass: "178.49", group: 4, period: 6 },
  { sym: "Ta", name: "Tantalum", mass: "180.94788", group: 5, period: 6 },
  { sym: "W", name: "Tungsten", mass: "183.84", group: 6, period: 6 },
  { sym: "Re", name: "Rhenium", mass: "186.207", group: 7, period: 6 },
  { sym: "Os", name: "Osmium", mass: "190.23", group: 8, period: 6 },
  { sym: "Ir", name: "Iridium", mass: "192.217", group: 9, period: 6 },
  { sym: "Pt", name: "Platinum", mass: "195.084", group: 10, period: 6 },
  { sym: "Au", name: "Gold", mass: "196.966569", group: 11, period: 6 },
  { sym: "Hg", name: "Mercury", mass: "200.59", group: 12, period: 6 },
  { sym: "Tl", name: "Thallium", mass: "204.3833", group: 13, period: 6 },
  { sym: "Pb", name: "Lead", mass: "207.2", group: 14, period: 6 },
  { sym: "Bi", name: "Bismuth", mass: "208.9804", group: 15, period: 6 },
  { sym: "Po", name: "Polonium", mass: "(209)", group: 16, period: 6 },
  { sym: "At", name: "Astatine", mass: "(210)", group: 17, period: 6 },
  { sym: "Rn", name: "Radon", mass: "(222)", group: 18, period: 6 },
  { sym: "Fr", name: "Francium", mass: "(223)", group: 1, period: 7 },
  { sym: "Ra", name: "Radium", mass: "(226)", group: 2, period: 7 },
  { sym: "Ac", name: "Actinium", mass: "(227)", group: 4, period: 10 },
  { sym: "Th", name: "Thorium", mass: "232.03806", group: 5, period: 10 },
  { sym: "Pa", name: "Protactinium", mass: "231.0588", group: 6, period: 10 },
  { sym: "U", name: "Uranium", mass: "238.02891", group: 7, period: 10 },
  { sym: "Np", name: "Neptunium", mass: "(237)", group: 8, period: 10 },
  { sym: "Pu", name: "Plutonium", mass: "(244)", group: 9, period: 10 },
  { sym: "Am", name: "Americium", mass: "(243)", group: 10, period: 10 },
  { sym: "Cm", name: "Curium", mass: "(247)", group: 11, period: 10 },
  { sym: "Bk", name: "Berkelium", mass: "(247)", group: 12, period: 10 },
  { sym: "Cf", name: "Californium", mass: "(251)", group: 13, period: 10 },
  { sym: "Es", name: "Einsteinium", mass: "(252)", group: 14, period: 10 },
  { sym: "Fm", name: "Fermium", mass: "(257)", group: 15, period: 10 },
  { sym: "Md", name: "Mendelevium", mass: "(258)", group: 16, period: 10 },
  { sym: "No", name: "Nobelium", mass: "(259)", group: 17, period: 10 },
  { sym: "Lr", name: "Lawrencium", mass: "(266)", group: 18, period: 10 },
  { sym: "Rf", name: "Rutherfordium", mass: "(267)", group: 4, period: 7 },
  { sym: "Db", name: "Dubnium", mass: "(268)", group: 5, period: 7 },
  { sym: "Sg", name: "Seaborgium", mass: "(269)", group: 6, period: 7 },
  { sym: "Bh", name: "Bohrium", mass: "(270)", group: 7, period: 7 },
  { sym: "Hs", name: "Hassium", mass: "(269)", group: 8, period: 7 },
  { sym: "Mt", name: "Meitnerium", mass: "(278)", group: 9, period: 7 },
  { sym: "Ds", name: "Darmstadtium", mass: "(281)", group: 10, period: 7 },
  { sym: "Rg", name: "Roentgenium", mass: "(282)", group: 11, period: 7 },
  { sym: "Cn", name: "Copernicium", mass: "(285)", group: 12, period: 7 },
  { sym: "Nh", name: "Nihonium", mass: "(286)", group: 13, period: 7 },
  { sym: "Fl", name: "Flerovium", mass: "(289)", group: 14, period: 7 },
  { sym: "Mc", name: "Moscovium", mass: "(289)", group: 15, period: 7 },
  { sym: "Lv", name: "Livermorium", mass: "(293)", group: 16, period: 7 },
  { sym: "Ts", name: "Tennessine", mass: "(294)", group: 17, period: 7 },
  { sym: "Og", name: "Oganesson", mass: "(294)", group: 18, period: 7 },
];

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
      var element = document.createElement("div");
      element.className = "element";
      element.style.backgroundColor = "rgba(0,127,127," + (Math.random() * 0.5 + 0.25) + ")";
      element.title = el.name; // 悬停提示元素名

      var number = document.createElement("div");
      number.className = "number";
      number.textContent = i + 1;
      element.appendChild(number);

      var symbol = document.createElement("div");
      symbol.className = "symbol";
      symbol.textContent = el.sym;
      element.appendChild(symbol);

      var details = document.createElement("div");
      details.className = "details";
      details.appendChild(document.createTextNode(el.name));
      details.appendChild(document.createElement("br"));
      details.appendChild(document.createTextNode(el.mass));
      element.appendChild(details);

      var object = new THREE.CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);
      objects.push(object);

      // 表格排列目标位置
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

    transform(targets.table, 5000); // 初始动画：聚拢为表格
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

  /* 布局切换：为每个元素补间位置与旋转 */
  function transform(targetList, duration) {
    TWEEN.removeAll();

    for (var i = 0; i < objects.length; i++) {
      var object = objects[i];
      var target = targetList[i];

      new TWEEN.Tween(object.position)
        .to(
          { x: target.position.x, y: target.position.y, z: target.position.z },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to(
          { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }

    // 过渡期间持续重绘
    new TWEEN.Tween({})
      .to({}, duration * 2)
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
