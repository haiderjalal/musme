from __future__ import annotations

from pathlib import Path
from shutil import copy2

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "images" / "musme-logo.PNG"
KIT = ROOT / "brand-kit" / "Musme_Brand_Kit_v1.0"


def cleaned_mark() -> Image.Image:
    image = Image.open(SOURCE).convert("RGBA")
    alpha = image.getchannel("A")
    threshold = alpha.point(lambda value: 255 if value >= 16 else 0)
    bbox = threshold.getbbox()
    if bbox is None:
        raise ValueError("Logo source contains no visible pixels")

    left, top, right, bottom = bbox
    padding = 24
    crop_box = (
        max(0, left - padding),
        max(0, top - padding),
        min(image.width, right + padding),
        min(image.height, bottom + padding),
    )
    return image.crop(crop_box)


def contain(mark: Image.Image, size: int, padding_ratio: float = 0.14) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    maximum = int(size * (1 - padding_ratio * 2))
    scale = min(maximum / mark.width, maximum / mark.height)
    resized = mark.resize(
        (max(1, round(mark.width * scale)), max(1, round(mark.height * scale))),
        Image.Resampling.LANCZOS,
    )
    position = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.alpha_composite(resized, position)
    return canvas


def build() -> None:
    mark = cleaned_mark()
    master_dir = KIT / "01_MASTER_LOGOS" / "PNG"
    mark_dir = KIT / "02_BRAND_MARK_AND_ICONS" / "Mark"
    favicon_dir = KIT / "02_BRAND_MARK_AND_ICONS" / "Favicon"
    app_dir = KIT / "02_BRAND_MARK_AND_ICONS" / "App_Social_Icons"
    preview_dir = KIT / "05_PREVIEWS" / "Reverse_On_Dark"

    for directory in (master_dir, mark_dir, favicon_dir, app_dir, preview_dir):
        directory.mkdir(parents=True, exist_ok=True)

    copy2(SOURCE, master_dir / "Musme_Logo_Approved_Raster_Master.png")
    mark.save(mark_dir / "Musme_Mark_Transparent.png", optimize=True)

    public_mark = mark.copy()
    public_mark.thumbnail((720, 520), Image.Resampling.LANCZOS)
    public_mark.save(ROOT / "public" / "images" / "musme-logo-mark.png", optimize=True)

    icon_32 = contain(mark, 32, 0.1)
    icon_32.save(favicon_dir / "Musme_Favicon_32.png", optimize=True)
    icon_192 = contain(mark, 192)
    icon_192.save(app_dir / "Musme_App_Icon_192.png", optimize=True)
    icon_512 = contain(mark, 512)
    icon_512.save(app_dir / "Musme_App_Icon_512.png", optimize=True)

    icon_512.save(ROOT / "app" / "icon.png", optimize=True)
    contain(mark, 180).save(ROOT / "app" / "apple-icon.png", optimize=True)
    icon_32.save(
        ROOT / "app" / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32)],
    )

    preview = Image.new("RGB", (1600, 900), "#0D0F0C")
    preview_mark = mark.copy()
    preview_mark.thumbnail((980, 620), Image.Resampling.LANCZOS)
    position = (
        (preview.width - preview_mark.width) // 2,
        (preview.height - preview_mark.height) // 2,
    )
    preview.paste(preview_mark, position, preview_mark)
    preview.save(preview_dir / "Musme_Mark_On_Dark.png", quality=94)

    overview = Image.new("RGB", (1600, 900), "#F2F5F1")
    draw = ImageDraw.Draw(overview)
    swatches = [
        ("#6BEFBC", (74, 100, 520, 800)),
        ("#2EAE84", (540, 100, 986, 800)),
        ("#0D0F0C", (1006, 100, 1526, 800)),
    ]
    for color, rect in swatches:
        draw.rounded_rectangle(rect, radius=28, fill=color)
    overview.save(KIT / "05_PREVIEWS" / "Musme_Palette_Overview.png", quality=94)


if __name__ == "__main__":
    build()
