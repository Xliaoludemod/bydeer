/* ========== 专属片柜页 ==========
   只列某一个分区里的「成套系列」—— 首页第二区域点某一项就跳到这里。
   地址参数 ?sec=film（银盐·胶片）/ digital（像素·数码）/ motion（动态·影像），
   不写参数时默认 film。

   卡片样式直接复用首页片柜那套（.series-card），点一张进它的系列页。
   这一页自成一体，不依赖 js/main.js（那里面是首页专有的逻辑）。 */

const $ = (s) => document.querySelector(s);

/* 缩略图约定：同目录下的 th/ 子文件夹、同名文件。
   没有 th/ 时自动退回大图（下面挂了 error 回退），不会出现破图 */
function thumbOf(src) {
  return String(src).replace(/\/([^/]+)$/, "/th/$1");
}

/* ---------- 社交图标（和首页/系列页同一套行为） ---------- */
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

SITE.social.forEach((s) => {
  const a = document.createElement("a");
  /* http(s) → 外链新窗口；站内路径（如 friends.html）→ 当前窗口跳过去；留空 → 不跳 */
  const isExt = !!s.url && /^https?:/i.test(s.url);
  const isInner = !!s.url && !isExt && s.url !== "#";
  const linked = isExt || isInner;
  if (isExt) { a.href = s.url; a.target = "_blank"; a.rel = "noopener"; }
  else if (isInner) { a.href = s.url; }
  /* 用 aria-label 而不是 title：title 会多弹一个浏览器原生提示框（变成两个气泡） */
  a.setAttribute("aria-label", s.name);
  if (s.icon && /\.(svg|png|jpe?g|webp)$/i.test(s.icon)) {
    const im = document.createElement("img");
    im.src = `icons/${s.icon}`;
    im.alt = s.name;
    a.appendChild(im);
  } else {
    a.textContent = s.icon || s.name.slice(0, 1);
  }
  const tip = document.createElement("span");
  tip.className = "snav-tip";
  tip.textContent = s.tip || s.name;
  a.appendChild(tip);
  a.addEventListener("mouseenter", () => a.classList.add("show"));
  a.addEventListener("mouseleave", () => a.classList.remove("show"));
  /* 没链接、但填了 tip 的（比如微信）→ 点一下复制 tip 里的号 */
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

/* ---------- 这一页是哪个分区 ----------
   secKey 三选一：film / digital / motion；
   ★ 另外支持一个特殊值 "contrib" = **朋友们那一层**（friends.html 会先设 window.__SEC__）。
   分区的专属片柜**只列你自己的**成套系列；朋友的作品只在 contrib 这一层出现。 */
const secKey = window.__SEC__ || new URLSearchParams(location.search).get("sec") || "film";
const isContrib = secKey === "contrib";
const sec = SITE.sections.find((s) => s.key === secKey) || SITE.sections[0];

document.title = `${isContrib ? "朋友们" : sec.name} · By deer | see 小鹿`;
$("#cTitle").textContent = isContrib ? "朋友们" : sec.name;
$("#cMeta").textContent = isContrib
  ? "他们拍的照片"                       /* 朋友们那一层的副标题 */
  : (sec.desc || "");

/* ---------- 只列这个分区的成套系列（朋友的作品不在分区里，只在这一层）---------- */
const grid = $("#cGrid");
const list = isContrib
  ? SITE.series.filter((s) => !!s.credit)
  : SITE.series.filter((s) => s.section === sec.key && !s.credit);

if (!list.length) {
  /* 分区可以自己写 empty 文案（动态·影像 = 「视频整理中」，那区是视频不是照片） */
  grid.innerHTML = `<div class="archive-empty">${sec.empty || "照片整理中"}</div>`;
} else {
  list.forEach((s) => {
    const card = document.createElement("div");
    card.className = "series-card";
    card.innerHTML = `
      <div class="cover">
        <img loading="lazy" draggable="false" src="${thumbOf(s.cover)}" alt="${s.title}">
        <div class="glass"></div>
        ${s.credit ? `<span class="credit">${s.credit}</span>` : ""}
      </div>
      <h4>${s.title}</h4>
      <p>${s.film || sec.name}</p>`;
    /* 封面优先用小图；没有 th/ 就退回大图 */
    const covImg = card.querySelector(".cover img");
    if (covImg) covImg.addEventListener("error", function onErr() {
      covImg.removeEventListener("error", onErr);
      covImg.src = s.cover;
    });
    card.addEventListener("click", () => {
      /* 带上 from → 系列页的「← 返回」才知道要回到**这一层**，而不是首页 */
      const from = isContrib ? "contrib" : sec.key;
      location.href = `series.html?s=${encodeURIComponent(s.slug)}&from=${encodeURIComponent(from)}`;
    });
    grid.appendChild(card);
  });
}

/* ---------- 「← 返回」：回到首页时停在离开前的位置 ----------
   插一个标记，首页的 main.js 看到标记就把 scrollY 放回去，不要弹回首屏第一张图 */
const backLink = $(".snav-back");
if (backLink) {
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    try { sessionStorage.setItem("bydeer:restoreScroll", "1"); } catch (err) {}
    location.href = "index.html";
  });
}

/* ---------- 从系列页回到本片柜时，也停在原位 ----------
   （系列页的「← 返回」会写 bydeer:restoreCabinet） */
const CAB_SCROLL = "bydeer:cabinetScroll";
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("pagehide", () => {
  try { sessionStorage.setItem(CAB_SCROLL, String(window.scrollY || 0)); } catch (e) {}
});
(function () {
  let y = null;
  try {
    if (sessionStorage.getItem("bydeer:restoreCabinet")) {
      sessionStorage.removeItem("bydeer:restoreCabinet");
      y = parseInt(sessionStorage.getItem(CAB_SCROLL) || "", 10);
    } else {
      const n = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (n && n.type && n.type !== "navigate") y = parseInt(sessionStorage.getItem(CAB_SCROLL) || "", 10);
    }
  } catch (e) {}
  if (!y || isNaN(y) || y <= 0) return;
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";     /* 别"滑"过去，直接到位 */
  window.scrollTo(0, y);
  requestAnimationFrame(() => { root.style.scrollBehavior = prev || ""; });
})();

/* ---------- 图片防盗用（只是门槛，不是锁）
   挡「右键 → 另存为」和「拖拽到桌面」；挡不住开发者工具 / 截图 / 抓包 ——
   真正的防线是站上只放降质版，母版不在站上。 */
document.addEventListener("contextmenu", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
