<template>
  <div class="app-layout">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">🎸</span>
          <span class="logo-text">Lychee Bass</span>
        </router-link>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="icon">🎯</span>
        <span class="label">学习</span>
      </router-link>
      <router-link to="/practice" class="nav-item">
        <span class="icon">🎵</span>
        <span class="label">练习</span>
      </router-link>
      <router-link to="/theory" class="nav-item">
        <span class="icon">📚</span>
        <span class="label">乐理</span>
      </router-link>
      <router-link to="/progress" class="nav-item">
        <span class="icon">📊</span>
        <span class="label">进度</span>
      </router-link>
      <router-link to="/about" class="nav-item">
        <span class="icon">ℹ️</span>
        <span class="label">关于</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding-bottom: 64px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 18px;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.7;
}

.logo-icon {
  font-size: 24px;
}

.main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  text-decoration: none;
  color: #999;
  transition: all 0.2s;
}

.nav-item .icon {
  font-size: 22px;
}

.nav-item .label {
  font-size: 11px;
}

.nav-item:hover {
  color: #333;
}

.nav-item.router-link-active {
  color: #ff8a65;
}

@media (max-width: 640px) {
  .nav-item .label {
    font-size: 10px;
  }
  .nav-item .icon {
    font-size: 20px;
  }
}
</style>
