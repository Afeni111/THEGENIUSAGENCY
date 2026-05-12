import os

replacements = {
    '<!-- Instagram -->\n                        <a href="#"': '<!-- Instagram -->\n                        <a href="https://www.instagram.com/thegeniusagencyteamhq"',
    '<!-- Facebook -->\n                        <a href="#"': '<!-- Facebook -->\n                        <a href="https://www.facebook.com/TheGeniusAgency/"',
    '<!-- TikTok -->\n                        <a href="#"': '<!-- TikTok -->\n                        <a href="https://www.tiktok.com/@thegeniusagencytm?is_from_webapp=1&sender_device=pc"',
    '<!-- YouTube -->\n                        <a href="#"': '<!-- YouTube -->\n                        <a href="https://www.youtube.com/@The_Genius_Agency"'
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith('.html'):
                update_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
