/* ========== 系列页：读取 URL 参数 ?s=slug，渲染该系列 ========== */

const $ = (s) => document.querySelector(s);

/* 缩略图约定：同目录下的 th/ 子文件夹、同名文件
   photos/银盐·胶片/某系列/03.jpg  →  photos/银盐·胶片/某系列/th/03.jpg
   没有缩略图时自动退回大图（各处都挂了 error 回退），不会出现破图 */
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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
  }
  fallbackCopy(t);
  return Promise.resolve();
}
/* "微信号：c08_yh0403" → "c08_yh0403"：只取冒号后面那截 */
function copyPart(txt) {
  const parts = String(txt).split(/[：:]/);
  return (parts.length > 1 ? parts.slice(1).join("：") : parts[0]).trim();
}

/* 从地址栏取系列标识；独立页直接用 build 脚本注入的 __SLUG__ */
const slug = window.__SLUG__ || new URLSearchParams(location.search).get("s");
/* 数据里还没有系列、或 slug 打错 → 用空壳兜底，页面显示「整理中」而不白屏报错 */
const series = SITE.series.find((x) => x.slug === slug) || SITE.series[0] || {
  slug: "", title: "整理中", section: "film", cover: "", video: "", photos: [],
};

/* 社交图标 */
SITE.social.forEach((s) => {
  const a = document.createElement("a");
  /* http(s) → 外链新窗口；站内路径（如 friends.html）→ 当前窗口跳过去；留空 → 不跳 */
  const isExt = !!s.url && /^https?:/i.test(s.url);
  const isInner = !!s.url && !isExt && s.url !== "#";
  const linked = isExt || isInner;
  if (isExt) { a.href = s.url; a.target = "_blank"; a.rel = "noopener"; }
  else if (isInner) { a.href = s.url; }
  /* 用 aria-label 而不是 title：title 会多弹一个浏览器原生提示框（两个气泡） */
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
  /* 每个图标都有悬停气泡：有 tip 用 tip，没有就用名字 */
  const tip = document.createElement("span");
  tip.className = "snav-tip";
  tip.textContent = s.tip || s.name;
  a.appendChild(tip);
  a.addEventListener("mouseenter", () => a.classList.add("show"));
  a.addEventListener("mouseleave", () => a.classList.remove("show"));
  /* 没链接、但填了 tip 的图标（比如微信）→ 点一下复制 tip 里的号 */
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

/* 标题区 */
const secName = SITE.sections.find((x) => x.key === series.section)?.name || "";
document.title = `${series.title} · By deer | see 小鹿`;
$("#sTitle").textContent = series.title;
const desc = SITE.sections.find((x) => x.key === series.section)?.desc || "";
/* 标题下那行小字：
   ① 系列写了 meta 文字 → 用它（投稿作品也可以有小字）
   ② 系列写了 meta: "" → 显式不要这行小字（三种情况里最优先的一种）
   ③ 完全没写 meta：自己的作品显示「分区 · 主题」；投稿作品不显示这行 */
const sMetaEl = $("#sMeta");
const metaText = series.meta !== undefined
  ? series.meta
  : (series.credit ? "" : [secName, desc].filter(Boolean).join(" · "));
if (metaText) {
  sMetaEl.style.display = "";
  sMetaEl.textContent = metaText;
} else {
  sMetaEl.style.display = "none";
  sMetaEl.textContent = "";
}

/* 图集：用缩略图（小、快），点开看大图。
   铺排方式 = 同一行等高、宽度按照片比例分（宽幅全景占宽、竖图占窄）。
   有 credit 的作品（朋友的投稿）在缩略图右下角加署名 */
const grid = $("#sGrid");
const cards = [];                  /* { el, ar } —— ar = 宽/高，同时当 flex-grow 用 */
let arLeft = 0;                    /* 还有几张的比例没读到 */
let firstLaid = false;             /* 第一版分行排过没有 */

series.photos.forEach((p, i) => {
  const fig = document.createElement("figure");
  fig.className = "sitem";
  const im = document.createElement("img");
  /* 不用 lazy：要在图片加载后立刻知道真实比例、把分行算准，
     lazy 会让屏幕外的图比例未知 → 滚动时照片跳位。
     缩略图很小（每张 40–150KB），整个系列一次加载也就 1–2MB。 */
  im.draggable = false;                     /* 不让拖走 */
  im.alt = `${series.title} ${i + 1}`;
  im.src = thumbOf(p.src);
  im.addEventListener("error", function onErr() {
    im.removeEventListener("error", onErr);
    im.src = p.src;              /* 没有 th/ 就退回大图 */
  });
  fig.appendChild(im);

  const cr = p.credit || series.credit || "";
  if (cr) {
    const sp = document.createElement("span");
    sp.className = "credit";
    sp.textContent = cr;
    fig.appendChild(sp);
  }
  fig.addEventListener("click", () => openLightbox(i));

  const card = { el: fig, ar: 1.5, settled: false };   /* 3:2 只是占位，第一版分行只认真比例 */
  cards.push(card);
  arLeft++;

  /* 这张的比例读到了（只算一次） */
  const settle = () => {
    if (card.settled) return;
    card.settled = true;
    arLeft--;
    firstLayoutIfReady();
  };
  const setAr = (w, h) => {
    if (!w || !h) return;
    fig.style.setProperty("--ar", w + "/" + h);
    card.ar = w / h;
    /* ★ 第一版分行必须等所有比例都读到 ——
       否则先按估的 3:2 排一次、图陆续加载完再重排，页面就会"抽一下"
       （用户 2026-09-29 报的 bug）。已经排过之后的比例修正才用合并重排。 */
    if (firstLaid) relayoutSoon(); else settle();
  };
  if (im.complete && im.naturalWidth) setAr(im.naturalWidth, im.naturalHeight);
  else im.addEventListener("load", () => setAr(im.naturalWidth, im.naturalHeight));
});

/* 一行照片的目标高度：宽屏到顶 340px，窄屏不低于 200px */
function targetRowH(W) {
  return Math.max(200, Math.min(340, W / 1.5));
}

/* 分行：一张张往当前行加，加到「整行按比例铺开后高度降到目标以下」就换行。
   这样每行都会铺满宽度，高度也不会太离谱。 */
function layout() {
  const W = grid.getBoundingClientRect().width || window.innerWidth;
  if (!W) return;
  const gap = W < 560 ? 14 : 24;
  const tH = targetRowH(W);
  grid.innerHTML = "";                 /* 清掉旧的行（卡片元素还在 cards 里） */
  if (!cards.length) return;

  let row = [], sum = 0;

  const flush = (isLast) => {
    if (!row.length) return;
    const r = document.createElement("div");
    r.className = "srow";
    r.style.gap = gap + "px";
    if (!isLast) r.style.marginBottom = gap + "px";
    /* 最后一行通常没铺满 → 限住宽度，让照片高度回到目标值，
       否则单独一张竖图会被拉满整行、变得巨大 */
    if (isLast) {
      const need = sum * tH + gap * (row.length - 1);
      if (need < W) r.style.maxWidth = Math.round(need) + "px";
    }
    row.forEach((c) => {
      c.el.style.flexGrow = String(c.ar);   /* 宽度按比例瓜分整行 → 高度自然一致 */
      r.appendChild(c.el);
    });
    grid.appendChild(r);
    row = []; sum = 0;
  };

  cards.forEach((c) => {
    row.push(c);
    sum += c.ar;
    const h = (W - gap * (row.length - 1)) / sum;   /* 铺满整行时的高度 */
    if (h <= tH) flush(false);
  });
  flush(true);
}

/* 图片陆续加载完 → 比例陆续修正 → 合并成一次重排，避免抖 */
let relayoutTimer = null;
function relayoutSoon() {
  clearTimeout(relayoutTimer);
  relayoutTimer = setTimeout(layout, 100);
}

/* ★ 第一版分行：等**所有**缩略图的真实比例都读出来再排一次。
   旧做法是立刻按估的 3:2 排、图加载完再重排 → 页面明显"抽一下"（用户报的 bug）。
   等待期间 .sgrid 是透明的（CSS 里 opacity:0），排好加 .ready 再淡出来，
   所以肉眼看到的就是"直接到位"，没有跳变。 */
function firstLayoutIfReady() {
  if (firstLaid || arLeft > 0) return;
  firstLaid = true;
  layout();
  grid.classList.add("ready");
}
/* 兜底：万一有图一直读不出比例，也别让图墙一直空着 */
setTimeout(() => {
  if (firstLaid) return;
  firstLaid = true;
  layout();
  grid.classList.add("ready");
}, 2500);

let lastW = Math.round(grid.getBoundingClientRect().width) || 0;
if (!cards.length) grid.classList.add("ready");
else firstLayoutIfReady();     /* 命中缓存时可能已经全读完了，直接排 */

/* 窗口宽度变了 → 重新分行（目标高度和间隙都跟着变） */
let rzTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(rzTimer);
  rzTimer = setTimeout(() => {
    const w = Math.round(grid.getBoundingClientRect().width);
    if (Math.abs(w - lastW) > 2) { lastW = w; layout(); }
  }, 180);
});

/* ---------- 灯箱 ---------- */
const lb = $("#lightbox");
let lbIdx = 0;

function renderLb() {
  const p = series.photos[lbIdx];
  const im = $("#lbImg");
  im.draggable = false;
  im.src = p.src;
  /* 器材后面接署名：「Fujifilm GFX100 · © 没脾气的莫奈」
     自己的作品没有 credit → 只显示器材 */
  const cr = p.credit || series.credit || "";
  /* 作品名（没有就留空 → CSS 的 :empty 会把整行藏掉） */
  $("#lbWork").textContent = p.work || "";
  $("#lbGear").textContent = [p.gear || "", cr].filter(Boolean).join(" · ");
  const share = $("#lbShare");
  share.innerHTML = "";
  if (p.link) {
    const a = document.createElement("a");
    a.href = p.link; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "网盘下载原图" + (p.code ? `（提取码 ${p.code}）` : "");
    a.addEventListener("click", (e) => {
      if (p.code) {
        e.preventDefault();
        navigator.clipboard?.writeText(p.code);
        a.textContent = "提取码已复制，正在打开网盘…";
        setTimeout(() => window.open(p.link, "_blank"), 600);
      }
    });
    share.appendChild(a);
  }
  if (series.video) {
    const v = document.createElement("a");
    v.href = series.video; v.target = "_blank"; v.rel = "noopener";
    v.textContent = "观看视频 →";
    v.style.marginLeft = "12px";
    share.appendChild(v);
  }
  const multi = series.photos.length > 1;
  $("#lbPrev").style.display = multi ? "" : "none";
  $("#lbNext").style.display = multi ? "" : "none";
}

function openLightbox(i) {
  lbIdx = i; renderLb();
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }

$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => { lbIdx = (lbIdx - 1 + series.photos.length) % series.photos.length; renderLb(); });
$("#lbNext").addEventListener("click", () => { lbIdx = (lbIdx + 1) % series.photos.length; renderLb(); });
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") $("#lbPrev").click();
  if (e.key === "ArrowRight") $("#lbNext").click();
});

/* ---------- 「← 返回」 ----------
   · 从首页进来的 → 回首页，并**停在离开前的位置**（main.js 看到标记就把 scrollY 放回去）
   · 从「专属片柜」进来的（地址带 ?from=xxx）→ **回那个专属片柜**，不是首页
     （用户 2026-09-29：「我点进某套出来我还希望是这个特殊片柜」）
   新标签页里直接打开这一页时既没标记、也没存过位置 → 老实从头开始 */
const backLink = $(".snav-back");
if (backLink) {
  const fromSec = new URLSearchParams(location.search).get("from");
  /* from=contrib → 是从「朋友们」那一层点进来的，就回 friends.html；
     from=film/digital/motion → 回对应的专属片柜；没有 → 回首页 */
  const backURL = fromSec === "contrib" ? "friends.html"
    : fromSec ? `cabinet.html?sec=${encodeURIComponent(fromSec)}`
      : "index.html";
  backLink.setAttribute("href", backURL);
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    try {
      if (fromSec) sessionStorage.setItem("bydeer:restoreCabinet", "1");
      else sessionStorage.setItem("bydeer:restoreScroll", "1");
    } catch (err) {}
    location.href = backURL;
  });
}

/* ---------- 图片防盗用（只是门槛，不是锁） ----------
   挡住「右键 → 另存为图片」和「拖拽」。挡不住开发者工具 / 截图 / 抓包。 */
document.addEventListener("contextmenu", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
