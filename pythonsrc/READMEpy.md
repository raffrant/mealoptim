# 🍝 MealOptim — Recipe Cost Optimizer

A Streamlit app that scrapes **real, live prices** from Greek supermarkets and finds the cheapest way to cook any recipe — either by shopping at one store or mixing across stores for maximum savings.

---

## What it does

Paste a list of ingredients and the app will:

1. **Parse** quantities, units, and ingredient names using regex + fuzzy matching
2. **Scrape** live prices from Sklavenitis, AB Vassilopoulos, and Xalkiadakis via Selenium
3. **Optimize** with two strategies:
   - **Mixed** — buy each item from whichever store is cheapest (lowest possible total)
   - **Single store** — buy everything from one store (most convenient)
4. **Display** a side-by-side comparison, item-by-item breakdown, and an exportable shopping list

If live scraping fails (e.g. the site changed its HTML or the driver isn't available), the app automatically falls back to realistic mock prices so you can still see the full UI flow.

---

## Supported Supermarkets

| Store | Country | URL scraped |
|---|---|---|
| Sklavenitis | Greece 🇬🇷 | sklavenitis.gr |
| AB Vassilopoulos | Greece 🇬🇷 | ab.gr |
| Xalkiadakis | Greece 🇬🇷 | xalkiadakis.gr |

> Lidl GR is stubbed in the code and not yet active — see [Known Issues](#known-issues).

---

## Prerequisites

- **Python** 3.9 or newer
- **Google Chrome** installed (the `GroceryScraper` class uses ChromeDriver)
  - The standalone `scrape_all_supermarkets()` function uses **Microsoft Edge** instead — make sure Edge is installed if you call that function directly
- An internet connection (for live scraping)

> **GPU (optional):** If you have an NVIDIA GPU with CUDA, install `cupy` and the optimizer will automatically use it for matrix operations. Without it, NumPy is used — no action needed.

---

## Installation

### 1 — Clone or copy the file

```bash
git clone <your-repo-url>
cd <your-repo>
```

Or just place `recipeoptimizer.py` in a folder of your choice.

### 2 — Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3 — Install dependencies

```bash
pip install streamlit pandas numpy selenium webdriver-manager beautifulsoup4 requests fuzzywuzzy python-Levenshtein
```

Full dependency list:

| Package | Purpose |
|---|---|
| `streamlit` | Web UI framework |
| `pandas` | DataFrames for results tables |
| `numpy` | Price matrix math and optimization |
| `selenium` | Browser automation for scraping |
| `webdriver-manager` | Auto-downloads the correct ChromeDriver / EdgeDriver |
| `beautifulsoup4` | HTML parsing after Selenium renders the page |
| `requests` | HTTP utility (imported, available for future use) |
| `fuzzywuzzy` | Fuzzy ingredient name matching |
| `python-Levenshtein` | Speeds up fuzzywuzzy (optional but recommended) |
| `cupy` *(optional)* | GPU-accelerated NumPy replacement |

---

## Running the app

```bash
streamlit run recipeoptimizer.py
```

Streamlit will print:

```
  You can now view your Streamlit app in your browser.
  Local URL:  http://localhost:8501
```

Open `http://localhost:8501` in your browser.

---

## How to use

1. **Choose an input method** in the left sidebar:
   - **Example Recipe** — pre-fills a Carbonara ingredient list so you can test immediately
   - **Text** — type your own recipe name and ingredients

2. **Enter ingredients** one per line or comma-separated. Supported formats:
   ```
   4 eggs
   200g pasta
   2 tbsp olive oil
   1 cup milk
   100g parmesan cheese
   ```

3. **Click "🔍 Find Best Prices"** — the app will:
   - Parse and display your ingredient list
   - Scrape each supermarket in sequence (progress bar shown)
   - Run the cost optimizer
   - Display results

4. **Read the results:**
   - **Metrics row** — Mixed total, Single-store total, Savings, Best Store
   - **Best Deal box** — highlighted winner
   - **Store comparison table** — total cost, items found, average per item
   - **Item breakdown** — which store is cheapest for each ingredient

5. **Export** — click "📋 Generate Shopping List" to get a plain-text checklist grouped by store.

---

## Project structure

```
recipeoptimizer.py          ← the entire app (single file)
```

Internally the file is divided into clear sections:

```
LOGGING SETUP
DATA MODELS          Ingredient, PriceData, RecipeResult dataclasses
STREAMLIT CONFIG     Page config + custom CSS
INGREDIENT PARSER    IngredientParser class — regex + fuzzy matching
WEB SCRAPER          GroceryScraper class — Selenium + BeautifulSoup
COST OPTIMIZER       CostOptimizer class — NumPy / CuPy matrix math
STREAMLIT UI         main() function — all layout and interactivity
```

---

## Architecture

```
User input (text)
      │
      ▼
IngredientParser.parse_ingredients()
  - Regex extracts quantity + unit + name
  - fuzzywuzzy matches name to ingredient database
      │
      ▼
GroceryScraper.scrape_ingredient()   ← cached with @st.cache_data
  - Headless Chrome via Selenium
  - BeautifulSoup parses rendered HTML
  - Falls back to mock prices if scraping fails
      │
      ▼
CostOptimizer.optimize()
  - Builds price matrix (ingredients × stores)
  - Mixed strategy:  min across stores per row
  - Single strategy: sum across items per column
  - GPU-accelerated if CuPy is available
      │
      ▼
Streamlit results display + shopping list export
```

---

## Known Issues

| Issue | Details |
|---|---|
| **Lidl not active** | Lidl GR URL is commented out in `SUPERMARKETS` dict — selector not yet confirmed |
| **Edge vs Chrome mismatch** | `scrape_all_supermarkets()` uses Edge; `GroceryScraper` uses Chrome — pick one and standardise |
| **Scraping fragility** | If a supermarket updates its HTML structure, the CSS selectors will break and mock data will be used instead |
| **No rate limiting / retries** | Heavy use may trigger bot protection on supermarket sites |
| **`st.set_page_config` placement** | The config call sits after the standalone scraper function — it must be the first Streamlit call executed to avoid warnings |
| **No `.env` / secrets file** | No API keys needed currently, but adding one for a future Claude integration would need `python-dotenv` or Streamlit secrets |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `WebDriverException: Chrome not found` | Install Google Chrome and make sure it's on your PATH |
| `ModuleNotFoundError: No module named 'fuzzywuzzy'` | Run `pip install fuzzywuzzy python-Levenshtein` |
| All prices show as mock data | Supermarket sites may have changed their HTML — check the CSS selectors in `GroceryScraper` |
| `streamlit: command not found` | Run `pip install streamlit` or activate your virtual environment |
| App crashes on `st.set_page_config` | Make sure no other Streamlit command runs before it at module level |
| Slow scraping | Each ingredient hits 3 sites sequentially — normal. Results are cached after the first run |

---

## License

MIT — modify and use freely.
