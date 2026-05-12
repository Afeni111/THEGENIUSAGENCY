import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Count cards by category
cards = re.findall(r'<div class="port-card"[^>]*data-cat="([^"]+)"', content)
from collections import Counter
counts = Counter(cards)

print("Current card counts:")
for cat, count in sorted(counts.items()):
    print(f"  {cat}: {count}")
print(f"\nTotal: {len(cards)} cards")

# Check if new cards exist
if "Business Case v1" in content:
    print("\n✅ New Pitch Deck cards inserted!")
if "Whipped Cream Desserts" in content:
    print("✅ New eBook Design cards inserted!")
