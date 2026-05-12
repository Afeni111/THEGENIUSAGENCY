#!/usr/bin/env python3
"""Update all portfolio cards with new button design - more flexible matching"""

import re

# Read the file
with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# More flexible pattern - just match the footer section
footer_pattern = r'<span class="port-card-year">.*?</span>\s*<a href="javascript:void\(0\)" class="port-case-link" onclick="event\.stopPropagation\(\);viewProject\(this\);">View Project[^<]*</a>'

# Find all unique category values from data-cat attributes in the file
cats = re.findall(r'data-cat="([^"]+)"', content)
print(f"Found categories: {set(cats)}")

# Count current footers
count_before = len(re.findall(footer_pattern, content, flags=re.DOTALL))
print(f"Cards with old footer: {count_before}")

# Find each card and replace individually
card_pattern = r'(<div class="port-card"[^>]*data-cat="([^"]+)"[^>]*>)'
matches = list(re.finditer(card_pattern, content))
print(f"Total cards found: {len(matches)}")

# Process from end to start to avoid position shifts
for i, match in enumerate(reversed(matches)):
    cat = match.group(2)
    pos = match.end()
    
    # Find the next footer in this card
    next_card = content.find('<div class="port-card"', pos)
    if next_card == -1:
        next_card = len(content)
    
    card_section = content[pos:next_card]
    
    # Check if it has the old footer
    if 'port-card-year' in card_section and 'port-case-link' in card_section:
        # Replace within this card section
        old_footer = r'<span class="port-card-year">.*?</span>\s*<a href="javascript:void\(0\)" class="port-case-link" onclick="event\.stopPropagation\(\);viewProject\(this\);">View Project[^<]*</a>'
        
        cat_encoded = cat.replace(' ', '+').replace("'", "\\'")
        new_footer = f'<a href="expert.html?category={cat_encoded}" class="port-btn port-btn-secondary" onclick="event.stopPropagation();">View Expert</a>\n                            <a href="javascript:void(0)" class="port-btn port-btn-primary" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>'
        
        new_card_section = re.sub(old_footer, new_footer, card_section, flags=re.DOTALL, count=1)
        
        if new_card_section != card_section:
            content = content[:pos] + new_card_section + content[next_card:]

# Count after
count_after = len(re.findall(footer_pattern, content, flags=re.DOTALL))
print(f"Cards still with old footer: {count_after}")

# Write back
with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ Updated cards. {count_before - count_after} cards modified.")
