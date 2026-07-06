import os
import re

def get_all_files(directory, ext):
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith(ext):
                files.append(os.path.join(root, filename))
    return files

def check_usage(target_files, search_dir):
    search_files = get_all_files(search_dir, ('.ts', '.tsx'))
    unused = []
    for t in target_files:
        basename = os.path.basename(t)
        name, _ = os.path.splitext(basename)
        if name in ['index', 'App', 'main', 'vite-env.d']:
            continue
        
        used = False
        for s in search_files:
            if s == t:
                continue
            with open(s, 'r', encoding='utf-8') as f:
                content = f.read()
                # Check for import or usage
                if re.search(r'\b' + name + r'\b', content):
                    used = True
                    break
        if not used:
            unused.append(t)
    return unused

views = get_all_files('src/views', ('.tsx',))
components = get_all_files('src/components', ('.tsx',))

unused_views = check_usage(views, 'src')
unused_components = check_usage(components, 'src')

print("Unused Views:", unused_views)
print("Unused Components:", unused_components)
