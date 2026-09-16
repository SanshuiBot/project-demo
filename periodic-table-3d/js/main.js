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

  /* ---------------- 元素扩展信息（原子序数顺序：分类 / 一句话简介） ---------------- */
  var ELEMENT_EXTRAS = [
    { cat: "非金属", desc: "宇宙中丰度最高的元素，水的组成成分。" },
    { cat: "稀有气体", desc: "最轻的稀有气体，用于填充飞艇与低温冷却。" },
    { cat: "碱金属", desc: "最轻的金属，锂电池的核心材料。" },
    { cat: "碱土金属", desc: "轻而坚硬的金属，铍铜合金用于航天器材。" },
    { cat: "类金属", desc: "硼砂与硼酸的主要元素，玻璃与洗涤剂原料。" },
    { cat: "非金属", desc: "生命骨架元素，存在于一切有机物中。" },
    { cat: "非金属", desc: "占大气 78%，是蛋白质与氨基酸的组成元素。" },
    { cat: "非金属", desc: "生命必需元素，呼吸作用与燃烧都离不开它。" },
    { cat: "卤素", desc: "最活泼的非金属，牙膏中的氟化物可防龋齿。" },
    { cat: "稀有气体", desc: "通电发出橙红光，霓虹灯的经典发光气体。" },
    { cat: "碱金属", desc: "质地软如蜡，食盐（氯化钠）的主要成分。" },
    { cat: "碱土金属", desc: "轻质金属，燃烧发出耀眼白光，用于照明弹。" },
    { cat: "主族金属", desc: "轻而耐用，铝箔、易拉罐与航空航天材料。" },
    { cat: "类金属", desc: "芯片与光纤的核心材料，信息时代的基石。" },
    { cat: "非金属", desc: "磷肥与 DNA 的组成元素，白磷在空气中自燃。" },
    { cat: "非金属", desc: "橡胶硫化的关键元素，也是硫酸的原料。" },
    { cat: "卤素", desc: "黄绿色有毒气体，用于自来水消毒。" },
    { cat: "稀有气体", desc: "极不活泼，用于保护焊接与白炽灯填充。" },
    { cat: "碱金属", desc: "密度比水还小，燃烧发出紫色火焰。" },
    { cat: "碱土金属", desc: "骨骼与牙齿的主要成分，石灰石的主要元素。" },
    { cat: "过渡金属", desc: "轻质耐热金属，用于自行车架与人工关节。" },
    { cat: "过渡金属", desc: "强度高且耐腐蚀，钛合金广泛用于航空领域。" },
    { cat: "过渡金属", desc: "硬度极高，钒钢用于工具与弹簧制造。" },
    { cat: "过渡金属", desc: "不锈钢的必需成分，化合物呈现斑斓色彩。" },
    { cat: "过渡金属", desc: "地壳中丰度较高的过渡金属，高锰酸钾呈紫色。" },
    { cat: "过渡金属", desc: "地壳中最丰富的金属，血红蛋白的核心元素。" },
    { cat: "过渡金属", desc: "蓝色玻璃的呈色元素，维生素 B12 的核心金属。" },
    { cat: "过渡金属", desc: "耐腐蚀，古代中国的白铜即含镍。" },
    { cat: "过渡金属", desc: "优良导体，电线与电路的主要材料。" },
    { cat: "过渡金属", desc: "人体必需微量元素，镀锌钢板防锈的关键。" },
    { cat: "主族金属", desc: "熔点极低的软金属，砷化镓用于半导体。" },
    { cat: "类金属", desc: "与二氧化硅同源的元素，高纯锗用于红外光学。" },
    { cat: "类金属", desc: "有剧毒的类金属，古代砒霜的主要成分。" },
    { cat: "非金属", desc: "导电性随光照变化，硒鼓复印机的核心。" },
    { cat: "卤素", desc: "常温下唯一的液态非金属，用于阻燃剂。" },
    { cat: "稀有气体", desc: "通电发出明亮白光，曾用于高速摄影闪光灯。" },
    { cat: "碱金属", desc: "极活泼的碱金属，铷原子钟用于卫星导航。" },
    { cat: "碱土金属", desc: "燃烧发出鲜红色火焰，用于烟花与信号弹。" },
    { cat: "过渡金属", desc: "钇铝石榴石用于激光器，高温超导研究材料。" },
    { cat: "过渡金属", desc: "耐腐蚀的银白金属，锆合金用于核燃料包壳。" },
    { cat: "过渡金属", desc: "超导材料的著名成分，铌钛合金用于核磁共振。" },
    { cat: "过渡金属", desc: "熔点极高的金属，钼丝可用于高温电炉。" },
    { cat: "过渡金属", desc: "首个由人工合成的元素，用于医学示踪。" },
    { cat: "过渡金属", desc: "耐腐蚀的铂族金属，铱钌合金用于钢笔尖。" },
    { cat: "过渡金属", desc: "反射率极高的铂族金属，用于车灯镀层。" },
    { cat: "过渡金属", desc: "钯金可用于催化汽车尾气净化。" },
    { cat: "过渡金属", desc: "导电性最佳的金属，胶片感光材料的核心。" },
    { cat: "过渡金属", desc: "镉黄颜料与镍镉电池的成分，毒性较强。" },
    { cat: "主族金属", desc: "铟锡氧化物是触摸屏透明电极的材料。" },
    { cat: "主族金属", desc: "青铜的主要成分，锡焊料广泛用于电子工业。" },
    { cat: "类金属", desc: "锑化物用于阻燃剂，古代用作化妆品原料。" },
    { cat: "类金属", desc: "玻璃制造的关键添加剂，碲化镉用于太阳能电池。" },
    { cat: "卤素", desc: "紫黑色固体，升华成紫色蒸气，碘酒可消毒。" },
    { cat: "稀有气体", desc: "氙灯亮度极高，也用作麻醉剂。" },
    { cat: "碱金属", desc: "熔点仅 28 度，空气中自燃，最活泼的金属之一。" },
    { cat: "碱土金属", desc: "硫酸钡可用于胃肠 X 光造影。" },
    { cat: "镧系元素", desc: "镧系之首，混合镧系金属用于打火石。" },
    { cat: "镧系元素", desc: "打火石与特种玻璃的成分，氧化铈可抛光玻璃。" },
    { cat: "镧系元素", desc: "磁性与光学性能独特，用于特种有色玻璃。" },
    { cat: "镧系元素", desc: "钕铁硼是最强永磁体，广泛用于电机与硬盘。" },
    { cat: "镧系元素", desc: "放射性元素，用于核电池与示踪研究。" },
    { cat: "镧系元素", desc: "激光器的关键元素，钐钴磁体耐高温。" },
    { cat: "镧系元素", desc: "红色荧光粉与节能灯的成分。" },
    { cat: "镧系元素", desc: "磁制冷与核反应堆控制棒材料。" },
    { cat: "镧系元素", desc: "绿色荧光粉的激活剂，铽铁磁致伸缩材料。" },
    { cat: "镧系元素", desc: "镝灯亮度高，用于电影放映与舞台照明。" },
    { cat: "镧系元素", desc: "最强的磁性元素之一，用于磁光存储。" },
    { cat: "镧系元素", desc: "激光常用元素，铒光纤放大器支撑光纤通信。" },
    { cat: "镧系元素", desc: "镱原子钟是目前最精准的时钟之一。" },
    { cat: "镧系元素", desc: "激光常用元素，铥激光器用于微创手术。" },
    { cat: "镧系元素", desc: "激光与 X 光管材料，镱箔用于测厚仪。" },
    { cat: "镧系元素", desc: "镥 scandium 铝酸盐闪烁体用于医学成像。" },
    { cat: "过渡金属", desc: "熔点最高的金属之一，铪锆比用于核工业。" },
    { cat: "过渡金属", desc: "电容器的重要材料，碳化钽极硬且耐磨。" },
    { cat: "过渡金属", desc: "熔点最高的金属，白炽灯丝曾是它的天下。" },
    { cat: "过渡金属", desc: "铼是熔点第二高的金属，用于航空发动机叶片。" },
    { cat: "过渡金属", desc: "密度第二大的金属，锇铱合金用于笔尖。" },
    { cat: "过渡金属", desc: "耐腐蚀性极强，标准质量的原器由它制成。" },
    { cat: "过渡金属", desc: "化学性质稳定，首饰与催化工业的核心材料。" },
    { cat: "过渡金属", desc: "液态金属，温度计与荧光灯曾是它的应用。" },
    { cat: "主族金属", desc: "铊盐剧毒，曾用于灭鼠，现用于红外探测。" },
    { cat: "主族金属", desc: "铅酸电池的主要材料，密度大且柔软。" },
    { cat: "主族金属", desc: "铋晶体呈现彩虹色泽，用于胃药与低熔点合金。" },
    { cat: "主族金属", desc: "放射性金属，钋毒性强，曾引发历史悬案。" },
    { cat: "卤素", desc: "天然元素中最稀有的之一，至今无实用价值。" },
    { cat: "稀有气体", desc: "天然放射性稀有气体，地下室需防范氡气。" },
    { cat: "碱金属", desc: "半衰期极短，天然存在量几乎为零。" },
    { cat: "碱土金属", desc: "镭的放射性由居里夫妇发现，曾用于夜光涂料。" },
    { cat: "锕系元素", desc: "锕系之首，天然存在于铀矿中。" },
    { cat: "锕系元素", desc: "钍基核电研究的燃料，氧化钍曾用于汽灯纱罩。" },
    { cat: "锕系元素", desc: "首个锕系元素，镤的发现历经十余年。" },
    { cat: "锕系元素", desc: "核燃料与核武器的核心元素，铀浓缩备受关注。" },
    { cat: "锕系元素", desc: "首个完全人工合成的锕系元素。" },
    { cat: "锕系元素", desc: "核武器与核电池的常用材料。" },
    { cat: "锕系元素", desc: "烟雾探测器中的镅-241 电离室。" },
    { cat: "锕系元素", desc: "主要用于科学研究，人工合成产量极低。" },
    { cat: "锕系元素", desc: "以加州命名的元素，锎-252 是强中子源。" },
    { cat: "锕系元素", desc: "以爱因斯坦命名，产量以原子数计。" },
    { cat: "锕系元素", desc: "以费米命名，仅能在实验室微量合成。" },
    { cat: "锕系元素", desc: "以门捷列夫命名，人工合成元素之一。" },
    { cat: "锕系元素", desc: "以诺贝尔命名，半衰期较短。" },
    { cat: "锕系元素", desc: "以回旋加速器发明者劳伦斯命名。" },
    { cat: "锕系元素", desc: "锕系最后一位成员，化学性质研究极少。" },
    { cat: "过渡金属", desc: "以卢瑟福命名，首个超铀元素。" },
    { cat: "过渡金属", desc: "以杜布纳联合核子研究所命名。" },
    { cat: "过渡金属", desc: "以西博格命名，这是首个以在世人物命名的元素。" },
    { cat: "过渡金属", desc: "以玻尔命名，半衰期极短。" },
    { cat: "过渡金属", desc: "以黑森州命名，人工合成量以原子数计。" },
    { cat: "过渡金属", desc: "以迈特纳命名，与 LISA 探测器研究相关。" },
    { cat: "过渡金属", desc: "以达姆施塔特命名，半衰期仅数秒。" },
    { cat: "过渡金属", desc: "以伦琴命名，X 射线发现者的荣誉。" },
    { cat: "过渡金属", desc: "以哥白尼命名，性质与汞相似。" },
    { cat: "主族金属", desc: "以日本理化学研究所命名，首个亚洲命名的元素。" },
    { cat: "主族金属", desc: "以俄罗斯杜布纳附近的莫斯科州命名。" },
    { cat: "主族金属", desc: "以弗廖罗夫命名，可能是一种类金属。" },
    { cat: "主族金属", desc: "以劳伦斯利弗莫尔实验室命名。" },
    { cat: "主族金属", desc: "以田纳西州命名，卤素家族最重的成员。" },
    { cat: "稀有气体", desc: "第 118 号元素，以奥加尼扬命名，仅合成数个原子。" },
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
      element.title = el.zh + " · " + el.name + "（双击查看详情）"; // 悬停提示中英文名 + 操作引导

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

    setupDetailPanel();

    transform(targets.table, 5000); // 初始动画：聚拢为表格
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
      var extra = ELEMENT_EXTRAS[index];
      if (!el || !extra) return;

      panel.querySelector(".d-symbol").textContent = el.sym;
      panel.querySelector(".d-zh").textContent = el.zh;
      panel.querySelector(".d-name").textContent = el.name;
      panel.querySelector(".v-number").textContent = index + 1;
      panel.querySelector(".v-mass").textContent = el.mass;
      panel.querySelector(".v-group").textContent = el.group;
      panel.querySelector(".v-period").textContent = el.period;
      panel.querySelector(".v-cat").textContent = extra.cat;
      panel.querySelector(".v-block").textContent = blockOf(index + 1, el);
      panel.querySelector(".d-desc").textContent = extra.desc;

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
