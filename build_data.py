import os
import csv
import json
import glob

def csv_to_list(file_path):
    data = []
    if not os.path.exists(file_path):
        return data
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    stacks_dir = os.path.join(data_dir, 'stacks')
    
    output_data = {}
    
    # Map of key name to filename
    files = {
        'styles': 'styles.csv',
        'colors': 'colors.csv',
        'typography': 'typography.csv',
        'charts': 'charts.csv',
        'prompts': 'prompts.csv',
        'guidelines': 'ux-guidelines.csv'
    }

    # Process main files
    for key, filename in files.items():
        path = os.path.join(data_dir, filename)
        output_data[key] = csv_to_list(path)
        print(f"Processed {filename} -> {len(output_data[key])} items")

    # Process stacks
    output_data['stacks'] = []
    stack_files = glob.glob(os.path.join(stacks_dir, '*.csv'))
    
    # We want a specific order or just all of them? 
    # The original viewer had a specific list, but glob is fine as long as we get the name right.
    # Original list: html-tailwind, react, nextjs, vue, svelte, swiftui, react-native, flutter
    
    # Let's map filename to display name roughly or just use the filename base
    stack_name_map = {
        'html-tailwind': 'HTML + Tailwind',
        'react': 'React',
        'nextjs': 'Next.js',
        'vue': 'Vue',
        'svelte': 'Svelte',
        'swiftui': 'SwiftUI',
        'react-native': 'React Native',
        'flutter': 'Flutter'
    }
    
    # To maintain specific order if desired, or just sort
    # Let's trust the glob but maybe sort by name to be deterministic
    stack_files.sort()
    
    for s_path in stack_files:
        basename = os.path.splitext(os.path.basename(s_path))[0]
        name = stack_name_map.get(basename, basename.title())
        csv_data = csv_to_list(s_path)
        output_data['stacks'].append({
            'name': name,
            'data': csv_data
        })
        print(f"Processed stack {basename} -> {len(csv_data)} items")

    # Write to data.js
    output_path = os.path.join(base_dir, 'data.js')
    js_content = f"window.DS_DATA = {json.dumps(output_data, ensure_ascii=False, indent=2)};"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Successfully created {output_path}")

if __name__ == "__main__":
    main()
