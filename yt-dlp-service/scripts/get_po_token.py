from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_po_token():
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://www.youtube.com")
        return driver.execute_script("return window.ytcfg.get('PO_TOKEN')")
    finally:
        driver.quit()

if __name__ == "__main__":
    print(get_po_token()) 