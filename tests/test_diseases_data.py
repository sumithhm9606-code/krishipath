import json, os

def test_all_57_crop_diseases():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'crop_diseases.json')
    with open(path, 'r', encoding='utf-8') as f:
        diseases = json.load(f)

    assert len(diseases) >= 57, f"Expected 57 crops, got {len(diseases)}"
    for crop, dlist in diseases.items():
        assert len(dlist) >= 2, f"Crop {crop} has fewer than 2 diseases"
        for d in dlist:
            assert 'name' in d and len(d['name']) > 0, f"{crop} missing name"
            assert 'name_kn' in d and len(d['name_kn']) > 0, f"{crop} missing name_kn"
            assert 'symptoms' in d and len(d['symptoms']) > 0, f"{crop} missing symptoms"
            assert 'treatment_chemical' in d and len(d['treatment_chemical']) > 0, f"{crop} missing chemical treatment"
            assert 'treatment_organic' in d and len(d['treatment_organic']) > 0, f"{crop} missing organic treatment"

