# demoProject —— 前端趣味实验室

一个纯前端趣味 demo 合集：**爱心树表白 / 纯 CSS3 小黄人 / 3D 元素周期表**。

仓库根目录自带一个**玻璃拟态导航首页**（`index.html`），卡片式入口直达三个作品。
整个仓库刻意保持**零依赖纯静态**——无 npm、无构建步骤、无后端、无 CDN，克隆后双击即可打开，部署到 GitHub Pages 等任意静态托管即开即用。

## 作品一览

| 入口 | Demo | 说明 | 在线预览 |
| --- | --- | --- | --- |
| 首页 | 导航首页 | 深色玻璃拟态卡片，汇总跳转三个 demo | [立即打开](https://SanshuiBot.github.io/project-demo/) |
| confession | 爱心树表白 | Canvas 爱心成长动画 + 打字机情书 + 相恋倒计时 | [立即打开](https://SanshuiBot.github.io/project-demo/confession/index.html) |
| minions | 纯 CSS3 小黄人 | 不依赖任何图片/脚本的 CSS3 动画雕塑军团 | [立即打开](https://SanshuiBot.github.io/project-demo/minions/minions_animation.html) |
| 3DPeriodicTable | 3D 元素周期表 | three.js CSS3D，118 元素 × 4 种 3D 布局 | [立即打开](https://SanshuiBot.github.io/project-demo/3DPeriodicTable/index.html) |

## 项目特性

- 🧱 **零依赖纯静态**：全部为本地资源，无任何外网请求；克隆后直接双击 `index.html` 即可运行；
- 🏠 **自带导航首页**：根目录 `index.html` 汇总三件作品，深色玻璃拟态 + 主题配色，移动端自适应；
- 🎨 **主题丰富**：Canvas 动画、纯 CSS3 造型、three.js CSS3D 各占一席，风格互不重复；
- ♿ **细节考究**：`prefers-reduced-motion` 减弱动态效果支持、窄屏适配、性能优化（后台自动暂停渲染等）。

## 快速开始

三个 demo 与首页均为纯静态页面，任选其一：

```bash
# 方式一：直接双击仓库根目录的 index.html（会打开导航首页，可点进各 demo）
# 方式二：本地起一个静态服务（推荐，可完整体验音频等资源加载）
cd project-demo
python -m http.server 8080
# 浏览器访问 http://localhost:8080/            → 导航首页
#                 http://localhost:8080/confession/ 等 → 各 demo
```

> 提示：`minions` 的入口文件名为 `minions_animation.html`，其余两个 demo 均为 `index.html`；
> 首页里的跳转全部使用相对路径，无论双击打开还是部署到子路径（如 `/project-demo/`）都能正确工作。

## 部署到 GitHub Pages

本仓库**没有构建步骤**，源码即产物，因此最简单可靠的方式是**从分支部署**（Deploy from a branch），无需任何 CI 配置。

### 方式 A：分支部署（推荐）

1. 推送代码到 GitHub 仓库（如 `SanshuiBot/project-demo`）；
2. 打开仓库 **Settings → Pages**；
3. 在 **Build and deployment** 区域，把 **Source** 选为 **"Deploy from a branch"**；
4. **Branch** 选择 `main`，目录选 **`/`（root）**，点击 **Save**；
5. 等待约 1 分钟（Actions 会自动跑一次），即可访问：
   `https://SanshuiBot.github.io/project-demo/`

访问路径与仓库名一致，均为相对路径友好设计：

| 页面 | 地址 |
| --- | --- |
| 导航首页 | `https://<user>.github.io/project-demo/` |
| 爱心树表白 | `https://<user>.github.io/project-demo/confession/` |
| 小黄人 | `https://<user>.github.io/project-demo/minions/minions_animation.html` |
| 3D 周期表 | `https://<user>.github.io/project-demo/3DPeriodicTable/` |

> 如果仓库是私有的，请先在 **Settings → Pages** 开启 Pages 服务（免费版需公开仓库）；
> 之后每次 push 到 `main`，GitHub 都会自动重新部署，无需手动操作。

### 方式 B：GitHub Actions 部署（可选）

若将来引入需要构建的框架（Vite 等），再把 Pages 的 Source 切到 **"GitHub Actions"**，
并在仓库新增 `.github/workflows/deploy.yml` 即可——构建全部在云端完成，本地依然只需 push：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deploy
        uses: actions/deploy-pages@v4
```

两种方式的对比：

| 维度 | 分支部署 | GitHub Actions |
| --- | --- | --- |
| 适用场景 | 纯静态、无构建 | 需要构建步骤 / 自定义流程 |
| 配置成本 | Settings 里点两下 | 需写 workflow 文件 |
| 部署历史 | 覆盖式 | 每次部署留痕、可回滚 |

**当前建议**：项目是纯静态零依赖，直接用**方式 A** 即可；哪天引入打包构建再切方式 B，并把 `path: .` 改成 `dist` 等构建产物目录。

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

> 说明：`3DPeriodicTable/js/` 下的 `three.min.js` 等为**本地第三方库文件**，随仓库分发而非 CDN 引用，
> 因此部署后依然没有任何外网请求，属于仓库内唯一的“依赖”，请勿删除。

---

## 开发与维护约定

- **保持零依赖**：仓库刻意不引入 npm / 构建工具 / 工具链。曾引入的 ESLint + Prettier 已移除——
  对纯静态页面价值有限，反而增加 `node_modules` 体积与克隆负担。改动代码后无需 `npm install` / `lint`，刷新浏览器即可验证；
- **代码风格**：沿用各文件现有缩进（2 空格）与注释密度；新代码保持无外部请求、可离线运行；
- **LESS**：仅 `minions/main.less` 涉及编译，改完用 `lessc` 重新生成 `main.css`（详见小黄人章节）；
- **提交信息**：遵循 Conventional Commits（如 `feat:` / `fix:` / `chore:`）。

## 近期更新

- 🏠 新增根目录导航首页 `index.html`（玻璃拟态卡片 + 主题配色 + 移动端适配），README 同步补充部署说明；
- 🧹 移除 ESLint / Prettier / `package.json` 等 npm 工具链，回归纯静态零依赖。

## 目录一览

```
project-demo/
├── README.md             # 项目文档（即本文件）
├── index.html            # 导航首页（深色玻璃拟态卡片，链接到下方三个 demo）
├── confession/           # 爱心树表白（Canvas + async/await，无第三方库）
├── minions/              # 纯 CSS3 小黄人（LESS + CSS3 动画）
└── 3DPeriodicTable/      # 3D 元素周期表（three.js CSS3D，本地库文件）
```
