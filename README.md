# demoProject

一个纯前端趣味 demo 合集，全部为**零依赖静态页面**（仅本地资源，无需构建、无需后端），克隆后可直接在浏览器打开，或部署到任意静态托管（GitHub Pages 等）。

| Demo | 说明 | 在线预览 |
| --- | --- | --- |
| confession | 爱心树表白 · 程序员的浪漫（Canvas 动画 + 打字机情书） | [立即打开](https://SanshuiBot.github.io/project-demo/confession/index.html) |
| minions | 纯 CSS3 小黄人 · 动画雕塑 | [立即打开](https://SanshuiBot.github.io/project-demo/minions/minions_animation.html) |
| 3DPeriodicTable | 3D 元素周期表 · three.js CSS3D | [立即打开](https://SanshuiBot.github.io/project-demo/3DPeriodicTable/index.html) |

---

## 一、confession —— 爱心树表白

> 一颗承载着心意的爱心从枝头落下，化作参天大树，开出满树繁花；
> 打字机逐字敲出写给 TA 的情话，倒计时默默记录“在一起”的每一天。

**交互流程（四幕动画）**：点击心形种子 → 心形坠落入土 → 树苗生长成枝 → 满树花开并聚拢 → 浮现情书文字与相恋计时，随后花瓣在树下持续飘落。

### 主要特性
- 🌳 **Canvas 动画**：贝塞尔曲线树枝生长、700 个花瓣缓放与飘落，全部由 `love.js` 绘制引擎完成；
- ⌨️ **打字机情书**：逐字打印表白文案（自动跳过 HTML 标签，光标闪烁）；
- ⏱️ **相恋计时器**：实时刷新“第 N 天 N 小时 N 分 N 秒”；
- 🎵 **背景音乐**：右下角悬浮按钮可播放/暂停（`renxi.mp3`，受浏览器自动播放策略限制，首次点击页面后自动开播）；
- 📱 **响应式缩放**：以 1100px 设计稿为准，窄屏自动等比缩放居中；
- ♿ **兼容检测**：不支持 Canvas 时优雅提示更换现代浏览器。

### 如何改成你自己的告白
1. **文字**：打开 `index.html`，把 `<span class="say">` 里的 `×××` 替换成 TA 与你的名字；
2. **时间**：打开 `renxi/main.js` 顶部的 `TOGETHER` 配置项，填上你们在一起的年月日时分秒；
3. **音乐**：替换 `renxi.mp3` 即可（推荐 44.1kHz、MP3 格式）。

### 技术栈与结构
原生 JavaScript（ES2017 `async/await` 编排动画时序）+ Canvas 2D，无任何第三方 JS 库 / 无 CDN / 无任何外网请求。

```
confession/
├── index.html            # 页面骨架 + 表白文案
├── renxi.mp3             # 背景音乐
└── renxi/
    ├── default.css       # 页面与舞台样式（含响应式）
    ├── functions.js      # 打字机 / 计时器 / 舞台缩放等通用函数
    ├── love.js           # Canvas 绘制引擎（心形种子、树枝、花瓣）
    └── main.js           # 动画编排与交互主控（async/await 时序，文案/时间配置在此）
```

---

## 二、minions —— 纯 CSS3 小黄人

> 不借助任何图片与脚本，仅用 DIV + CSS3 绘制出会眨眼、嘴巴张合的小黄人军团。

四个小黄人排成一排（整体横向可排布至约 1400px+ 宽），每个都有独立的循环动画：**眼球左右张望、嘴巴上下开合**。

### 四个变体
| 类名 | 体型 | 眼睛 |
| --- | --- | --- |
| `.minion-1` | 标准 | 双眼 |
| `.minion-2` | 瘦高（0.88 × 1.1） | 单眼（右侧镜片隐藏） |
| `.minion-3` | 矮胖（1.15 × 1.02） | 单眼 |
| `.minion-4` | 高个（1.0 × 1.1） | 双眼 |

> 页面 HTML 中的 `<!-- 注释 -->` 说明了各变体差异；单/双眼与体型均由 LESS 混入 `Minion(@width; @height; @eye)` 参数化控制。

### 技术要点
- **CSS3 造型**：圆角、边框、`z-index` 分层堆叠出头发、护目镜、嘴巴、背带裤、口袋等全部细节；
- **关键帧动画**：`eye`（眼球横移）与 `up-down`（嘴巴张合）两个无限循环动画；
- **LESS 混入**：`main.less` 中用一份 `Minion()` 混入生成四种体型，改参数即可出新变体；
- **可访问性**：系统开启“减弱动态效果”（`prefers-reduced-motion`）时自动停掉循环动画；
- **窄屏适配**：舞台（`.stage`）支持横向滚动浏览，手机也能看完整支队伍。

### 修改与重新编译样式
样式源文件为 `minions/main.less`（页面实际加载的是编译产物 `main.css`）。调整混入参数或颜色后，使用任意 LESS 编译器（如 `lessc main.less main.css`）重新生成即可；直接手改 `main.css` 同样有效。

```
minions/
├── minions_animation.html   # 页面（四个小黄人的 DOM 结构）
├── main.css                 # 编译产物（页面实际加载）
└── main.less                # 样式源文件（推荐在此修改）
```

---

## 三、3DPeriodicTable —— 3D 元素周期表（three.js CSS3D）

> 118 个化学元素以 3D 卡片呈现，四种布局任意切换，拖拽旋转、滚轮缩放，身临其境“玩”周期表。

### 玩法
- **拖拽** 旋转视角，**滚轮** 缩放距离；
- 底部按钮切换布局：`TABLE` 标准周期表 / `SPHERE` 球面 / `HELIX` 双螺旋 / `GRID` 网格；
- 鼠标悬停卡片查看元素名称与相对原子质量。

### 技术要点
- **CSS3D 渲染**：每个元素是一张可变换的 DOM 卡片（`CSS3DRenderer`），无 WebGL 门槛；
- **布局算法**：表格按族/周期排布；球面采用斐波那契螺旋均匀采样；螺旋与网格为经典参数方程；
- **补间动画**：基于 tween 的指数缓动（`Exponential.InOut`），切换布局时随机错峰、平滑归位；
- **性能细节**：页面切到后台自动暂停渲染循环（`visibilitychange`），释放 CPU；
- 数据含全部 118 个元素（符号 / 英文名 / 相对原子质量 / 族 / 周期），修正了英文名笔误（Einstenium → Einsteinium）与残缺质量值。

### 结构说明
```
3DPeriodicTable/
├── index.html        # 页面 + 样式 + 布局菜单
└── js/
    ├── main.js              # 主控逻辑与元素数据（新增，原内联于 HTML）
    ├── three.min.js         # three.js（本地依赖）
    ├── tween.min.js         # tween 补间库（本地依赖）
    ├── TrackballControls.js # 轨道控制（拖拽/缩放，本地依赖）
    └── CSS3DRenderer.js     # CSS3D 渲染器（本地依赖）
```

---

## 本地运行

三个项目均为纯静态页面，任选其一：

```bash
# 方式一：直接双击项目目录下的 index.html / minions_animation.html
# 方式二：本地起一个静态服务（推荐，可完整体验音频等资源加载）
cd project-demo
python -m http.server 8080
# 浏览器访问 http://localhost:8080/confession/ 等
```

## 目录一览

```
project-demo/
├── README.md
├── confession/           # 爱心树表白（Canvas + async/await，无第三方库）
├── minions/              # 纯 CSS3 小黄人（LESS + CSS3 动画）
└── 3DPeriodicTable/      # 3D 元素周期表（three.js CSS3D）
```
