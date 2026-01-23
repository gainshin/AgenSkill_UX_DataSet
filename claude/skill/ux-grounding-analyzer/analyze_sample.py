#!/usr/bin/env python3
"""
UX Grounding Analyzer - Sample Analysis Script

This script demonstrates how to analyze GroundCUA annotations
for UX quality issues.

Usage:
    python analyze_sample.py
"""

import json
import os
from pathlib import Path

# Minimum touch target size (Apple HIG / Material Design)
MIN_TOUCH_TARGET = 44  # pixels

# UI element category rules
CATEGORY_RULES = {
    "Button": {
        "min_size": MIN_TOUCH_TARGET,
        "checks": ["touch_target", "label_clarity", "confirmshaming"]
    },
    "Input Elements": {
        "checks": ["has_label", "placeholder_only"]
    },
    "Menu": {
        "checks": ["hierarchy_depth", "hidden_options"]
    },
    "Navigation": {
        "checks": ["current_indicator", "consistency"]
    },
    "Sidebar": {
        "max_items": 9,  # 7±2 cognitive load
        "checks": ["grouping", "cognitive_load"]
    }
}

def load_annotations(json_path: str) -> list:
    """Load GroundCUA annotation JSON file."""
    with open(json_path, 'r') as f:
        return json.load(f)

def calculate_size(bbox: list) -> tuple:
    """Calculate width and height from bbox [x1, y1, x2, y2]."""
    x1, y1, x2, y2 = bbox
    return (x2 - x1, y2 - y1)

def check_touch_target(element: dict) -> dict | None:
    """Check if button/interactive element meets minimum touch target."""
    if element.get("category") not in ["Button", "Input Elements"]:
        return None
    
    width, height = calculate_size(element["bbox"])
    
    if width < MIN_TOUCH_TARGET or height < MIN_TOUCH_TARGET:
        return {
            "element_id": element["id"],
            "bbox": element["bbox"],
            "category": element["category"],
            "issue_type": "touch_target_too_small",
            "current_size": [round(width, 1), round(height, 1)],
            "recommended_size": [MIN_TOUCH_TARGET, MIN_TOUCH_TARGET],
            "severity": "high",
            "fix_suggestion": f"增加元素尺寸至少 {MIN_TOUCH_TARGET}x{MIN_TOUCH_TARGET}px"
        }
    return None

def check_sidebar_cognitive_load(elements: list) -> dict | None:
    """Check if sidebar has too many items."""
    sidebar_items = [e for e in elements if e.get("category") == "Sidebar"]
    
    if len(sidebar_items) > CATEGORY_RULES["Sidebar"]["max_items"]:
        return {
            "element_id": "sidebar_group",
            "category": "Sidebar",
            "issue_type": "cognitive_overload",
            "current_count": len(sidebar_items),
            "recommended_max": CATEGORY_RULES["Sidebar"]["max_items"],
            "severity": "medium",
            "fix_suggestion": "考慮將側邊欄項目分組或使用折疊選單"
        }
    return None

def analyze_annotations(annotations: list) -> dict:
    """
    Analyze GroundCUA annotations for UX issues.
    
    Returns:
        dict with summary and detailed issues
    """
    issues = []
    passed = []
    
    # Check each element
    for element in annotations:
        # Touch target check
        touch_issue = check_touch_target(element)
        if touch_issue:
            issues.append(touch_issue)
        elif element.get("category") in ["Button", "Input Elements"]:
            passed.append({
                "element_id": element["id"],
                "category": element["category"],
                "check": "touch_target",
                "status": "pass"
            })
    
    # Aggregate checks
    sidebar_issue = check_sidebar_cognitive_load(annotations)
    if sidebar_issue:
        issues.append(sidebar_issue)
    
    # Categorize by severity
    high_severity = len([i for i in issues if i.get("severity") == "high"])
    medium_severity = len([i for i in issues if i.get("severity") == "medium"])
    
    overall_severity = "high" if high_severity > 0 else "medium" if medium_severity > 0 else "low"
    
    return {
        "summary": {
            "total_elements": len(annotations),
            "issues_found": len(issues),
            "passed_checks": len(passed),
            "severity": overall_severity
        },
        "issues": issues,
        "passed": passed[:5]  # Limit passed list for brevity
    }

def main():
    """Run sample analysis on downloaded GroundCUA data."""
    # Path to sample data
    sample_dir = Path(__file__).parent.parent.parent.parent / "data" / "groundcua_sample"
    chromium_data = sample_dir / "data" / "Chromium"
    
    # Find first JSON file
    json_files = list(chromium_data.glob("*.json"))
    
    if not json_files:
        print("❌ No sample data found. Run download script first.")
        return
    
    sample_file = json_files[0]
    print(f"📂 Analyzing: {sample_file.name}")
    print("-" * 50)
    
    # Load and analyze
    annotations = load_annotations(sample_file)
    result = analyze_annotations(annotations)
    
    # Print results
    print(f"\n📊 Summary:")
    print(f"   Total elements: {result['summary']['total_elements']}")
    print(f"   Issues found:   {result['summary']['issues_found']}")
    print(f"   Passed checks:  {result['summary']['passed_checks']}")
    print(f"   Severity:       {result['summary']['severity'].upper()}")
    
    if result['issues']:
        print(f"\n⚠️  Issues:")
        for issue in result['issues'][:5]:
            print(f"   [{issue['category']}] {issue['issue_type']}")
            print(f"       → {issue['fix_suggestion']}")
    
    # Save report
    report_path = sample_dir / "analysis_report.json"
    with open(report_path, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Report saved to: {report_path}")

if __name__ == "__main__":
    main()
