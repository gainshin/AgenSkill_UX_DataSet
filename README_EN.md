# 🎨 AI/UX System Dataset

<div align="center">

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Made for UX Designers](https://img.shields.io/badge/Made%20for-UX%20Designers-blue.svg)]()
[![AI Agent Ready](https://img.shields.io/badge/AI%20Agent-Ready-green.svg)]()

**A Design System Dataset for UX Designers to Understand AI Agent Decision-Making**

[中文 Readme](README.md) | [English Readme](README_EN.md)

</div>

---

## 📖 Project Overview

This project is an educational resource for **UX Designers** and a knowledge base for **AI Agents**, designed to bridge the gap between human design intuition and **AI Chain-of-Thought (COT)** reasoning.

It demonstrates the complete decision-making process from "Visual Style Selection" to "Ethical Review," emphasizing the translation of UX expertise into structured data actionable by Agents.

### 🎯 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| 🎨 **Visual Intelligence** | 57 distinct design styles with full CSS implementation and interactive visualization | ✅ Completed |
| 🛡️ **Ethical Intelligence** | 4-layer Dark Pattern dataset with annotated cases and COT analysis | ✅ Completed |
| 📝 **UICrit Design Critique Library** | 1,000 RICO UI screens with professional design critiques and ratings | ✅ Integrated |
| 🧠 **Agent Generator (Vision)** | Reasoning engine & **24+ Integrated Agentic Skills** (skills.rest) | ✅ Completed (v1.0) |

### 🤖 Agent Integration (Skill Usage)

This dataset introduces a unified guide for Agent Skill invocation and a comprehensive skill library.

*   **`CLAUDE.md`**: Unified guide for checking available skills.
*   **`Skill_reference.md`**: Core high-priority skills for UX/Frontend (Version A).
*   **`Skill_reference_Full.md`**: Complete list of 24 Design & Creative skills (Version B).

Supports **Claude Code**, **Cursor**, **Kiro**, **GitHub Copilot**, and other AI coding tools.

👉 **[View Detailed Usage Guide](CLAUDE.md)**

Command: `/ai-ux-sys-dataset`

---

## 🏗️ Core Features

### 1. 🎨 Visual Intelligence: 57 Design Style Systems

An interactive Viewer driven by `styles.csv` that allows instant switching and previewing of 57 distinct visual themes.

*   **7 Major Style Groups**:
    *   **Core UI**: Glassmorphism, Neumorphism, Material, Flat
    *   **Creative**: Bauhaus, Pop Art, Brutalism
    *   **Motion**: Gaming, Parallax
    *   **Futuristic**: Cyberpunk, Holographic
    *   **Specialized**, **Landing Page**, **Dashboard**
*   **Implementation**: All styles are translated into executable CSS Variables and Classes, supporting one-click application and clearing.

### 2. 🛡️ Ethical Intelligence: Dark Pattern Dataset

A **4-layer data structure** based on the AidUI framework, designed to train Agents to identify and remediate malicious design patterns. The interactive Viewer showcases 10 fully annotated cases.

*   **Level 1: Screen** - URL, Platform, Screenshot, Citations
*   **Level 2: Component** - UI Component Type (Button, Popup), Bounding Box Coordinates
*   **Level 3: Pattern** - Type (Dark/Good), Severity, Psychology Principles (e.g., FOMO, Loss Aversion)
*   **Level 4: Agent COT (Reasoning)**
    *   **Observation**: Visual hierarchy analysis
    *   **Reasoning**: Psychological impact assessment
    *   **Remediation**: 5-step concrete improvement plan

### 3. 📝 UICrit Design Critique Library (New)

Integrates the **UICrit Dataset** released by Google Research, containing professional design critiques for 1,000 mobile UI screens from RICO.

*   **Dataset Size**: 11,344 design critiques across 1,000 screens
*   **Rating Dimensions**: Aesthetics, Learnability, Efficiency, Usability, Design Quality
*   **Comment Sources**: 👤 Human / 🤖 LLM / 🔀 Both
*   **Categories**: Typography, Color, Spacing, Hierarchy, Interaction, Accessibility
*   **Bounding Box**: Each critique includes precise location coordinates

**Data Files:**
*   `data/uicrit_public.csv` - Original CSV (4.8MB)
*   `data/uicrit_full.json` - Full JSON (1,000 screens)
*   `data/uicrit_curated.json` - Curated subset (50 screens)

**Citation:**
> Yang, G., et al. (2024). *Can AI Assistants Know What They Don't Know?* UIST '24.  
> https://dl.acm.org/doi/10.1145/3654777.3676381  
> Dataset: https://github.com/google-research-datasets/uicrit

### 4. 🧠 Agent Generator: UX Agent Skills (Latest)

The Generator tab now features a **Card-based Skill Library** integrated from `skills.rest`, categorizing 24+ essential skills for the UX Agent persona.

*   **Categories**: Design & Creative, Frontend Dev, Dev Tools, API & Architecture, CSS & Motion.
*   **Skill Cards**: Each card provides a direct link to the skill definition and usage instructions.
*   **Localization**: Bilingual support with Chinese-primary and English-secondary descriptions.

**Reasoning Pipeline (Concept):**
1.  **Style** → 2. **Color** → 3. **Typography** → 4. **Tech Stack** → 5. **UX Guidelines**

**4-Layer Generation Architecture:**

1.  **Design System Layer**
    *   **Tokens**: Color, Spacing, Radius, Elevation
    *   **Components**: Defining states (Default/Hover/Error) and stack binding (Tailwind/React)
2.  **Screen & Flow Layer**
    *   **Structure**: Layout Tree (Section/Column)
    *   **Attention**: Visual Priority (Primary/Secondary) & Expected Behavior
    *   **Flows**: Sitemap & Task Flow
3.  **Behavior & Pattern Layer**
    *   **Ethics Check**: Scanning for Dark Patterns
    *   **Best Practices**: Applying WCAG and domain-specific guidelines (e.g., Clinical UX)
4.  **Skill Output Layer**
    *   Generates `skill.md`: The "Recipe" for the Agent, documenting the complete history from ingredient selection (Tokens) to cooking steps (Flows).

---

## 📂 Project Architecture

```
local_viewer/
├── index.html              # Main Interface: Viewer, Generator, Guidelines
├── styles.css              # Complete CSS definitions for 57 styles
├── viewer.js               # Core logic (CSV parser, DOM manipulation)
├── data.js                 # Preloaded data bundle (includes Dark Pattern data)
├── README.md               # This file
├── assets/                 
│   ├── case-studies/       # Detailed UX case study HTMLs
│   └── screenshots/        # Dark Pattern case screenshots
└── data/                   # Structured CSV Data Sources
    ├── styles.csv          # 57 Style Definitions
    ├── dark-patterns.csv   # 10 Annotated Dark Pattern Cases
    ├── colors.csv          # 53 Color Palettes
    ├── typography.csv      # Typography Pairings
    └── ...
```

---

## 🚀 Usage

### 1. Launch Viewer
It is recommended to use a local server to ensure proper CSV data loading via fetch:

```bash
# Inside local_viewer directory
python3 -m http.server 8080
# Visit http://localhost:8080
```

### 2. Explore Dark Pattern Cases
1.  Navigate to the **"UX Guidelines"** tab.
2.  Scroll to the **"🔍 Annotated Dark Pattern Cases"** section.
3.  Use filters (Severity, Type) to find specific cases.
4.  Click any card to view the full **COT Analysis (Observation-Reasoning-Remediation)** and component annotations.

---

## 📜 License

This project is licensed under **CC BY-NC 4.0**.
Available for educational, research, and personal learning purposes. For commercial use, please contact PrivacyUX Consulting Ltd.

<div align="center">
  
**© 2025 PrivacyUX Consulting Ltd.**  
*Empowering Design with AI Intelligence*

</div>
