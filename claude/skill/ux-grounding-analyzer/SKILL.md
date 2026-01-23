---
name: UX Grounding Analyzer
description: Analyze grounded UI elements for UX quality using GroundCUA annotations
version: 1.0.0
---

# UX Grounding Analyzer Skill

將 GroundCUA 的 UI 元素定位（grounding）與 UX 設計評估結合，實現精確的元素級 UX 分析。

## 功能 (Capabilities)

1. **UI 元素解析** - 讀取 GroundCUA 格式的 JSON 標註
2. **類別映射分析** - 根據元素類別（Button, Menu, Input 等）應用對應 UX 規則
3. **Dark Pattern 檢測** - 掃描可疑互動模式
4. **無障礙審計** - 檢查對比度、觸控目標大小、標籤清晰度
5. **報告生成** - 輸出帶有 bbox 座標的改善建議

---

## 輸入格式

```json
{
  "screenshot": "path/to/image.png",
  "annotations": [
    {
      "image_path": "Platform/hash.png",
      "bbox": [x1, y1, x2, y2],
      "text": "Button label",
      "category": "Button",
      "id": "uuid"
    }
  ]
}
```

---

## 分析規則

### Button 元素
- ✅ 觸控目標 ≥ 48x48 像素
- ✅ 文字標籤清晰表達功能
- ⚠️ 檢查是否使用 Confirmshaming
- ⚠️ 檢查雙重否定措辭

### Input Elements
- ✅ 有明確的 label（非僅 placeholder）
- ✅ 錯誤狀態有視覺反饋
- ⚠️ 檢查是否強制填寫非必要資訊

### Menu / Navigation
- ✅ 層級深度 ≤ 3
- ✅ 當前位置有視覺提示
- ⚠️ 檢查 Hidden Costs 或重要選項被隱藏

### Sidebar
- ✅ 分組邏輯清晰
- ✅ 認知負荷適中（項目數 ≤ 7±2）

---

## 輸出格式

```json
{
  "summary": {
    "total_elements": 45,
    "issues_found": 3,
    "severity": "medium"
  },
  "issues": [
    {
      "element_id": "uuid",
      "bbox": [100, 200, 150, 250],
      "category": "Button",
      "issue_type": "touch_target_too_small",
      "current_size": [50, 30],
      "recommended_size": [48, 48],
      "fix_suggestion": "增加按鈕 padding 至少 9px"
    }
  ],
  "passed": [
    {
      "element_id": "uuid",
      "category": "Navigation",
      "check": "hierarchy_depth",
      "status": "pass"
    }
  ]
}
```

---

## 使用方式

```python
from ux_grounding_analyzer import analyze_screenshot

result = analyze_screenshot(
    screenshot="data/groundcua_sample/images/Chromium/000ab2c7...png",
    annotations="data/groundcua_sample/data/Chromium/000ab2c7...json"
)

print(result["summary"])
for issue in result["issues"]:
    print(f"[{issue['category']}] {issue['issue_type']} at {issue['bbox']}")
```

---

## 數據來源

- **GroundCUA**: `huggingface:ServiceNow/GroundCUA` (MIT License)
- **Dark Pattern 規則**: `data/dark_patterns_annotated.json`
- **UICrit 評論**: `data/uicrit_curated.json`

---

## 引用

```bibtex
@misc{feizi2025groundingcomputeruseagents,
  title={Grounding Computer Use Agents on Human Demonstrations},
  author={Aarash Feizi et al.},
  year={2025},
  eprint={2511.07332}
}
```
