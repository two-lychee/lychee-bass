# Lychee Bass - 贝斯自学工具网站

## 项目概述

Lychee Bass 是一个面向贝斯自学者的在线学习平台，提供交互式指板、音名训练、音阶探索等学习工具。

**技术栈：** Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tone.js

## 项目结构

```
src/
├── components/
│   ├── bass-simiulator/          # 贝斯学习核心组件
│   │   ├── BassFretboard.vue     # 可复用指板组件（支持高亮、静音、事件）
│   │   ├── NoteQuiz.vue          # 音名识别训练
│   │   ├── ScaleExplorer.vue     # 音阶高亮探索
│   │   └── music-theory.ts       # 音乐理论工具（音名计算、音阶生成、角色判断）
│   └── layout/                   # 布局组件
│       └── AppLayout.vue         # 全局布局（导航+主内容）
├── views/
│   └── bass-simulator/
│       └── bass-simulator.vue    # 主页面：tab 切换三个学习模块
├── router/
│   └── index.ts                  # 路由配置
├── stores/
│   └── counter.ts                # Pinia store（暂未使用）
└── App.vue                       # 根组件
```

## 核心组件说明

### BassFretboard.vue
可复用的贝斯指板组件，支持：
- **Props:**
  - `tuning`: 调弦（默认 E1/A1/D2/G2）
  - `fretCount`: 品数（默认 12）
  - `highlights`: 高亮标记数组（用于学习模块）
  - `muted`: 静音模式（用于音名训练）
  - `showToggle`: 是否显示"显示/隐藏音名"按钮
- **Emits:**
  - `note-played`: 点击/拖动时触发，payload 包含 `{ stringIndex, fret, note }`
- **坐标约定:** fret = 0 表示空弦，1-12 表示对应品位

### music-theory.ts
音乐理论工具函数库：
- `STANDARD_TUNING`: 标准四弦贝斯调弦常量
- `NOTE_NAMES`: 12 个半音名称（升号体系）
- `SCALE_INTERVALS`: 常见调式的音程定义（大调、小调、五声、布鹊斯）
- `calcNote(openNote, fret)`: 计算指定弦品位的音（含八度）
- `stripOctave(note)`: 去除八度信息，返回纯音名
- `buildScale(root, scaleKey)`: 生成指定根音和调式的音阶
- `noteRole(note, root, scaleKey)`: 判断音在音阶中的角色（根音/三度/五度/其它）

### NoteQuiz.vue
音名识别训练游戏：
- 随机高亮指板上一个位置，提供 4 个选项（1 正确 + 3 干扰）
- 实时统计得分、正确率、连击、最高连击
- 答题后颜色反馈（绿色正确 / 红色错误）

### ScaleExplorer.vue
音阶可视化工具：
- 选择根音（12 个半音）+ 调式（大调/小调/五声/布鲁斯）
- 自动在指板上高亮音阶内的所有音
- 用不同颜色区分角色：根音（红）、三度（蓝）、五度（紫）、其它（橙）
- 显示音阶包含的音名列表

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm type-check   # TypeScript 类型检查
pnpm lint         # ESLint 检查并自动修复
pnpm format       # Prettier 格式化
pnpm test:unit    # 运行单元测试
```

## 设计约定

### 音高与调弦
- 标准四弦贝斯：**E1 - A1 - D2 - G2**（从粗弦到细弦，从左到右）
- 比吉他低一个八度
- fret = 0 表示空弦音，fret = 1-12 表示对应品位

### 颜色规范
- 背景主色：`#3b2f2f`（深棕）
- 高亮主色：`#ff8a65`（橙红）
- 音名显示：`#ffecb3`（浅黄）
- 反馈色：
  - 正确：`#81c784`（绿）
  - 错误：`#e57373`（红）
  - 根音：`#ef5350`
  - 三度：`#42a5f5`
  - 五度：`#ab47bc`
  - 其它音：`#ffb74d`

### 组件复用原则
- `BassFretboard` 是"受控组件"：不持有学习状态，通过 props 接收高亮、通过 emit 上报交互
- 学习模块（NoteQuiz / ScaleExplorer）持有状态，控制指板的显示和行为
- 音乐理论计算统一由 `music-theory.ts` 提供，避免重复实现

## 待扩展功能

### 短期可实现
- [ ] 节拍器 + BPM 调节
- [ ] 音阶练习器（自动播放音阶，用户跟弹）
- [ ] 录音功能（MediaRecorder API）
- [ ] 学习记录（LocalStorage 或 IndexedDB）
- [ ] 五弦贝斯支持（B-E-A-D-G）
- [ ] 横向指板视图（更接近演奏视角）
- [ ] 真实采样音色（Tone.Sampler）

### 中期可扩展
- [ ] 曲目库（用户想学的歌曲清单）
- [ ] 和弦识别工具
- [ ] 音程听力训练
- [ ] Bass line 谱面播放器（滚动谱表 + 指板同步）
- [ ] Drum loop 伴奏轨
- [ ] 用户笔记系统（指板截图 + 文字注释）

### 长期愿景
- [ ] 社区功能（分享练习记录、bass line）
- [ ] 在线协作练习房（WebRTC）
- [ ] 教程文章系统
- [ ] 视频教程嵌入与时间戳跳转

## 常见问题

**Q: 为什么音高听起来不对？**
A: 确保 `STANDARD_TUNING` 是 `['E1', 'A1', 'D2', 'G2']`，不是 `E4/A4/D4/G4`。

**Q: 为什么拖动时触发不了空弦？**
A: 确保点击区的循环是 `v-for="fret in fretCount + 1"`，且 `playNote(stringIndex, fret - 1)` 让 fret 从 0 开始。

**Q: 如何添加新的音阶？**
A: 在 `music-theory.ts` 的 `SCALE_INTERVALS` 和 `SCALE_LABELS` 中添加新条目，`ScaleExplorer` 会自动显示。

**Q: 如何替换音色？**
A: 将 `BassFretboard.vue` 中的 `Tone.MonoSynth` 替换为 `Tone.Sampler`，加载真实采样文件。

## 已知问题

- 移动端拖动体验待优化（防止触发浏览器滚动）
- 音色较简陋，建议后续替换为真实采样
- 暂无学习进度持久化

## 贡献指南

添加新学习模块时：
1. 在 `src/components/bass-simiulator/` 创建新组件
2. 使用 `BassFretboard` 作为子组件，通过 `highlights` prop 控制高亮
3. 在 `bass-simulator.vue` 的 `tabs` 中添加新 tab
4. 需要的音乐理论工具统一放在 `music-theory.ts`
