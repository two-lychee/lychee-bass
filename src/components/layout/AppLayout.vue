<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink to="/" class="wordmark" aria-label="Lychee Bass 首页"
        ><span class="brand-mark" aria-hidden="true">╱╱</span> LYCHEE<span class="wordmark-light"
          >BASS</span
        ></RouterLink
      >
      <nav class="main-nav" aria-label="主导航">
        <RouterLink
          to="/"
          :class="{ 'nav-active': $route.path === '/' || $route.name === 'practice-training' }"
          >基础训练</RouterLink
        >
        <RouterLink
          to="/practice/library"
          :class="{
            'nav-active': ['practice-library', 'practice-lesson'].includes(String($route.name)),
          }"
          >曲谱练习</RouterLink
        >
        <RouterLink to="/progress" active-class="nav-active">练习记录</RouterLink>
      </nav>
      <UColorModeButton class="theme-toggle" />
    </header>
    <main class="site-content"><slot /></main>
    <footer class="site-footer">
      <span>LYCHEE BASS <span class="footer-divider">/</span> 拿起琴，慢慢来。</span>
      <nav aria-label="辅助导航">
        <RouterLink to="/tools">辅助工具</RouterLink
        ><RouterLink to="/practice/metronome">节拍器</RouterLink
        ><RouterLink to="/theory">读谱与乐理</RouterLink>
      </nav>
    </footer>
  </div>
</template>
