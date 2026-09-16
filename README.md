# lychee-bass

This template should help get you started developing with Vue 3 in Vite.

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
