import os, sys, tempfile
from datetime import date
os.environ["KRISHIPATH_DB"] = os.path.join(tempfile.mkdtemp(), "t.db")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app as A

PR = {"wage": 450, "urea": 270, "ssp": 600, "mop": 1700, "price": 1500}
tomato = next(c for c in A.CROPS if c["en"] == "Tomato")
paddy = next(c for c in A.CROPS if c["en"] == "Paddy")

def test_plant_count_matches_manual():  # 1 acre x 0.9 usable / (0.9 x 0.45 m) = 8993
    assert A.estimate(tomato, 1, PR)["plants"] == 8993

def test_scales_with_acres():
    assert A.estimate(paddy, 2, PR)["labour_days"] == 2 * A.estimate(paddy, 1, PR)["labour_days"]

def test_cost_is_quantity_times_price():
    e = A.estimate(paddy, 1, PR)
    assert abs(e["cost_labour"] - paddy["labour"] * 450) < 1e-6

def test_more_farmers_means_more_pressure():
    h = date(2026, 11, 15)
    lo, hi = A.market(paddy, 10, 0, h, 2300)["score"], A.market(paddy, 90, 0, h, 2300)["score"]
    assert hi > lo

def test_bad_weather_eases_pressure():
    h = date(2026, 11, 15)
    assert A.market(paddy, 50, 1, h, 2300)["score"] < A.market(paddy, 50, 0, h, 2300)["score"]

def test_forecast_has_six_points():
    assert len(A.market(paddy, 50, 0, date(2026, 11, 15), 2300)["points"]) == 6

def test_api_validation_and_plan():
    c = A.app.test_client()
    body = {"crop": 0, "acres": 0, "sow": "2026-11-10", "district": "Hassan"}
    assert c.post("/api/plan", json=body).status_code == 400          # zero acres rejected
    assert c.post("/api/plan", json={**body, "acres": 1, "crop": 999}).status_code == 400  # unsupported crop
    r = c.post("/api/plan", json={**body, "acres": 1.5})
    assert r.status_code == 200 and len(r.get_json()["roadmap"]) == 8

def test_farmers_flow():
    c = A.app.test_client()
    f = {"name": "Test Farmer", "phone": "9876543210", "district": "Hassan", "crop": "Ragi", "years": 5, "consent": True}
    assert c.post("/api/farmers", json={**f, "consent": False}).status_code == 400
    assert c.post("/api/farmers", json={**f, "phone": "123"}).status_code == 400
    assert c.post("/api/farmers", json=f).status_code == 201
    assert c.post("/api/farmers", json=f).status_code == 409
    fid = c.get("/api/farmers?district=Hassan").get_json()[0]["id"]
    assert c.delete(f"/api/farmers/{fid}").status_code == 403
    assert c.delete(f"/api/farmers/{fid}", headers={"X-Admin-Key": A.ADMIN_KEY}).status_code == 200
