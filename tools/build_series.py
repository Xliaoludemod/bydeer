# 根据 js/data.js 里的 series 自动生成系列页。
# 运行：python tools/build_series.py
#
# 会做两件事：
#   1) 重写通用页 series.html（靠 ?s=slug 区分，可分享）
#   2) 每个系列生成一个独立页 <slug>.html（URL 更干净）
#
# ★ 解析 data.js 时会先剥掉注释 —— 否则 data.js 注释里那段
#   「复制下面模板」的示例会被当成真系列，凭空生出一个 english-name.html。
import os, re, io

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "series.html")

# ★ "从详情页过来"的标记脚本。单独放一个常量、用 {fromSubScript} 占位 ——
#   不能直接把带 {} 的 JS 写进 TPL：.format() 会把花括号当成占位符报 KeyError
#   （2026-09-30 踩过：series.html 被写成了 0 字节）。
FROM_SUB_SCRIPT = ('<script>/* ★ 标记"刚才是从详情页这边走的"：首页读到它就还原滚动位置/筛选/高亮。'
                   '写在 HTML 里而不是 series.js 里 —— 就算下面的 JS 整个崩了，这个标记也已经生效 */'
                   'try{sessionStorage.setItem("bydeer:fromSub","1");}catch(e){}</script>')

TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · By deer | see 小鹿</title>
<meta name="description" content="{title} · {secname}">
<link rel="stylesheet" href="css/style.css?v={ver}">
</head>
<body class="series-page">

{fromSubScript}

<nav class="snav">
  <a class="snav-back" href="index.html">← 返回</a>
  <div class="snav-logo">By deer&nbsp;|&nbsp;see 小鹿</div>
  <div class="snav-social" id="navSocial"></div>
</nav>

<header class="shead">
  <h1 id="sTitle">{title}</h1>
  <p id="sMeta">{secname} · {desc}</p>
</header>

<main class="sbody">
  <div class="sgrid" id="sGrid"></div>
</main>

<div class="lightbox" id="lightbox">
  <button class="lb-close" id="lbClose">×</button>
  <button class="lb-prev" id="lbPrev">‹</button>
  <button class="lb-next" id="lbNext">›</button>
  <figure class="lb-figure"><img id="lbImg" alt=""></figure>
  <div class="lb-info">
    <div class="lb-work" id="lbWork"></div>
    <div class="lb-gear" id="lbGear"></div>
    <div class="lb-share" id="lbShare"></div>
  </div>
</div>

<script src="js/data.js?v={ver}"></script>
<script>window.__SLUG__ = "{slug}";</script>
<script src="js/series.js?v={ver}"></script>
</body>
</html>
"""


def strip_comments(text):
    """去掉块注释和行注释 —— 防止注释里的示例被当成真数据"""
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    text = re.sub(r"(?m)^\s*//.*$", "", text)
    return text


def read_version():
    """从 index.html 取当前的资源版本号，保证生成页和主站一致（不然会引到旧缓存）"""
    try:
        t = io.open(os.path.join(BASE, "index.html"), encoding="utf-8").read()
        m = re.search(r"(?:css|js)/[\w.-]+\.(?:css|js)\?v=([\w.-]+)", t)
        return m.group(1) if m else "1"
    except Exception:
        return "1"


def parse_series(js_path):
    """从 data.js 提取 series 的 slug/title/section（已剥注释）"""
    text = strip_comments(io.open(js_path, encoding="utf-8").read())
    out = []
    for m in re.finditer(
        r'slug:\s*"([^"]+)"[\s\S]{0,400}?title:\s*"([^"]+)"[\s\S]{0,200}?section:\s*"([^"]+)"',
        text,
    ):
        out.append({"slug": m.group(1), "title": m.group(2), "section": m.group(3)})
    return out


def parse_sections(js_path):
    text = strip_comments(io.open(js_path, encoding="utf-8").read())
    out = {}
    for m in re.finditer(
        r'key:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*desc:\s*"([^"]+)"', text
    ):
        out[m.group(1)] = (m.group(2), m.group(3))
    return out


def main():
    data_js = os.path.join(BASE, "js", "data.js")
    series = parse_series(data_js)
    secs = parse_sections(data_js)
    ver = read_version()
    print("资源版本号:", ver)
    if not series:
        print("没读到 series（这不算错 —— 可能你还没加系列），只生成通用页")

    # 1) 通用 series.html
    with io.open(SRC, "w", encoding="utf-8") as f:
        f.write(TPL.format(title="系列", secname="", desc="", slug="", ver=ver, fromSubScript=FROM_SUB_SCRIPT))
    print("生成:", SRC)

    # 2) 每个系列一个独立页
    for s in series:
        name, desc = secs.get(s["section"], ("", ""))
        p = os.path.join(BASE, f'{s["slug"]}.html')
        with io.open(p, "w", encoding="utf-8") as f:
            f.write(TPL.format(title=s["title"], secname=name, desc=desc,
                               slug=s["slug"], ver=ver, fromSubScript=FROM_SUB_SCRIPT))
        print("生成:", p)

    print("\n共 %d 个系列页" % len(series))


if __name__ == "__main__":
    main()
