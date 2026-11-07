# -*- coding: utf-8 -*-
import os
import json
import urllib.request
import urllib.parse
import time

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static', 'diseases')
os.makedirs(STATIC_DIR, exist_ok=True)

# Direct Wikimedia Commons titles mapped to destination filenames
COMMONS_MAPPING = {
    # Tomato (only Tomato gets these!)
    'tomato_1.jpg': 'File:Alternaria solani - leaf lesions.jpg',
    'tomato_2.jpg': 'File:Tomato with Phytophthora infestans (late blight).jpg',

    # Potato (real potato foliage!)
    'potato_1.jpg': 'File:Late blight on potato leaf 2.jpg',
    'potato_2.jpg': 'File:American Journal of Botany Volume IV Plate XIX Elliott Alternaria and Macrosporium N540 w1150.jpg',

    # Sugarcane
    'sugarcane_2.jpg': 'File:Sugar cane smut.jpg',

    # Chilli
    'chilli_1.jpg': 'File:Pepper Disease in Tropical Bonakanda.jpg',
    'chilli_2.jpg': 'File:Yellow curl leaf disease Pj IMG 3162.jpg',

    # Groundnut
    'groundnut_1.jpg': 'File:Leaf spot symptoms (10.3897-mycokeys.81.67850) Figure 14.jpg',
    'groundnut_2.jpg': 'File:Puccinia arachidis2.jpg',

    # Cabbage
    'cabbage_1.jpg': 'File:Black rot of cabbage symptoms.jpg',
    'cabbage_2.jpg': 'File:Knolvoet bij bloemkool (Plasmodiophora brassicae on cauliflower).jpg',

    # Cauliflower
    'cauliflower_1.jpg': 'File:Knolvoet bij bloemkool (Plasmodiophora brassicae on cauliflower).jpg',

    # Mango
    'mango_1.jpg': 'File:Mango anthracnose 1a (cropped).jpg',
    'mango_2.jpg': 'File:Mango powdery mildew flowers 2.jpg',

    # Grapes
    'grapes_1.jpg': 'File:Plasmopara viticola 305150885.jpg',
    'grapes_2.jpg': 'File:Oidium or powdery mildew of the vine (1907) (14592187267).jpg',

    # Wheat
    'wheat_1.jpg': 'File:Wheat leaf rust on wheat.jpg',

    # Turmeric
    'turmeric_1.jpg': 'File:Curcuma longa roots.jpg',

    # Ginger
    'ginger_1.jpg': 'File:Ginger (Zingiber officinale).jpg',

    # Coffee
    'coffee_1.jpg': 'File:Hemileia vastatrix.jpg'
}

def resolve_and_download(title, dest_name):
    dest_path = os.path.join(STATIC_DIR, dest_name)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'KrishiPathPlant/4.0 (contact@krishipath.org)'})
    try:
        data = json.loads(urllib.request.urlopen(req, timeout=8).read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for _, p in pages.items():
            if 'imageinfo' in p and len(p['imageinfo']) > 0:
                direct_url = p['imageinfo'][0]['url']
                img_req = urllib.request.Request(direct_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KrishiPath/4.0'})
                with urllib.request.urlopen(img_req, timeout=12) as resp, open(dest_path, 'wb') as f:
                    f.write(resp.read())
                print(f"Downloaded {dest_name} ({title}) -> {os.path.getsize(dest_path)} bytes")
                return True
    except Exception as e:
        print(f"Failed {dest_name} ({title}): {e}")
    return False

for dest_name, title in COMMONS_MAPPING.items():
    resolve_and_download(title, dest_name)
    time.sleep(1.2)

print("Done downloading verified crop images!")

