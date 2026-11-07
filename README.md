# KRISHIPATH

A step-by-step, bilingual (English / Kannada) farming guide for Karnataka: pick a crop, add land details, get a roadmap,
resource and cost estimates, a 5-day indicative price outlook, crop-health guidance and a farmer community.

## Run
```
pip install -r requirements.txt
python app.py            # open http://127.0.0.1:5000
pytest                   # run the tests
```
Optional environment variables: `PORT`, `ADMIN_KEY` (needed to remove a farmer from the community; change the default), `KRISHIPATH_DB`.

## Structure
- `app.py` Flask backend: input validation, plan engine (plants, water, fertilizer, labour, cost), market model, SQLite community and feedback.
- `data/crops.csv` 57 Karnataka crops. `stages.json` roadmap stages. `health.json` crop-health guide. `districts.json` 31 districts.
- `static/` frontend (HTML, CSS, JavaScript, `i18n.json`).
- `tests/test_calc.py` calculation, market and API tests.

## API
`GET /api/crops` · `GET /api/meta` · `POST /api/plan` · `GET|POST /api/farmers` · `DELETE /api/farmers/<id>` (admin key) · `POST /api/feedback`

## Limitations (please read)
- Crop values in `data/crops.csv` are indicative, typical-range figures. Verify them with your KVK, agriculture university or officer and a soil test, and record sources before relying on them. Edit the CSV to update them.
- The market outlook is a transparent rule-based indicator (farmer share, harvest-glut month, weather), not a price guarantee. "Today" is the price the user enters or a typical reference value, not a live mandi rate.
- Farmer share is entered by the user; it is not verified data. Transport, storage, quality, demand, imports and policy are not modelled.
- Disease guidance is a possible-issue guide, not a diagnosis. No pesticide doses are given.
- Community phone numbers are stored only with the farmer's consent; protect the database file and set `ADMIN_KEY`.
