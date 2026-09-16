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
  // 118 个元素（符号 / 英文名 / 中文名 / 相对原子质量 / 族 / 周期）；
  // 质量值带括号表示无稳定同位素元素的半衰期最长同位素质量
  var ELEMENTS = [
  { sym: "H", name: "Hydrogen", zh: "氢", mass: "1.00794", group: 1, period: 1 },
  { sym: "He", name: "Helium", zh: "氦", mass: "4.002602", group: 18, period: 1 },
  { sym: "Li", name: "Lithium", zh: "锂", mass: "6.941", group: 1, period: 2 },
  { sym: "Be", name: "Beryllium", zh: "铍", mass: "9.012182", group: 2, period: 2 },
  { sym: "B", name: "Boron", zh: "硼", mass: "10.811", group: 13, period: 2 },
  { sym: "C", name: "Carbon", zh: "碳", mass: "12.0107", group: 14, period: 2 },
  { sym: "N", name: "Nitrogen", zh: "氮", mass: "14.0067", group: 15, period: 2 },
  { sym: "O", name: "Oxygen", zh: "氧", mass: "15.9994", group: 16, period: 2 },
  { sym: "F", name: "Fluorine", zh: "氟", mass: "18.9984032", group: 17, period: 2 },
  { sym: "Ne", name: "Neon", zh: "氖", mass: "20.1797", group: 18, period: 2 },
  { sym: "Na", name: "Sodium", zh: "钠", mass: "22.98977", group: 1, period: 3 },
  { sym: "Mg", name: "Magnesium", zh: "镁", mass: "24.305", group: 2, period: 3 },
  { sym: "Al", name: "Aluminium", zh: "铝", mass: "26.9815386", group: 13, period: 3 },
  { sym: "Si", name: "Silicon", zh: "硅", mass: "28.0855", group: 14, period: 3 },
  { sym: "P", name: "Phosphorus", zh: "磷", mass: "30.973762", group: 15, period: 3 },
  { sym: "S", name: "Sulfur", zh: "硫", mass: "32.065", group: 16, period: 3 },
  { sym: "Cl", name: "Chlorine", zh: "氯", mass: "35.453", group: 17, period: 3 },
  { sym: "Ar", name: "Argon", zh: "氩", mass: "39.948", group: 18, period: 3 },
  { sym: "K", name: "Potassium", zh: "钾", mass: "39.0983", group: 1, period: 4 },
  { sym: "Ca", name: "Calcium", zh: "钙", mass: "40.078", group: 2, period: 4 },
  { sym: "Sc", name: "Scandium", zh: "钪", mass: "44.955912", group: 3, period: 4 },
  { sym: "Ti", name: "Titanium", zh: "钛", mass: "47.867", group: 4, period: 4 },
  { sym: "V", name: "Vanadium", zh: "钒", mass: "50.9415", group: 5, period: 4 },
  { sym: "Cr", name: "Chromium", zh: "铬", mass: "51.9961", group: 6, period: 4 },
  { sym: "Mn", name: "Manganese", zh: "锰", mass: "54.938045", group: 7, period: 4 },
  { sym: "Fe", name: "Iron", zh: "铁", mass: "55.845", group: 8, period: 4 },
  { sym: "Co", name: "Cobalt", zh: "钴", mass: "58.933195", group: 9, period: 4 },
  { sym: "Ni", name: "Nickel", zh: "镍", mass: "58.6934", group: 10, period: 4 },
  { sym: "Cu", name: "Copper", zh: "铜", mass: "63.546", group: 11, period: 4 },
  { sym: "Zn", name: "Zinc", zh: "锌", mass: "65.38", group: 12, period: 4 },
  { sym: "Ga", name: "Gallium", zh: "镓", mass: "69.723", group: 13, period: 4 },
  { sym: "Ge", name: "Germanium", zh: "锗", mass: "72.63", group: 14, period: 4 },
  { sym: "As", name: "Arsenic", zh: "砷", mass: "74.9216", group: 15, period: 4 },
  { sym: "Se", name: "Selenium", zh: "硒", mass: "78.96", group: 16, period: 4 },
  { sym: "Br", name: "Bromine", zh: "溴", mass: "79.904", group: 17, period: 4 },
  { sym: "Kr", name: "Krypton", zh: "氪", mass: "83.798", group: 18, period: 4 },
  { sym: "Rb", name: "Rubidium", zh: "铷", mass: "85.4678", group: 1, period: 5 },
  { sym: "Sr", name: "Strontium", zh: "锶", mass: "87.62", group: 2, period: 5 },
  { sym: "Y", name: "Yttrium", zh: "钇", mass: "88.90585", group: 3, period: 5 },
  { sym: "Zr", name: "Zirconium", zh: "锆", mass: "91.224", group: 4, period: 5 },
  { sym: "Nb", name: "Niobium", zh: "铌", mass: "92.90628", group: 5, period: 5 },
  { sym: "Mo", name: "Molybdenum", zh: "钼", mass: "95.96", group: 6, period: 5 },
  { sym: "Tc", name: "Technetium", zh: "锝", mass: "(98)", group: 7, period: 5 },
  { sym: "Ru", name: "Ruthenium", zh: "钌", mass: "101.07", group: 8, period: 5 },
  { sym: "Rh", name: "Rhodium", zh: "铑", mass: "102.9055", group: 9, period: 5 },
  { sym: "Pd", name: "Palladium", zh: "钯", mass: "106.42", group: 10, period: 5 },
  { sym: "Ag", name: "Silver", zh: "银", mass: "107.8682", group: 11, period: 5 },
  { sym: "Cd", name: "Cadmium", zh: "镉", mass: "112.411", group: 12, period: 5 },
  { sym: "In", name: "Indium", zh: "铟", mass: "114.818", group: 13, period: 5 },
  { sym: "Sn", name: "Tin", zh: "锡", mass: "118.71", group: 14, period: 5 },
  { sym: "Sb", name: "Antimony", zh: "锑", mass: "121.76", group: 15, period: 5 },
  { sym: "Te", name: "Tellurium", zh: "碲", mass: "127.6", group: 16, period: 5 },
  { sym: "I", name: "Iodine", zh: "碘", mass: "126.90447", group: 17, period: 5 },
  { sym: "Xe", name: "Xenon", zh: "氙", mass: "131.293", group: 18, period: 5 },
  { sym: "Cs", name: "Caesium", zh: "铯", mass: "132.9054", group: 1, period: 6 },
  { sym: "Ba", name: "Barium", zh: "钡", mass: "137.327", group: 2, period: 6 },
  { sym: "La", name: "Lanthanum", zh: "镧", mass: "138.90547", group: 4, period: 9 },
  { sym: "Ce", name: "Cerium", zh: "铈", mass: "140.116", group: 5, period: 9 },
  { sym: "Pr", name: "Praseodymium", zh: "镨", mass: "140.90765", group: 6, period: 9 },
  { sym: "Nd", name: "Neodymium", zh: "钕", mass: "144.242", group: 7, period: 9 },
  { sym: "Pm", name: "Promethium", zh: "钷", mass: "(145)", group: 8, period: 9 },
  { sym: "Sm", name: "Samarium", zh: "钐", mass: "150.36", group: 9, period: 9 },
  { sym: "Eu", name: "Europium", zh: "铕", mass: "151.964", group: 10, period: 9 },
  { sym: "Gd", name: "Gadolinium", zh: "钆", mass: "157.25", group: 11, period: 9 },
  { sym: "Tb", name: "Terbium", zh: "铽", mass: "158.92535", group: 12, period: 9 },
  { sym: "Dy", name: "Dysprosium", zh: "镝", mass: "162.5", group: 13, period: 9 },
  { sym: "Ho", name: "Holmium", zh: "钬", mass: "164.93032", group: 14, period: 9 },
  { sym: "Er", name: "Erbium", zh: "铒", mass: "167.259", group: 15, period: 9 },
  { sym: "Tm", name: "Thulium", zh: "铥", mass: "168.93421", group: 16, period: 9 },
  { sym: "Yb", name: "Ytterbium", zh: "镱", mass: "173.054", group: 17, period: 9 },
  { sym: "Lu", name: "Lutetium", zh: "镥", mass: "174.9668", group: 18, period: 9 },
  { sym: "Hf", name: "Hafnium", zh: "铪", mass: "178.49", group: 4, period: 6 },
  { sym: "Ta", name: "Tantalum", zh: "钽", mass: "180.94788", group: 5, period: 6 },
  { sym: "W", name: "Tungsten", zh: "钨", mass: "183.84", group: 6, period: 6 },
  { sym: "Re", name: "Rhenium", zh: "铼", mass: "186.207", group: 7, period: 6 },
  { sym: "Os", name: "Osmium", zh: "锇", mass: "190.23", group: 8, period: 6 },
  { sym: "Ir", name: "Iridium", zh: "铱", mass: "192.217", group: 9, period: 6 },
  { sym: "Pt", name: "Platinum", zh: "铂", mass: "195.084", group: 10, period: 6 },
  { sym: "Au", name: "Gold", zh: "金", mass: "196.966569", group: 11, period: 6 },
  { sym: "Hg", name: "Mercury", zh: "汞", mass: "200.59", group: 12, period: 6 },
  { sym: "Tl", name: "Thallium", zh: "铊", mass: "204.3833", group: 13, period: 6 },
  { sym: "Pb", name: "Lead", zh: "铅", mass: "207.2", group: 14, period: 6 },
  { sym: "Bi", name: "Bismuth", zh: "铋", mass: "208.9804", group: 15, period: 6 },
  { sym: "Po", name: "Polonium", zh: "钋", mass: "(209)", group: 16, period: 6 },
  { sym: "At", name: "Astatine", zh: "砹", mass: "(210)", group: 17, period: 6 },
  { sym: "Rn", name: "Radon", zh: "氡", mass: "(222)", group: 18, period: 6 },
  { sym: "Fr", name: "Francium", zh: "钫", mass: "(223)", group: 1, period: 7 },
  { sym: "Ra", name: "Radium", zh: "镭", mass: "(226)", group: 2, period: 7 },
  { sym: "Ac", name: "Actinium", zh: "锕", mass: "(227)", group: 4, period: 10 },
  { sym: "Th", name: "Thorium", zh: "钍", mass: "232.03806", group: 5, period: 10 },
  { sym: "Pa", name: "Protactinium", zh: "镤", mass: "231.0588", group: 6, period: 10 },
  { sym: "U", name: "Uranium", zh: "铀", mass: "238.02891", group: 7, period: 10 },
  { sym: "Np", name: "Neptunium", zh: "镎", mass: "(237)", group: 8, period: 10 },
  { sym: "Pu", name: "Plutonium", zh: "钚", mass: "(244)", group: 9, period: 10 },
  { sym: "Am", name: "Americium", zh: "镅", mass: "(243)", group: 10, period: 10 },
  { sym: "Cm", name: "Curium", zh: "锔", mass: "(247)", group: 11, period: 10 },
  { sym: "Bk", name: "Berkelium", zh: "锫", mass: "(247)", group: 12, period: 10 },
  { sym: "Cf", name: "Californium", zh: "锎", mass: "(251)", group: 13, period: 10 },
  { sym: "Es", name: "Einsteinium", zh: "锿", mass: "(252)", group: 14, period: 10 },
  { sym: "Fm", name: "Fermium", zh: "镄", mass: "(257)", group: 15, period: 10 },
  { sym: "Md", name: "Mendelevium", zh: "钔", mass: "(258)", group: 16, period: 10 },
  { sym: "No", name: "Nobelium", zh: "锘", mass: "(259)", group: 17, period: 10 },
  { sym: "Lr", name: "Lawrencium", zh: "铹", mass: "(266)", group: 18, period: 10 },
  { sym: "Rf", name: "Rutherfordium", zh: "𬬻", mass: "(267)", group: 4, period: 7 },
  { sym: "Db", name: "Dubnium", zh: "𬭊", mass: "(268)", group: 5, period: 7 },
  { sym: "Sg", name: "Seaborgium", zh: "𬭳", mass: "(269)", group: 6, period: 7 },
  { sym: "Bh", name: "Bohrium", zh: "𬭛", mass: "(270)", group: 7, period: 7 },
  { sym: "Hs", name: "Hassium", zh: "𬭶", mass: "(269)", group: 8, period: 7 },
  { sym: "Mt", name: "Meitnerium", zh: "鿏", mass: "(278)", group: 9, period: 7 },
  { sym: "Ds", name: "Darmstadtium", zh: "𬭸", mass: "(281)", group: 10, period: 7 },
  { sym: "Rg", name: "Roentgenium", zh: "𬬬", mass: "(282)", group: 11, period: 7 },
  { sym: "Cn", name: "Copernicium", zh: "鿔", mass: "(285)", group: 12, period: 7 },
  { sym: "Nh", name: "Nihonium", zh: "鿭", mass: "(286)", group: 13, period: 7 },
  { sym: "Fl", name: "Flerovium", zh: "𫓧", mass: "(289)", group: 14, period: 7 },
  { sym: "Mc", name: "Moscovium", zh: "镆", mass: "(289)", group: 15, period: 7 },
  { sym: "Lv", name: "Livermorium", zh: "𫟅", mass: "(293)", group: 16, period: 7 },
  { sym: "Ts", name: "Tennessine", zh: "鿬", mass: "(294)", group: 17, period: 7 },
  { sym: "Og", name: "Oganesson", zh: "鿫", mass: "(294)", group: 18, period: 7 },
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
      element.title = el.zh + " · " + el.name; // 悬停提示中英文元素名

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
      details.appendChild(document.createTextNode(el.zh));
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
