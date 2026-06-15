<template>
  <div class="app-layout">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">🎸</span>
          <span class="logo-text">Lychee Bass</span>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-item">学习工具</router-link>
          <router-link to="/practice" class="nav-item">练习工具</router-link>
          <router-link to="/theory" class="nav-item">乐理知识</router-link>
          <router-link to="/progress" class="nav-item">学习进度</router-link>
          <router-link to="/about" class="nav-item">关于</router-link>
        </nav>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <p>Lychee Bass &copy; 2026 · 让贝斯学习更轻松</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1515;
}

.header {
  background: #2c2424;
  border-bottom: 1px solid #3a3030;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 24px;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: #ccc;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #3a3030;
  color: #fff;
}

.nav-item.router-link-active {
  background: #ff8a65;
  color: #fff;
}

.main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
}

.footer {
  background: #2c2424;
  border-top: 1px solid #3a3030;
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 13px;
}

.footer p {
  margin: 0;
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
  }

  .nav {
    width: 100%;
    justify-content: center;
  }

  .nav-item {
    flex: 1;
    text-align: center;
  }
}
</style>
