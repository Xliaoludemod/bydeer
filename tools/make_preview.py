"""为一套照片生成小预览（长边 1000、q80），输出到 _incoming/preview*/ """
import os, sys, glob
from PIL import Image

src = sys.argv[1]
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

files = []
for ext in ("*.jpg", "*.jpeg", "*.tif", "*.tiff"):
    files += glob.glob(os.path.join(src, ext))
# Windows 文件系统大小写不敏感 → 去重（否则 *.jpg 与 *.JPG 会各匹配一遍）
files = sorted({f for f in files}, key=lambda p: os.path.basename(p).lower())

for i, f in enumerate(files, 1):
    try:
        im = Image.open(f)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        w, h = im.size
        k = 1000 / max(w, h)
        if k < 1:
            im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
        name = f"{i:02d}.jpg"
        im.save(os.path.join(out, name), "JPEG", quality=80, optimize=True)
        print(f"{name}  ←  {os.path.basename(f)}   {w}x{h} {'竖' if h > w else '横'}")
    except Exception as e:
        print(f"!! {os.path.basename(f)}: {e}")

print(f"\n共 {len(files)} 张，预览写到 {out}")
