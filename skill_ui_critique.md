# UI Critique Skill

## Overview
This skill enables AI Agents to generate professional-grade UI design critiques following the UICrit methodology (Google Research, UIST '24).

## Input Format
- **Screenshot**: Mobile UI screenshot (PNG/JPG)
- **Task Context**: Primary user task the UI is designed for (optional)

## Output Format
Generate critiques in the following structure:

```json
{
  "ratings": {
    "aesthetics": 1-10,
    "learnability": 1-5,
    "efficiency": 1-5,
    "usability": 1-10,
    "overall_quality": 1-10
  },
  "critiques": [
    {
      "issue": "Brief issue description",
      "detail": "Detailed explanation of the design problem",
      "severity": "high|medium|low",
      "bounding_box": [x1_pct, y1_pct, x2_pct, y2_pct],
      "category": "typography|spacing|color|hierarchy|accessibility|interaction"
    }
  ],
  "positive_aspects": ["List of design strengths"],
  "recommendations": ["Actionable improvement suggestions"]
}
```

## Rating Rubrics

### Aesthetics (1-10)
| Score | Description |
|-------|-------------|
| 1-3 | Visually inconsistent, poor color/typography choices |
| 4-6 | Functional but lacks visual polish |
| 7-8 | Clean, consistent, follows design principles |
| 9-10 | Exceptional visual design, memorable |

### Learnability (1-5)
| Score | Description |
|-------|-------------|
| 1-2 | Confusing UI patterns, unclear navigation |
| 3 | Standard patterns, some learning curve |
| 4-5 | Intuitive, self-explanatory interface |

### Efficiency (1-5)
| Score | Description |
|-------|-------------|
| 1-2 | Too many steps, hidden actions |
| 3 | Average task completion flow |
| 4-5 | Optimized for speed, clear CTAs |

### Usability (1-10)
Combined measure of learnability + efficiency + error prevention

### Overall Quality (1-10)
Weighted average: `(aesthetics * 0.3) + (usability * 0.7)`

## Critique Categories

1. **Typography**: Font size, contrast, hierarchy, readability
2. **Spacing**: Margins, padding, visual breathing room
3. **Color**: Contrast ratios, accessibility, emotional tone
4. **Hierarchy**: Visual priority, information architecture
5. **Accessibility**: WCAG compliance, touch targets, screen reader
6. **Interaction**: Affordances, feedback, error states

## Example Critique

**Input**: Login screen with small password field

**Output**:
```json
{
  "ratings": {
    "aesthetics": 6,
    "learnability": 4,
    "efficiency": 3,
    "usability": 5,
    "overall_quality": 5.3
  },
  "critiques": [
    {
      "issue": "Password field too small",
      "detail": "The password input field is only 32px in height, making it difficult for users with motor impairments to tap accurately.",
      "severity": "high",
      "bounding_box": [0.1, 0.45, 0.9, 0.5],
      "category": "accessibility"
    }
  ],
  "positive_aspects": ["Clear branding", "Simple layout"],
  "recommendations": ["Increase input height to 48px minimum"]
}
```

## References
- [UICrit Dataset](https://github.com/google-research-datasets/uicrit)
- [RICO Dataset](http://www.interactionmining.org/rico.html)
- UIST '24 Paper: [ACM DL](https://dl.acm.org/doi/10.1145/3654777.3676381)
