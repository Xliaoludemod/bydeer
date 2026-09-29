"""
把一套原片处理成上站用的两档图：
  大图  photos/<分区>/<系列>/NN.jpg        长边 2560 · q88  （点开放大看用）
  缩略  photos/<分区>/<系列>/th/NN.jpg     长边  900 · q82  （图墙/卡片用）

用法：
  python tools/prep_photos.py "<原片文件夹>" "photos/<分区>/<系列>"
  python tools/prep_photos.py "<原片文件夹>" "photos/<分区>/<系列>" --crop
  python tools/prep_photos.py "<原片文件夹>" "photos/<分区>/<系列>" --order "b.jpg,a.jpg"

  ★ 默认【不裁任何边】。
  --crop   自动裁掉「又黑又均匀」的边框。**只有胶片扫描件才用**（大连那套的黑边）。
           数码片一律不要加 —— 星空 / 夜景 / 大面积暗调会被误判成黑边
           （青梅尖被误裁过 552px、维也纳顶部被误裁过 552px，都是真内容）。
  --order  指定出场顺序（逗号分隔的原片文件名）。列出的按给定顺序排在前面，
           没列出的按文件名顺序跟在后面。不写则纯按文件名排序。
           ★ 注意：夜景/暗调片**必须逐张看图复核**才能判黑边，别只信阈值。
"""
import os, sys, glob, warnings
from PIL import Image, ImageStat

warnings.filterwarnings("ignore")            # 大图会有 DecompressionBomb 警告，忽略
Image.MAX_IMAGE_PIXELS = None                # 中画幅原片动辄 100MP，取消像素上限

_argv = sys.argv[1:]
ORDER = []
if "--order" in _argv:
    _i = _argv.index("--order")
    if _i + 1 < len(_argv):
        ORDER = [x.strip() for x in _argv[_i + 1].split(",") if x.strip()]
        del _argv[_i:_i + 2]

_args = [a for a in _argv if not a.startswith("--")]
_flags = {a for a in _argv if a.startswith("--")}
# 默认不裁。--no-crop 仍接受（老命令兼容），但已是默认行为。
CROP_BORDER = bool(_flags & {"--crop", "--trim"})
KEEP_BORDER = not CROP_BORDER

SRC = _args[0]
OUT = _args[1]
LONG_FULL, Q_FULL = 2560, 88
LONG_TH, Q_TH = 900, 82
THR_MEAN, THR_STD, MAXFRAC = 22, 14, 0.32


def border_crop(im):
    """返回 (crop_box, (l,t,r,b)) —— 只裁「又黑又均匀」的边，不碰案天空"""
    g = im.convert("L")
    w, h = g.size

    def black_row(y):
        s = ImageStat.Stat(g.crop((0, y, w, y + 1)))
        return s.mean[0] < THR_MEAN and s.stddev[0] < THR_STD

    def black_col(x):
        s = ImageStat.Stat(g.crop((x, 0, x + 1, h)))
        return s.mean[0] < THR_MEAN and s.stddev[0] < THR_STD

    t = 0
    while t < h * MAXFRAC and black_row(t):
        t += 1
    b = 0
    while b < h * MAXFRAC and black_row(h - 1 - b):
        b += 1
    l = 0
    while l < w * MAXFRAC and black_col(l):
        l += 1
    r = 0
    while r < w * MAXFRAC and black_col(w - 1 - r):
        r += 1
    return (l, t, w - r, h - b), (l, t, r, b)


def resize(im, long_edge):
    w, h = im.size
    if max(w, h) <= long_edge:
        return im
    k = long_edge / max(w, h)
    return im.resize((round(w * k), round(h * k)), Image.LANCZOS)


files = sorted({f for f in glob.glob(os.path.join(SRC, "*")) 
                if f.lower().endswith((".jpg", ".jpeg", ".tif", ".tiff"))},
               key=lambda p: os.path.basename(p).lower())

# --order：列出的按给定顺序排前，其余按文件名跟在后面
if ORDER:
    _by = {os.path.basename(f): f for f in files}
    _head = [_by[n] for n in ORDER if n in _by]
    _miss = [n for n in ORDER if n not in _by]
    if _miss:
        print("⚠ --order 里有找不到的文件：%s" % ", ".join(_miss))
    _seen = {os.path.basename(f) for f in _head}
    files = _head + [f for f in files if os.path.basename(f) not in _seen]

th_dir = os.path.join(OUT, "th")
os.makedirs(th_dir, exist_ok=True)

print(f"{'序号':<5}{'源文件':<22}{'原尺寸':<12}{'裁黑边(左 上 右 下)':<22}{'大图':<12}{'大图KB':>8}{'缩图KB':>8}")
print("-" * 100)
for i, f in enumerate(files, 1):
    im = Image.open(f)
    if im.mode != "RGB":
        im = im.convert("RGB")
    ow, oh = im.size
    if KEEP_BORDER:
        cut = (0, 0, 0, 0)
        cut_note = "不裁（默认）"
    else:
        box, cut = border_crop(im)
        if sum(cut) > 4:
            im = im.crop(box)
        cut_note = f"{cut[0]} {cut[1]} {cut[2]} {cut[3]}"
    full = resize(im, LONG_FULL)
    thumb = resize(im, LONG_TH)
    n = f"{i:02d}"
    p_full = os.path.join(OUT, n + ".jpg")
    p_th = os.path.join(th_dir, n + ".jpg")
    full.save(p_full, "JPEG", quality=Q_FULL, optimize=True, progressive=True, subsampling=1)
    thumb.save(p_th, "JPEG", quality=Q_TH, optimize=True, progressive=True)
    print(f"{n:<5}{os.path.basename(f):<22}{f'{ow}x{oh}':<12}"
          f"{cut_note:<22}"
          f"{f'{full.size[0]}x{full.size[1]}':<12}"
          f"{os.path.getsize(p_full)/1024:>8.0f}{os.path.getsize(p_th)/1024:>8.0f}")
print(f"\n共 {len(files)} 张 → {OUT}" + ("   [未裁任何边]" if KEEP_BORDER else ""))
