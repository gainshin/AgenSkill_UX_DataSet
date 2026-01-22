#!/usr/bin/env python3
"""
Clean duplicate skill cards from index.html
"""

file_path = "/Users/admin/Library/Mobile Documents/com~apple~CloudDocs/Github/ui-ux-pro-design_system/local_viewer/index.html"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line numbers
clear_button_comment_line = None
actual_clear_button_line = None

for i, line in enumerate(lines):
    if '<!-- Floating Clear Style Button -->' in line and clear_button_comment_line is None:
        clear_button_comment_line = i
        print(f"Found clear button comment at line {i+1}")
    if '<button class="clear-style-btn hidden" id="clear-style-btn">' in line:
        actual_clear_button_line = i
        print(f"Found actual clear button at line {i+1}")
        break

if clear_button_comment_line is not None and actual_clear_button_line is not None:
    # Keep everything before clear_button_comment_line + 1, then skip to actual_clear_button_line
    new_lines = lines[:clear_button_comment_line+1] + ['\n'] + lines[actual_clear_button_line:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Successfully removed {actual_clear_button_line - clear_button_comment_line - 1} lines of duplicate content")
    print(f"Removed lines {clear_button_comment_line+2} to {actual_clear_button_line}")
else:
    print("Could not find the markers")
    print(f"Clear button comment line: {clear_button_comment_line}")
    print(f"Actual clear button line: {actual_clear_button_line}")
