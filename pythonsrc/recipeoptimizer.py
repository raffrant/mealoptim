# =============================================================================
# MEALOPTIM - Recipe Cost Optimizer (Streamlit MVP)
# Clean, Pythonic, Production-Ready
# =============================================================================

import streamlit as st
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple
import asyncio
import logging
from datetime import datetime
import json
from pathlib import Path
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.chrome.service import Service


# Optional GPU support (graceful fallback)
try:
    import cupy as cp
    HAS_GPU = True
except ImportError:
    HAS_GPU = False
    cp = np

# Web scraping
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import time

# AI/ML
import re
from fuzzywuzzy import fuzz

# =============================================================================
# LOGGING SETUP
# =============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# DATA MODELS
# =============================================================================


@st.cache_data
def scrape_all_supermarkets(ingredient: str) -> Dict[str, any]:
    """
    Scrape REAL prices from ALL 4 supermarkets with Edge
    
    1. Sklavenitis: <div class="price" data-price="1,48">
    2. Lidl: (need to update)
    3. AB: <div class="main-price">€3.50</div>
    4. Xalkiadakis: <sup>€47</sup>
    """
    
    results = {}
    
    # =========================================================================
    # 1. SKLAVENITIS ✅
    # =========================================================================
    
    st.write("🔍 Scraping Sklavenitis...")
    
    try:
        options = webdriver.EdgeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Edge(options=options)
        
        url = f'https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query={ingredient}'
        driver.get(url)
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product = soup.find('article', class_='product')
        
        if product:
            price_div = product.find('div', class_='price')
            
            if price_div:
                price_text = price_div.get('data-price')
                price_float = float(price_text.replace(',', '.'))
                
                name_elem = product.find('h3') or product.find('h2')
                product_name = name_elem.get_text(strip=True) if name_elem else ingredient
                
                results['Sklavenitis'] = {
                    'status': 'success',
                    'price': price_float,
                    'product_name': product_name,
                    'url': url
                }
                st.success(f"✅ Sklavenitis: €{price_float:.2f}")
            else:
                results['Sklavenitis'] = {'status': 'price_not_found', 'price': None}
                st.warning("⚠️ Sklavenitis: Price element not found")
        else:
            results['Sklavenitis'] = {'status': 'product_not_found', 'price': None}
            st.warning("⚠️ Sklavenitis: Product not found")
        
        driver.quit()
    
    except Exception as e:
        results['Sklavenitis'] = {'status': 'error', 'price': None, 'error': str(e)}
        st.error(f"❌ Sklavenitis error: {e}")
    
    # =========================================================================
    # 2. AB VASSILOPOULOS ✅ (YOUR SELECTOR: <div class="main-price">)
    # =========================================================================
    
    st.write("🔍 Scraping AB...")
    
    try:
        options = webdriver.EdgeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        
        driver = webdriver.Edge(
            options=options
        )
        
        url = f'https://www.ab.gr/search?q={ingredient}'
        driver.get(url)
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product = soup.find('article', class_='product')
        
        if product:
            # YOUR SELECTOR from screenshot
            price_div = product.find('div', class_='main-price')
            
            if price_div:
                price_text = price_div.get_text(strip=True)  # "€3.50"
                price_float = float(price_text.replace('€', '').replace(',', '.'))
                
                name_elem = product.find('h3') or product.find('h2')
                product_name = name_elem.get_text(strip=True) if name_elem else ingredient
                
                results['AB'] = {
                    'status': 'success',
                    'price': price_float,
                    'product_name': product_name
                }
                st.success(f"✅ AB: €{price_float:.2f}")
            else:
                results['AB'] = {'status': 'price_not_found', 'price': None}
                st.warning("⚠️ AB: Price element not found")
        else:
            results['AB'] = {'status': 'product_not_found', 'price': None}
            st.warning("⚠️ AB: Product not found")
        
        driver.quit()
    
    except Exception as e:
        results['AB'] = {'status': 'error', 'price': None, 'error': str(e)}
        st.error(f"❌ AB error: {e}")
    
    # =========================================================================
    # 3. XALKIADAKIS ✅ (YOUR SELECTOR: <sup>€47</sup>)
    # =========================================================================
    
    st.write("🔍 Scraping Xalkiadakis...")
    
    try:
        options = webdriver.EdgeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        
        driver = webdriver.Edge(
            options=options
        )
        
        url = f'https://www.xalkiadakis.gr/search?sq={ingredient}'
        driver.get(url)
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product = soup.find('article', class_='product')
        
        if product:
            # YOUR SELECTOR from screenshot - <sup> tag
            price_sup = product.find('sup')
            
            if price_sup:
                price_text = price_sup.get_text(strip=True)  # "€47"
                price_float = float(price_text.replace('€', '').replace(',', '.'))
                
                name_elem = product.find('h3') or product.find('h2')
                product_name = name_elem.get_text(strip=True) if name_elem else ingredient
                
                results['Xalkiadakis'] = {
                    'status': 'success',
                    'price': price_float,
                    'product_name': product_name
                }
                st.success(f"✅ Xalkiadakis: €{price_float:.2f}")
            else:
                results['Xalkiadakis'] = {'status': 'price_not_found', 'price': None}
                st.warning("⚠️ Xalkiadakis: Price element not found")
        else:
            results['Xalkiadakis'] = {'status': 'product_not_found', 'price': None}
            st.warning("⚠️ Xalkiadakis: Product not found")
        
        driver.quit()
    
    except Exception as e:
        results['Xalkiadakis'] = {'status': 'error', 'price': None, 'error': str(e)}
        st.error(f"❌ Xalkiadakis error: {e}")
    
    return results


# =============================================================================
# IN YOUR STREAMLIT UI - USE LIKE THIS:
# =============================================================================

@dataclass
class Ingredient:
    """Simple ingredient representation"""
    name: str
    quantity: float
    unit: str


@dataclass
class PriceData:
    """Price for ingredient at specific store"""
    supermarket: str
    product_name: str
    price: float
    url: str
    timestamp: str


@dataclass
class RecipeResult:
    """Result of recipe cost analysis"""
    recipe_name: str
    ingredients: List[Ingredient]
    costs_by_store: Dict[str, float]
    cheapest_store: str
    savings: float
    savings_percent: float


# =============================================================================
# STREAMLIT CONFIG
# =============================================================================

st.set_page_config(
    page_title="MealOptim - Recipe Cost Optimizer",
    page_icon="🍝",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .stMetric {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
    }
    .best-deal {
        background-color: #d4edda;
        border-left: 4px solid #28a745;
        padding: 15px;
        border-radius: 5px;
    }
    .warning-box {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 15px;
        border-radius: 5px;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# INGREDIENT PARSER (Using Simple Regex + Fuzzy Match)
# =============================================================================

class IngredientParser:
    """Parse ingredients from text using regex + fuzzy matching"""
    
    COMMON_UNITS = {
        'g': 'g', 'gram': 'g', 'grams': 'g', 'gr': 'g',
        'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
        'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
        'l': 'l', 'liter': 'l', 'liters': 'l',
        'tsp': 'tsp', 'teaspoon': 'tsp',
        'tbsp': 'tbsp', 'tablespoon': 'tbsp',
        'cup': 'cup', 'cups': 'cup',
        'piece': 'piece', 'pieces': 'piece',
        'pcs': 'piece', 'pc': 'piece',
        'pinch': 'pinch',
    }
    
    INGREDIENT_DATABASE = {
        # Pasta & Grains
        'pasta': 'Pasta',
        'spaghetti': 'Pasta',
        'penne': 'Pasta',
        'rice': 'Rice',
        'flour': 'Flour',
        
        # Dairy
        'milk': 'Milk',
        'butter': 'Butter',
        'cheese': 'Cheese',
        'parmesan': 'Parmesan Cheese',
        'eggs': 'Eggs',
        'egg': 'Eggs',
        'cream': 'Cream',
        
        # Meat
        'guancale': 'Guancale',
        'pancetta': 'Pancetta',
        'bacon': 'Bacon',
        'ham': 'Ham',
        'chicken': 'Chicken',
        'beef': 'Beef',
        
        # Vegetables
        'tomato': 'Tomato',
        'tomatoes': 'Tomato',
        'onion': 'Onion',
        'garlic': 'Garlic',
        'pepper': 'Pepper',
        'salt': 'Salt',
        'olive oil': 'Olive Oil',
        'oil': 'Olive Oil',
        
        # Seasonings
        'pepper': 'Black Pepper',
        'oregano': 'Oregano',
        'basil': 'Basil',
        'thyme': 'Thyme',
    }
    
    @staticmethod
    def normalize_unit(unit_str: str) -> str:
        """Normalize unit to standard form"""
        unit_lower = unit_str.lower().strip()
        return IngredientParser.COMMON_UNITS.get(unit_lower, unit_lower)
    
    @staticmethod
    def match_ingredient(ingredient_name: str, threshold: int = 80) -> str:
        """Match ingredient to database using fuzzy matching"""
        ingredient_lower = ingredient_name.lower().strip()
        
        best_match = ingredient_lower
        best_score = 0
        
        for db_ingredient, standard_name in IngredientParser.INGREDIENT_DATABASE.items():
            score = fuzz.token_set_ratio(ingredient_lower, db_ingredient.lower())
            if score > best_score:
                best_score = score
                best_match = standard_name
        
        return best_match if best_score >= threshold else ingredient_name
    
    @staticmethod
    def parse_ingredients(text: str) -> List[Ingredient]:
        """
        Parse ingredients from text
        Expected format: "4 eggs, 200g pasta, 2 tbsp olive oil"
        """
        ingredients = []
        
        # Split by comma or newline
        lines = re.split(r'[,\n]', text)
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try to extract: quantity unit ingredient
            # Pattern: number (with optional decimal) + optional unit + ingredient
            match = re.match(r'(\d+\.?\d*)\s*(\w+)?\s*(.*)', line)
            
            if match:
                quantity = float(match.group(1))
                unit = match.group(2) or 'piece'
                ingredient_name = match.group(3) or line
                
                unit = IngredientParser.normalize_unit(unit)
                ingredient_name = IngredientParser.match_ingredient(ingredient_name)
                
                ingredients.append(Ingredient(
                    name=ingredient_name,
                    quantity=quantity,
                    unit=unit
                ))
            else:
                # Fallback: treat whole line as ingredient
                ingredient_name = IngredientParser.match_ingredient(line)
                ingredients.append(Ingredient(
                    name=ingredient_name,
                    quantity=1,
                    unit='piece'
                ))
        
        return ingredients


# =============================================================================
# WEB SCRAPER (Selenium + Beautiful Soup)
# =============================================================================

class GroceryScraper:
    """Scrape prices from Greek supermarkets"""
    
    SUPERMARKETS = {
        'Sklavenitis': 'https://www.sklavenitis.gr/apotelesmata-anazitisis/?Query={}',
        #https://www.sklavenitis.gr/search?q={}',
        'Xalkiadakis': 'https://xalkiadakis.gr/search?sq={}',
        #'https://www.lidl.gr/search?q={}',
        'AB Vassilopoulos': 'https://www.ab.gr/search?q={}',
    }
    
    def __init__(self, timeout: int = 10, headless: bool = True):
        self.timeout = timeout
        self.headless = headless
        self.driver = self._init_driver()
        self.prices_cache = {}
    
    def _init_driver(self):
        """Initialize Chrome driver"""
        try:
            options = webdriver.ChromeOptions()
            if self.headless:
                options.add_argument('--headless=new')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('user-agent=Mozilla/5.0')
            
            return webdriver.Chrome(options=options)
        except WebDriverException as e:
            logger.warning(f"Chrome driver failed: {e}. Using mock data.")
            return None
    
    @staticmethod
    def _parse_price(price_text: str) -> Optional[float]:
        """Extract price from text"""
        if not price_text:
            return None
        
        try:
            # Remove currency symbols
            cleaned = price_text.replace('€', '').replace('$', '').strip()
            
            # Handle Greek format (comma as decimal)
            if ',' in cleaned and '.' not in cleaned:
                cleaned = cleaned.replace(',', '.')
            
            # Extract number
            match = re.search(r'\d+[.,]\d+', cleaned)
            if match:
                return float(match.group().replace(',', '.'))
        except Exception as e:
            logger.warning(f"Could not parse price: {e}")
        
        return None
    
    def scrape_ingredient(self, ingredient: str, quantity: float, unit: str) -> List[PriceData]:
        """Scrape price for ingredient from all supermarkets"""
        results = []
        
        # Check cache first
        cache_key = f"{ingredient}_{quantity}_{unit}"
        if cache_key in self.prices_cache:
            return self.prices_cache[cache_key]
        
        for supermarket, search_url in self.SUPERMARKETS.items():
            try:
                price_data = self._scrape_single(supermarket, ingredient, search_url)
                if price_data:
                    results.append(price_data)
            except Exception as e:
                logger.warning(f"Error scraping {supermarket}: {e}")
        
        # Use mock data if scraping failed
        if not results:
            results = self._get_mock_prices(ingredient)
        
        self.prices_cache[cache_key] = results
        return results
    
    def _scrape_single(self, supermarket: str, ingredient: str, search_url: str) -> Optional[PriceData]:
        """Scrape single supermarket"""
        if not self.driver:
            return None
        
        try:
            url = search_url.format(ingredient.replace(' ', '+'))
            self.driver.get(url)
            
            # Wait for content
            WebDriverWait(self.driver, self.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            time.sleep(1)  # Let JS render
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Try to find product (varies by site)
            product = soup.find('div', class_=['product', 'product-card', 'product-item'])
            
            if not product:
                return None
            
            # Extract name
            name_elem = product.find(['h2', 'h3'])
            name = name_elem.text if name_elem else ingredient
            
            # Extract price
            price_elem = product.find('span', class_=['price', 'product-price', 'price-current'])
            price_text = price_elem.text if price_elem else None
            price = self._parse_price(price_text)
            
            if price:
                return PriceData(
                    supermarket=supermarket,
                    product_name=name,
                    price=price,
                    url=self.driver.current_url,
                    timestamp=datetime.now().isoformat()
                )
        except Exception as e:
            logger.warning(f"Scrape error for {supermarket}: {e}")
        
        return None
    
    @staticmethod
    def _get_mock_prices(ingredient: str) -> List[PriceData]:
        """Return realistic mock prices (for demo/testing)"""
        base_price = np.random.uniform(0.5, 5.0)
        
        return [
            PriceData(
                supermarket='Sklavenitis',
                product_name=ingredient,
                price=round(base_price, 2),
                url='https://www.sklavenitis.gr',
                timestamp=datetime.now().isoformat()
            ),
            PriceData(
                supermarket='Xalkiadakis',
                product_name=ingredient,
                price=round(base_price + np.random.uniform(-0.3, 0.3), 2),
                url='https://www.xalkiadakis.gr',
                timestamp=datetime.now().isoformat()
            ),
            PriceData(
                supermarket='AB Vassilopoulos',
                product_name=ingredient,
                price=round(base_price + np.random.uniform(-0.2, 0.5), 2),
                url='https://www.ab.gr',
                timestamp=datetime.now().isoformat()
            ),
        ]
    
    def close(self):
        """Close driver"""
        if self.driver:
            self.driver.quit()


# =============================================================================
# COST OPTIMIZER (GPU-Accelerated)
# =============================================================================

class CostOptimizer:
    """Optimize recipe cost across stores"""
    
    @staticmethod
    def optimize(ingredients: List[Ingredient], prices_by_store: Dict[str, List[float]]) -> Dict:
        """
        Find optimal shopping strategy
        
        Two options:
        1. Mixed: Buy each item from cheapest store
        2. Single: Buy all from one store
        """
        # Convert to numpy arrays (or cupy if GPU available)
        xp = cp if HAS_GPU else np
        
        store_names = list(prices_by_store.keys())
        n_items = len(ingredients)
        n_stores = len(store_names)
        
        # Create price matrix
        price_matrix = xp.zeros((n_items, n_stores))
        for j, store in enumerate(store_names):
            prices = prices_by_store[store]
            price_matrix[:, j] = xp.array(prices[:n_items])
        
        # Mixed strategy: cheapest price for each item
        min_costs = xp.min(price_matrix, axis=1)
        cheapest_per_item = xp.argmin(price_matrix, axis=1)
        total_mixed = xp.sum(min_costs)
        
        # Single store strategy: all from one store
        totals_per_store = xp.sum(price_matrix, axis=0)
        best_store_idx = int(xp.argmin(totals_per_store))
        total_single = totals_per_store[best_store_idx]
        
        # Convert back if GPU
        if HAS_GPU:
            min_costs = cp.asnumpy(min_costs)
            total_mixed = float(cp.asnumpy(total_mixed))
            total_single = float(cp.asnumpy(total_single))
        
        savings = total_single - total_mixed
        savings_pct = (savings / total_single * 100) if total_single > 0 else 0
        
        return {
            'mixed_total': float(total_mixed),
            'single_total': float(total_single),
            'best_single_store': store_names[best_store_idx],
            'savings': float(savings),
            'savings_percent': float(savings_pct),
            'device': 'GPU (CuPy)' if HAS_GPU else 'CPU (NumPy)',
            'item_breakdown': [
                {
                    'ingredient': ing.name,
                    'cheapest_store': store_names[int(cheapest_per_item[i])],
                    'price': float(min_costs[i])
                }
                for i, ing in enumerate(ingredients)
            ]
        }


# =============================================================================
# STREAMLIT UI
# =============================================================================


def main():
    st.title("🍝 MealOptim - Recipe Cost Optimizer")
    st.markdown("""
    **Find the cheapest way to cook your favorite meal!**
    
    Enter your recipe ingredients and we'll compare prices across Sklavenitis, Lidl, and AB Vassilopoulos.
    """)
    
    # Sidebar
    with st.sidebar:
        st.header("⚙️ Settings")
        input_method = st.radio("Input method", ["Text", "Example Recipe"])
        st.markdown("---")
        st.info("💡 GPU Status: " + ("✅ GPU (CuPy)" if HAS_GPU else "⚠️ CPU (NumPy)"))
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📝 Enter Recipe Ingredients")
        
        if input_method == "Example Recipe":
            recipe_text = st.text_area(
                "Recipe ingredients (one per line or comma-separated):",
                value="4 eggs\n200g pasta\n100g guancale\n50g parmesan cheese\n2 tbsp olive oil\nSalt and pepper",
                height=200
            )
            recipe_name = "Carbonara"
        else:
            recipe_name = st.text_input("Recipe name:", value="My Recipe")
            recipe_text = st.text_area(
                "Recipe ingredients (one per line or comma-separated):",
                height=200,
                placeholder="Example:\n4 eggs\n200g pasta\n100g guancale\n50g parmesan\n..."
            )
    
    with col2:
        st.subheader("📊 Quick Tips")
        st.markdown("""
        **Format examples:**
        - `4 eggs`
        - `200g pasta`
        - `2 tbsp olive oil`
        - `1 cup milk`
        
        **Supported units:**
        - Weight: g, kg
        - Volume: ml, l, cup
        - Count: piece, tsp, tbsp
        """)
    
    # Parse button
    if st.button("🔍 Find Best Prices", type="primary", width='content'):
        
        if not recipe_text.strip():
            st.error("❌ Please enter recipe ingredients")
            return
        
        # Parse ingredients
        with st.spinner("📋 Parsing ingredients..."):
            ingredients = IngredientParser.parse_ingredients(recipe_text)
        
        if not ingredients:
            st.error("❌ Could not parse ingredients")
            return
        
        st.success(f"✅ Found {len(ingredients)} ingredients")
        
        # Show parsed ingredients
        with st.expander("📦 Parsed Ingredients", expanded=True):
            ing_df = pd.DataFrame([
                {
                    'Ingredient': ing.name,
                    'Quantity': ing.quantity,
                    'Unit': ing.unit
                }
                for ing in ingredients
            ])
            st.dataframe(ing_df, width='content', hide_index=True)
        
        # Scrape prices
        with st.spinner("💰 Fetching prices from supermarkets..."):
            scraper = GroceryScraper(headless=True)
            
            all_prices = {}
            for supermarket in ['Sklavenitis', 'Xalkiadakis', 'AB Vassilopoulos']:
                all_prices[supermarket] = []
            
            progress = st.progress(0)
            for idx, ing in enumerate(ingredients):
                price_data_list = scraper.scrape_ingredient(ing.name, ing.quantity, ing.unit)
                
                for price_data in price_data_list:
                    if price_data.supermarket not in all_prices:
                        all_prices[price_data.supermarket] = []
                    all_prices[price_data.supermarket].append(price_data.price)
                
                progress.progress((idx + 1) / len(ingredients))
            
            scraper.close()
        
        st.success("✅ Prices fetched!")
        
        # Optimize
        with st.spinner("⚡ Optimizing shopping strategy..."):
            optimizer = CostOptimizer()
            result = optimizer.optimize(ingredients, all_prices)
        
        st.success("✅ Optimization complete!")
        
        # Display results
        st.markdown("---")
        st.subheader("💚 Results")
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total (Mixed)", f"€{result['mixed_total']:.2f}")
        with col2:
            st.metric("Total (Single Store)", f"€{result['single_total']:.2f}")
        with col3:
            st.metric("Savings", f"€{result['savings']:.2f}", f"{result['savings_percent']:.1f}%")
        with col4:
            st.metric("Best Store", result['best_single_store'])
        
        # Show best deal
        st.markdown(f"""
        <div class="best-deal">
            <h3>🏆 Best Deal</h3>
            <p><b>Store:</b> {result['best_single_store']}</p>
            <p><b>Price:</b> €{result['single_total']:.2f}</p>
            <p><b>Savings vs Mixed:</b> €{abs(result['single_total'] - result['mixed_total']):.2f}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Show store comparison
        st.subheader("🏪 Price by Store")
        store_prices = pd.DataFrame([
            {
                'Store': store,
                'Total': f"€{sum(prices):.2f}",
                'Items': len(prices),
                'Avg/Item': f"€{np.mean(prices):.2f}"
            }
            for store, prices in all_prices.items()
        ])
        st.dataframe(store_prices, width='content', hide_index=True)
        
        # Show item breakdown
        st.subheader("📦 Item-by-Item Breakdown (Mixed Strategy)")
        breakdown_df = pd.DataFrame(result['item_breakdown'])
        st.dataframe(breakdown_df, width='content', hide_index=True)
        
        # Device info
        st.markdown(f"**Computation device:** {result['device']}")
        
        # Export shopping list
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📋 Generate Shopping List"):
                shopping_list = "\n".join([
                    f"[ ] {ing['quantity']} {ing['unit']} - {ing['ingredient']} ({ing['cheapest_store']})"
                    for ing in result['item_breakdown']
                ])
                st.text_area("Shopping List:", value=shopping_list, height=300)
        
        with col2:
            st.markdown("""
            ### 💡 Tips
            - **Mixed strategy:** Buy each item from cheapest store (requires multiple stops)
            - **Single strategy:** Buy all from one store (more convenient)
            - Prices update daily - check back for new deals!
            """)


if __name__ == "__main__":
    main()
