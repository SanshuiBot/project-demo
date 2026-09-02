// ESLint 10 flat config
// 检查范围：各 demo 的自有 JS（script 脚本）；第三方/压缩/编译产物一律忽略
import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "**/*.min.js", // 压缩产物（three.min.js / tween.min.js 等）
      // 第三方附属：three.js 示例时代的旧版控件与渲染器（非本项目代码）
      "3DPeriodicTable/js/TrackballControls.js",
      "3DPeriodicTable/js/CSS3DRenderer.js",
      "minions/main.css", // LESS 编译产物（源文件 main.less 为准）
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // 均为传统 IIFE 脚本，非 ES 模块
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // 花瓣飘落 / 计时刷新等动画演示中的无限循环为有意为之
      "no-constant-condition": ["error", { checkLoops: false }],
    },
  },
  eslintConfigPrettier, // 关闭与 Prettier 冲突的格式类规则
];
