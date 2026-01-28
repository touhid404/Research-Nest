from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
import string

# Helper to generate random string
def random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Helper for robust logout
def logout(driver, wait):
    print("Logging out...")
    try:
        # Locate the Logout text span (even if hidden)
        logout_span = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Logout')]")))
        
        logout_trigger = logout_span.find_element(By.XPATH, "./ancestor::div[contains(@class, 'cursor-pointer') or contains(@class, 'group relative')][1]")
        
        driver.execute_script("arguments[0].click();", logout_trigger)
        
        # Wait for and click the confirmation modal button
        confirm_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Log Out')]")))
        confirm_btn.click()
        
        # Wait for login page
        wait.until(EC.url_contains("/auth/login"))
        print("Logged out successfully.")
        time.sleep(1)
    except Exception as e:
        print(f"Logout failed: {e}")
        raise e

# Options to keep browser open
options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

# Edge Driver
service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)

try:
    wait = WebDriverWait(driver, 10)
    
    # --- CONSTANTS ---
    BASE_URL = "http://localhost:5173"
    KARIM_EMAIL = "karim@gmail.com"
    KARIM_PASS = "12345678"
    
    NEW_USER_NAME = f"TestUser_{random_string(4)}"
    NEW_USER_EMAIL = f"{random_string(6)}@test.com"
    NEW_USER_PASS = "password123"
    POST_TITLE = f"Selenium Research {random_string(4)}"

    # --- PART 1: LOGIN AS KARIM & CREATE POST ---
    print(f"\n--- PART 1: LOGIN AS {KARIM_EMAIL} ---")
    driver.maximize_window()
    driver.get(f"{BASE_URL}/auth/login")

    # Login
    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(KARIM_EMAIL)
    driver.find_element(By.NAME, "password").send_keys(KARIM_PASS)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Sign In')]").click()
    
    wait.until(EC.url_contains("/home"))
    print("Logged in as Karim.")

    # Create Post
    print("Creating Post...")
    driver.get(f"{BASE_URL}/home/posts/create-post")
    
    wait.until(EC.presence_of_element_located((By.NAME, "title"))).send_keys(POST_TITLE)
    driver.find_element(By.NAME, "researchTopic").send_keys("Selenium Testing")
    driver.find_element(By.NAME, "description").send_keys("This post is created for testing purposes.")
    driver.find_element(By.XPATH, "//button[contains(text(), 'Post Proposal')]").click()
    
    wait.until(EC.url_contains("/home/posts/myposts"))
    print(f"Post '{POST_TITLE}' created.")
    time.sleep(2)

    # Logout
    logout(driver, wait)


    # --- PART 2: REGISTER NEW USER & SEND REQUEST ---
    print(f"\n--- PART 2: REGISTER NEW USER {NEW_USER_EMAIL} ---")
    driver.get(f"{BASE_URL}/auth/register")
    
    # Step 1: Gender & Occupation
    print("Step 1: Personal Details")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'grid')]//button[1]"))).click() # Select first gender
    driver.find_element(By.XPATH, "//button[contains(text(), 'Student')]").click() # Select Occupation
    driver.find_element(By.XPATH, "//button[contains(text(), 'Continue')]").click()
    
    # Step 2: Interests
    print("Step 2: Interests")
    wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Artificial Intelligence')]"))).click()
    driver.find_element(By.XPATH, "//button[contains(text(), 'Continue')]").click()

    # Step 3: Account Details
    print("Step 3: Account Creation")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Full Name']"))).send_keys(NEW_USER_NAME)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Email Address']").send_keys(NEW_USER_EMAIL)
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(NEW_USER_PASS)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Complete Registration')]").click()
    
    wait.until(EC.url_contains("/home"))
    print("Registered and Logged in as New User.")

    # Send Request
    print("Sending Request...")
    driver.get(f"{BASE_URL}/home/posts/explore")
    
    try:
        # Wait for posts to load
        time.sleep(3) 
        
        # User requested specific strategy: find h2 with the title
        print(f"Looking for post with title: {POST_TITLE}")
        
        # XPath: Find h2 with exact text (or contains), then go up to the card container
        post_card_xpath = f"//h2[contains(text(), '{POST_TITLE}')]/ancestor::div[contains(@class, 'group/card')]"
        post_card = wait.until(EC.presence_of_element_located((By.XPATH, post_card_xpath)))
        
        # Click 'Request' button within this card
        request_btn = post_card.find_element(By.XPATH, ".//button[contains(text(), 'Request')]")
        
        # Scroll into view to avoid header overlapping
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", request_btn)
        time.sleep(1) # Wait for scroll
        
        # JS Click to avoid interception
        driver.execute_script("arguments[0].click();", request_btn)
        
        # Fill Request Modal
        desc_area = wait.until(EC.presence_of_element_located((By.ID, "description")))
        desc_area.send_keys("I am interested in collaborating.")
        
        send_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Send Request')]")
        driver.execute_script("arguments[0].click();", send_btn)
        
        # Wait for modal to close / success
        time.sleep(2)
        print("Request Sent.")
        
    except Exception as e:
        print(f"Failed to find/request post: {e}")
        raise e

    # Logout
    logout(driver, wait)


    # --- PART 3: LOGIN AS KARIM & ACCEPT REQUEST & FORM GROUP ---
    print(f"\n--- PART 3: LOGIN AS KARIM & FORM GROUP ---")
    driver.get(f"{BASE_URL}/auth/login")
    
    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(KARIM_EMAIL)
    driver.find_element(By.NAME, "password").send_keys(KARIM_PASS)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Sign In')]").click()
    
    wait.until(EC.url_contains("/home"))
    print("Logged in as Karim.")
    
    # Go to Requests
    driver.get(f"{BASE_URL}/home/requests/pending")
    print("Checking Pending Requests...")
    
    # Find request from NEW_USER_NAME
    time.sleep(3)
    try:
        req_card = wait.until(EC.presence_of_element_located((By.XPATH, f"//div[contains(@class, 'flex flex-row') and contains(., '{NEW_USER_NAME}')]")))
        accept_btn = req_card.find_element(By.XPATH, ".//button[contains(text(), 'Accept')]")
        accept_btn.click()
        print("Request Accepted.")
        time.sleep(2)
    except Exception as e:
        print(f"Could not find request from {NEW_USER_NAME}. It might be already accepted or missing.")
    
    # Go to Accepted Requests to Form Group
    print("Navigating to Accepted Requests...")
    
    driver.get(f"{BASE_URL}/home/requests/accepted")
    
    time.sleep(3)
    try:
        print(f"Looking for Accepted Request with Title: {POST_TITLE}")
        group_card = wait.until(EC.presence_of_element_located((By.XPATH, f"//div[contains(., '{POST_TITLE}') and contains(@class, 'rounded-2xl')]")))
        
        form_team_btn = group_card.find_element(By.XPATH, ".//button[contains(text(), 'Form Team')]")
        
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", form_team_btn)
        time.sleep(1)
        
        driver.execute_script("arguments[0].click();", form_team_btn)
        
        group_name_input = wait.until(EC.visibility_of_element_located((By.ID, "groupName")))
        group_name_input.clear()
        group_name_input.send_keys(f"Team {POST_TITLE}")
        
        # Click Create Team
        create_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Create Team')]")
        driver.execute_script("arguments[0].click();", create_btn)
        
        # Wait for success toast or modal close
        time.sleep(3)
        print("Group Formed Successfully!")
        
    except Exception as e:
         print(f"Failed to form group: {e}")
         raise e # Re-raise to trigger the main exception handler


    # --- PART 4: CHAT & SEND MESSAGE ---
    print(f"\n--- PART 4: CHAT & SEND MESSAGE ---")
    
    # Go to Messages
    driver.get(f"{BASE_URL}/home/messages")
    print("Navigating to Messages...")
    
    GROUP_NAME = f"Team {POST_TITLE}"
    
    try:
        print(f"Looking for chat group: {GROUP_NAME}")
        # Search for the group name in the sidebar list
        chat_item = wait.until(EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{GROUP_NAME}')] | //div[contains(text(), '{GROUP_NAME}')]")))
        
        driver.execute_script("arguments[0].click();", chat_item)
        print(f"Opened chat for {GROUP_NAME}.")
        
        # Wait for message input
        message_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Type a message...']")))
        
        # Send Message
        FUNNY_MESSAGE = "Why did the developer go broke? Because he used up all his cache!"
        message_input.send_keys(FUNNY_MESSAGE)
        
        # Click Send
        send_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        driver.execute_script("arguments[0].click();", send_btn)
        
        print("Funny message sent.")
        
        time.sleep(3)
        
    except Exception as e:
        print(f"Failed to chat: {e}")
        raise e

    print("\n--- TEST COMPLETED SUCCESSFULLY ---")

except Exception as e:
    print(f"\n!!! TEST FAILED: {e}")
finally:
    pass

