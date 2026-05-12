import re

with open('portfolio.html.bak', 'r', encoding='utf-8') as f:
    content = f.read()

cards = re.findall(r'<div class="port-card"[^>]*data-cat="([^"]+)"', content)
from collections import Counter
counts = Counter(cards)

print('BACKUP counts:')
for cat, count in sorted(counts.items()):
    print(f'{cat}: {count}')
print(f'Total: {len(cards)}')
