import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json(filename: str):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)

menus = load_json("menu_data.json")
set_options = load_json("set_options.json")
promotions = load_json("promotions.json")
coupons = load_json("coupons.json")
