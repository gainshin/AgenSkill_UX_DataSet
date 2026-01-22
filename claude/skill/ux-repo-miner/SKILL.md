---
name: ux-repo-miner
description: 專門用於挖掘 GitHub 上 UX/UI 設計資源、數據集與開源工具的智能 Skill。將 GitHub 視為 UX 研究的彈藥庫。
---

# UX Repo Miner Skill

## 🎯 目的 (Goal)
將 GitHub 轉化為 UX 研究的開源彈藥庫。接收自然語言描述的 UX 需求，自動搜索、篩選、分析相關開源專案，並結構化回傳結果。重點在於識別該資源是否與現有的 `AgenSkill_UX_DataSet` 形成互補。

## 🧠 上下文 (Context: AgenSkill_UX_DataSet)
此 Skill 服務於 `AgenSkill_UX_DataSet` 生態。該數據集目前核心包含：
- **視覺智能 (Visual)**: 57 種設計風格 (CSS/Variables)。
- **倫理智能 (Ethical)**: Dark Pattern 標註數據集 (AidUI 結構)。
- **設計評論 (UICrit)**: Mobile UI RICO 評論數據。
- **Agent Skills**: 用於生成 UX 決策的 Agent 技能庫。

**互補性判斷標準**:
- **高優先級 (Complementary)**: 填補現有空白 (e.g., Voice UI, VR/AR, 金融/醫療特定領域 UX, 完整的 User Flow 數據集, 可訪問性測試工具)。
- **低優先級 (Redundant)**: 與現有高度重疊且無顯著差異的通用 UI Kits。

## 📝 執行流程 (Workflow)

### 1. 🔍 需求解析與搜索 (Search)
- **Input**: 接收用戶的 UX 需求 (e.g., "Mobile onboarding flow dataset").
- **Action**: 在 GitHub 進行關鍵字搜索。
- **Sorting**: 
  - 預設按 **Stars** 排序以確保品質。
  - 若需求強調「最新趨勢」，則按 **Recently Updated** 排序。

### 2. 📖 內容分析 (Analyze)
針對搜索到的前 3-5 個高相關專案，讀取其 `README.md` 與檔案結構，抽取以下 Metadata：

- **資料型態 (Data Type)**: Dataset (JSON/CSV), Image Set, Design System (Code), Tool/Library, Paper/Research.
- **任務類型 (Task Type)**: Classification, Detection, Generation, Annotation, Heuristic Evaluation.
- **授權 (License)**: MIT, Apache 2.0, CC-BY-NC (注意商業可用性).
- **適用場景 (UX Scene)**: Mobile, Web, Dashboard, Chatbot, VR, etc.

### 3. ✅ 互補性標記 (Compatibility Check)
- 判斷該專案與 `AgenSkill_UX_DataSet` 的關係。
- **Tag**: `[Complementary]`, `[Extension]`, `[Alternative]`, `[Unrelated]`.

### 4. 📤 輸出與存檔 (Output)
- **JSON 回傳**: 將分析結果以結構化 JSON 回傳給用戶。
- **存檔**: 將符合條件的優秀專案連結與簡述追加寫入本目錄下的 `reference.md`。

## 💻 輸出格式範例 (Output Example)

```json
[
  {
    "name": "example-ux-dataset",
    "url": "https://github.com/example/ux-dataset",
    "stars": 1200,
    "last_updated": "2024-12-01",
    "metadata": {
      "data_type": "Dataset (JSON + Screenshots)",
      "task_type": "Flow Analysis",
      "license": "CC-BY-4.0",
      "ux_scene": "Mobile Onboarding"
    },
    "relationship": "Complementary",
    "reason": "提供了目前 dataset 缺乏的完整 Onboarding 流程截圖，可補充 UICrit 的單頁視角。"
  }
]
```

## 📂 檔案操作 (File Action)
若用戶指示「下載資料」，則使用 `git clone` 或 `download` 工具將核心資料夾下載至指定路徑。

## 📚 知識庫更新 (Knowledge Update)
每次執行後，自動將推薦的 Repo 記錄於 `reference.md`：
格式：`- [Project Name](URL) - **[Tag]** Description (Stars: N)`
