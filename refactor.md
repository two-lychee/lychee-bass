# Lychee Bass — Nuxt UI 改造计划

## Context（背景）

Lychee Bass 目前是 Vue 3 + Vite + 手写 CSS 的小工具站，UI 全部由各组件内的 `<style scoped>` 手写（卡片、按钮、弹窗、表格、滑块都是各写各的）。`@nuxt/ui@4.11.1` 和 `tailwindcss@4.3.3` 已装入 `package.json`，但**项目完全没有接入**（vite 插件没注册、CSS 没 import、`UApp` 没包）。

本次改造目标：**功能全部不变**，把 UI 层迁移到 Nuxt UI 组件库，并按已确认的四项决策执行——顶部导航、Lucide 图标、自定义荔枝橙品牌色、暗色模式切换。视觉上贴合网页端使用习惯，消除重复手写样式。

**不动的部分**：`server/`（Fastify 曲谱服务）、`src/music/`、`music-theory.ts`、`useMetronome.ts`、Tone.js 音频逻辑、alphatab 谱面渲染逻辑、路由结构（`router/index.ts` 路由表保持不变）。

## 已确认的决策

| 决策项 | 选择 |
|---|---|
| 导航形态 | 顶部导航栏（`UHeader` + `UHorizontalNavigation`） |
| 图标 | 引入 `@iconify-json/lucide` 矢量图标，替换全部 Emoji |
| 品牌色 | 自定义精确荔枝橙色阶（`#ff8a65` 系），注册为 `primary` |
| 暗色模式 | 启用，`UColorModeButton` 一键切换 |

---

## 阶段 1：基础设施接入（Nuxt UI + Tailwind）

先让 Nuxt UI 跑起来，这是所有后续工作的前提。

**`vite.config.ts`** — 注册插件并配置品牌色：
```ts
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [
    vue(), vueJsx(), vueDevTools(),
    ui({
      ui: { colors: { primary: 'lychee', neutral: 'stone' } },
    }),
  ],
  // 保留现有 server.proxy / resolve.alias
})
```

**`src/assets/main.css`** — 替换为 Tailwind + Nuxt UI 入口，并注册荔枝橙色阶（全部 50–950 档）：
```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --color-lychee-50:  #fff3ee;
  --color-lychee-100: #ffe3d8;
  /* ... 中间档位以 #ff8a65 为 400 锚点生成 ... */
  --color-lychee-400: #ff8a65;
  --color-lychee-500: #ff7043;
  --color-lychee-600: #e56f4d;   /* 练习页已有用色，对齐 */
  --color-lychee-950: #4a1d10;
}
```
> 荔枝橙色阶以现有代码里出现过的 `#ff8a65`（主色）、`#ff7043`（hover）、`#e56f4d`（练习模块 eyebrow 色）为锚点推导，保证迁移后视觉延续。

**`src/main.ts`** — 注册 Vue 插件：
```ts
import ui from '@nuxt/ui/vue-plugin'
app.use(ui)
```

**`src/App.vue`** — 包 `UApp`（Toast / Tooltip / 编程式浮层必需）：
```vue
<UApp>
  <NuxtLayout>...</NuxtLayout>  ← 非 Nuxt 项目不用这个
</UApp>
```
实际是 `<UApp><AppLayout><RouterView /></AppLayout></UApp>`。

**`index.html`** — `<div id="app" class="isolate">`，标题改为 "Lychee Bass"。

**类型 & 构建**：
- `.gitignore` 加 `auto-imports.d.ts`、`components.d.ts`
- `tsconfig.app.json` 的 `include` 加上这两个声明文件 + `#build/ui` 路径别名（主题类型提示）
- `package.json` 的 `build` 脚本由并行改串行：`run-s build-only type-check`（声明文件先生成再类型检查）

**清理**：`src/assets/base.css`（Vue 脚手架主题变量）和 `main.css` 里手写的 `a`/`.green` 规则可删除，由 Tailwind preflight + Nuxt UI 接管。`src/components/icons/` 下 5 个脚手架图标组件若无人引用则删除。

**验证点**：`pnpm dev` 起得来，页面能渲染（此时页面还是旧的，但 Tailwind 已生效），随便找个地方写 `<UButton>` 能正常渲染且是荔枝橙色。

---

## 阶段 2：顶部导航 + 布局骨架

**`src/components/layout/AppLayout.vue`** — 重写，删除全部 `<style scoped>`：

- 顶部 `UHeader`（sticky），左侧 Logo（`router-link` + Lucide 图标），中间 `UHorizontalNavigation`（学习 / 练习 / 乐理 / 进度 / 关于），右侧 `UColorModeButton` + 移动端 `UHeader` 自带的汉堡菜单
- 导航项从现有路由表映射，`to` + Lucide icon（`music`/`presentation`/`book-open`/`chart-no-axes-column`/`info`）
- 主内容区改为 `UContainer`，`wide-main`（练习页宽屏）通过 `:ui` 或容器 class 控制 max-width
- **删除底部导航**及其全部样式；`padding-bottom: 64px` 一并移除

**暗色模式**：Nuxt UI 默认跟随系统，`UColorModeButton` 提供切换。需检查各页面在暗色下的可读性（阶段 4 处理具体页面）。

**验证点**：五个一级路由切换正常，激活态高亮正确，暗色切换整体无白底/黑字问题。

---

## 阶段 3：通用组件替换（先删后立）

三个自造通用组件全部**删除**，改为直接使用 Nuxt UI：

| 旧组件 | 替代 | 参数映射 |
|---|---|---|
| `AppButton` | `UButton` | variant: primary→`solid`、secondary→`outline`、ghost→`ghost`；size: small→`sm`、medium→`md`、large→`lg` |
| `AppCard` | `UCard` | 直接包内容 |
| `AppModal` | `UModal` | `v-model:open` 替代 `show` prop + `close` emit；`#header`/`#body` 插槽 |

引用处仅 `bass-simulator.vue`（`AppModal`），其余两个组件当前无引用（可直接删）。删完后 `src/components/common/` 目录清空移除。

---

## 阶段 4：逐视图迁移（功能不变，换皮）

迁移顺序按依赖关系：内容页 → 交互页 → 复杂页。

### 4.1 内容展示页（最简单，先做）

**`TheoryView.vue`**（324 行，纯展示）
- 各 `.section` → `UPageSection`（或 `UContainer` + 标题）
- `.interval-table` → `UTable`（数据抽到 script 的数组里，列定义 `columns`）
- `.note-chip` → `UBadge` 网格
- `.tuning-box` 四根弦 → `UPageGrid` + `UCard`
- `.example` 代码块 → `UCard` 或 `UKbd`/`code` 样式
- `.tip` 学习建议 → `UAlert`（`icon="lightbulb"`）

**`AboutView.vue`**（125 行，纯展示）
- `.tag` 技术栈 → `UBadge`
- 各 section → `UPageSection`；`UPageHeader` 做标题区

**`ProgressView.vue`**（172 行，模拟数据）
- `.stat-card` 三个统计卡 → `UPageGrid` + `UPageCard`（大数字 + 标签）
- `.records-list` → `UTable`（列：日期 / 活动 / 时长）
- `.empty` 空态 → `UEmpty`（`icon="music"`）
- `.tip` → `UAlert`

### 4.2 交互工具页

**`Metronome.vue`**（344 行，练习模块核心）
- `type="range"` 滑块 → `USlider`（BPM 40–240、音量 -30~0）
- 拍号 / 节奏型 / 重音 / 细分的 `.btn-group` → `UButton` 组或 `URadioGroup`
- 预设速度按钮 → 一排 `UButton size="xs" variant="soft"`
- **保留**：BPM 大数字显示、拍点灯（`.beat` 圆点动画）、圆形播放按钮——这些是定制视觉，用 Tailwind class 重写而非套组件
- BPM 输入可考虑 `UInputNumber`

**`bass-simulator.vue`**（首页，261 行）
- `.tool-nav` 三模式切换 → `UTabs`（`items` 带图标）或 `UButton` 组；`UTabs` 更贴合"网页 Tabs"习惯
- 配置弹窗：`AppModal` → `UModal`，`<select>` → `USelect`（`items` 绑定 `TUNINGS`），复选框 → `UCheckbox`
- `.note-badge` 调弦音名 → `UBadge`
- `BassFretboard` 调用方式**完全不动**（受控组件，props/emits 保持）

**`NoteQuiz.vue``ScaleExplorer.vue`**（各 200+ 行）
- 选项按钮 → `UButton`；得分统计 → `UBadge` / `UPageCard`
- `ScaleExplorer` 的调式选择 `<select>` → `USelect`，根音 12 个半音 → `USelect` 或 `UButton` 网格
- 指板高亮逻辑、`music-theory.ts` 调用**全部不动**

**`PracticeView.vue`**（练习空间外壳，86 行）
- `.module-nav` 卡片网格 → `UPageGrid` + `UPageCard`（可点击导航，保留 icon + 标题 + 描述结构）
- `.practice-topbar` → `UPageHeader`

**`PracticeLibraryView.vue`**（291 行，含网络请求）
- 导入面板 → `UCard` + `UButton`（文件选择保持隐藏 `<input>` + `@click`，或用 `UButton` 包裹）
- `.import-message` / `.library-message` → `UAlert`（成功/警告/错误三态映射 `color`）
- `.stored-score` → `UCard`；轨道 `<select>` → `USelect`
- `.exercise-card` → `UPageCard`，"开始练习" → `UButton`（`to` 路由跳转，`trailing-icon`）
- 加载态 `isLoadingScores` → `USkeleton` 或按钮 `loading`
- **`fetch('/api/scores')` 全部逻辑不动**

**`ScorePractice.vue`**（811 行，最复杂）
- 表单控件（5 个 select/input/button）→ `USelect` / `UInput` / `UButton`
- 播放控制按钮组 → `UButton` + 图标（`play`/`pause`/`skip-forward`）
- alphatab 渲染容器、节拍同步逻辑、Tone.js 播放**全部不动**，只换外围控件样式

### 4.3 不动的组件（确认无需迁移）

- `BassFretboard.vue`（346 行）：指板是核心定制可视化，其高亮/静音/拖动逻辑保持原样。仅需把内联色值（`#ff8a65` 等）改为引用 Tailwind 主题变量，让暗色模式可用——**若改动风险大则保持原样**，指板本身是深色木纹背景，暗色下也可读。
- `AlphaTabScoreView.vue`：alphatab 容器，保持。
- `ExerciseSettings.vue` / `FingerExercise.vue`：内部控件按 4.2 规律替换（select→USelect 等）。

---

## 阶段 5：收尾

- 全局搜索残留的 `<style scoped>` 手写卡片/按钮样式，确认已被组件替代的都删除
- 检查暗色模式：逐页过一遍，修复硬编码的 `#333`/`#fff`/`#f5f5f5`（改为 `text-default`/`bg-default` 等语义色或保留为定制）
- `pnpm type-check` 通过（含 `#build/ui` 类型）
- `pnpm lint` / `pnpm format`
- `pnpm build` 生产构建成功
- **更新 `CLAUDE.md`**：设计约定章节补充 Nuxt UI 组件优先原则、品牌色定义位置、暗色模式说明
- 删除无引用的脚手架文件（`stores/counter.ts` 若仍没用、`components/icons/*`）

---

## 关键文件清单

| 文件 | 改动 |
|---|---|
| `vite.config.ts` | 注册 `@nuxt/ui/vite` + 品牌色 |
| `src/main.ts` | 注册 `@nuxt/ui/vue-plugin` |
| `src/assets/main.css` | Tailwind + Nuxt UI import + 荔枝橙 `@theme` |
| `src/assets/base.css` | 删除 |
| `src/App.vue` | 包 `UApp` |
| `index.html` | `isolate` class + 标题 |
| `tsconfig.app.json` / `.gitignore` / `package.json` | 声明文件、构建脚本串行化 |
| `src/components/layout/AppLayout.vue` | 重写为 `UHeader` 顶部导航 |
| `src/components/common/{AppButton,AppCard,AppModal}.vue` | **删除** |
| `src/views/*.vue`（7 个）+ `src/views/practice/*.vue`（4 个） | 逐个迁移组件 |
| `src/components/bass-simiulator/*.vue`（8 个） | 外围控件迁移，核心逻辑不动 |
| `CLAUDE.md` | 更新设计约定 |

新增依赖：`@iconify-json/lucide`（devDependency）

---

## 验证方式

1. `pnpm dev` → 逐页点击五个一级路由，确认功能正常：
   - 首页：三模式切换、配置弹窗、指板点击/拖动发声
   - 练习库：GP 文件上传、轨道切换、跳转练习
   - 谱子练习：播放/暂停、节拍同步、指板联动
   - 节拍器：BPM 调节、拍点显示、拍号切换
   - 音名训练：答题反馈、计分
   - 音阶探索：根音/调式切换、指板高亮
2. 暗色模式切换 → 各页面无不可读区域
3. 移动端（Chrome DevTools 375px）→ 顶部导航收起为汉堡菜单，布局不溢出
4. `pnpm type-check && pnpm build` 通过

---

## 风险与取舍

- **`build` 脚本并行→串行**会让构建略慢，但类型检查需要先生成 `components.d.ts`，这是 Nuxt UI 官方明确要求的
- **BassFretboard 暗色适配**可能需要它内部加色值切换逻辑；若工作量超预期，先保持指板原样（木纹背景在暗色下本身可读），打 TODO
- **alphatab 与 Tailwind 样式冲突**：alphatab 渲染的是自己管线的 SVG/CSS，需验证 `@import "tailwindcss"` 的 preflight 不破坏谱面渲染（阶段 1 接入后立即验证一次，不要等到最后）
- Emoji 图标全部替换为 Lucide 后，`BassFretboard` 内部若有 Emoji 装饰需一并处理
