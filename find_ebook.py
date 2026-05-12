import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all lines with eBook
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'eBook' in line:
        print(f"Line {i+1}: {line[:100]}")
        if i > 0:
            print(f"  Previous: {lines[i-1][:100]}")
        if i < len(lines) - 1:
            print(f"  Next: {lines[i+1][:100]}")
        print()
