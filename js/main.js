/* ========== 渲染与交互 ========== */

/* ★ 在 Console 里报一声自己是什么版本 —— 用来确认"浏览器里跑的是不是新代码"。
   版本号直接从本脚本自己的地址（js/main.js?v=xxx）里取，不用手动同步。 */
try {
  console.log("bydeer · 资源版本 " +
    ((document.currentScript && document.currentScript.src.match(/v=([\w.-]+)/) || [])[1] || "(未知)"));
} catch (e) {}

const $ = (s) => document.querySelector(s);

/* 缩略图约定：同目录下的 th/ 子文件夹、同名文件。
   卡片/预览用小图，点开放大才用大图；没有 th/ 时自动退回大图 */
function thumbOf(src) {
  return String(src).replace(/\/([^/]+)$/, "/th/$1");
}

/* ---------- 复制到剪贴板（给"点一下复制微信号"用） ---------- */
function fallbackCopy(t) {
  const ta = document.createElement("textarea");
  ta.value = t;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}
function copyText(t) {
  /* 现代浏览器用 clipboard API；不支持或没权限时退回老办法 */
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
  }
  fallbackCopy(t);
  return Promise.resolve();
}
/* "微信号：c08_yh0403" → "c08_yh0403"：只取冒号后面那截，前面是说明文字 */
function copyPart(txt) {
  const parts = String(txt).split(/[：:]/);
  return (parts.length > 1 ? parts.slice(1).join("：") : parts[0]).trim();
}

/* ---------- 社交图标 ---------- */
SITE.social.forEach((s) => {
  const a = document.createElement("a");
  /* 三种情况：
       · 填 http(s)://…   → 外链，新窗口打开
       · 填站内路径（如 friends.html）→ **当前窗口跳过去**（2026-09-30 加的，给「朋友们」当入口）
       · 留空 或 "#"      → 只显示图标，不跳转 */
  const isExt = !!s.url && /^https?:/i.test(s.url);
  const isInner = !!s.url && !isExt && s.url !== "#";
  const linked = isExt || isInner;
  if (isExt) { a.href = s.url; a.target = "_blank"; a.rel = "noopener"; }
  else if (isInner) { a.href = s.url; }
  /* 用 aria-label 而不是 title：title 会让浏览器自己弹一个原生提示框，
     和我们做的气泡同时出现 → 变成两个气泡。aria-label 只给读屏软件用，不弹框 */
  a.setAttribute("aria-label", s.name);
  /* icon 填的是图片文件名 → 用图标；否则退回显示名字的第一个字 */
  if (s.icon && /\.(svg|png|jpe?g|webp)$/i.test(s.icon)) {
    const im = document.createElement("img");
    im.src = `icons/${s.icon}`;
    im.alt = s.name;
    a.appendChild(im);
  } else {
    a.textContent = s.icon || s.name.slice(0, 1);
  }
  /* 每个图标都挂一个悬停小气泡：
     有 tip 就用 tip（比如微信号），没有就用名字（比如"小红书"）。
     不要用 title —— 它跟这个气泡会同时出现，变成两个提示。 */
  const tip = document.createElement("span");
  tip.className = "nav-tip";
  tip.textContent = s.tip || s.name;
  a.appendChild(tip);
  /* CSS 的 :hover 之外再用 JS 兜一层，免得某些环境悬停不灵 */
  a.addEventListener("mouseenter", () => a.classList.add("show"));
  a.addEventListener("mouseleave", () => a.classList.remove("show"));
  /* 没链接、但填了 tip 的图标（比如微信）→ 点一下复制 tip 里的号；
     鼠标也会变成手型，让人知道这里是能点的 */
  if (!linked && s.tip) {
    a.style.cursor = "pointer";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      copyText(copyPart(s.tip));
      const old = tip.textContent;
      tip.textContent = "已复制 ✓";
      a.classList.add("show");
      setTimeout(() => { tip.textContent = old; }, 1800);
    });
  } else if (!linked) {
    a.addEventListener("click", (e) => e.preventDefault());
  }
  $("#navSocial").appendChild(a);
});

/* ---------- 首页轮播 ---------- */
const slidesBox = $("#heroSlides");
const blurBg = $("#heroBlur");
const dotsBox = $("#heroDots");
let cur = 0, timer = null;
const imgs = [];
const heroReady = [];        /* 哪几张已经加载好了 */
let heroStarted = false, heroFail = 0;

/* ★ 2026-09-29 修「第一遍特别慢」：
   以前是在循环里 `await loadImg(...)` 一张张来 —— 等于**串行下载**
   （第二张要等第一张下完才开始下），而且必须**等最后一张到位**才 go(0) 起计时，
   所以第一张会多停留"后面那几张的下载时间"。现在改成：所有图同时开始下载、
   按顺序占好位置，**第一张一到就开场**，计时立刻起跑。 */
function buildSlides() {
  const list = SITE.heroSlides || [];
  if (!list.length) {
    /* 一张轮播图都还没有（照片没进来）→ 首页给个安静占位，不报错 */
    document.querySelector(".hero")?.classList.add("hero-empty");
    return;
  }
  list.forEach((src, k) => {
    const im = new Image();
    im.alt = "";
    imgs.push(im);
    slidesBox.appendChild(im);
    const dot = document.createElement("i");
    /* ★ 这里以前写的是 imgs.length - 1 → 点哪个圆点都跳到"最后一张" */
    dot.addEventListener("click", () => go(k, true));
    dotsBox.appendChild(dot);
    im.addEventListener("load", () => { heroReady[k] = true; startHero(); });
    im.addEventListener("error", () => {
      heroFail++;
      /* 全挂了才给占位，别留一个空首屏 */
      if (heroFail === list.length) document.querySelector(".hero")?.classList.add("hero-empty");
    });
    im.src = src;
    /* 提前解码。不解码的话，轮到它上台那一帧才解码，会明显顿一下 */
    if (im.decode) im.decode().catch(() => {});
  });
  /* 命中缓存时 load 可能在挂监听之前就发生了 → 补一次判断 */
  if (imgs[0].complete && imgs[0].naturalWidth > 0) { heroReady[0] = true; startHero(); }
  /* 兜底：heroSlides[0] 迟迟不来（网络慢/图挂了）→ 别让首屏空着，先上已经就绪的那张 */
  setTimeout(() => startHero(true), 1500);
}

/* 开场。★ 优先等 heroSlides[0] —— 配置里的第一张就该是开场那张，
   否则"谁先下完谁先上"会让开场变成随机的（小文件常常抢先，用户看到的就不是第一张了）。
   只有 force=true（1.5 秒兜底）时才退而求其次，用第一张已就绪的。 */
function startHero(force) {
  if (heroStarted || !imgs.length) return;
  let k = -1;
  if (heroReady[0]) k = 0;
  else if (force) k = heroReady.indexOf(true);
  if (k < 0) return;
  heroStarted = true;
  /* 开场这张淡入快一点（.fast 把 1.6s 收到 .5s），别让人对着黑屏等一秒多 */
  slidesBox.classList.add("fast");
  go(k);                                   /* 先亮第一张到位的（竖图会自动切 contain） */
  setTimeout(() => slidesBox.classList.remove("fast"), 700);
  if (imgs.length > 1) {
    clearInterval(timer);
    timer = setInterval(() => go((cur + 1) % imgs.length), 5500);
  }
}

function go(i, manual) {
  if (!imgs.length) return;
  imgs.forEach((el, k) => el.classList.toggle("on", k === i));
  [...dotsBox.children].forEach((d, k) => d.classList.toggle("on", k === i));
  const im = imgs[i];
  const portrait = im.naturalWidth < im.naturalHeight;
  slidesBox.classList.toggle("contain", portrait);
  /* ★ 模糊填充层只有**竖图**才需要（横图是 cover 铺满，根本看不见它）。
     而这一层挂着 blur(26px) + scale(1.16) 的大背景图，第一次创建合成图层会明显卡一下
     —— 用户报的「第一次还是会卡一会」就是它。横图直接关掉，别让它参与合成。 */
  if (portrait && im.src) {
    if (blurBg.style.backgroundImage.indexOf(im.src) < 0) blurBg.style.backgroundImage = `url("${im.src}")`;
    blurBg.style.display = "";
  } else {
    blurBg.style.backgroundImage = "";
    blurBg.style.display = "none";
  }
  cur = i;
  if (manual) { clearInterval(timer); timer = setInterval(() => go((cur + 1) % imgs.length), 5500); }
}

/* ---------- 分栏索引 ---------- */
const indexList = $("#indexList");
const previewImg = $("#previewImg");

/* 右侧展示图：换上这一张（src 为空 → 清空，框留白）。
   换图靠 CSS 的 .fade 做交叉淡入。 */
function setPreview(src) {
  previewImg.classList.add("fade");
  setTimeout(() => {
    if (!src) {
      previewImg.removeAttribute("src");
      previewImg.style.visibility = "hidden";
      previewImg.classList.remove("fade");
      return;
    }
    previewImg.style.visibility = "";
    previewImg.src = src;
    previewImg.onload = () => previewImg.classList.remove("fade");
  }, 220);
}

/* ---------- 默认状态 ----------
   · data.js 的 indexPreview 配了图 → 默认就在那里轮播（每 4.5 秒淡入换下一张）
   · 没配（现在是空的）→ **默认什么都不显示，框留空**
   · 鼠标停在某个分区上 → 暂停轮播、换成那个分区的 preview 图；移开再回到默认状态 */
const ROTATE_MS = 4500;
const rotList = (SITE.indexPreview && SITE.indexPreview.length)
  ? SITE.indexPreview.slice()
  : [];
let rotIdx = 0, rotTimer = null;

function startRotate() {
  stopRotate();
  if (!rotList.length) { setPreview(null); return; }   /* 没配 → 框留空 */
  setPreview(rotList[rotIdx % rotList.length]);
  if (rotList.length < 2) return;                      /* 只有一张就不必转 */
  rotTimer = setInterval(() => {
    rotIdx = (rotIdx + 1) % rotList.length;
    setPreview(rotList[rotIdx]);
  }, ROTATE_MS);
}
function stopRotate() {
  if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
}

/* ---------- 悬停某个分区时，框里显示什么 ----------
   `sections[].preview` 既可以是**一条路径**，也可以是**一组路径**：
   · 一条 → 就显示那一张
   · 一组 → 每 4.5 秒换下一张（2026-09-30 加的，用户「这俩试试」要两种都看）
   · 没配 → 保持默认那一张，**不清空**（空灰框像网站坏了） */
let secTimer = null, secIdx = 0;
function stopSecRotate() {
  if (secTimer) { clearInterval(secTimer); secTimer = null; }
}
function showSectionPreview(sec) {
  stopSecRotate();
  const pv = sec && sec.preview;
  const list = Array.isArray(pv) ? pv.slice() : (pv ? [pv] : []);
  if (!list.length) { startRotate(); return; }
  stopRotate();
  secIdx = 0;
  setPreview(list[0]);
  if (list.length > 1) {
    secTimer = setInterval(() => {
      secIdx = (secIdx + 1) % list.length;
      setPreview(list[secIdx]);
    }, ROTATE_MS);
  }
}

startRotate();                             /* 进来先按默认状态摆好 */

SITE.sections.forEach((sec) => {
  const item = document.createElement("div");
  item.className = "index-item";
  item.dataset.sec = sec.key;
  if (sec.cabinet) item.classList.add("linked");   /* 能点进去的给个手型 */
  item.innerHTML = `<h3>${sec.name}</h3><p>${sec.desc}</p>`;
  /* 悬停：左边高亮 + 换成这个分区的图
     ★ 分区**没配 preview**（比如「动态 · 影像」还没视频）→ **保持默认那张**，
       不要把框清空 —— 空灰框会让人以为网站坏了（用户 2026-09-29 说的）。 */
  item.addEventListener("mouseenter", () => {
    indexList.classList.add("on");
    document.querySelectorAll(".index-item").forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    showSectionPreview(sec);               /* 配了就用它的（可以是一组），没配就保持默认 */
  });
  indexList.appendChild(item);
});

/* 鼠标移出整个索引区 → 取消高亮，回到默认状态 */
indexList.addEventListener("mouseleave", () => {
  indexList.classList.remove("on");
  document.querySelectorAll(".index-item").forEach((el) => el.classList.remove("active"));
  stopSecRotate();
  startRotate();
});

/* ---------- 点亮 / 取消点亮某个分区（还原状态用，效果和 hover 一致） ---------- */
function applySectionHighlight(key) {
  const item = [...document.querySelectorAll(".index-item")].find((el) => el.dataset.sec === key);
  if (!item) return false;
  indexList.classList.add("on");
  document.querySelectorAll(".index-item").forEach((el) => el.classList.remove("active"));
  item.classList.add("active");
  const s = SITE.sections.find((x) => x.key === key);
  if (s) showSectionPreview(s);          /* 右侧换回它的展示图（没配 preview 就保持默认那张） */
  return true;
}
function clearSectionHighlight() {
  indexList.classList.remove("on");
  document.querySelectorAll(".index-item").forEach((el) => el.classList.remove("active"));
  stopSecRotate();
  startRotate();
}

/* 点了配了 cabinet 的分区 → 进它的「专属片柜」页；没配的点了没反应 */
indexList.addEventListener("click", (e) => {
  const item = e.target.closest(".index-item");
  if (!item) return;
  const sec = SITE.sections.find((s) => s.key === item.dataset.sec);
  if (sec && sec.cabinet) location.href = sec.cabinet;
});

/* ---------- 筛选 + 档案图墙 ---------- */
const filterRow = $("#filterRow");
const grid = $("#archiveGrid");
let activeFilter = "all";

/* 筛选键：就三个分区。
   ★ 2026-09-30 去掉了「投稿」这一项 —— 朋友们的作品已经独立成一层（首页右上角
   「朋友们」图标 → friends.html），不再和自己的作品混在同一个片柜里。 */
const FILTERS = [
  { key: "all", name: "全部" },
  ...SITE.sections.map((s) => ({ key: s.key, name: s.name })),
];

FILTERS.forEach((f, i) => {
  const b = document.createElement("button");
  b.textContent = f.name;
  if (i === 0) b.classList.add("on");
  b.addEventListener("click", () => {
    activeFilter = f.key;
    filterRow.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    renderGrid();
  });
  filterRow.appendChild(b);
});

function renderGrid() {
  grid.innerHTML = "";
  /* ★ 片柜只列**你自己**的作品。有 credit（署名）的是朋友的作品 ——
     它们独立成一层，走右上角「朋友们」图标 → friends.html（2026-09-30 分层）。 */
  const list = SITE.series
    .filter((s) => !s.credit)
    .filter((s) => (activeFilter === "all" ? true : s.section === activeFilter));
  if (!list.length) {
    /* 这个筛选下一套系列都还没有 → 一行安静占位。
       分区可以自己写 empty 文案（动态·影像 = 「视频整理中」，那区是视频不是照片） */
    const sec = SITE.sections.find((x) => x.key === activeFilter);
    grid.innerHTML = `<div class="archive-empty">${(sec && sec.empty) || "照片整理中"}</div>`;
    return;
  }
  list.forEach((s) => {
      const secName = SITE.sections.find((x) => x.key === s.section)?.name || "";
      const card = document.createElement("div");
      card.className = "series-card";
      card.innerHTML = `
        <div class="cover">
          <img loading="lazy" draggable="false" src="${thumbOf(s.cover)}" alt="${s.title}">
          <div class="glass"></div>
          ${s.credit ? `<span class="credit">${s.credit}</span>` : ""}
        </div>
        <h4>${s.title}</h4>
        <p>${s.film || secName}</p>`;   /* 胶片系列显示胶片型号（如 Kodak cp200），其余显示分区名 */
      /* 卡片封面也用小图；没有 th/ 就退回大图 */
      const covImg = card.querySelector(".cover img");
      if (covImg) covImg.addEventListener("error", function onErr() {
        covImg.removeEventListener("error", onErr);
        covImg.src = s.cover;
      });
      card.addEventListener("click", () => {
        location.href = `series.html?s=${encodeURIComponent(s.slug)}`;
      });
      grid.appendChild(card);
    });
}
renderGrid();

/* ---------- 灯箱 ---------- */
const lb = $("#lightbox");
let lbSeries = null, lbIdx = 0;

function openLightbox(series, idx = 0) {
  lbSeries = series;
  lbIdx = idx;
  renderLb();
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderLb() {
  const p = lbSeries.photos[lbIdx];
  const lbi = $("#lbImg");
  lbi.draggable = false;
  lbi.src = p.src;
  /* 器材后面接署名（投稿作品才有） */
  const cr = p.credit || lbSeries.credit || "";
  /* 作品名（没有就留空 → CSS 的 :empty 会把整行藏掉） */
  $("#lbWork").textContent = p.work || "";
  $("#lbGear").textContent = [p.gear || "", cr].filter(Boolean).join(" · ");
  const share = $("#lbShare");
  share.innerHTML = "";
  if (p.link) {
    const a = document.createElement("a");
    a.href = p.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "网盘下载原图" + (p.code ? `（提取码 ${p.code}）` : "");
    a.addEventListener("click", (e) => {
      if (p.code) {
        e.preventDefault();
        navigator.clipboard?.writeText(p.code);
        a.textContent = "提取码已复制，正在打开网盘…";
        setTimeout(() => { window.open(p.link, "_blank"); }, 600);
      }
    });
    share.appendChild(a);
  }
  if (lbSeries.video) {
    const v = document.createElement("a");
    v.href = lbSeries.video;
    v.target = "_blank";
    v.rel = "noopener";
    v.textContent = "观看视频 →";
    v.style.marginLeft = "12px";
    share.appendChild(v);
  }
  $("#lbPrev").style.display = lbSeries.photos.length > 1 ? "" : "none";
  $("#lbNext").style.display = lbSeries.photos.length > 1 ? "" : "none";
}

$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => { lbIdx = (lbIdx - 1 + lbSeries.photos.length) % lbSeries.photos.length; renderLb(); });
$("#lbNext").addEventListener("click", () => { lbIdx = (lbIdx + 1) % lbSeries.photos.length; renderLb(); });
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") $("#lbPrev").click();
  if (e.key === "ArrowRight") $("#lbNext").click();
});
function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }

/* ---------- 滚回原处 ----------
   从片柜卡片 / 专属片柜进详情页，再按「← 返回」回到首页时，
   **停在离开前那个位置**，不要弹回首屏第一张图。
   做法：离开首页时把 scrollY 存进 sessionStorage；回来时再放回去。
   （浏览器自带的历史滚动恢复在本地/预览环境不可靠，所以自己接管：
     关掉 scrollRestoration，改成"只在返回/刷新时"恢复 —— 正常点链接进首页仍然从头开始） */
const SCROLL_KEY = "bydeer:indexScroll";
const RESTORE_KEY = "bydeer:restoreScroll";
const SEC_KEY = "bydeer:indexSec";          /* 第二区域：鼠标最后停在哪个分区上 */
const FILTER_KEY = "bydeer:indexFilter";    /* 第三区域：选了哪个筛选标签 */
const FROM_SUB_KEY = "bydeer:fromSub";      /* 详情页 HTML 里留下的"我刚从那边过来" */

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

/* ★ 2026-09-30：光还原滚动位置不够 —— 用户要的是「回到进去之前的样子」。
   所以离开首页时把**界面状态**也一起存下：第二区域鼠标停在哪一项、第三区域选了哪个筛选。
   （用户原话：「进入专属片柜之后再点回到主页，我希望是回到进去之前的样子；
     从片柜进去同理，也回到进去之前的时候」） */
window.addEventListener("pagehide", () => {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || window.pageYOffset || 0));
    const act = document.querySelector(".index-item.active");
    if (act && act.dataset.sec) sessionStorage.setItem(SEC_KEY, act.dataset.sec);
    else sessionStorage.removeItem(SEC_KEY);          /* 离开时鼠标没停在分区上 → 清掉，别留旧的 */
    sessionStorage.setItem(FILTER_KEY, activeFilter);
  } catch (e) {}
});

/* 这次载入算不算「从详情页回来」？返回原位 + 还原界面状态都靠它判断。
   三个信号，命中任意一个就算：
   ① 详情页的「← 返回」点过了（bydeer:restoreScroll）
   ② 详情页 HTML 里写下的 bydeer:fromSub —— ★ 写在 HTML 里，那页的 JS 就算全崩了它也在
   ③ 浏览器前进/后退/刷新
   只有「正常点链接进首页」（navigate）才从头开始。 */
function isReturning() {
  try {
    if (sessionStorage.getItem(RESTORE_KEY) === "1") return true;
    if (sessionStorage.getItem(FROM_SUB_KEY) === "1") return true;
    const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    return !!(nav && nav.type && nav.type !== "navigate");
  } catch (e) {
    return false;
  }
}

function restoreScroll(returning) {
  let y = null;
  try {
    if (returning) {
      /* 标记用完就撕掉 */
      if (sessionStorage.getItem(RESTORE_KEY)) sessionStorage.removeItem(RESTORE_KEY);
      y = parseInt(sessionStorage.getItem(SCROLL_KEY) || "", 10);
    }
  } catch (e) {}
  if (!y || isNaN(y) || y <= 0) return;
  /* 临时关掉 html 的 scroll-behavior: smooth，否则会"滑"过去而不是直接到位 */
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, y);
  requestAnimationFrame(() => { root.style.scrollBehavior = prev || ""; });
}

/* ---------- 入场动效 ---------- */
const io = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

buildSlides();

/* ---------- ★ 把「进去之前的样子」摆回来 ----------
   用户 2026-09-30：「进入专属片柜之后再点回到主页，我希望是回到进去之前的样子；
   从片柜进去同理，也回到进去之前的时候」。
   光还原滚动位置不够，还要还原界面状态：
     ① 第三区域（片柜）：上次选中的那个筛选标签
     ② 第二区域：鼠标停在哪一项（高亮 + 右侧展示图）
   ⚠️ 只在「从详情页回来」时做 —— 正常点链接进首页要一切从头开始。 */
const RETURNING = isReturning();
let fromSubSeen = "?";
try { fromSubSeen = String(sessionStorage.getItem(FROM_SUB_KEY)); } catch (e) {}
try { sessionStorage.removeItem(FROM_SUB_KEY); } catch (e) {}   /* 一次性标记，读完就清 */

if (RETURNING) {
  /* ① 筛选标签 */
  let f = null;
  try { f = sessionStorage.getItem(FILTER_KEY); } catch (e) {}
  if (f && f !== activeFilter && FILTERS.some((x) => x.key === f)) {
    activeFilter = f;
    [...filterRow.children].forEach((b, i) => b.classList.toggle("on", FILTERS[i].key === f));
    renderGrid();
  }
  /* ② 第二区域的高亮 + 右侧展示图 */
  let k = null;
  try { k = sessionStorage.getItem(SEC_KEY); } catch (e) {}
  if (k && applySectionHighlight(k)) {
    /* 还原出来的高亮先"锁"着：鼠标一直不动，说明它确实还停在那儿；
       鼠标一动（哪怕 1px）就立刻按真实位置重新判定，免得鼠标早移开了这里还亮着。 */
    const onFirstMove = (e) => {
      document.removeEventListener("mousemove", onFirstMove, true);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const over = el && el.closest ? el.closest(".index-item") : null;
      if (over && over.dataset.sec) applySectionHighlight(over.dataset.sec);
      else clearSectionHighlight();
    };
    document.addEventListener("mousemove", onFirstMove, true);
  }
}

/* 最后再摆滚动位置：等卡片都渲染完，页面高度稳定了才恢复 */
restoreScroll(RETURNING);

/* ---------- 临时诊断（问题解决后整段删掉）----------
   明明有存档的位置、这次却没走还原 → 左下角亮一小条写清原因。
   正常第一次进站没有存档，不会出现这条。 */
(function () {
  let saved = null;
  try { saved = sessionStorage.getItem(SCROLL_KEY); } catch (e) {}
  if (saved === null || saved === "" || RETURNING) return;
  const navType = (function () {
    try { const n = performance.getEntriesByType && performance.getEntriesByType("navigation")[0]; return n ? n.type : "(取不到)"; }
    catch (e) { return "?"; }
  })();
  const b = document.createElement("div");
  b.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:9999;background:#fff;color:#a33;" +
    "font:12px/1.5 system-ui,sans-serif;padding:5px 10px;border:1px solid #e0b4b4;border-radius:6px;opacity:.92";
  b.textContent = "诊断：有存档位置(" + saved + ")但这次没还原 —— fromSub=" + fromSubSeen +
    "，导航类型=" + navType + "，代码版本=" +
    ((document.currentScript && document.currentScript.src.match(/v=([\w.-]+)/) || [])[1] || "(未知)");
  document.body.appendChild(b);
  setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 30000);
})();

/* ---------- 图片防盗用（只是门槛，不是锁） ----------
   挡住「右键 → 另存为图片」和「拖拽到桌面」。
   范围：所有 img，以及灯箱整块区域（连空白处右键也不给菜单）。
   ⚠️ 挡不住开发者工具 / 截图 / 抓包 —— 真正的防线是：
   站上放的本来就是降质版，母版不在这里。 */
document.addEventListener("contextmenu", (e) => {
  const t = e.target;
  if (t.tagName === "IMG" || (t.closest && t.closest(".lightbox"))) e.preventDefault();
});
document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
