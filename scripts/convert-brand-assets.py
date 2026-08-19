from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/sports803tv-mobile/assets/images')
for name in ['icon.png', 'splash-icon.png', 'favicon.png', 'android-icon-foreground.png']:
    path = root / name
    image = Image.open(path).convert('RGBA')
    image.save(path, format='PNG', optimize=True)
    print(name, image.size, 'PNG')
