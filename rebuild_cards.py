import os
import re

base_path = r"c:\Users\OWNER\Downloads\THEGENIUSUSAGENCY\portfolios"

# Check what files exist
ebook_folder = os.path.join(base_path, "DESIGNED AND WRITTEN EBOOKS")
pitch_folder = os.path.join(base_path, "PITCH DECK AND PRESENTATION")

print("eBook folder exists:", os.path.exists(ebook_folder))
print("Pitch folder exists:", os.path.exists(pitch_folder))

if os.path.exists(ebook_folder):
    ebook_files = os.listdir(ebook_folder)
    print(f"\neBook files ({len(ebook_files)}):")
    for f in ebook_files[:5]:
        print(f"  - {f}")

if os.path.exists(pitch_folder):
    pitch_files = os.listdir(pitch_folder)
    print(f"\nPitch Deck files ({len(pitch_files)}):")
    for f in pitch_files[:5]:
        print(f"  - {f}")
