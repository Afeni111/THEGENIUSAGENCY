import os

# Read existing card template
with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract a sample card structure
import re
sample_card = re.search(r'<div class="port-card" data-cat="Pitch Deck".*?</div>\s*</div>\s*</div>', content, re.DOTALL)
if sample_card:
    print("Found existing Pitch Deck card template")
    print(sample_card.group(0)[:500])
else:
    print("No existing Pitch Deck card found")

# Pitch Deck files (excluding Solara which already exists)
pitch_files = [
    ("Business Case v1", "Business Case v1.pdf", "Professional business case presentation for corporate strategy."),
    ("Dequity Capital", "Dequity Capital v1.pdf", "Investment pitch deck for private equity funding round."),
    ("E Profile Flex Logistics", "E Profile Flex Logistics_.pdf", "Corporate profile presentation for logistics company."),
    ("Entelsoft Master", "Entelsoft Master Ready to go .pdf", "Complete software company presentation deck."),
    ("HealthLife NY", "HealthLife NY Company Presentation ready to go .pdf", "Healthcare company investor presentation."),
    ("Media Outpost v2", "Media Outpost v2.pdf", "Media agency capabilities presentation deck."),
    ("Media Outpost Copy", "Media Outpost v2 - Copy.pdf", "Alternative version of media agency presentation.")
]

# eBook Design files
ebook_files = [
    ("Whipped Cream Desserts", "12 recipes Whipped Cream Desserts.pdf", "Delicious whipped cream dessert recipes collection."),
    ("Shradder Recipes", "15 shradder recipes PDF WITH front cover page Interactive PDF.pdf", "Healthy shredder recipes for weight loss."),
    ("Italian Recipes", "25 Italian recipes Book cookbookdigital.pdf.crdownload", "Authentic Italian cuisine cookbook collection."),
    ("Yolo Diet Recipes", "25 Yolo Diet Recipes.pdf", "Modern diet recipes for healthy lifestyle."),
    ("Canning Recipes", "30 canning recipes.pdf", "Complete guide to food canning and preservation."),
    ("50 Keto Recipes", "50 Keto Recipes (5 Ingredients) pink.pdf", "Simple 5-ingredient keto diet recipes."),
    ("50 Smoothies", "50 Smoothies recipes by mr_usmaan from fiverr.com.pdf", "Healthy smoothie recipes for energy and wellness."),
    ("Acid Reflux Cookbook", "Acid Reflux Cookbook.pdf", "Gentle recipes for acid reflux and digestive health."),
    ("HR Resume Samples", "HR Studio Resume Samples.pdf", "Professional resume templates and samples."),
    ("Lets Have Drinks", "lets have drinks ebook new coverpage.pdf", "Cocktail and beverage recipe collection."),
    ("Meal Plan Makeover", "Meal Plan Makeover.pdf", "Comprehensive meal planning guide and recipes."),
    ("Media Outpost", "Media Outpost v2.pdf", "Media and marketing strategies guidebook."),
    ("Diabetes Cookbook", "Type 2 Diabetes Cookbook for Beginners.pdf", "Beginner-friendly diabetic-friendly recipes."),
    ("Cookbook Cover", "cookbook cover.pdf", "Professional cookbook design and layout samples."),
    ("Acid Reflux Docx", "Acid Reflux Cookbook.docx", "Digestive health recipes in editable format.")
]

print(f"\nNeed to create {len(pitch_files)} Pitch Deck cards")
print(f"Need to create {len(ebook_files)} eBook Design cards")
