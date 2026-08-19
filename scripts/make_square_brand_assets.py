from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/sports803tv-mobile/assets/images')
source = Image.open(root / 'icon.png').convert('RGBA')
size = max(source.width, source.height)
canvas = Image.new('RGBA', (size, size), (8, 12, 24, 255))
x = (size - source.width) // 2
y = (size - source.height) // 2
canvas.alpha_composite(source, (x, y))
for name in ('icon.png', 'android-icon-foreground.png', 'splash-icon.png', 'favicon.png'):
    canvas.save(root / name, format='PNG', optimize=True)
print(f'Wrote square brand assets at {size}x{size}')
