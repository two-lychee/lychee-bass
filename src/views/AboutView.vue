<template>
  <div class="about-page">
    <header class="page-header">
      <h1>关于 Lychee Bass</h1>
      <p class="subtitle">为贝斯自学者打造的在线工具集</p>
    </header>

    <section class="section">
      <h2>项目简介</h2>
      <p>
        Lychee Bass 是一个开源的贝斯学习平台，提供交互式指板、音名训练、音阶探索等实用工具。
        我们相信，好的工具能让学习变得更高效、更有趣。
      </p>
    </section>

    <section class="section">
      <h2>当前功能</h2>
      <ul class="feature-list">
        <li><strong>自由演奏</strong> — 交互式指板，支持点击/拖动发声</li>
        <li><strong>音名训练</strong> — 随机测验，帮助记忆指板音位</li>
        <li><strong>音阶探索</strong> — 可视化调式，理解音的角色</li>
      </ul>
    </section>

    <section class="section">
      <h2>技术栈</h2>
      <div class="tech-tags">
        <span class="tag">Vue 3</span>
        <span class="tag">TypeScript</span>
        <span class="tag">Vite</span>
        <span class="tag">Tone.js</span>
        <span class="tag">Pinia</span>
      </div>
    </section>

    <section class="section">
      <h2>未来计划</h2>
      <ul class="feature-list">
        <li>节拍器与录音功能</li>
        <li>真实采样音色</li>
        <li>学习进度持久化</li>
        <li>曲目库与谱面播放</li>
        <li>更多学习模块（和弦识别、音程训练等）</li>
      </ul>
    </section>

    <section class="section">
      <h2>反馈与贡献</h2>
      <p>
        这是一个开源项目，欢迎提交 issue 和 PR。如果你有好的想法或建议，也可以通过 GitHub 联系我们。
      </p>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  color: #eee;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #ff8a65;
}

.section p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #ccc;
  font-size: 14px;
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
  color: #ccc;
  font-size: 14px;
}

.feature-list li {
  margin-bottom: 8px;
}

.feature-list strong {
  color: #ffecb3;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: #2c2424;
  border: 1px solid #3a3030;
  border-radius: 4px;
  font-size: 12px;
  color: #ff8a65;
}
</style>
