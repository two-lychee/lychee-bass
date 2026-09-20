<script setup lang="ts">
import { computed, ref } from 'vue'

const chapters = [
  ['start', '先看懂谱面'],
  ['tab', 'TAB 与五线谱'],
  ['duration', '音符与休止符'],
  ['meter', '拍号与数拍'],
  ['phrasing', '附点、连线与切分'],
  ['symbols', '常见符号'],
  ['walkthrough', '逐拍读一小节'],
  ['practice', '带回练习库'],
]
const values = [
  {
    name: '全音符',
    note: '\uE1D2',
    rest: '\uE4E3',
    beats: '4',
    shape: '空心符头，无符干',
    restShape: '小方块挂在线下',
  },
  {
    name: '二分音符',
    note: '\uE1D3',
    rest: '\uE4E4',
    beats: '2',
    shape: '空心符头，加一根符干',
    restShape: '小方块坐在线上',
  },
  {
    name: '四分音符',
    note: '\uE1D5',
    rest: '\uE4E5',
    beats: '1',
    shape: '实心符头，加一根符干',
    restShape: '弯折的竖形符号',
  },
  {
    name: '八分音符',
    note: '\uE1D7',
    rest: '\uE4E6',
    beats: '1/2',
    shape: '实心符头，1 条符尾或符杠',
    restShape: '1 个小钩',
  },
  {
    name: '十六分音符',
    note: '\uE1D9',
    rest: '\uE4E7',
    beats: '1/4',
    shape: '实心符头，2 条符尾或符杠',
    restShape: '2 个小钩',
  },
  {
    name: '三十二分音符',
    note: '\uE1DB',
    rest: '\uE4E8',
    beats: '1/8',
    shape: '实心符头，3 条符尾或符杠',
    restShape: '3 个小钩',
  },
  {
    name: '六十四分音符',
    note: '\uE1DD',
    rest: '\uE4E9',
    beats: '1/16',
    shape: '实心符头，4 条符尾或符杠',
    restShape: '4 个小钩',
  },
]
const staffNotes = ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A']
const techniques = [
  {
    sign: '× / x',
    name: '死音（闷音）',
    text: '左手轻触弦但不按实，右手拨出短促的打击声。它占时值、需要发音；休止符则要求安静。Palm mute（掌根闷音）通常仍有音高，不能和死音混为一谈。',
  },
  {
    sign: '5h7 / H',
    name: '击弦',
    text: '先拨 5 品，再用左手手指敲下同弦 7 品，让第二个音发声。第二个音仍要在谱面规定的时刻出现。',
  },
  {
    sign: '7p5 / P',
    name: '勾弦',
    text: '先准备好 5 品，再拨响 7 品，用按 7 品的手指轻勾离弦，使 5 品发声，不只是抬起手指。',
  },
  {
    sign: '5/7 · 7\\5',
    name: '滑音',
    text: '保持按弦，从 5 品滑到 7 品，或从 7 品滑到 5 品。连奏滑音一般只拨起始音；换把滑音是否重拨要看谱面标记。',
  },
  {
    sign: 'b / 弯箭头',
    name: '推弦',
    text: '从起始音把弦推高到目标音高。标记 1/2 通常是升半音，full 通常是升全音；这里的数字不是拍数。r 表示回到原音高。',
  },
  {
    sign: '◇ / N.H. / A.H.',
    name: '泛音',
    text: '菱形音头或文字提示泛音。自然泛音轻触弦的节点（如 12 品）发声；人工泛音方法不同。TAB 的数字可能标触弦位置，先看原谱图例。',
  },
  {
    sign: '> · · · —',
    name: '重音、断奏、保持音',
    text: '音头上方或下方的 > 是重音；点是断奏，声音缩短但数拍不变；短横线是保持音，通常弹足时值。音头右侧的点才是增加时值的附点。',
  },
  {
    sign: 'p · mf · f · <',
    name: '力度',
    text: 'p 弱、mp 中弱、mf 中强、f 强；渐张的发夹表示渐强，渐收表示渐弱。音符旁的 p 也可能是勾弦，结合位置和上下文判断。',
  },
  {
    sign: '⌒ + 点 / ~',
    name: '延长与颤音',
    text: '弧线内带点的延长记号表示适当延长，具体多久由演奏处理；波浪线通常提示颤音。它们都不同于把两个同音连起来的延音线。',
  },
  {
    sign: 'Am7 · C/G',
    name: '和弦标记',
    text: 'Am7 是 A 小七和弦，和弦音为 A C E G；不要求贝斯一次弹完所有音。C/G 表示 C 和弦以 G 为低音。上方和弦名提供和声背景，实际弹什么仍看音符或编配要求。',
  },
]
const slots = ['1', '&', '2', '&', '3', '&', '4', '&']
const examples = [
  {
    title: '音符 + 休止',
    notation: '四分音符 → 两个八分音符 → 四分休止符 → 四分音符',
    actions: ['拨', '延', '拨', '拨', '停', '停', '拨', '延'],
    frets: ['0', '—', '3', '5', '休', '休', '0', '—'],
    details: [
      '第 1 拍拨 E 弦空弦 E1，保持一整拍。',
      '这是第 1 拍的后半拍，让 E1 继续响，不重新拨弦。',
      '第 2 拍拨 E 弦 3 品 G1，只占半拍。',
      '第 2 拍的 & 拨 E 弦 5 品 A1，占后半拍。',
      '第 3 拍开始四分休止：用手止住余音，保持安静。',
      '仍在第 3 拍的休止中，继续数 &。',
      '第 4 拍再次拨 E 弦空弦 E1，保持一拍。',
      '继续保持，到下一小节边界再按后续音符或休止处理。',
    ],
    summary: '1 + 1/2 + 1/2 + 1（休止）+ 1 = 4 拍。这里所有数字都在 E 弦上。',
  },
  {
    title: '延音线跨过正拍',
    notation: '八分休止 → 八分音符与四分音符同音相连 → 二分音符',
    actions: ['停', '拨', '延', '延', '拨', '延', '延', '延'],
    frets: ['休', '3', '—', '—', '5', '—', '—', '—'],
    details: [
      '第 1 拍前半拍休止，先数 1。',
      '在第 1 拍的 & 拨 E 弦 3 品 G1。',
      '延音线连到第 2 拍的同一个 G1：继续响，不再拨。',
      '继续保持 G1，到第 3 拍前结束，共响 1.5 拍。',
      '第 3 拍拨 E 弦 5 品 A1，二分音符保持两拍。',
      '保持 A1，不重拨。',
      '虽然到了第 4 拍，A1 仍在持续，不重拨。',
      '保持到小节末尾。这一音一共占第 3、4 两拍。',
    ],
    summary: '1/2（休止）+（1/2 + 1）+ 2 = 4 拍。弱位起音延续到下一正拍，是常见切分节奏。',
  },
]
const exampleIndex = ref(0)
const selectedSlot = ref(0)
const example = computed(() => examples[exampleIndex.value]!)
const selectExample = (index: number) => {
  exampleIndex.value = index
  selectedSlot.value = 0
}
</script>

<template>
  <article class="reading-guide flex min-w-0 flex-col gap-6" aria-label="贝斯读谱指南">
    <header>
      <p class="text-xs font-bold tracking-wider text-primary">从看懂符号，到按拍弹出来</p>
      <h2 class="mt-2 text-2xl font-bold text-highlighted">贝斯读谱指南</h2>
      <p class="mt-2 text-sm text-muted">
        每个音都回答四个问题：弹什么音？在哪里弹？什么时候开始？响多久、怎样结束？先慢慢读，再连起来弹。
      </p>
    </header>
    <nav class="flex flex-wrap gap-2" aria-label="读谱章节">
      <a
        v-for="[id, title] in chapters"
        :key="id"
        :href="`#reading-${id}`"
        class="rounded-md border border-default px-3 py-2 text-sm text-primary hover:bg-muted"
        >{{ title }}</a
      >
    </nav>

    <section id="reading-start" class="guide-section">
      <h3>01 · 拿到一张谱，先看这五件事</h3>
      <ol class="list-decimal space-y-2 pl-5">
        <li>
          <strong>乐器和调弦：</strong>确认是 Bass 轨道。标准四弦从粗到细是
          E1、A1、D2、G2；降调或五弦谱不能直接套标准四弦位置。
        </li>
        <li>
          <strong>谱号、调号：</strong
          >谱号确定五线谱的音高位置，调号规定默认升降哪些音。贝斯常用低音谱号。
        </li>
        <li>
          <strong>拍号、速度：</strong>先确认每小节装多少时值，再看速度标记用哪种音符作为一拍。
        </li>
        <li>
          <strong>路线：</strong
          >从左往右读，同一行读完再读下一行；小节线分隔小节，反复号可能要求返回。
        </li>
        <li>
          <strong>先读节奏，再找音：</strong>先拍手或念数拍，分清拨弦、延续和休止，然后加左手位置。
        </li>
      </ol>
      <p class="callout">
        上下对齐的五线谱和 TAB
        通常是同一段音乐的两种表示，不需要各弹一遍。同一时刻竖着叠起的音一般要同时弹；横着排列的音按时间依次弹。
      </p>
    </section>

    <section id="reading-tab" class="guide-section">
      <h3>02 · TAB 看位置，五线谱看音高</h3>
      <h4>TAB：线是弦，数字是品</h4>
      <p>
        四弦 TAB 从上到下是 G、D、A、E，最上面是最细的 1 弦，最下面是最粗的 4 弦。数字 3 表示该弦第
        3 品，不是第 3 根弦，也不是用第 3 指。0 是空弦，12 是十二品，应当作一个数字读。
      </p>
      <div class="overflow-x-auto rounded-lg bg-muted p-4">
        <pre
          class="w-max font-mono text-sm leading-7"
          aria-label="TAB 示例：依次弹 E 弦空弦、E 弦三品、A 弦二品、D 弦空弦"
        >
G |-----------------|
D |-------------0---|
A |---------2-------|
E |--0--3-----------|
     ①  ②   ③   ④</pre
        >
      </div>
      <p>
        依次弹：① E 弦空弦 E1 → ② E 弦 3 品 G1 → ③ A 弦 2 品 B1 → ④ D 弦空弦
        D2。每升一品升高一个半音。这个纯文本示意只说明先后和位置，<strong>不能单靠横线数量判断时值</strong>；节奏要看配套五线谱、TAB
        符干符杠或明确的拍点。
      </p>
      <h4>五线谱：先定谱号，再数线与间</h4>
      <p>
        五条线从下往上数；相邻两线之间叫“间”。低音谱号的两个点夹住第 4 线 F。五线从下到上是
        G、B、D、F、A；四个间从下到上是
        A、C、E、G。每上移一条线或一个间，音名字母前进一级，不代表固定升一个半音。
      </p>
      <svg
        viewBox="0 0 600 170"
        class="w-full max-w-2xl text-highlighted"
        role="img"
        aria-label="低音谱号示意：自下而上为 G A B C D E F G A，五条线为 G B D F A"
      >
        <line
          v-for="y in [40, 60, 80, 100, 120]"
          :key="y"
          x1="20"
          x2="580"
          :y1="y"
          :y2="y"
          stroke="currentColor"
          stroke-opacity="0.45"
        />
        <text x="28" y="60" class="music-glyph" font-size="80">&#xE062;</text>
        <g v-for="(note, index) in staffNotes" :key="index">
          <ellipse
            :cx="125 + index * 52"
            :cy="120 - index * 10"
            rx="9"
            ry="6"
            fill="currentColor"
          />
          <text
            :x="125 + index * 52"
            y="153"
            text-anchor="middle"
            font-size="15"
            fill="currentColor"
          >
            {{ note }}
          </text>
        </g>
      </svg>
      <p>
        超出五线谱就在上下加短线，仍按 C D E F G A B 循环数。例如低音谱表下加一线是 E，下加一间是
        F，上加一线是 C。符干朝上或朝下主要是排版和声部需要，<strong>不改变音高和时值</strong>。
      </p>
      <p class="callout">
        电贝斯通常写得比实际声音高一个八度：标准记谱的 E2、A2、D3、G3 对应实际空弦
        E1、A1、D2、G2。本站指板音名标实际音高；导入谱的八度显示还取决于轨道设置，优先核对调弦和
        TAB，不要看到八度数字不同就随意换品。
      </p>
      <h4>升降号与调号怎么用？</h4>
      <p>
        ♯ 升半音，♭ 降半音，♮ 还原为自然音；𝄪 重升是升两个半音，𝄫
        重降是降两个半音。升降号写在音符左边。谱号后的调号默认作用于所有八度的相应音名；例如一个升号的调号中，所有
        F 默认弹 F♯。
      </p>
      <p>
        小节中的临时升降号通常影响本小节同一谱表、同一八度的同名音，到小节线后恢复调号；跨小节延音线连接的那个音保持原音高。提醒性的括号升降号只是帮助阅读。先认字母，再看调号，再看临时记号。
      </p>
      <p>
        同一个实际音可以有不同弦位，例如 E 弦 5 品和 A 弦空弦都是
        A1。只有五线谱时要自己选择顺手的指法；有 TAB 时可以先用它给出的弦品位置。
      </p>
    </section>

    <section class="guide-section" aria-label="简谱入门">
      <h3>补充 · 简谱里的数字，与 TAB 数字不是一回事</h3>
      <p>
        简谱的 1 2 3 4 5 6 7 表示调内音级，唱作 do re mi fa sol la si。先看调号：1=C 时，1 是 C、2
        是 D；1=G 时，1 是 G、2 是 A、7 是 F♯。它们表示音高关系，不表示贝斯品位。
      </p>
      <p>
        数字上方一个点表示高一个八度，下方一个点表示低一个八度；多个点继续升降八度。数字右侧的点是附点，增加原时值的一半，注意区分点的位置。
      </p>
      <p>
        常见简谱中，四分音符作一拍时，单个无下划线的数字占一拍；一道下划线是半拍，两道是四分之一拍。数字后每条延长横线增加一拍，如“5
        —”是两拍，“5 — — —”是四拍；0 表示休止，也要按下划线或附点确定时值。
      </p>
      <p class="callout">
        对照记：TAB 的 0 = 拨响空弦，简谱的 0 = 休止；TAB 的 3 = 第三品，简谱的 3 =
        调内第三级。拿到谱先认清谱种，再解释数字。
      </p>
    </section>

    <section id="reading-duration" class="guide-section">
      <h3>03 · 音符管发声，休止符管安静</h3>
      <p>
        先看符头是空心还是实心，再看有没有符干，最后数符尾或横向符杠。每多一条符尾／符杠，时值减半。下面统一以<strong
          >四分音符 = 1 拍</strong
        >计算；换了拍单位，拍数也会变。
      </p>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-sm">
          <caption class="sr-only">
            音符与对应休止符时值对照，四分音符为一拍
          </caption>
          <thead>
            <tr>
              <th scope="col">名称</th>
              <th scope="col">音符</th>
              <th scope="col">休止符</th>
              <th scope="col">拍数</th>
              <th scope="col">辨认方法</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="value in values" :key="value.name">
              <th scope="row">{{ value.name }}</th>
              <td>
                <span class="music-glyph symbol" aria-hidden="true">{{ value.note }}</span>
              </td>
              <td>
                <span class="music-glyph symbol" aria-hidden="true">{{ value.rest }}</span>
              </td>
              <td class="font-mono font-bold text-primary">{{ value.beats }}</td>
              <td>
                {{ value.shape }}<br /><span class="text-dimmed">休止：{{ value.restShape }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        两个八分音符连在一起时，符尾变为一道横杠，每个仍然占半拍；两个十六分音符用两道横杠，每个仍然占四分之一拍。<strong
          >符杠分组帮助看拍子，不表示这些音合成一个音。</strong
        >
      </p>
      <p>
        休止符不是“等着但让上一音一直响”：到休止开始的位置，要用左手或右手止住琴弦余音，嘴里继续数拍。全休止符也常用于表示整小节休止，此时按该小节拍号计时；多小节休止上方的数字表示休止多少小节。
      </p>
      <p class="callout">
        先牢记：1 个全音符 = 2 个二分音符 = 4 个四分音符 = 8
        个八分音符。音符名称说的是比例，不是固定秒数；在四分音符 = 60 的速度下，四分音符 1
        秒，八分音符 0.5 秒。
      </p>
    </section>

    <section id="reading-meter" class="guide-section">
      <h3>04 · 拍号决定怎么分组，速度决定多快</h3>
      <p>
        拍号的下方数字表示哪种音符作为记谱单位，上方数字表示每小节有几个这样的单位。4/4
        是四个四分音符的总时值；3/4
        是三个。一个完整小节中，同一声部的音符与休止时值相加，应符合拍号。弱起小节可能不足一整小节。
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-default p-4">
          <h4>4/4：四拍，每拍分两份</h4>
          <p class="font-mono text-primary">1 &amp; 2 &amp; 3 &amp; 4 &amp;</p>
          <p>
            数字是正拍，&amp;（读 and）是两拍之间的后半拍。每格是一个八分音符，不要把 &amp;
            也数成一整拍。
          </p>
        </div>
        <div class="rounded-lg border border-default p-4">
          <h4>十六分细分：一拍分四份</h4>
          <p class="font-mono text-primary">1 e &amp; a · 2 e &amp; a …</p>
          <p>
            四个音节均匀分配在一拍内。1 到下一个 2 的时间不变，手上的音变密，脚下的拍速不要变快。
          </p>
        </div>
        <div class="rounded-lg border border-default p-4">
          <h4>3/4 与 6/8：长度相同，重音分组不同</h4>
          <p>
            3/4 常按 2+2+2 个八分音符分组，有三大拍；6/8 常按 3+3
            分组，有两大拍，每大拍是附点四分音符。6/8 可数“1 la li，2 la li”，也可慢数“1 2 3，4 5
            6”，重心在 1、4。
          </p>
        </div>
        <div class="rounded-lg border border-default p-4">
          <h4>2/2、C 与速度单位</h4>
          <p>
            C 表示 4/4，带竖线的 C 表示 2/2；2/2 常以二分音符为一拍。看到“音符 =
            80”时必须认音符：6/8 的附点四分音符 = 80，意味着每分钟 80 个大拍，不能直接当成 80
            个八分音符。
          </p>
        </div>
      </div>
      <p>
        9/8 常分成 3+3+3，12/8 常分成 3+3+3+3。5/8、7/8 等拍号要结合符杠和重音看是 2+3、2+2+3
        还是其他分组；拍号本身不总能给出全部重音信息。
      </p>
    </section>

    <section id="reading-phrasing" class="guide-section">
      <h3>05 · 附点、连线、连音和切分</h3>
      <svg
        viewBox="0 0 620 140"
        class="w-full max-w-2xl text-highlighted"
        role="img"
        aria-label="图形对照：两个八分音符用一道符杠相连；附点位于音头右侧；延音线连接同高的两个音头"
      >
        <g fill="currentColor" stroke="currentColor">
          <ellipse cx="35" cy="70" rx="8" ry="5" />
          <ellipse cx="95" cy="70" rx="8" ry="5" />
          <path d="M42 70 V25 H102 V70 M42 29 H102" fill="none" stroke-width="2" />
          <ellipse cx="250" cy="70" rx="8" ry="5" />
          <path d="M257 70 V25" stroke-width="2" />
          <circle cx="273" cy="70" r="3" />
          <ellipse cx="425" cy="70" rx="8" ry="5" />
          <ellipse cx="505" cy="70" rx="8" ry="5" />
          <path d="M432 70 V25 M512 70 V25 M428 83 Q465 111 502 83" fill="none" stroke-width="2" />
        </g>
        <g fill="currentColor" font-size="14" text-anchor="middle">
          <text x="70" y="128">一道符杠：各半拍</text>
          <text x="263" y="128">附点四分：1.5 拍</text>
          <text x="465" y="128">同音延音线：只拨一次</text>
        </g>
      </svg>
      <div class="space-y-4">
        <div>
          <h4>附点：增加原时值的一半</h4>
          <p>
            写在音头右侧的点是附点。附点二分 = 2 + 1 = 3 拍；附点四分 = 1 + 1/2 = 1.5 拍；附点八分 =
            1/2 + 1/4 = 3/4 拍。双附点再加原值的四分之一，例如双附点四分 = 1.75
            拍。休止符也可以带附点。
          </p>
        </div>
        <div>
          <h4>延音线：同音相连，只拨第一次</h4>
          <p>
            弧线连住两个相同音高的音符时，常表示延音线，两音时值相加。例如四分音符连八分音符，共响
            1.5 拍。第二个符头是延续，不是新的拨弦；延音可以跨小节线。
          </p>
        </div>
        <div>
          <h4>圆滑线：不同音连贯演奏，音高仍要变</h4>
          <p>
            外形也像弧线，但连接不同音高或一组音，表示连贯的乐句。在贝斯谱上可能结合击弦、勾弦等技巧。不能把圆滑线内的所有音当成同一个音保持，也不能一概认为每个音都要右手重拨。
          </p>
        </div>
        <div>
          <h4>三连音：把通常两份的时间均分成三份</h4>
          <p>
            三个八分音符上方标 3，通常表示三个音合占一个四分拍，每音占 1/3
            拍，可数“1-trip-let”。普通三个八分音符占 1.5 拍，和八分三连音不一样；6/8
            中一大拍的三个普通八分音符无需标 3。其他连音要结合标记和所跨时值判断。
          </p>
        </div>
        <div>
          <h4>反拍与切分：拍子照走，起音或重音挪到弱位</h4>
          <p>
            只在 &amp;
            上拨弦，是常见反拍练习。弱位起音并延续越过下一强位，或突出弱位重音，会形成切分感。先保持“1
            &amp; 2 &amp;”的均匀细分，再决定在哪格发声，不要为了等一个音把拍子拉长。
          </p>
        </div>
        <div>
          <h4>Swing / Shuffle：看成对八分音符的演奏说明</h4>
          <p>
            标注 Swing
            时，成对八分音符常演奏为长短关系，接近三连音的前两份与后一份；比例随风格和速度变化，并非永远精确
            2:1。Straight 表示均分。不要把这种处理自动套到所有曲谱。
          </p>
        </div>
      </div>
    </section>

    <section id="reading-symbols" class="guide-section">
      <h3>06 · 演奏符号与反复路线速查</h3>
      <p>
        不同制谱软件可能使用不同缩写，优先看曲谱自己的图例。下面是常见读法，不代表本站播放器已能模拟所有技巧。
      </p>
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="technique in techniques"
          :key="technique.name"
          class="rounded-lg border border-default p-4"
        >
          <span class="font-mono font-bold text-primary">{{ technique.sign }}</span>
          <h4>{{ technique.name }}</h4>
          <p>{{ technique.text }}</p>
        </div>
      </div>
      <h4>反复号：先找返回点，再决定出口</h4>
      <p>
        <strong>||: … :||</strong>
        表示把这一段重复，通常弹两遍（有次数标记时依标记）。没有前反复号时通常回到曲首。带“1.”“2.”的房子是不同结尾：第一遍进
        1 房后返回，第二遍跳过 1 房进 2 房。
      </p>
      <p>
        <strong>D.C.</strong> 回到曲首，<strong>D.S.</strong> 回到 Segno（𝄋）记号；<strong
          >al Fine</strong
        >
        表示返回后弹到 Fine 结束，<strong>al Coda</strong> 表示返回后遇到 To Coda 时跳到
        Coda（𝄌）尾声。第一次经过 To Coda 通常先继续，等执行返始指令后再跳。
      </p>
      <p>
        细双线常表示段落分界，不等于停止；细线加粗线是终止线。遇到复杂路线，先写出“小节 1–8 → 1–6 →
        9–10”这样的顺序，再开始连弹。
      </p>
    </section>

    <section id="reading-walkthrough" class="guide-section">
      <h3>07 · 点一格，读懂一整个小节</h3>
      <p>
        这是教学拆解，使用 4/4、每格半拍、标准调弦，全部在 E
        弦演奏。点击格子查看动作；“延”是继续发声，“停”是止音保持安静。
      </p>
      <div class="flex flex-wrap gap-2" aria-label="示例选择">
        <button
          v-for="(item, index) in examples"
          :key="item.title"
          type="button"
          :aria-pressed="exampleIndex === index"
          class="rounded-md border border-default px-3 py-2 text-sm"
          :class="exampleIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-muted'"
          @click="selectExample(index)"
        >
          {{ item.title }}
        </button>
      </div>
      <p class="font-semibold text-highlighted">{{ example.notation }}</p>
      <div class="grid grid-cols-4 gap-2 sm:grid-cols-8">
        <button
          v-for="(slot, index) in slots"
          :key="index"
          type="button"
          :aria-pressed="selectedSlot === index"
          :aria-label="`第 ${Math.floor(index / 2) + 1} 拍${index % 2 ? '后半拍' : '前半拍'}：${example.actions[index]}`"
          class="flex flex-col items-center gap-2 rounded-lg border p-3"
          :class="
            selectedSlot === index
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-default hover:bg-muted'
          "
          @click="selectedSlot = index"
        >
          <span class="font-mono font-bold">{{ slot }}</span
          ><strong>{{ example.actions[index] }}</strong
          ><span class="text-xs">{{ example.frets[index] }}</span>
        </button>
      </div>
      <p class="callout min-h-16" aria-live="polite">{{ example.details[selectedSlot] }}</p>
      <p>{{ example.summary }}</p>
      <details class="rounded-lg border border-default p-4">
        <summary class="cursor-pointer font-semibold text-highlighted">
          自测：附点四分音符接八分音符，共几拍？拨几次？
        </summary>
        <p class="mt-3">
          共 1.5 + 0.5 = 2
          拍。没有延音线且没有特殊奏法时拨两次；若是同音并用延音线相连，则只拨一次，持续两拍。
        </p>
      </details>
      <details class="rounded-lg border border-default p-4">
        <summary class="cursor-pointer font-semibold text-highlighted">
          自测：TAB 上的 0、× 和休止分别怎么做？
        </summary>
        <p class="mt-3">
          0 是拨响空弦，有明确音高；×
          是拨出死音，有打击声；休止是止住余音并保持安静。三者都需要准确占据谱面指定的时值。
        </p>
      </details>
    </section>

    <section id="reading-practice" class="guide-section">
      <h3>08 · 把读谱方法用到练习库</h3>
      <p>
        本站“节奏与 Bass Tab”是辅助网格：顶部数字和 &amp; 标拍内位置，TAB
        数字表示品位；下方四条弦线帮助确认弹哪根弦。右手 ↓ / ↑
        是交替拨弦提示，拨片可按下拨／上拨理解，指弹可映射为食指／中指交替；它们不表示音高升降。右手
        × 表示闷音动作。
      </p>
      <p class="callout">
        网格中的短横线要结合所在行理解：四弦 TAB
        某一行没有数字，只说明该弦此格没有标新音，其他弦可能在发声；不能把所有空格都当成休止。导入曲谱遇到延音、连音或复杂节奏时，回看原始五线谱和
        TAB 确认完整时值与奏法。
      </p>
      <div class="grid gap-3 sm:grid-cols-3">
        <RouterLink
          :to="{ name: 'practice-lesson', query: { exercise: 'eighth-alternating' } }"
          class="practice-link"
          ><strong>① 八分音符交替拨弦 →</strong
          ><span
            >念 1 &amp; 2 &amp; 3 &amp; 4 &amp;，每半拍拨一次，辨认 E、A 弦上的品位。</span
          ></RouterLink
        >
        <RouterLink
          :to="{ name: 'practice-lesson', query: { exercise: 'offbeat-groove' } }"
          class="practice-link"
          ><strong>② 反拍律动 →</strong
          ><span>数字位置休止并止音，&amp; 位置才拨弦。脚下继续打正拍。</span></RouterLink
        >
        <RouterLink
          :to="{ name: 'practice-lesson', query: { exercise: 'syncopation' } }"
          class="practice-link"
          ><strong>③ 切分与闷音 →</strong
          ><span>先区分正常音与 × 的打击声，保持均匀细分，再处理弱位重音。</span></RouterLink
        >
      </div>
      <p>
        建议顺序：只数拍 → 拍出节奏 → 在一根空弦上练节奏与止音 → 加左手品位 →
        最后加入力度与技巧。先把一个小节读准，再连下一个小节。
      </p>
      <p class="text-xs">
        延伸阅读：<a
          href="https://www.musictheory.net/lessons"
          target="_blank"
          rel="noreferrer"
          class="text-primary underline"
          >musictheory.net 基础乐理课程</a
        >
        ·
        <a
          href="https://www.studybass.com/lessons/reading-music/bass-clef-fretboard-notes/"
          target="_blank"
          rel="noreferrer"
          class="text-primary underline"
          >StudyBass：低音谱表与指板</a
        >
      </p>
    </section>
  </article>
</template>

<style scoped>
@font-face {
  font-family: 'ReadingBravura';
  src: url('/assets/font/Bravura.woff2') format('woff2');
  font-display: swap;
}
.music-glyph {
  font-family: 'ReadingBravura', serif;
}
.symbol {
  display: inline-block;
  font-size: 36px;
  line-height: 2;
  min-width: 40px;
}
.guide-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-margin-top: 90px;
  border-top: 1px solid var(--ui-border);
  padding-top: 24px;
}
.guide-section h3 {
  color: var(--ui-text-highlighted);
  font-size: 1.2rem;
  font-weight: 700;
}
.guide-section h4 {
  color: var(--ui-text-highlighted);
  font-weight: 600;
  margin-bottom: 6px;
}
.guide-section p,
.guide-section li {
  color: var(--ui-text-muted);
  font-size: 0.925rem;
  line-height: 1.85;
}
.guide-section strong {
  color: var(--ui-text-highlighted);
}
.callout {
  padding: 12px 16px;
  border-left: 3px solid var(--ui-primary);
  background: var(--ui-bg-muted);
  border-radius: 4px;
}
th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ui-border);
}
td {
  color: var(--ui-text-muted);
}
.practice-link {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.7;
}
.practice-link:hover {
  background: var(--ui-bg-muted);
}
.practice-link span {
  color: var(--ui-text-muted);
}
button,
a,
summary {
  outline-offset: 4px;
}
</style>
