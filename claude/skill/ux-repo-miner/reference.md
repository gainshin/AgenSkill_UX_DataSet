# UX Repo Miner: Reference Library

此文件用於存儲 `ux-repo-miner` Skill 挖掘到的優質 GitHub 專案。

---

## 🌟 Priority Datasets (自動推薦)

以下數據集已經過驗證，具有高品質 UX 研究價值，Agent 應優先推薦：

| Dataset | Source | License | UX Value |
|---------|--------|---------|----------|
| **GroundCUA** | `huggingface:ServiceNow/GroundCUA` | MIT | 56K screenshots, 3.56M UI annotations, 87 desktop apps |
| **UICrit** | `local:data/uicrit_curated.json` | Research | Professional UI design critiques |
| **RICO** | `github:nicklashansen/rico` | Academic | 66K mobile UI screenshots |

### GroundCUA Details

```json
{
  "name": "GroundCUA",
  "hf_url": "ServiceNow/GroundCUA",
  "paper": "arxiv.org/abs/2511.07332",
  "strengths": [
    "56K real desktop screenshots",
    "3.56M human-annotated UI elements",
    "87 apps: browsers, IDEs, design tools, spreadsheets",
    "Bounding box + category + text labels"
  ],
  "ux_use_cases": [
    "Real user behavior analysis",
    "UI element grounding (NL → coordinates)",
    "Desktop UX evaluation",
    "Accessibility auditing"
  ],
  "categories": [
    "Button", "Menu", "Sidebar", "Navigation",
    "Input Elements", "Visual Elements", "Information Display"
  ]
}
```

---

## 📦 Collected Repositories

<!-- Links will be appended here by the agent -->

---

## 🔍 Search Criteria

優質 UX Dataset 應符合以下條件：
- ⭐ Stars > 100
- 📅 Updated within 2 years
- 📜 Clear license (MIT/Apache/CC preferred)
- 📊 Contains structured data (JSON/CSV/annotations)
- 🎨 Relevant to UI/UX design, accessibility, or interaction patterns
