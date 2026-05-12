#!/usr/bin/env python3
"""
Portfolio updater script - updates portfolio.html with all portfolios from folders
"""

import os
import re

# Portfolio data structure
portfolios = {
    "Website Design": [],
    "Pitch Deck": [],
    "eBook Design": [],
    "Website Sales": [],
    "Amazon KDP": []
}

# Shopify Designs (10 files)
shopify_designs = [
    ("Planet Greenhouse", "Nature-inspired Shopify store for greenhouse plant enthusiasts.", "screencapture-planetgreenhouse-2025-07-23-18_37_28.png"),
    ("Peggy's Kiddy Corral", "Fun, vibrant Shopify store for kids products and accessories.", "screencapture-peggyskiddycorral-2025-07-23-18_37_52.png"),
    ("La Grande Beaute", "Elegant Shopify store for a premium beauty and cosmetics brand.", "screencapture-lagrandebeaute-2025-07-23-18_38_22.png"),
    ("Nappa Dori", "Luxury leather goods Shopify store with premium aesthetic.", "screencapture-nappadori-co-uk-2025-07-23-18_38_49.png"),
    ("Isolabella Kids", "Bright, playful Shopify store for children's fashion and accessories.", "screencapture-isolabellakids-2025-07-23-18_40_13.png"),
    ("My Let It Shine", "Inspiring Shopify store with motivational lifestyle brand.", "screencapture-myletitshine-net-2025-07-23-18_40_59.png"),
    ("Kingston Paint", "Professional Shopify store for a premium paint and coatings brand.", "screencapture-shop-kingstonpaint-2025-07-23-18_40_35.png"),
    ("Select Line Sports", "Sleek Shopify store for a sports equipment and activewear brand.", "screencapture-selectlinesports-2025-07-23-18_41_32.png"),
    ("Uggs Online", "Premium footwear Shopify store with clean, high-end design.", "screencapture-uggsonline-2025-07-23-18_42_26.png"),
    ("Godfullness", "Faith-based lifestyle Shopify store with a warm, welcoming design.", "screencapture-godfullness-2025-07-23-18_43_23.png"),
]

# WordPress Designs (11 files) - combined with Shopify under Website Design
wordpress_designs = [
    ("Damashii Digital", "Modern digital agency WordPress website with strong branding.", "screencapture-damashiidigital-2025-07-24-18_26_36.png"),
    ("Defaren", "Clean, professional organisation WordPress website.", "screencapture-defaren-org-2025-07-24-18_27_35.png"),
    ("Zipbotz", "Tech startup WordPress website with bold, modern design.", "screencapture-dev-zipbotz-2025-07-24-18_25_32.png"),
    ("Goldenrod Dog", "Pet services WordPress website with friendly, approachable design.", "screencapture-goldenrod-dog-322237-hostingersite-2025-07-24-18_27_50.png"),
    ("Paxtans", "Stylish WordPress site for a creative brand with strong visual identity.", "screencapture-paxtans-2025-07-24-18_25_13.png"),
    ("Marketing Mavericks", "Dynamic marketing agency WordPress website with conversion focus.", "screencapture-marketing-mavericks-org-2025-07-24-18_27_06.png"),
    ("Playa Sur Paradise", "Resort and travel WordPress website with beautiful imagery.", "screencapture-playasurparadise-2025-07-24-18_26_51.png"),
    ("Sprixo Scentara", "Elegant fragrance brand WordPress website.", "screencapture-sprixo-scentara-2025-07-24-18_26_23.png"),
    ("The European Way", "European lifestyle and culture WordPress website with editorial style.", "screencapture-the-european-way-eu-2025-07-24-18_28_08.png"),
]

# Pitch Decks (8 PDF files)
pitch_decks = [
    ("Solara Studios Bali", "Professional investor pitch deck for a luxury Bali resort development.", "Solara Studios Bali - Pitch Deck Ready.pdf"),
    ("Dequity Capital", "Compelling financial firm pitch deck with data-driven storytelling.", "Dequity Capital v1.pdf"),
    ("HealthLife NY", "Health and wellness company presentation with clean, professional slides.", "HealthLife NY Company Presentation ready to go .pdf"),
    ("Business Case", "Strategic business case presentation with comprehensive market analysis.", "Business Case v1.pdf"),
    ("E Profile Flex Logistics", "Logistics company profile presentation with operational highlights.", "E Profile Flex Logistics_.pdf"),
    ("Entelsoft Master", "Technology solutions pitch deck with innovative service offerings.", "Entelsoft Master Ready to go .pdf"),
    ("Media Outpost", "Media agency pitch deck showcasing creative capabilities and portfolio.", "Media Outpost v2.pdf"),
    ("Media Outpost v2", "Enhanced media agency presentation with expanded case studies.", "Media Outpost v2 - Copy.pdf"),
]

# eBooks (15 PDF files - excluding .docx and .crdownload)
ebooks = [
    ("50 Keto Recipes", "Beautifully designed keto recipe eBook with 5-ingredient focus.", "50 Keto Recipes (5 Ingredients) pink.pdf"),
    ("Meal Plan Makeover", "Comprehensive meal planning eBook with vibrant, engaging layout.", "Meal Plan Makeover.pdf"),
    ("Whipped Cream Desserts", "Delicious dessert recipes eBook with elegant design and photography.", "12 recipes Whipped Cream Desserts.pdf"),
    ("15 Shradder Recipes", "Interactive recipe eBook with professional layout and cover design.", "15 shradder recipes PDF WITH front cover page Interactive PDF.pdf"),
    ("Yolo Diet Recipes", "Healthy lifestyle recipe collection with modern, clean design.", "25 Yolo Diet Recipes.pdf"),
    ("Canning Recipes", "Preservation and canning guide with rustic, homemade aesthetic.", "30 canning recipes.pdf"),
    ("Smoothies Recipes", "Colorful smoothie recipe collection with vibrant design elements.", "50 Smoothies recipes by mr_usmaan from fiverr.com.pdf"),
    ("Acid Reflux Cookbook", "Health-focused cookbook with gentle, soothing design approach.", "Acid Reflux Cookbook.pdf"),
    ("HR Studio Resumes", "Professional resume templates and career guide eBook.", "HR Studio Resume Samples.pdf"),
    ("Type 2 Diabetes Cookbook", "Diabetes-friendly recipes with nutritional information and clean layout.", "Type 2 Diabetes Cookbook for Beginners.pdf"),
    ("Cookbook Cover Design", "Professional cookbook cover design showcasing layout expertise.", "cookbook cover.pdf"),
    ("Let's Have Drinks", "Beverage recipe eBook with stylish, modern cover design.", "lets have drinks ebook new coverpage.pdf"),
    ("Media Outpost eBook", "Media strategy eBook with professional formatting.", "Media Outpost v2.pdf"),
]

# Website Sales (12 images + 6 videos = 18 total)
website_sales = [
    ("Shopify Sales 1", "Proven Shopify store revenue performance screenshot.", "sales 1.png"),
    ("Shopify Sales 2", "E-commerce revenue dashboard showing consistent growth.", "sales 2.png"),
    ("Shopify Sales 3", "High-converting Shopify store analytics and metrics.", "sales 3.png"),
    ("Shopify Sales 4", "Store performance metrics and conversion rate data.", "sales 4.png"),
    ("Shopify Sales 5", "Monthly revenue report showing strong sales performance.", "sales 5.png"),
    ("Shopify Sales 6", "E-commerce store growth analytics and sales trends.", "sales 6.png"),
    ("Shopify Sales 7", "Shopify admin dashboard showing high sales volume.", "sales 7.png"),
    ("Shopify Sales 8", "Conversion tracking and sales performance overview.", "sales 8.png"),
    ("Shopify Sales 10", "Revenue milestone achievement screenshot.", "sale 10.png"),
    ("Shopify Sales 11", "Sales analytics and performance metrics display.", "sales 11.png"),
    ("Shopify Sales 12", "Store revenue statistics and growth indicators.", "sales 12.png"),
    ("Shopify Sales 13", "E-commerce success metrics and sales data.", "sales 13.png"),
    # Videos
    ("Shopify Sales Recording 1", "Video walkthrough of sales dashboard performance.", "recording.mkv", "video"),
    ("Shopify Sales Recording 2", "Live sales data demonstration video.", "recording (1).mkv", "video"),
    ("Shopify Sales Recording 3", "Store analytics video presentation.", "recording (2).mkv", "video"),
    ("Shopify Screen Capture 4", "Screen recording of store management.", "screen-capture (4).webm", "video"),
    ("Shopify Screen Capture 5", "Video demonstration of sales workflow.", "screen-capture (5).webm", "video"),
    ("Shopify Screen Capture 6", "E-commerce operations video showcase.", "screen-capture (6).webm", "video"),
]

# Amazon KDP (39 images)
kdp_files = [
    "1C9DC909-8007-438B-A3E3-0A74E10AC3B9.jpeg",
    "20240228_075653.jpg",
    "639720F8-49BA-433E-801E-B18E0921E8E4.jpeg",
    "A Special Life - Bestseller.png",
    "Athlete - ACOS.png",
    "Book ads - ACOS.png",
    "Book ads2- ACOS.png",
    "Campaign ads results.png",
    "DEE85B51-2C68-4E40-82D8-E78BCAAF5C6F.png",
    "Pride and Perjury.png",
    "Screenshot 2024-02-24 at 10.07.14 AM.png",
    "Screenshot_20240508_233859_Chrome.jpg",
    "The Fractional Formula - Bestseller.png",
    "The Pivot bestseller.png",
    "Untitled - ACOS Fiction.png",
    "Untitled - ACOS New1.png",
    "Untitled - ACOS rich.png",
    "Untitled - ACOS1 - Copy.png",
    "Untitled - ACOS1.png",
    "Untitled - DE bestseller.png",
    "Untitled - DE market bs.png",
    "Untitled - Guide to start.png",
    "Untitled - Poetry - Copy.png",
    "Untitled - Poetry.png",
    "Untitled - Top Secret.png",
    "Untitled - kids.png",
    "Untitled - rather.png",
    "Untitled - results3.png",
    "Untitled - trivia - Copy.png",
    "Untitled -bestsellers..png",
    "ads results 2.png",
    "bestseller - 1.png",
    "book ACOS.png",
    "book ads3.png",
    "kdp ads result 1.png",
    "kdp campaign results.png",
    "myfather - bestseller.png",
    "the severe.png",
    "Снимок экрана 2024-03-23 в 16.47.11.png",
]

def generate_img_card(title, category, desc, filepath, folder):
    """Generate HTML for an image portfolio card"""
    safe_title = title.replace("'", "&#39;")
    return f'''                <div class="port-card" data-cat="{category}" data-year="2025" data-title="{safe_title}"
                     onclick="openModal('{safe_title}','{category}','{desc}','portfolios/{folder}/{filepath}','2025','img')">
                    <div class="port-card-thumb">
                        <div class="port-watermark"></div>
                        <img src="portfolios/{folder}/{filepath}" alt="{safe_title}" loading="lazy">
                        <button class="port-zoom-btn" onclick="event.stopPropagation();openModal('{safe_title}','{category}','{desc}','portfolios/{folder}/{filepath}','2025','img')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">{category}</p>
                        <h3 class="port-card-title">{safe_title}</h3>
                        <p class="port-card-desc">{desc}</p>
                        <div class="port-card-footer">
                            <span class="port-card-year"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>2025</span>
                            <a href="javascript:void(0)" class="port-case-link" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>
                        </div>
                    </div>
                </div>
'''

def generate_video_card(title, category, desc, filepath, folder):
    """Generate HTML for a video portfolio card"""
    safe_title = title.replace("'", "&#39;")
    return f'''                <div class="port-card" data-cat="{category}" data-year="2025" data-title="{safe_title}"
                     onclick="openModal('{safe_title}','{category}','{desc}','portfolios/{folder}/{filepath}','2025','video')">
                    <div class="port-card-thumb" style="background: linear-gradient(135deg, #0d1e36, #1a3050); display: flex; align-items: center; justify-content: center;">
                        <div class="port-watermark"></div>
                        <div style="text-align: center; color: #D4AF37;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            <p style="margin: 10px 0 0; font-size: 0.8rem; color: #888;">Video</p>
                        </div>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">{category}</p>
                        <h3 class="port-card-title">{safe_title}</h3>
                        <p class="port-card-desc">{desc}</p>
                        <div class="port-card-footer">
                            <span class="port-card-year"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>2025</span>
                            <a href="javascript:void(0)" class="port-case-link" onclick="event.stopPropagation();viewProject(this);">View Video &rarr;</a>
                        </div>
                    </div>
                </div>
'''

def generate_pdf_card(title, category, desc, filepath, folder, icon_type="pdf"):
    """Generate HTML for a PDF portfolio card (Pitch Deck or eBook)"""
    safe_title = title.replace("'", "&#39;")
    if icon_type == "pitch":
        icon_svg = '''<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'''
        label = "Pitch Deck PDF"
        bg = "linear-gradient(135deg, #0a0a0a, #1a1a1a)"
    else:  # ebook
        icon_svg = '''<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'''
        label = "eBook PDF"
        bg = "linear-gradient(135deg, #1a0a0a, #2a1010)"
    
    return f'''                <div class="port-card" data-cat="{category}" data-year="2025" data-title="{safe_title}"
                     onclick="openModal('{safe_title}','{category}','{desc}','portfolios/{folder}/{filepath}','2025','pdf')">
                    <div class="port-card-thumb" style="background: {bg}; display: flex; align-items: center; justify-content: center;">
                        <div class="port-watermark"></div>
                        <div style="text-align: center; color: #D4AF37;">
                            {icon_svg}
                            <p style="margin: 10px 0 0; font-size: 0.8rem; color: #888;">{label}</p>
                        </div>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">{category}</p>
                        <h3 class="port-card-title">{safe_title}</h3>
                        <p class="port-card-desc">{desc}</p>
                        <div class="port-card-footer">
                            <span class="port-card-year"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>2025</span>
                            <a href="javascript:void(0)" class="port-case-link" onclick="event.stopPropagation();viewProject(this);">View PDF &rarr;</a>
                        </div>
                    </div>
                </div>
'''

def generate_kdp_card(filename, index):
    """Generate HTML for an Amazon KDP portfolio card"""
    title = filename.rsplit('.', 1)[0][:30]  # Use filename as title, truncated
    return f'''                <div class="port-card" data-cat="Amazon KDP" data-year="2025" data-title="KDP Result {index}"
                     onclick="openModal('KDP Result {index}','Amazon KDP','Amazon KDP advertising campaign results and bestseller achievements.','portfolios/AMAZON KDP ADS/{filename}','2025','img')">
                    <div class="port-card-thumb">
                        <div class="port-watermark"></div>
                        <img src="portfolios/AMAZON KDP ADS/{filename}" alt="KDP Result {index}" loading="lazy">
                        <button class="port-zoom-btn" onclick="event.stopPropagation();openModal('KDP Result {index}','Amazon KDP','Amazon KDP advertising campaign results and bestseller achievements.','portfolios/AMAZON KDP ADS/{filename}','2025','img')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                    </div>
                    <div class="port-card-body">
                        <p class="port-card-cat">Amazon KDP</p>
                        <h3 class="port-card-title">KDP Result {index}</h3>
                        <p class="port-card-desc">Amazon KDP advertising campaign results and bestseller achievements.</p>
                        <div class="port-card-footer">
                            <span class="port-card-year"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>2025</span>
                            <a href="javascript:void(0)" class="port-case-link" onclick="event.stopPropagation();viewProject(this);">View Result &rarr;</a>
                        </div>
                    </div>
                </div>
'''

def main():
    # Generate all cards
    all_cards = []
    
    # Website Design Cards (Shopify + WordPress = 21 total)
    all_cards.append("\n                <!-- WEBSITE DESIGN - 21 TOTAL (10 Shopify + 11 WordPress) -->\n")
    all_cards.append("\n                <!-- Shopify Designs -->\n")
    for title, desc, filename in shopify_designs:
        all_cards.append(generate_img_card(title, "Website Design", desc, filename, "SHOPIFY DESIGN"))
    
    all_cards.append("\n                <!-- WordPress Designs -->\n")
    for title, desc, filename in wordpress_designs:
        all_cards.append(generate_img_card(title, "Website Design", desc, filename, "WORDPRESS WEDSITE"))
    
    # Pitch Deck Cards (8 PDF files)
    all_cards.append("\n                <!-- PITCH DECK - 8 TOTAL -->\n")
    for title, desc, filename in pitch_decks:
        all_cards.append(generate_pdf_card(title, "Pitch Deck", desc, filename, "PITCH DECK AND PRESENTATION", "pitch"))
    
    # eBook Design Cards (13 PDF files - usable ones)
    all_cards.append("\n                <!-- EBOOK DESIGN - 13 TOTAL -->\n")
    for title, desc, filename in ebooks:
        all_cards.append(generate_pdf_card(title, "eBook Design", desc, filename, "DESIGNED AND WRITTEN EBOOKS", "ebook"))
    
    # Website Sales Cards (12 images + 6 videos = 18 total)
    all_cards.append("\n                <!-- WEBSITE SALES - 18 TOTAL (12 images + 6 videos) -->\n")
    for item in website_sales:
        if len(item) == 4:  # Video
            title, desc, filename, _ = item
            all_cards.append(generate_video_card(title, "Website Sales", desc, filename, "SHOPIFY SALES"))
        else:  # Image
            title, desc, filename = item
            all_cards.append(generate_img_card(title, "Website Sales", desc, filename, "SHOPIFY SALES"))
    
    # Amazon KDP Cards (39 images)
    all_cards.append("\n                <!-- AMAZON KDP - 39 TOTAL -->\n")
    for i, filename in enumerate(kdp_files, 1):
        all_cards.append(generate_kdp_card(filename, i))
    
    # Join all cards
    new_grid_content = "".join(all_cards)
    
    # Read the original file
    with open("portfolio.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find and replace the portfolio grid section
    # Pattern: from "<!-- Portfolio Grid -->" to the closing div of the grid
    pattern = r'(<!-- Portfolio Grid -->\s*<section class="port-section">\s*<div class="container">\s*<div class="port-grid" id="port-grid">).*?(\s*</div>\s*<!-- Load More -->)'
    
    replacement = r'\1\n' + new_grid_content + r'\2'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write the updated file
    with open("portfolio.html", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    # Print summary
    total_cards = len(shopify_designs) + len(wordpress_designs) + len(pitch_decks) + len(ebooks) + len(website_sales) + len(kdp_files)
    print(f"✅ Updated portfolio.html with {total_cards} portfolio items:")
    print(f"   - Website Design: {len(shopify_designs) + len(wordpress_designs)} (10 Shopify + 11 WordPress)")
    print(f"   - Pitch Deck: {len(pitch_decks)}")
    print(f"   - eBook Design: {len(ebooks)}")
    print(f"   - Website Sales: {len(website_sales)} (12 images + 6 videos)")
    print(f"   - Amazon KDP: {len(kdp_files)}")

if __name__ == "__main__":
    main()
