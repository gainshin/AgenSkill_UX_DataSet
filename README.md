# 🎨 AI/UX System Dataset

<div align="center">

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Made for UX Designers](https://img.shields.io/badge/Made%20for-UX%20Designers-blue.svg)]()
[![AI Agent Ready](https://img.shields.io/badge/AI%20Agent-Ready-green.svg)]()

**面向 UX 設計師與 AI Agent 的設計系統數據集**
*A Design System Dataset for UX Designers to Understand AI Agent Decision-Making*

[中文 Readme](README.md) | [English Readme](README_EN.md)

</div>

---

## 📖 專案簡介 (Project Overview)

本專案是一個面向 **UX 設計師** 的教育資源與 **AI Agent** 的知識庫，旨在從人類用戶的瀏覽角度，幫助理解 **AI Agent 的思維鏈 (Chain-of-Thought, COT)** 如何運用設計系統進行設計決策。

核心展示了從「風格選擇」到「倫理檢視」的完整決策過程，特別強調將 UX 專業知識轉化為 Agent 可執行的結構化數據。

### 🎯 核心模組 (Core Modules)

| 模組 | 說明 | 狀態 |
|------|------|------|
| 🎨 **視覺智能 (Visual Intelligence)** | 57 種設計風格的完整 CSS 實現與互動展示 | ✅ 已完成 |
| 🛡️ **倫理智能 (Ethical Intelligence)** | 4 層結構的 Dark Pattern 標註數據集與 COT 分析 | ✅ 已完成 |
| 📝 **UICrit 設計評論庫** | 1,000 個 RICO UI 畫面的專業設計評論與評分 | ✅ 已整合 |
| 🧠 **Agent Generator (Vision)** | 推理引擎與 **24+ 整合 Agentic Skills** (skills.rest) | ✅ 已完成 (v1.0) |

### 🤖 Agent 使用指南 (Agent Integration)

本數據集提供統一的 Agent Skill 調用指南與完整的技能庫。

*   **`CLAUDE.md`**: 檢查可用技能的統一指南。
*   **`Skill_reference.md`**: UX/Frontend 核心高優先級技能庫 (Version A)。
*   **`Skill_reference_Full.md`**: 包含 24 個 Design & Creative 技能的完整清單 (Version B)。

支援 **Claude Code**, **Cursor**, **Kiro**, **GitHub Copilot** 等 IDE。

👉 **[查看詳細使用指南 (Usage Guide)](CLAUDE.md)**

### 🛠️ 支援 IDE (Supported IDEs)
本專案已為以下 AI 輔助開發環境優化，支援自動上下文加載與技能調用：
*   **Antigravity** (Deepmind Advanced Agentic Coding)
*   **VSCode** (配合 Copilot/Cursor)
*   **Claude Code**
*   **Cursor** / **Windsurf**

### 🕵️ Tracking Agent Protocol
當您在上述 IDE 中使用 `/ai-ux-sys-dataset` 指令或啟用本數據集時，系統將自動啟動 **Tracking Agent**：
1.  **自動日誌 (Auto-Logging)**: 您的設計決策將被記錄為 `trace.json`。
2.  **思維鏈審計 (COT Auditing)**: 確保生成的 UX 建議具有可復現性 (Reproducibility)。

---

## 🏗️ 核心功能詳解

### 1. 🎨 視覺智能：57 種設計風格系統

透過 `styles.csv` 驅動的互動式 Viewer，即時切換與預覽 57 種截然不同的視覺主題。

*   **7 大風格分組**：
    *   **Core UI**: Glassmorphism, Neumorphism, Material, Flat
    *   **Creative**: Bauhaus, Pop Art, Brutalism
    *   **Motion**: Gaming, Parallax
    *   **Futuristic**: Cyberpunk, Holographic
    *   **Specialized**, **Landing Page**, **Dashboard**
*   **技術實現**：所有風格均轉化為可執行的 CSS Variables 與 Classes，支持一鍵套用與清除。

### 2. 🛡️ 倫理智能：Dark Pattern 數據集

基於 AidUI 架構的 **4 層數據結構**，訓練 Agent 識別並修復惡意設計模式。互動式 Viewer 展示了 10 個經典標註案例。

*   **Level 1: Screen (畫面層)** - URL, 平台, 截圖, 引用來源
*   **Level 2: Component (組件層)** - UI 組件類型 (Button, Popup), Bounding Box 座標
*   **Level 3: Pattern (模式層)** - 類型 (Dark/Good), 嚴重度, 心理學原理 (如 FOMO, Loss Aversion)
*   **Level 4: Agent COT (推理層)**
    *   **觀察 (Observation)**: 視覺層級分析
    *   **推理 (Reasoning)**: 心理學影響評估
    *   **改善 (Remediation)**: 5 步驟具體修復建議

### 3. 📝 UICrit 設計評論庫 (新增)

整合 Google Research 發布的 **UICrit 資料集**，包含 1,000 個 RICO 行動 UI 畫面的專業設計評論。

*   **資料規模**: 11,344 條設計評論，1,000 個畫面
*   **評分維度**: 美學 (Aesthetics)、易學性 (Learnability)、效率 (Efficiency)、易用性 (Usability)、設計品質 (Design Quality)
*   **評論來源**: 👤 Human / 🤖 LLM / 🔀 Both
*   **評論分類**: Typography, Color, Spacing, Hierarchy, Interaction, Accessibility
*   **Bounding Box**: 每條評論含精確定位座標

**資料檔案:**
*   `data/uicrit_public.csv` - 原始 CSV (4.8MB)
*   `data/uicrit_full.json` - 完整 JSON (1,000 畫面)
*   `data/uicrit_curated.json` - 精選子集 (50 畫面)

**引用來源:**
> Yang, G., et al. (2024). *Can AI Assistants Know What They Don't Know?* UIST '24.  
> https://dl.acm.org/doi/10.1145/3654777.3676381  
> Dataset: https://github.com/google-research-datasets/uicrit

### 4. 🧠 Agent Generator: UX Agent Skills (最新)

Generator 分頁現在整合了來自 `skills.rest` 的 **卡片式技能庫 (Skill Library)**，分類了 24+ 個 UX Agent 必備技能。

*   **技能分類**: Design & Creative, Frontend Dev, Dev Tools, API & Architecture, CSS & Motion.
*   **卡片設計**: 每個卡片提供技能定義與使用說明的直接連結。
*   **雙語支援**: 採用「中文為主，英文為輔」的描述格式，方便快速理解。

**推理流程 (概念):**
1.  **風格 (Style)** → 2. **色彩 (Color)** → 3. **字體 (Typo)** → 4. **技術棧 (Stack)** → 5. **UX 準則 (Guidelines)**

**4 層生成架構：**

1.  **設計系統層 (Design System Layer)**
    *   **Tokens**: Color, Spacing, Radius, Elevation
    *   **Components**: 定義狀態 (Default/Hover/Error) 與技術棧綁定 (Tailwind/React)
2.  **畫面與流程層 (Screen & Flow Layer)**
    *   **Structure**: Layout Tree (Section/Column)
    *   **Attention**: 視覺優先級 (Primary/Secondary) & 期待行為
    *   **Flows**: Sitemap & Task Flow
3.  **行為與模式層 (Behavior & Pattern Layer)**
    *   **Ethics Check**: 掃描 Dark Patterns
    *   **Best Practices**: 應用 WCAG 與領域準則 (如 Clinical UX)
4.  **技能生成層 (Skill Output Layer)**
    *   產生 `skill.md`：作為 Agent 的「食譜」，詳細記錄從食材選擇 (Tokens) 到烹飪步驟 (Flows) 的完整履歷。

### 5. 🕵️ Tracking Agent (COT Auditor)
作為「黑盒飛行記錄器」，追蹤並審計 Agent 的決策過程。
- **Auto-Logging**: 自動記錄所有設計決策與 Prompt Context。
- **COT Replication**: 驗證其他 Agent 的思維鏈是否可復現，防止幻覺。
- **位置**: `claude/skill/tracking-agent/`

### 6. ⛏️ UX Repo Miner (Resource)
將 GitHub 視為 UX 彈藥庫的專用 Skill。
- **Search & Analyze**: 自動挖掘互補性高的 UX 數據集與工具。
- **Compatibility**: 優先標記與本數據集互補的開源資源。
- **位置**: `claude/skill/ux-repo-miner/`

---

## 📂 專案架構 (Project Architecture)

```
local_viewer/
├── index.html              # 主介面：包含 Viewer, Generator, Guidelines
├── styles.css              # 包含 57 種風格的完整 CSS 定義
├── viewer.js               # 核心渲染邏輯 (CSV parser, DOM manipulation)
├── data.js                 # 預加載數據包 (包含 Dark Patterns 數據)
├── README.md               # 本文件
├── assets/                 
│   ├── case-studies/       # 詳細 UX 案例分析 HTML
│   └── screenshots/        # Dark Pattern 案例截圖
└── data/                   # 結構化 CSV 數據源
    ├── styles.csv          # 57 種風格定義
    ├── dark-patterns.csv   # 10 個 Dark Pattern 標註案例
    ├── colors.csv          # 53 組配色方案
    ├── typography.csv      # 字體配對
    └── ...
```

---

## 🚀 使用方式 (Usage)

### 1. 啟動 Viewer
建議使用本地服務器以確保 CSV 數據正確加載：

```bash
# 在 local_viewer 目錄下
python3 -m http.server 8080
# 瀏覽器訪問 http://localhost:8080
```

### 2. 瀏覽 Dark Pattern 案例
1.  進入 **「UX 準則 (UX Guidelines)」** 標籤頁。
2.  滾動至 **「🔍 Dark Pattern 標註案例庫」**。
3.  使用篩選器 (Severity, Type) 查找特定案例。
4.  點擊卡片查看完整的 **COT 分析 (觀察-推理-改善)** 與組件標註。

---

## 📜 授權條款 (License)

本專案採用 **CC BY-NC 4.0** 授權。
適用於教育、研究與個人學習。商業用途請聯繫 PrivacyUX Consulting Ltd.

<div align="center">
  
**© 2025 PrivacyUX Consulting Ltd.**  
*Empowering Design with AI Intelligence*

</div>
