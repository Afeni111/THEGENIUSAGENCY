import os
import json

base_path = r"c:\Users\OWNER\Downloads\THEGENIUSAGENCY\portfolios"

result = {}

for folder in os.listdir(base_path):
    folder_path = os.path.join(base_path, folder)
    if os.path.isdir(folder_path):
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        result[folder] = files

# Save to file
with open('portfolio_files.json', 'w') as f:
    json.dump(result, f, indent=2)

print("Scanned folders:")
for folder, files in result.items():
    print(f"  {folder}: {len(files)} files")
