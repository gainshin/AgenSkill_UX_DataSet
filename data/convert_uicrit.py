#!/usr/bin/env python3
"""
Convert UICrit CSV to JSON format for Local Viewer integration.
Groups critiques by rico_id and extracts structured data.
"""

import csv
import json
import ast
import re
from collections import defaultdict

def parse_comment(comment_text):
    """Parse a single comment to extract text and bounding box."""
    bbox_match = re.search(r'Bounding Box:\s*\[([\d.,\s]+)\]', comment_text)
    bbox = None
    if bbox_match:
        try:
            coords = [float(x.strip()) for x in bbox_match.group(1).split(',')]
            if len(coords) == 4:
                bbox = coords
        except:
            pass
    
    # Remove bounding box from comment text
    clean_text = re.sub(r'\s*Bounding Box:\s*\[[\d.,\s]+\]\s*$', '', comment_text).strip()
    
    return {
        "text": clean_text,
        "bounding_box": bbox
    }

def categorize_comment(comment_text):
    """Categorize comment based on content keywords."""
    text_lower = comment_text.lower()
    
    if any(word in text_lower for word in ['contrast', 'color', 'background', 'foreground']):
        return 'color'
    elif any(word in text_lower for word in ['font', 'text', 'read', 'typography', 'size']):
        return 'typography'
    elif any(word in text_lower for word in ['align', 'padding', 'spacing', 'position', 'margin']):
        return 'spacing'
    elif any(word in text_lower for word in ['button', 'click', 'tap', 'icon', 'menu']):
        return 'interaction'
    elif any(word in text_lower for word in ['hierarchy', 'prominent', 'dominant', 'important']):
        return 'hierarchy'
    elif any(word in text_lower for word in ['accessible', 'disability', 'screen reader']):
        return 'accessibility'
    else:
        return 'general'

def determine_severity(ratings):
    """Determine severity based on ratings."""
    avg_rating = sum(ratings.values()) / len(ratings) if ratings else 5
    if avg_rating <= 4:
        return 'high'
    elif avg_rating <= 6:
        return 'medium'
    else:
        return 'low'

def main():
    csv_path = '/Users/admin/Library/Mobile Documents/com~apple~CloudDocs/Github/ui-ux-pro-design_system/local_viewer/data/uicrit_public.csv'
    
    # Group data by rico_id
    screens = defaultdict(lambda: {
        "rico_id": None,
        "tasks": [],
        "ratings": {"aesthetics": [], "learnability": [], "efficiency": [], "usability": [], "design_quality": []},
        "critiques": []
    })
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            rico_id = row['rico_id']
            screen = screens[rico_id]
            screen["rico_id"] = rico_id
            
            # Collect task descriptions
            task = row['task'].strip()
            if task and task not in screen["tasks"]:
                screen["tasks"].append(task)
            
            # Collect ratings
            try:
                screen["ratings"]["aesthetics"].append(int(row['aesthetics_rating']))
                screen["ratings"]["learnability"].append(int(row['learnability']))
                screen["ratings"]["efficiency"].append(int(row['efficency']))  # Note: typo in original CSV
                screen["ratings"]["usability"].append(int(row['usability_rating']))
                screen["ratings"]["design_quality"].append(int(row['design_quality_rating']))
            except:
                pass
            
            # Parse comments
            try:
                comments_list = ast.literal_eval(row['comments'])
                sources_list = ast.literal_eval(row['comments_source'])
                
                for i, comment in enumerate(comments_list):
                    source = sources_list[i] if i < len(sources_list) else 'unknown'
                    parsed = parse_comment(comment)
                    category = categorize_comment(comment)
                    
                    critique = {
                        "text": parsed["text"],
                        "bounding_box": parsed["bounding_box"],
                        "source": source,
                        "category": category
                    }
                    
                    # Avoid duplicates
                    if not any(c["text"] == critique["text"] for c in screen["critiques"]):
                        screen["critiques"].append(critique)
            except Exception as e:
                pass
    
    # Convert to final format with averaged ratings
    result = []
    for rico_id, data in screens.items():
        avg_ratings = {}
        for key, values in data["ratings"].items():
            avg_ratings[key] = round(sum(values) / len(values), 1) if values else None
        
        severity = determine_severity(avg_ratings)
        
        result.append({
            "rico_id": data["rico_id"],
            "task": data["tasks"][0] if data["tasks"] else "Unknown",
            "all_tasks": data["tasks"],
            "ratings": avg_ratings,
            "severity": severity,
            "critiques": data["critiques"][:10]  # Limit to 10 critiques per screen
        })
    
    # Sort by design_quality rating (worst first for learning)
    result.sort(key=lambda x: x["ratings"].get("design_quality") or 10)
    
    # Save full dataset
    output_path = '/Users/admin/Library/Mobile Documents/com~apple~CloudDocs/Github/ui-ux-pro-design_system/local_viewer/data/uicrit_full.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(result)} screens with critiques")
    print(f"Saved to: {output_path}")
    
    # Also create a smaller curated subset (top 50 most educational examples)
    curated = result[:50]
    curated_path = '/Users/admin/Library/Mobile Documents/com~apple~CloudDocs/Github/ui-ux-pro-design_system/local_viewer/data/uicrit_curated.json'
    with open(curated_path, 'w', encoding='utf-8') as f:
        json.dump(curated, f, ensure_ascii=False, indent=2)
    
    print(f"Saved curated subset (50 screens) to: {curated_path}")

if __name__ == "__main__":
    main()
