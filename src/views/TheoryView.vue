<template>
  <div class="theory-page">
    <header class="page-header">
      <h1>基础乐理</h1>
      <p class="subtitle">贝斯演奏必备的音乐理论知识</p>
    </header>

    <section class="section">
      <h2>🎸 贝斯调弦</h2>
      <p>标准四弦贝斯从粗到细（从低到高）的调弦为：</p>
      <div class="tuning-box">
        <div class="string-item">
          <span class="string-num">4弦</span>
          <span class="note">E1</span>
          <span class="freq">41.2 Hz</span>
        </div>
        <div class="string-item">
          <span class="string-num">3弦</span>
          <span class="note">A1</span>
          <span class="freq">55.0 Hz</span>
        </div>
        <div class="string-item">
          <span class="string-num">2弦</span>
          <span class="note">D2</span>
          <span class="freq">73.4 Hz</span>
        </div>
        <div class="string-item">
          <span class="string-num">1弦</span>
          <span class="note">G2</span>
          <span class="freq">98.0 Hz</span>
        </div>
      </div>
      <p class="note-text">贝斯比吉他低一个八度，相邻弦之间为纯四度关系。</p>
    </section>

    <section class="section">
      <h2>🎵 音名与半音</h2>
      <p>西方音乐体系中，一个八度内有 <strong>12 个半音</strong>，对应的音名为：</p>
      <div class="notes-grid">
        <span v-for="n in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']" :key="n" class="note-chip">{{ n }}</span>
      </div>
      <ul class="info-list">
        <li><strong>半音</strong>：相邻两个音之间的最小距离（如 C → C#）</li>
        <li><strong>全音</strong>：两个半音的距离（如 C → D）</li>
        <li>E → F 和 B → C 之间只有半音，没有黑键</li>
      </ul>
    </section>

    <section class="section">
      <h2>🎼 音阶与调式</h2>

      <h3>大调音阶（Major Scale）</h3>
      <p>音程结构：<code>全 - 全 - 半 - 全 - 全 - 全 - 半</code></p>
      <p class="example">例：C 大调 = C D E F G A B C</p>

      <h3>自然小调音阶（Natural Minor Scale）</h3>
      <p>音程结构：<code>全 - 半 - 全 - 全 - 半 - 全 - 全</code></p>
      <p class="example">例：A 小调 = A B C D E F G A</p>

      <h3>五声音阶（Pentatonic Scale）</h3>
      <p><strong>小调五声</strong>最常用于蓝调和摇滚，只有 5 个音，容易即兴。</p>
      <p class="example">例：A 小调五声 = A C D E G</p>

      <h3>布鲁斯音阶（Blues Scale）</h3>
      <p>在小调五声基础上加入"蓝调音"（b5）。</p>
      <p class="example">例：A 布鲁斯 = A C D D# E G</p>
    </section>

    <section class="section">
      <h2>📐 音程</h2>
      <p>两个音之间的距离称为音程，以半音数计算：</p>
      <table class="interval-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>半音数</th>
            <th>示例（以 C 为根音）</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>根音</td><td>0</td><td>C</td></tr>
          <tr><td>小二度</td><td>1</td><td>C → C#</td></tr>
          <tr><td>大二度</td><td>2</td><td>C → D</td></tr>
          <tr><td>小三度</td><td>3</td><td>C → D#</td></tr>
          <tr><td>大三度</td><td>4</td><td>C → E</td></tr>
          <tr><td>纯四度</td><td>5</td><td>C → F</td></tr>
          <tr><td>减五度（蓝调音）</td><td>6</td><td>C → F#</td></tr>
          <tr><td>纯五度</td><td>7</td><td>C → G</td></tr>
          <tr><td>小六度</td><td>8</td><td>C → G#</td></tr>
          <tr><td>大六度</td><td>9</td><td>C → A</td></tr>
          <tr><td>小七度</td><td>10</td><td>C → A#</td></tr>
          <tr><td>大七度</td><td>11</td><td>C → B</td></tr>
          <tr><td>八度</td><td>12</td><td>C → C</td></tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>🥁 节奏基础</h2>
      <ul class="info-list">
        <li><strong>拍号</strong>：如 4/4 表示每小节 4 拍，每拍为四分音符</li>
        <li><strong>BPM</strong>：每分钟拍数（Beats Per Minute），如 120 BPM</li>
        <li><strong>节拍器</strong>：帮助保持稳定节奏的工具</li>
        <li><strong>常见拍号</strong>：4/4（最常见）、3/4（华尔兹）、6/8（进行曲）</li>
      </ul>
    </section>

    <section class="section">
      <h2>🎯 贝斯在乐队中的角色</h2>
      <ul class="info-list">
        <li><strong>节奏基础</strong>：与鼓配合，构成节奏组（Rhythm Section）</li>
        <li><strong>和声支撑</strong>：通常演奏根音或和弦内音</li>
        <li><strong>连接桥梁</strong>：在旋律和鼓之间架起桥梁</li>
        <li><strong>低音填充</strong>：填补频率范围，让音乐更饱满</li>
      </ul>
    </section>

    <div class="tip">
      <strong>💡 学习建议</strong>
      <ul>
        <li>先熟悉指板上的音名位置</li>
        <li>从小调五声音阶开始练习即兴</li>
        <li>多听、多模仿经典 bass line</li>
        <li>使用节拍器练习，培养稳定的节奏感</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.theory-page {
  max-width: 900px;
  margin: 0 auto;
  color: #333;
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
  color: #666;
  font-size: 14px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  margin: 0 0 16px;
  font-size: 22px;
  color: #ff8a65;
}

.section h3 {
  margin: 20px 0 8px;
  font-size: 16px;
  color: #333;
}

.section p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #666;
  font-size: 14px;
}

.section strong {
  color: #333;
}

.section code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  color: #ff8a65;
  font-size: 13px;
  border: 1px solid #e0e0e0;
}

.tuning-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.string-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.string-num {
  font-size: 12px;
  color: #999;
}

.note {
  font-size: 24px;
  font-weight: bold;
  color: #ff8a65;
}

.freq {
  font-size: 11px;
  color: #999;
}

.note-text {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.note-chip {
  padding: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.info-list {
  margin: 12px 0;
  padding-left: 20px;
  line-height: 1.8;
  color: #666;
  font-size: 14px;
}

.info-list li {
  margin-bottom: 8px;
}

.example {
  padding: 10px 14px;
  background: #fff;
  border-left: 3px solid #ff8a65;
  border-radius: 4px;
  font-family: monospace;
  color: #333;
  font-size: 13px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.interval-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.interval-table th {
  background: #f5f5f5;
  padding: 10px;
  text-align: left;
  color: #ff8a65;
  border: 1px solid #e0e0e0;
  font-weight: 600;
}

.interval-table td {
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  color: #666;
}

.interval-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.tip {
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.tip strong {
  display: block;
  margin-bottom: 12px;
  color: #ff8a65;
  font-size: 15px;
}

.tip ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
  color: #666;
  font-size: 14px;
}

.tip li {
  margin-bottom: 6px;
}
</style>
