"""读取照片的 EXIF 器材信息 —— 用法:
   python _exif.py <文件夹或文件...>
输出每张的: 文件名 / 尺寸 / 体积 / 相机 / 镜头 / 焦距 / 光圈 / 快门 / ISO
胶片扫描件没有 EXIF 会显示「无 EXIF」，需要用户口述。
"""
import os, sys, glob
from PIL import Image, ExifTags

TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def fmt_shutter(v):
    try:
        v = float(v)
        return f"1/{round(1/v)}s" if v and v < 1 else f"{v}s"
    except Exception:
        return str(v)


def read_one(path):
    size_kb = os.path.getsize(path) / 1024
    try:
        im = Image.open(path)
        w, h = im.size
    except Exception as e:
        print(f"{os.path.basename(path):32s} 打不开: {e}")
        return
    info = {"size": f"{w}x{h}", "kb": f"{size_kb:.0f}KB"}
    exif = {}
    try:
        raw = im.getexif()
        exif = {TAGS.get(k, k): v for k, v in raw.items()}
        # 镜头等常在 ExifIFD 子表里
        sub = raw.get_ifd(0x8769) if hasattr(raw, "get_ifd") else {}
        for k, v in (sub or {}).items():
            exif[TAGS.get(k, k)] = v
    except Exception:
        pass

    def get(*names):
        for n in names:
            if exif.get(n) not in (None, ""):
                return str(exif[n])
        return ""

    model = get("Model")
    make = get("Make")
    if make and model and not model.lower().startswith(make.split()[0].lower()):
        model = f"{make} {model}"
    lens = get("LensModel", "LensMake", "LensSpecification")
    fl = get("FocalLength")
    fn = get("FNumber")
    et = get("ExposureTime")
    iso = get("ISOSpeedRatings", "PhotographicSensitivity")
    date = get("DateTimeOriginal", "DateTime")
    parts = [p for p in [model, lens,
                         f"{fl}mm" if fl else "",
                         f"f/{fn}" if fn else "",
                         fmt_shutter(et) if et else "",
                         f"ISO{iso}" if iso else ""] if p]
    print(f"{os.path.basename(path):34s} {info['size']:>12s} {info['kb']:>8s}  "
          f"{' · '.join(parts) if parts else '无 EXIF'}"
          + (f"   [{date}]" if date else ""))


def main(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            for ext in ("*.jpg", "*.jpeg", "*.JPG", "*.JPEG", "*.tif", "*.tiff", "*.png"):
                files += glob.glob(os.path.join(p, "**", ext), recursive=True)
        else:
            files.append(p)
    files = sorted(set(files))
    if not files:
        print("没找到图片")
        return
    print(f"共 {len(files)} 个文件\n" + "-" * 100)
    for f in files:
        read_one(f)


if __name__ == "__main__":
    main(sys.argv[1:] or ["."])
