import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all cards and their categories
card_pattern = r'<div class="port-card"[^>]*data-cat="([^"]+)"[^>]*>'
cards = re.findall(card_pattern, content)

# Count by category
from collections import Counter
counts = Counter(cards)

print("Portfolio cards by category:")
print("=" * 40)
for cat, count in sorted(counts.items()):
    print(f"{cat}: {count} cards")
print("=" * 40)
print(f"Total: {len(cards)} cards")
