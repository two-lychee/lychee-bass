# lychee-bass

贝斯实琴跟练工具，使用 Vue 3、TypeScript 和 Tone.js。

## 基础训练

首页提供右手节奏、左手指法、双手结合三个方向，共 9 项练习，无需曲谱服务即可使用。
练习台支持四拍预备、40–160 BPM、连续循环、独立示范音与节拍声、当前／下一音指板提示。
停止、离开页面或切到后台时结束本次跟练；未满 1 秒的跟练和预备拍不保存。
记录保存于当前浏览器 LocalStorage（最近 200 次），包括速度、时长、完整遍数和自评；不进行收音判定。

- `/`：基础训练目录。
- `/practice/training/:exerciseId`：统一练习台。
- `/practice/library`：曲谱导入与示例曲目，需要下方的曲谱服务。
- `/progress`：真实基础训练记录。
- `/tools`、`/practice/metronome`、`/theory`：辅助工具。

新增训练内容放在 `src/music/foundation-exercises.ts`，复用统一音频调度与练习台。
视觉样式位于 `src/assets/main.css`：直角、细分隔线、黑白层级，橙色强调当前动作。

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

In another terminal, start the score API:

```sh
pnpm server:dev
```

The Vite development server proxies `/api` to `http://localhost:3001`.

### Score Backend

The Fastify backend stores Guitar Pro files under `server-data/scores` and score metadata in
`server-data/scores.sqlite`. Both are local runtime data and are ignored by Git.

```sh
pnpm server:start
```

After `pnpm build`, the backend also serves the production frontend at `http://localhost:3001`.
The score API includes upload, list, score metadata, practice data, original-file download, and
delete endpoints under `/api/scores`.

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
