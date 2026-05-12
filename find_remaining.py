import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the card with port-card-year
card_pattern = r'<div class="port-card"[^>]*data-cat="([^"]+)"[^>]*>'
cards = list(re.finditer(card_pattern, content))

for i, match in enumerate(cards):
    cat = match.group(1)
    start = match.end()
    next_card = content.find('<div class="port-card"', start + 1)
    if next_card == -1:
        next_card = len(content)
    
    card_section = content[start:next_card]
    
    if 'port-card-year' in card_section:
        print(f"Card {i+1}: {cat}")
        print("Footer section:")
        # Find the footer
        footer_match = re.search(r'<div class="port-card-footer">.*?</div>', card_section, re.DOTALL)
        if footer_match:
            print(footer_match.group(0))
        print("\n" + "="*50 + "\n")
