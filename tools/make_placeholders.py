# 生成占位图：在 photos/ 下按 data.js 里的路径造灰底编号图
import os, sys
from PIL import Image, ImageDraw

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PLACEHOLDERS = [
    ("银盐·胶片/海边的人", ["01", "02"], (2000, 1250)),
    ("银盐·胶片/夜班公交", ["01"], (1250, 2000)),          # 竖图，测试模糊填充
    ("像素·数码/阳台植物志", ["01"], (2000, 1250)),
    ("动态·影像/城市切片", ["01"], (2000, 1250)),
]

def make(folder, names, size):
    d = os.path.join(BASE, "photos", folder)
    os.makedirs(d, exist_ok=True)
    for n in names:
        p = os.path.join(d, f"{n}.jpg")
        if os.path.exists(p):
            continue
        img = Image.new("RGB", size, (190, 187, 178))
        dr = ImageDraw.Draw(img)
        dr.rectangle([0, size[1]//2 - 2, size[0], size[1]//2 + 2], fill=(160, 157, 148))
        dr.text((60, 60), f"{folder} / {n}", fill=(90, 88, 82))
        img.save(p, quality=85)
        print("ok:", p)

for f, ns, sz in PLACEHOLDERS:
    make(f, ns, sz)
print("done")
