import requests
from io import BytesIO
from PIL import Image, ImageDraw

# Create a simple meal image
img = Image.new('RGB', (600, 400), color=(240, 235, 230))
draw = ImageDraw.Draw(img)

# Rice area
draw.rectangle([20, 20, 250, 200], fill=(200, 160, 80))
draw.text((80, 100), 'RICE', fill=(100, 80, 40))

# Vegetables  
draw.rectangle([280, 20, 450, 200], fill=(100, 150, 50))
draw.text((320, 100), 'GREENS', fill=(50, 100, 20))

img_bytes = BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

files = {'image': ('meal.jpg', img_bytes, 'image/jpeg')}

try:
    response = requests.post('http://localhost:5000/api/meals/analyze', files=files, timeout=60)
    print('Status:', response.status_code)
    print('Response:', response.text[:500])
except Exception as e:
    print('Error:', str(e)[:500])
