import os
import json
import urllib.request
import urllib.parse
import re

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static', 'diseases')
os.makedirs(STATIC_DIR, exist_ok=True)

# Wikimedia search helper
def fetch_commons_image_url(query):
    try:
        url = f'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&srlimit=5&format=json'
        req = urllib.request.Request(url, headers={'User-Agent': 'KrishiPathApp/1.0 (contact@krishipath.org)'})
        data = json.loads(urllib.request.urlopen(req, timeout=6).read().decode('utf-8'))
        for item in data.get('query', {}).get('search', []):
            t = item['title']
            if any(t.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png']) and not any(bad in t.lower() for bad in ['icon', 'logo', 'map', 'diagram', 'graph', 'stamp', 'specimen_label']):
                u_url = f'https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(t)}&prop=imageinfo&iiprop=url&format=json'
                u_req = urllib.request.Request(u_url, headers={'User-Agent': 'KrishiPathApp/1.0 (contact@krishipath.org)'})
                u_data = json.loads(urllib.request.urlopen(u_req, timeout=6).read().decode('utf-8'))
                for k, v in u_data.get('query', {}).get('pages', {}).items():
                    if 'imageinfo' in v and len(v['imageinfo']) > 0:
                        return v['imageinfo'][0]['url']
    except Exception as e:
        pass
    return None

def download_file(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 2000:
        return True
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KrishiPath/1.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp, open(target_path, 'wb') as f:
            f.write(resp.read())
        return os.path.exists(target_path) and os.path.getsize(target_path) > 2000
    except Exception:
        return False

print('Helper definitions ready.')

