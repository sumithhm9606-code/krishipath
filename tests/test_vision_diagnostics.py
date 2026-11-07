import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import cv2, numpy as np, base64
from app import app, detect_human_in_image, analyze_plant_disease

def test_human_face_and_skin_detection():
    # 1. Image with synthetic skin tone
    img_skin = np.full((300, 300, 3), (120, 160, 210), dtype=np.uint8) # BGR skin
    _, buf = cv2.imencode('.jpg', img_skin)
    skin_b64 = base64.b64encode(buf).decode()

    assert detect_human_in_image(skin_b64) is True

    client = app.test_client()
    res = client.post("/api/crop-health", json={"image_b64": skin_b64, "crop_name": "auto"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["is_human"] is True
    assert "Human Detected" in data["message"]

def test_diseased_leaf_tomato_yellowing():
    # Leaf with green foliage and high yellowing chlorosis (e.g., Tomato Leaf Curl)
    img_leaf = np.full((300, 300, 3), (35, 140, 45), dtype=np.uint8)
    # Add significant yellow chlorosis
    cv2.circle(img_leaf, (150, 150), 90, (20, 190, 220), -1)
    _, buf = cv2.imencode('.jpg', img_leaf)
    leaf_b64 = base64.b64encode(buf).decode()

    assert detect_human_in_image(leaf_b64) is False

    client = app.test_client()
    res = client.post("/api/crop-health", json={"image_b64": leaf_b64, "crop_name": "Tomato"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["is_human"] is False
    assert data["crop"] == "Tomato"
    assert "analysis" in data
    assert len(data["analysis"]["disease"]) > 0
    assert len(data["analysis"]["treatment_chemical"]) > 0
    assert len(data["analysis"]["treatment_organic"]) > 0

def test_diseased_leaf_paddy_blast():
    # Leaf with elongated necrotic blast lesions
    img_paddy = np.full((300, 300, 3), (35, 150, 40), dtype=np.uint8)
    # Add elongated spindle lesions
    cv2.ellipse(img_paddy, (100, 80), (45, 15), 30, 0, 360, (15, 60, 90), -1)
    cv2.ellipse(img_paddy, (200, 200), (50, 16), 45, 0, 360, (15, 60, 90), -1)
    _, buf = cv2.imencode('.jpg', img_paddy)
    paddy_b64 = base64.b64encode(buf).decode()

    assert detect_human_in_image(paddy_b64) is False

    client = app.test_client()
    res = client.post("/api/crop-health", json={"image_b64": paddy_b64, "crop_name": "Paddy"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["is_human"] is False
    assert data["crop"] == "Paddy"
    assert "Blast" in data["analysis"]["disease"] or "Spot" in data["analysis"]["disease"]

def test_auto_detect_crop_mode():
    img_leaf = np.full((300, 300, 3), (35, 140, 45), dtype=np.uint8)
    cv2.circle(img_leaf, (150, 150), 70, (20, 190, 220), -1)
    _, buf = cv2.imencode('.jpg', img_leaf)
    leaf_b64 = base64.b64encode(buf).decode()

    client = app.test_client()
    # User sends auto
    res = client.post("/api/crop-health", json={"image_b64": leaf_b64, "crop_name": "auto"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["is_human"] is False
    assert "analysis" in data

