import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from PIL import Image
import io, base64
import json

from app import app, detect_human_in_image

def test_human_detection():
    client = app.test_client()
    im_skin = Image.new("RGB", (100, 100), color=(210, 160, 130))
    buf = io.BytesIO()
    im_skin.save(buf, format="JPEG")
    skin_b64 = base64.b64encode(buf.getvalue()).decode()

    assert detect_human_in_image(skin_b64) is True

    res = client.post("/api/crop-health", json={"image_b64": skin_b64, "crop_name": "Paddy"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["is_human"] is True
    assert "Human Detected" in data["message"]

def test_crop_disease_fallback():
    client = app.test_client()
    im_plant = Image.new("RGB", (100, 100), color=(34, 139, 34))
    buf = io.BytesIO()
    im_plant.save(buf, format="JPEG")
    plant_b64 = base64.b64encode(buf.getvalue()).decode()

    assert detect_human_in_image(plant_b64) is False

    res_plant = client.post("/api/crop-health", json={"image_b64": plant_b64, "crop_name": "Paddy"})
    assert res_plant.status_code == 200
    data_plant = res_plant.get_json()
    assert data_plant["is_human"] is False
    assert "analysis" in data_plant
    assert "treatment_chemical" in data_plant["analysis"]
    assert "treatment_organic" in data_plant["analysis"]
