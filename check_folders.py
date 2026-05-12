import os
import glob

base_path = r"c:\Users\OWNER\Downloads\THEGENIUSAGENCY\portfolios"

folders = [
    "DESIGNED AND WRITTEN EBOOKS",
    "PITCH DECK AND PRESENTATION"
]

for folder in folders:
    folder_path = os.path.join(base_path, folder)
    print(f"\n=== {folder} ===")
    if os.path.exists(folder_path):
        files = os.listdir(folder_path)
        print(f"Found {len(files)} files:")
        for f in files:
            print(f"  - {f}")
    else:
        print("Folder does not exist!")
