import os

with open('folder_list.txt', 'w') as out:
    base = r"c:\Users\OWNER\Downloads\THEGENIUSAGENCY\portfolios"
    for folder in os.listdir(base):
        path = os.path.join(base, folder)
        if os.path.isdir(path):
            files = os.listdir(path)
            out.write(f"\n{folder}: {len(files)} files\n")
            for f in files[:15]:
                out.write(f"  - {f}\n")
            if len(files) > 15:
                out.write(f"  ... and {len(files)-15} more\n")

print("Done! Check folder_list.txt")
