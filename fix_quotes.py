#!/usr/bin/env python3
"""
Fix escaped quotes in portfolio.html onclick handlers
"""

import re

# Read the file
with open("portfolio.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace escaped quotes in onclick handlers
# Pattern: onclick=\"openModal(...)\" -> onclick="openModal(...)"
content = re.sub(r'onclick=\\"openModal\(([^)]+)\\"', r'onclick="openModal(\1)"', content)

# Also fix any other escaped quotes in the file
content = content.replace('\\"', '"')

# Write the updated file
with open("portfolio.html", "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Fixed escaped quotes in portfolio.html")
