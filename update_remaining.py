#!/usr/bin/env python3
"""Update remaining portfolio cards with new button design"""

import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all cards with data-cat
card_pattern = r'<div class="port-card"[^>]*data-cat="([^"]+)"[^>]*>'
cards = list(re.finditer(card_pattern, content))

updated = 0

# Process from end to start
for match in reversed(cards):
    cat = match.group(1)
    start = match.end()
    
    # Find the end of this card (next card or end of grid)
    next_card = content.find('<div class="port-card"', start + 1)
    if next_card == -1:
        next_card = len(content)
    
    card_section = content[start:next_card]
    
    # Check if it has the old footer structure
    if 'port-card-year' in card_section and 'port-case-link' in card_section:
        # Find and replace the footer
        old_footer_pattern = r'<div class="port-card-footer">\s*<span class="port-card-year">.*?<\/span>\s*<a href="javascript:void\(0\)" class="port-case-link" onclick="event\.stopPropagation\(\);viewProject\(this\);">View Project.*?<\/a>\s*<\/div>'
        
        cat_encoded = cat.replace(' ', '+')
        new_footer = f'<div class="port-card-footer">\n                            <a href="expert.html?category={cat_encoded}" class="port-btn port-btn-secondary" onclick="event.stopPropagation();">View Expert</a>\n                            <a href="javascript:void(0)" class="port-btn port-btn-primary" onclick="event.stopPropagation();viewProject(this);">View Project &rarr;</a>\n                        </div>'
        
        new_card_section = re.sub(old_footer_pattern, new_footer, card_section, flags=re.DOTALL, count=1)
        
        if new_card_section != card_section:
            content = content[:start] + new_card_section + content[next_card:]
            updated += 1

with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ Updated {updated} remaining cards with new button design")
