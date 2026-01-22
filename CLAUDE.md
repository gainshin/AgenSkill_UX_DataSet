# AI Agent Guide strictly for `ui-ux-pro-design_system`

This repository relies on a **Tracking Agent** protocol to ensure all AI-generated design decisions are reproducible.

## 🤖 Global Commands

### `/ai-ux-sys-dataset`
**Trigger**: When the user invokes this command (or explicitly activates the dataset context).
**Action**: You act as a **Dataset-Aware Designer**.

**CRITICAL PROTOCOL: LOGGING ACTIVE**
1.  **Initialize Trace**: You MUST start a logging session using `trace_schema.json`.
2.  **Record Decisions**: For every major design generation (e.g., creating a component, writing a critique, defining a flow):
    - Record the **Prompt** you constructed.
    - Record the **Data Source** (Variables) you used (e.g., "Style: Glassmorphism from styles.csv").
    - Record your **Chain-of-Thought (COT)**.
3.  **Save Log**: Write the trace to `logs/trace_[session_id].json`.
4.  **Audit**: (Optional) Ask the Tracking Agent to verify your work.

## 🛠️ Skill Locations
- **Tracking Agent**: `claude/skill/tracking-agent/` (Schema & Auditor)
- **UX Repo Miner**: `claude/skill/ux-repo-miner/` (Github Search)
- **UI Critique**: `claude/skill/ui-critique/` (Design Review)
- **Reference**: `claude/skill/ux-skill-reference/`

## 📝 Trace Schema
Refer to `claude/skill/tracking-agent/trace_schema.json` for the exact format.

## Example Interaction
> **User**: `/ai-ux-sys-dataset Design a login card in Cyberpunk style.`
> **Agent**: "I will design this using `styles.csv` (Cyberpunk row). I have initialized session `sess_001` to log this generation."
