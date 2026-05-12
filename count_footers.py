import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Count old footers
old_footers = len(re.findall(r'<span class="port-card-year">.*?</svg>.*?</span>\s*<a href="javascript:void\(0\)" class="port-case-link"', content, re.DOTALL))
print(f'Cards with old footer: {old_footers}')

# Count new footers
new_footers = len(re.findall(r'class="port-btn port-btn-secondary"', content))
print(f'Cards with new buttons: {new_footers}')

# Count total cards
cards = len(re.findall(r'<div class="port-card"', content))
print(f'Total cards: {cards}')
