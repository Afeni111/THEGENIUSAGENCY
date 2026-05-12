import os

def update_file(filepath, root_dir):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'js/analytics.js' in content:
        return

    # Calculate relative path to js/analytics.js
    rel_path = os.path.relpath(os.path.join(root_dir, 'js', 'analytics.js'), os.path.dirname(filepath))
    script_tag = f'    <script src="{rel_path.replace(os.sep, "/")}"></script>'

    if '</head>' in content:
        content = content.replace('</head>', f'{script_tag}\n</head>')
    elif '</body>' in content:
        content = content.replace('</body>', f'{script_tag}\n</body>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Injected {script_tag} into {filepath}")

def main():
    root_dir = os.getcwd()
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith('.html'):
                update_file(os.path.abspath(os.path.join(root, file)), root_dir)

if __name__ == "__main__":
    main()
