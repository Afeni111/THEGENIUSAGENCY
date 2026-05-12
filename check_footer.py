import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find one example of old footer
match = re.search(r'<div class="port-card-footer">.*?port-case-link.*?</div>', content, re.DOTALL)
if match:
    print('Found old footer:')
    print(match.group(0)[:500])
else:
    print('No old footer found')

# Count
count = len(re.findall(r'port-case-link', content))
print(f'\nTotal port-case-link occurrences: {count}')
