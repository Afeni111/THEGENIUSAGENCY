#!/usr/bin/env python3
"""Update all portfolio cards with new button design"""

import re

# Read the file
with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match a portfolio card and extract components
card_pattern = r'(<div class="port-card"[^>]*data-cat="([^"]+)"[^>]*>.*?<div class="port-card-footer">)\s*<span class="port-card-year">.*?<\/svg>([^<]+)<\/span>\s*<a href="javascript:void\(0\)" class="port-case-link" onclick="event\.stopPropagation\(\);viewProject\(this\);">View Project[^<]*<\/a>\s*(<\/div>\s*<\/div>\s*<\/div>)'

def replace_footer(match):
    before = match.group(1)
    category = match.group(2)
    date = match.group(3).strip()
    after = match.group(4)
    
    # Create new footer with category-encoded URL
    category_encoded = category.replace(' ', '+')
    
    new_footer = f'''<div class="port-card-footer">
                            <a href="expert.html?category={category_encoded}" class="port-btn port-btn-secondary" onclick="event.stopPropagation();">View Expert</a>
                            <a href="javascript:void(0)" class="port-btn port-btn-primary" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>
                        </div>{after}'''
    
    return before + new_footer

# Replace all occurrences
new_content = re.sub(card_pattern, replace_footer, content, flags=re.DOTALL)

# Count replacements
count = len(re.findall(card_pattern, content, flags=re.DOTALL))

# Write back
with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ Updated {count} portfolio cards with new button design")
