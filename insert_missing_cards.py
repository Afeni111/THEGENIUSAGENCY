#!/usr/bin/env python3
"""Insert missing Pitch Deck and eBook Design cards"""

import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pitch Deck files to add (excluding Solara which exists)
pitch_decks = [
    ("Business Case v1", "Business Case v1.pdf", "Professional business case presentation for corporate strategy."),
    ("Dequity Capital", "Dequity Capital v1.pdf", "Investment pitch deck for private equity funding round."),
    ("E Profile Flex Logistics", "E Profile Flex Logistics_.pdf", "Corporate profile presentation for logistics company."),
    ("Entelsoft Master", "Entelsoft Master Ready to go .pdf", "Complete software company presentation deck."),
    ("HealthLife NY", "HealthLife NY Company Presentation ready to go .pdf", "Healthcare company investor presentation."),
    ("Media Outpost v2", "Media Outpost v2.pdf", "Media agency capabilities presentation deck."),
    ("Media Outpost Copy", "Media Outpost v2 - Copy.pdf", "Alternative version of media agency presentation.")
]

# eBook files to add
ebooks = [
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
    ("Media Outpost Guide", "Media Outpost v2.pdf", "Media and marketing strategies guidebook."),
    ("Diabetes Cookbook", "Type 2 Diabetes Cookbook for Beginners.pdf", "Beginner-friendly diabetic-friendly recipes."),
    ("Cookbook Cover Design", "cookbook cover.pdf", "Professional cookbook design and layout samples."),
    ("Acid Reflux Cookbook", "Acid Reflux Cookbook.docx", "Digestive health recipes in editable format.")
]

def create_pitch_card(title, filename, desc):
    safe_title = title.replace("'", "\\'")
    return f'''                <div class="port-card" data-cat="Pitch Deck" data-year="2025" data-title="{title}"
                     onclick="openModal('{safe_title}','Pitch Deck','{desc}','portfolios/PITCH DECK AND PRESENTATION/{filename}','2025','pdf')">
                    <div class="port-card-thumb" style="background: linear-gradient(135deg, #0a0a0a, #1a1a1a); display: flex; align-items: center; justify-content: center;">
                        <div class="port-watermark"></div>
                        <div style="text-align: center; color: #D4AF37;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                            <p style="margin: 10px 0 0; font-size: 0.8rem; color: #888;">Pitch Deck PDF</p>
                        </div>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">Pitch Deck</p>
                        <h3 class="port-card-title">{title}</h3>
                        <p class="port-card-desc">{desc}</p>
                        <div class="port-card-footer">
                            <a href="expert.html?category=Pitch+Deck" class="port-btn port-btn-secondary" onclick="event.stopPropagation();">View Expert</a>
                            <a href="javascript:void(0)" class="port-btn port-btn-primary" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>
                        </div>
                    </div>
                </div>
'''

def create_ebook_card(title, filename, desc):
    safe_title = title.replace("'", "\\'")
    return f'''                <div class="port-card" data-cat="eBook Design" data-year="2025" data-title="{title}"
                     onclick="openModal('{safe_title}','eBook Design','{desc}','portfolios/DESIGNED AND WRITTEN EBOOKS/{filename}','2025','pdf')">
                    <div class="port-card-thumb" style="background: linear-gradient(135deg, #0a0a0a, #1a1a1a); display: flex; align-items: center; justify-content: center;">
                        <div class="port-watermark"></div>
                        <div style="text-align: center; color: #D4AF37;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <p style="margin: 10px 0 0; font-size: 0.8rem; color: #888;">eBook PDF</p>
                        </div>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">eBook Design</p>
                        <h3 class="port-card-title">{title}</h3>
                        <p class="port-card-desc">{desc}</p>
                        <div class="port-card-footer">
                            <a href="expert.html?category=eBook+Design" class="port-btn port-btn-secondary" onclick="event.stopPropagation();">View Expert</a>
                            <a href="javascript:void(0)" class="port-btn port-btn-primary" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>
                        </div>
                    </div>
                </div>
'''

# Generate Pitch Deck cards HTML
pitch_html = "\n".join([create_pitch_card(t, f, d) for t, f, d in pitch_decks])

# Generate eBook cards HTML  
ebook_html = "\n".join([create_ebook_card(t, f, d) for t, f, d in ebooks])

# Find where to insert - after the existing Pitch Deck card (Solara Studios Bali)
# Look for the comment before Website Sales section
insert_marker = "<!-- PITCH DECK - 8 TOTAL -->"
if insert_marker in content:
    # Insert after the existing Solara card (which ends before the Website Sales section)
    solara_end = content.find("<!-- PITCH DECK - 8 TOTAL -->")
    if solara_end != -1:
        # Find the end of Solara card
        next_section = content.find("<!-- PITCH DECK - 8 TOTAL -->")
        website_sales = content.find("<!-- Website Sales -->")
        
        # Insert new pitch cards before Website Sales
        if website_sales != -1:
            content = content[:website_sales] + pitch_html + "\n\n                <!-- Website Sales -->\n" + content[website_sales + len("<!-- Website Sales -->") + 1:]
            
            # Now find eBook insertion point
            pitch_deck_marker = content.find("<!-- PITCH DECK - 8 TOTAL -->")
            ebook_section = content.find("<!-- eBook Design -->")
            
            if ebook_section != -1:
                # Insert eBook cards after the comment
                content = content[:ebook_section + len("<!-- eBook Design -->") + 1] + "\n" + ebook_html + content[ebook_section + len("<!-- eBook Design -->") + 1:]
            else:
                # Insert after all cards but before closing grid
                print("No eBook Design comment found, will insert after pitch decks")
                
with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ Added {len(pitch_decks)} Pitch Deck cards")
print(f"✅ Added {len(ebooks)} eBook Design cards")
print("Total cards now: 76 + 7 + 15 = 98 cards")
