import requests
from io import BytesIO
from PIL import Image, ImageDraw

# Create a realistic meal image
img = Image.new('RGB', (500, 400), color=(240, 235, 230))
draw = ImageDraw.Draw(img)

# Rice area
draw.rectangle([50, 50, 250, 200], fill=(200, 160, 80))
draw.text((100, 100), 'RICE', fill=(100, 80, 40))

# Vegetables  
draw.rectangle([280, 50, 450, 200], fill=(100, 150, 50))
draw.text((320, 100), 'VEGGIES', fill=(50, 100, 20))

# Dal
draw.rectangle([50, 230, 200, 350], fill=(180, 100, 40))
draw.text((80, 280), 'DAL', fill=(100, 50, 20))

img_bytes = BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

files = {'image': ('meal.jpg', img_bytes, 'image/jpeg')}
response = requests.post('http://localhost:5000/api/meals/analyze', files=files)

print('Status:', response.status_code)
data = response.json()
print('Success:', data.get('success'))

if data.get('analysis'):
    analysis = data['analysis']
    foods = analysis.get('foods_detected', [])
    print('Foods detected:', foods[0][:100] if foods else 'None')
    
    gaps = analysis.get('nutrient_gaps', [])
    print('Nutrient gaps:', ', '.join(gaps[:2]))
    
    recs = analysis.get('recommendations', [])
    print('Recommendation:', recs[0][:80] if recs else 'None')
    
    print('\n✓ Meal API is working correctly!')
else:
    print('Error:', data.get('error'))
