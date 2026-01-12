document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');

    try {
        // Fetch base files + get stack file list separately
        let styles, colors, typography, charts, prompts, guidelines, stacksData;

        if (window.DS_DATA) {
            ({ styles, colors, typography, charts, prompts, guidelines, stacks: stacksData } = window.DS_DATA);
        } else {
            [styles, colors, typography, charts, prompts, guidelines, ...stacksData] = await Promise.all([
                fetchCSV('data/styles.csv'),
                fetchCSV('data/colors.csv'),
                fetchCSV('data/typography.csv'),
                fetchCSV('data/charts.csv'),
                fetchCSV('data/prompts.csv'),
                fetchCSV('data/ux-guidelines.csv'),
                fetchCSV('data/stacks/html-tailwind.csv').then(d => ({ name: 'HTML + Tailwind', data: d })),
                fetchCSV('data/stacks/react.csv').then(d => ({ name: 'React', data: d })),
                fetchCSV('data/stacks/nextjs.csv').then(d => ({ name: 'Next.js', data: d })),
                fetchCSV('data/stacks/vue.csv').then(d => ({ name: 'Vue', data: d })),
                fetchCSV('data/stacks/svelte.csv').then(d => ({ name: 'Svelte', data: d })),
                fetchCSV('data/stacks/swiftui.csv').then(d => ({ name: 'SwiftUI', data: d })),
                fetchCSV('data/stacks/react-native.csv').then(d => ({ name: 'React Native', data: d })),
                fetchCSV('data/stacks/flutter.csv').then(d => ({ name: 'Flutter', data: d }))
            ]);
        }

        renderStyles(styles);
        renderColors(colors);
        renderTypography(typography);
        renderCharts(charts);
        renderGuidelines(guidelines);
        renderStacks(stacksData);
        renderDashboard(styles, colors, typography, charts, guidelines, stacksData);
        initGenerator(prompts, styles, colors);

        setupTabs();
        initVersionToggle();
        initClearStyleButton();

        // Dark Pattern Init
        renderDarkPatternCases();
        initDarkPatternFilters();
        initDarkPatternModal();

        loader.style.display = 'none';

    } catch (error) {
        loader.textContent = 'Error loading data: ' + error.message;
        console.error(error);
    }
});

async function fetchCSV(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    const text = await response.text();
    return parseCSV(text);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);

    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim();
        });
        return obj;
    });
}

function parseCSVLine(text) {
    // Basic CSV parser that handles quoted strings with commas
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(s => s.replace(/^"|"$/g, '').trim()); // Clean quotes
}

function setupTabs() {
    const tabs = document.querySelectorAll('.nav-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(`${tab.dataset.tab}-tab`);
            if (target) {
                target.classList.add('active');
                // Trigger render if generator tab
                if (tab.dataset.tab === 'generator') {
                    window.renderGeneratorTab();
                }
            }
        });
    });
}

function initVersionToggle() {
    const toggleBtn = document.getElementById('version-toggle');
    const versionPanel = document.getElementById('version-panel');

    if (toggleBtn && versionPanel) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // Collapse
                versionPanel.classList.add('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                // Expand
                versionPanel.classList.remove('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }
}

// Style Theme Preview System
function applyStyleTheme(themeName) {
    // Remove any existing theme classes
    document.body.className = document.body.className
        .split(' ')
        .filter(c => !c.startsWith('theme-'))
        .join(' ');

    // Apply new theme
    document.body.classList.add(`theme-${themeName}`);

    // Show clear button
    const clearBtn = document.getElementById('clear-style-btn');
    if (clearBtn) {
        clearBtn.classList.remove('hidden');
    }

    // Store current theme
    sessionStorage.setItem('currentStyleTheme', themeName);
}

function clearStyleTheme() {
    // Remove all theme classes
    document.body.className = document.body.className
        .split(' ')
        .filter(c => !c.startsWith('theme-'))
        .join(' ');

    // Hide clear button
    const clearBtn = document.getElementById('clear-style-btn');
    if (clearBtn) {
        clearBtn.classList.add('hidden');
    }

    // Clear stored theme
    sessionStorage.removeItem('currentStyleTheme');
}

function initClearStyleButton() {
    const clearBtn = document.getElementById('clear-style-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearStyleTheme);
    }

    // Restore theme if exists in session
    const savedTheme = sessionStorage.getItem('currentStyleTheme');
    if (savedTheme) {
        applyStyleTheme(savedTheme);
    }
}

/* =========================================
   AGENT BREADCRUMB SYSTEM
   ========================================= */
const BREADCRUMB_KEY = 'agent_breadcrumbs_v1';

window.getBreadcrumbs = function () {
    return JSON.parse(localStorage.getItem(BREADCRUMB_KEY) || '[]');
};

window.saveBreadcrumbs = function (items) {
    localStorage.setItem(BREADCRUMB_KEY, JSON.stringify(items));
    window.renderBreadcrumbFooter();
};

window.getSelection = function (id) {
    const items = window.getBreadcrumbs();
    return items.find(i => i.id === id)?.status || null;
};

window.setSelection = function (type, id, name, status) {
    let items = window.getBreadcrumbs();
    const existingIndex = items.findIndex(i => i.id === id);

    if (status === null) {
        if (existingIndex > -1) items.splice(existingIndex, 1);
    } else {
        const newItem = { type, id, name, status, timestamp: Date.now() };
        if (existingIndex > -1) items[existingIndex] = newItem;
        else items.push(newItem);
    }

    window.saveBreadcrumbs(items);

    // Update UI card classes
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
        card.classList.remove('status-selected', 'status-rejected', 'status-considered');
        if (status) card.classList.add(`status-${status}`);

        // Update button active states
        card.querySelectorAll('.selection-btn').forEach(btn => btn.classList.remove('active'));
        if (status === 'selected') card.querySelector('.btn-select')?.classList.add('active');
        if (status === 'considered') card.querySelector('.btn-consider')?.classList.add('active');
        if (status === 'rejected') card.querySelector('.btn-reject')?.classList.add('active');
    }
};

window.renderBreadcrumbFooter = function () {
    let footer = document.querySelector('.breadcrumb-footer');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'breadcrumb-footer';
        document.body.appendChild(footer);
    }

    const items = window.getBreadcrumbs().filter(i => i.status === 'selected');
    const typeOrder = { 'style': 1, 'color': 2, 'typography': 3, 'stack': 4 };
    items.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));

    const trackHTML = items.length ? items.map((item, idx) => `
        <div class="breadcrumb-item">
            <span class="bc-label">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}:</span>
            <strong>${item.name}</strong>
        </div>
        ${idx < items.length - 1 ? '<span class="breadcrumb-arrow">→</span>' : ''}
    `).join('') : '<span class="text-sm text-gray-500">Select items to build your design recipe...</span>';

    footer.innerHTML = `
        <div class="breadcrumb-logo">
            <span>🧠</span> Agent Context
        </div>
        <div class="breadcrumb-track">
            ${trackHTML}
        </div>
        <div class="breadcrumb-actions">
            <button class="bc-btn bc-btn-clear" onclick="window.clearBreadcrumbs()">Reset</button>
            <button class="bc-btn bc-btn-generate" onclick="window.generateSkillMD()">Generate Skill.md</button>
        </div>
    `;
    if (items.length > 0) footer.classList.add('visible');
    else footer.classList.remove('visible');
};

window.clearBreadcrumbs = function () {
    window.saveBreadcrumbs([]);
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('status-selected', 'status-rejected', 'status-considered');
        c.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
    });
};

window.generateSkillMD = function () {
    const skillPreview = document.getElementById('skill-code-preview');
    const text = skillPreview ? skillPreview.textContent : '# Error: No content';

    // Create blob download
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill_recipe_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/* Generator Render Function */
window.renderGeneratorTab = function () {
    const visualContent = document.getElementById('cot-visual-content');
    const skillPreview = document.getElementById('skill-code-preview');
    if (!visualContent) return;

    // Clear current content
    visualContent.innerHTML = '';

    const breadcrumbs = window.getBreadcrumbs();
    const visualItems = breadcrumbs.filter(i => ['style', 'color', 'typography', 'stack'].includes(i.type) && i.status === 'selected');

    if (visualItems.length === 0) {
        visualContent.innerHTML = '<p class="placeholder-text">Select Style, Color, Typography to populate...</p>';
        if (skillPreview) skillPreview.textContent = '// AI Agent Skill Recipe\n// Status: Waiting for inputs...';
        return;
    }

    // Determine sort order
    const typeOrder = { 'style': 1, 'color': 2, 'typography': 3, 'stack': 4 };
    visualItems.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));

    visualItems.forEach(item => {
        const div = document.createElement('div');
        div.className = `cot-token type-${item.type}`;
        const icon = item.type === 'style' ? '🎨' : item.type === 'color' ? '🌈' : item.type === 'typography' ? '🔤' : '⚡';
        div.innerHTML = `<span class="token-icon">${icon}</span><strong>${item.name}</strong>`;
        visualContent.appendChild(div);
    });

    // Generate Preview Text
    const date = new Date().toISOString().split('T')[0];
    let md = `# AI Agent Skill Recipe\n# Date: ${date}\n\n`;

    md += `## 1. Visual System Definition\n`;
    md += `> The visual language tokens derived from selected components.\n\n`;
    visualItems.forEach(item => {
        md += `- **${item.type.toUpperCase()}**: ${item.name}\n`;
    });

    md += `\n## 2. Screen Architecture\n`;
    md += `- **Layout**: (Pending Phase 14 implementation)\n`;

    md += `\n## 3. Behavior & Guidelines\n`;
    md += `- **Compliance**: WCAG 2.1 AA (Auto-selected)\n`;

    if (skillPreview) skillPreview.textContent = md;
};

// Init Footer
document.addEventListener('DOMContentLoaded', () => window.renderBreadcrumbFooter());

function renderStyles(data) {
    const container = document.getElementById('styles-grid');
    const filterContainer = document.getElementById('style-filters');

    // Clear and prepare filter container
    filterContainer.innerHTML = '';

    // Calculate unique Style Categories
    const categories = [...new Set(data.map(d => d['Style Category']))].filter(Boolean).sort();

    // Helper to chunk categories
    function chunkCategories(cats) {
        if (cats.length === 0) return [];
        // Determine break points to split into max 4 groups
        // A simple balanced split approach
        const groupCount = Math.min(cats.length, 4);
        const chunkSize = Math.ceil(cats.length / groupCount);
        const chunks = [];

        for (let i = 0; i < cats.length; i += chunkSize) {
            const group = cats.slice(i, i + chunkSize);
            if (group.length > 0) {
                const startChar = group[0][0].toUpperCase();
                const endChar = group[group.length - 1][0].toUpperCase();
                const rangeLabel = startChar === endChar ? startChar : `${startChar}-${endChar}`;
                chunks.push({ label: rangeLabel, values: group });
            }
        }
        return chunks;
    }

    const categoryChunks = chunkCategories(categories);

    // Filter State
    let activeFilters = {
        type: null,
        era: null,
        category: null
    };

    // 1. Generate Category Dropdowns
    const categorySelects = [];
    categoryChunks.forEach(chunk => {
        const select = document.createElement('select');
        select.innerHTML = `<option value="all">分類 ${chunk.label} (Category ${chunk.label})</option>`;
        chunk.values.forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            select.appendChild(option);
        });

        // Category Change Listener
        select.addEventListener('change', () => {
            // New category selected in THIS dropdown
            const val = select.value;

            if (val !== 'all') {
                activeFilters.category = val;
                // Reset other category dropdowns to 'all'
                categorySelects.forEach(s => {
                    if (s !== select) s.value = 'all';
                });
            } else {
                // If set to all, clear category (unless another is somehow set, but UI prevents that)
                activeFilters.category = null;
            }
            applyFilters();
        });

        categorySelects.push(select);
        filterContainer.appendChild(select);
    });

    // 2. Generate Type and Era Dropdowns
    ['Type', 'Era/Origin'].forEach(key => {
        const select = document.createElement('select');
        const zhLabel = key === 'Era/Origin' ? '年代' : '類型';
        const enLabel = key === 'Era/Origin' ? 'Eras' : 'Types';
        select.innerHTML = `<option value="all">所有${zhLabel} (All ${enLabel})</option>`;

        const values = [...new Set(data.map(d => d[key]))].filter(Boolean).sort();
        values.forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            // Fix key mapping for Type/Era
            if (key === 'Type') activeFilters.type = select.value === 'all' ? null : select.value;
            if (key === 'Era/Origin') activeFilters.era = select.value === 'all' ? null : select.value;
            applyFilters();
        });
        filterContainer.appendChild(select);
    });

    /* Favorites Button Removed - Replaced by Breadcrumbs */

    function renderCards(items) {
        container.innerHTML = '';

        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card style-card';
            const itemId = item['Style Category'] || `style-${index}`;
            const itemName = item['Style Category'] || `Style ${index}`;

            // Get selection status
            const status = window.getSelection(itemId);
            if (status) card.classList.add(`status-${status}`);
            card.dataset.id = itemId;

            // Generate style-specific preview
            const previewHTML = generateStylePreview(item);

            card.innerHTML = `
                <div class="style-preview">
                    ${previewHTML}
                    <div class="selection-controls ${status ? 'has-selection' : ''}">
                        <button class="selection-btn btn-select ${status === 'selected' ? 'active' : ''}" 
                                onclick="window.setSelection('style', '${itemId}', '${itemName}', 'selected'); event.stopPropagation();" 
                                title="Select as Primary">
                            ✓
                        </button>
                        <button class="selection-btn btn-consider ${status === 'considered' ? 'active' : ''}" 
                                onclick="window.setSelection('style', '${itemId}', '${itemName}', 'considered'); event.stopPropagation();" 
                                title="Consider">
                            ★
                        </button>
                        <button class="selection-btn btn-reject ${status === 'rejected' ? 'active' : ''}" 
                                onclick="window.setSelection('style', '${itemId}', '${itemName}', 'rejected'); event.stopPropagation();" 
                                title="Reject">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <span class="card-index">#${String(index + 1).padStart(2, '0')}</span>
                    <h3>${itemName}</h3>
                    <p class="keywords">${item.Keywords ? item.Keywords.split(',').slice(0, 3).join('、') : ''}</p>
                </div>
            `;



            // Universal style preview click handler - maps style names to theme classes
            const styleCategory = (item['Style Category'] || '').toLowerCase();
            const themeMap = {
                'minimalism': 'minimalism', 'swiss': 'minimalism',
                'neumorphism': 'neumorphism',
                'glassmorphism': 'glassmorphism',
                'brutalism': 'brutalism',
                'flat': 'flat',
                'skeuomorphism': 'skeuomorphism',
                'claymorphism': 'claymorphism',
                'dark mode': 'dark-oled', 'oled': 'dark-oled',
                'neubrutalism': 'neubrutalism',
                'bento box': 'bento', 'bento': 'bento',
                'swiss modernism': 'swiss-modern',
                'soft ui': 'soft-ui',
                'vibrant': 'vibrant', 'block': 'vibrant',
                'aurora': 'aurora',
                'retro-futurism': 'retro-futurism', 'retro': 'retro-futurism',
                'y2k': 'y2k',
                'cyberpunk': 'cyberpunk',
                'memphis': 'memphis',
                'vaporwave': 'vaporwave',
                'pixel': 'pixel-art',
                'gen z chaos': 'gen-z-chaos', 'maximalism': 'gen-z-chaos',
                'exaggerated minimalism': 'exaggerated-minimal',
                '3d': '3d-hyper', 'hyperrealism': '3d-hyper',
                'motion-driven': 'motion',
                'micro-interactions': 'microinteractions',
                'liquid glass': 'liquid-glass',
                'kinetic': 'kinetic',
                'accessible': 'accessible', 'ethical': 'accessible',
                'inclusive': 'inclusive',
                'zero interface': 'zero-ui',
                'ai-native': 'ai-native', 'ai': 'ai-native',
                'biophilic': 'biophilic', 'organic': 'biophilic',
                'e-ink': 'e-ink', 'paper': 'e-ink',
                'dimensional': 'dimensional', 'layering': 'dimensional',
                'parallax': 'parallax',
                'hud': 'hud', 'sci-fi': 'hud', 'fui': 'hud',
                'spatial': 'spatial', 'visionos': 'spatial',
                'biomimetic': 'biomimetic',
                'bento grids': 'bento-grids',
                'hero-centric': 'hero', 'hero': 'hero',
                'conversion': 'conversion',
                'feature-rich': 'feature-showcase', 'showcase': 'feature-showcase',
                'social proof': 'social-proof',
                'product demo': 'product-demo', 'interactive': 'product-demo',
                'trust': 'trust', 'authority': 'trust',
                'storytelling': 'storytelling',
                'minimal & direct': 'minimal-direct',
                'data-dense': 'data-dense', 'dashboard': 'data-dense',
                'heat map': 'heatmap', 'heatmap': 'heatmap',
                'executive': 'executive',
                'real-time': 'realtime', 'monitoring': 'realtime',
                'drill-down': 'drilldown', 'analytics': 'drilldown',
                'comparative': 'comparative', 'comparison': 'comparative',
                'predictive': 'predictive',
                'user behavior': 'user-behavior', 'behavior': 'user-behavior',
                'financial': 'financial',
                'sales': 'sales', 'intelligence': 'sales'
            };

            // Find matching theme
            let matchedTheme = null;
            for (const [keyword, themeName] of Object.entries(themeMap)) {
                if (styleCategory.includes(keyword)) {
                    matchedTheme = themeName;
                    break;
                }
            }

            if (matchedTheme) {
                card.style.cursor = 'pointer';
                card.title = '點擊套用此風格 (Click to apply this style)';
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.favorite-btn')) return;
                    applyStyleTheme(matchedTheme);
                });
            }

            container.appendChild(card);
        });
    }

    // Generate visual preview based on style category
    function generateStylePreview(item) {
        const category = (item['Style Category'] || '').toLowerCase();
        const colors = extractAllHex(item['Primary Colors'] || '');
        const primary = colors[0] || '#000';
        const secondary = colors[1] || '#FFF';

        // Match style to visual preview
        if (category.includes('minimalism') || category.includes('swiss')) {
            return `<div style="background:#F5F5F5;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:60px;height:60px;background:#000;"></div>
            </div>`;
        }
        if (category.includes('neumorphism')) {
            return `<div style="background:#E0E5EC;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:70px;height:70px;border-radius:16px;background:#E0E5EC;box-shadow:-8px -8px 16px #fff,8px 8px 16px rgba(174,174,192,0.4);"></div>
            </div>`;
        }
        if (category.includes('glassmorphism')) {
            return `<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:100px;height:60px;background:rgba(255,255,255,0.25);backdrop-filter:blur(10px);border-radius:16px;border:1px solid rgba(255,255,255,0.3);"></div>
            </div>`;
        }
        if (category.includes('brutalism')) {
            return `<div style="background:#FFEB3B;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:80px;height:50px;background:#2196F3;border:3px solid #000;"></div>
            </div>`;
        }
        if (category.includes('3d') || category.includes('hyperrealism')) {
            return `<div style="background:linear-gradient(180deg,#001F3F 0%,#0a1628 100%);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:50px;height:50px;background:radial-gradient(circle at 30% 30%,#FFD700,#B8860B);border-radius:50%;box-shadow:0 10px 30px rgba(0,0,0,0.5);"></div>
            </div>`;
        }
        if (category.includes('vibrant') || category.includes('block')) {
            return `<div style="background:linear-gradient(135deg,#39FF14 0%,#8B00FF 100%);height:100%;display:flex;align-items:center;justify-content:center;gap:8px;">
                <div style="width:40px;height:50px;background:#00FFFF;"></div>
                <div style="width:40px;height:50px;background:#FFAA00;"></div>
            </div>`;
        }
        if (category.includes('dark mode') || category.includes('oled')) {
            return `<div style="background:#000;height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="color:#39FF14;font-size:24px;font-weight:700;text-shadow:0 0 10px #39FF14;">OLED</span>
            </div>`;
        }
        if (category.includes('accessible') || category.includes('ethical')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="font-size:32px;">♿</div>
                <span style="margin-left:8px;font-weight:700;color:#000;">WCAG AAA</span>
            </div>`;
        }
        if (category.includes('claymorphism')) {
            return `<div style="background:linear-gradient(145deg,#FFE5EC,#FFF0F5);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:60px;height:60px;background:linear-gradient(145deg,#FFB6C1,#FFC0CB);border-radius:20px;box-shadow:inset 2px 2px 5px rgba(255,255,255,0.5),-5px -5px 10px rgba(255,255,255,0.8),5px 5px 10px rgba(0,0,0,0.1);"></div>
            </div>`;
        }
        if (category.includes('aurora')) {
            return `<div style="background:linear-gradient(135deg,#0080FF,#8B00FF,#FF1493,#00FFFF);height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="color:#FFF;font-size:20px;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.3);">Aurora</span>
            </div>`;
        }
        if (category.includes('retro') && category.includes('futurism')) {
            return `<div style="background:linear-gradient(180deg,#1A1A2E 0%,#16213E 100%);height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="color:#FF006E;font-size:22px;font-weight:700;text-shadow:0 0 10px #FF006E,0 0 20px #00FFFF;font-family:monospace;">RETRO</span>
            </div>`;
        }
        if (category.includes('flat design')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;gap:10px;">
                <div style="width:30px;height:30px;background:#EF4444;border-radius:4px;"></div>
                <div style="width:30px;height:30px;background:#22C55E;border-radius:4px;"></div>
                <div style="width:30px;height:30px;background:#3B82F6;border-radius:4px;"></div>
            </div>`;
        }
        if (category.includes('neubrutalism')) {
            return `<div style="background:#FFEB3B;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:70px;height:45px;background:#FFF;border:3px solid #000;box-shadow:4px 4px 0 #000;border-radius:0;"></div>
            </div>`;
        }
        if (category.includes('bento')) {
            return `<div style="background:#F5F5F7;height:100%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;padding:12px;">
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);"></div>
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);grid-row:span 2;"></div>
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);"></div>
            </div>`;
        }
        if (category.includes('cyberpunk')) {
            return `<div style="background:#0D0D0D;height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="color:#00FF00;font-family:monospace;font-size:16px;text-shadow:0 0 5px #00FF00;">$ sudo hack_</span>
            </div>`;
        }
        if (category.includes('y2k')) {
            return `<div style="background:linear-gradient(135deg,#FF69B4,#00FFFF);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:50px;height:50px;background:linear-gradient(135deg,#C0C0C0,#FFF);border-radius:50%;box-shadow:inset 0 -5px 10px rgba(0,0,0,0.2);"></div>
            </div>`;
        }
        if (category.includes('memphis')) {
            return `<div style="background:#86CCCA;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;">
                <div style="width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:35px solid #FF71CE;"></div>
                <div style="width:30px;height:30px;background:#FFCE5C;"></div>
            </div>`;
        }
        if (category.includes('vaporwave')) {
            return `<div style="background:linear-gradient(180deg,#FF71CE,#01CDFE);height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="color:#FFF;font-size:18px;font-weight:700;text-shadow:2px 2px 0 #B967FF;">Ａ Ｅ Ｓ</span>
            </div>`;
        }
        if (category.includes('pixel')) {
            return `<div style="background:#000;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="display:grid;grid-template-columns:repeat(5,8px);gap:2px;">
                    ${Array(15).fill().map((_, i) => `<div style="width:8px;height:8px;background:${['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][i % 5]};"></div>`).join('')}
                </div>
            </div>`;
        }
        if (category.includes('spatial') || category.includes('vision')) {
            return `<div style="background:linear-gradient(135deg,#E8E8E8,#F5F5F5);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:80px;height:50px;background:rgba(255,255,255,0.6);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,0.8);box-shadow:0 8px 32px rgba(0,0,0,0.1);"></div>
            </div>`;
        }
        if (category.includes('ai-native') || category.includes('ai native')) {
            return `<div style="background:#F5F5F5;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="display:flex;gap:4px;">
                    <div style="width:8px;height:8px;background:#6366F1;border-radius:50%;animation:pulse 1s infinite;"></div>
                    <div style="width:8px;height:8px;background:#6366F1;border-radius:50%;animation:pulse 1s infinite 0.2s;"></div>
                    <div style="width:8px;height:8px;background:#6366F1;border-radius:50%;animation:pulse 1s infinite 0.4s;"></div>
                </div>
            </div>`;
        }
        // Skeuomorphism
        if (category.includes('skeuomorphism')) {
            return `<div style="background:linear-gradient(180deg,#8B4513 0%,#654321 100%);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:70px;height:50px;background:linear-gradient(180deg,#D4A574,#C4956A);border-radius:6px;box-shadow:inset 0 2px 4px rgba(255,255,255,0.3),0 4px 8px rgba(0,0,0,0.4);border:1px solid #8B4513;"></div>
            </div>`;
        }
        // Liquid Glass
        if (category.includes('liquid') && category.includes('glass')) {
            return `<div style="background:linear-gradient(135deg,#FF6B6B,#4ECDC4,#45B7D1,#96CEB4);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:60px;height:60px;background:linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0.1));border-radius:50%;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.5);animation:float 3s ease-in-out infinite;"></div>
            </div>`;
        }
        // Motion-Driven
        if (category.includes('motion')) {
            return `<div style="background:#1a1a2e;height:100%;display:flex;align-items:center;justify-content:center;gap:6px;">
                <div style="width:10px;height:40px;background:#4ECDC4;border-radius:5px;animation:bounce 0.6s ease-in-out infinite;"></div>
                <div style="width:10px;height:40px;background:#FF6B6B;border-radius:5px;animation:bounce 0.6s ease-in-out infinite 0.1s;"></div>
                <div style="width:10px;height:40px;background:#45B7D1;border-radius:5px;animation:bounce 0.6s ease-in-out infinite 0.2s;"></div>
            </div>`;
        }
        // Micro-interactions
        if (category.includes('micro')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:60px;height:36px;background:#22C55E;border-radius:18px;position:relative;">
                    <div style="width:28px;height:28px;background:#FFF;border-radius:50%;position:absolute;top:4px;right:4px;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
            </div>`;
        }
        // Inclusive Design
        if (category.includes('inclusive')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;gap:12px;">
                <div style="font-size:28px;">👁️</div>
                <div style="font-size:28px;">👂</div>
                <div style="font-size:28px;">🖐️</div>
            </div>`;
        }
        // Zero Interface
        if (category.includes('zero')) {
            return `<div style="background:#FAFAFA;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:80px;height:80px;border:2px dashed #DDD;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:24px;color:#CCC;">🎤</span>
                </div>
            </div>`;
        }
        // Soft UI Evolution
        if (category.includes('soft ui')) {
            return `<div style="background:#E8EDF5;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:70px;height:70px;background:#E8EDF5;border-radius:16px;box-shadow:-6px -6px 14px rgba(255,255,255,0.8),6px 6px 14px rgba(0,0,0,0.1);"></div>
            </div>`;
        }
        // Landing Page styles - Hero-Centric
        if (category.includes('hero')) {
            return `<div style="background:linear-gradient(135deg,#667eea,#764ba2);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
                <div style="width:80px;height:12px;background:rgba(255,255,255,0.9);border-radius:6px;"></div>
                <div style="width:50px;height:8px;background:rgba(255,255,255,0.5);border-radius:4px;"></div>
                <div style="width:40px;height:20px;background:#FF6B6B;border-radius:4px;margin-top:8px;"></div>
            </div>`;
        }
        // Conversion-Optimized
        if (category.includes('conversion')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:100px;padding:12px;background:#F8F9FA;border-radius:8px;text-align:center;">
                    <div style="width:100%;height:24px;background:#E9ECEF;border-radius:4px;margin-bottom:8px;"></div>
                    <div style="width:100%;height:28px;background:#22C55E;border-radius:4px;"></div>
                </div>
            </div>`;
        }
        // Feature-Rich / Feature Showcase
        if (category.includes('feature')) {
            return `<div style="background:#F8F9FA;height:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:20px;">
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;"><span style="font-size:20px;">⚡</span></div>
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;"><span style="font-size:20px;">🔒</span></div>
                <div style="background:#FFF;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;"><span style="font-size:20px;">📊</span></div>
            </div>`;
        }
        // Minimal & Direct
        if (category.includes('minimal') && category.includes('direct')) {
            return `<div style="background:#FFF;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">
                <div style="width:60px;height:8px;background:#000;border-radius:4px;"></div>
                <div style="width:30px;height:30px;background:#000;border-radius:50%;"></div>
            </div>`;
        }
        // Social Proof-Focused
        if (category.includes('social proof')) {
            return `<div style="background:#F8F9FA;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;">
                <div style="width:36px;height:36px;background:#DDD;border-radius:50%;"></div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;gap:2px;">${'⭐'.repeat(5)}</div>
                    <div style="width:60px;height:6px;background:#E0E0E0;border-radius:3px;"></div>
                </div>
            </div>`;
        }
        // Interactive Product Demo
        if (category.includes('interactive') && category.includes('demo')) {
            return `<div style="background:#1E293B;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:100px;height:70px;background:#334155;border-radius:8px;border:2px solid #475569;display:flex;align-items:center;justify-content:center;">
                    <div style="width:0;height:0;border-left:20px solid #FFF;border-top:12px solid transparent;border-bottom:12px solid transparent;"></div>
                </div>
            </div>`;
        }
        // Trust & Authority
        if (category.includes('trust') && category.includes('authority')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;gap:12px;">
                <div style="width:40px;height:40px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">🏆</div>
                <div style="width:40px;height:40px;background:linear-gradient(135deg,#C0C0C0,#A0A0A0);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">✓</div>
            </div>`;
        }
        // Storytelling-Driven
        if (category.includes('storytelling')) {
            return `<div style="background:linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);height:100%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:20px;">
                <div style="display:flex;gap:4px;align-items:flex-end;">
                    <div style="width:8px;height:20px;background:#FF6B6B;border-radius:2px;"></div>
                    <div style="width:8px;height:35px;background:#4ECDC4;border-radius:2px;"></div>
                    <div style="width:8px;height:50px;background:#45B7D1;border-radius:2px;"></div>
                    <div style="width:8px;height:40px;background:#96CEB4;border-radius:2px;"></div>
                </div>
            </div>`;
        }
        // BI/Analytics - Data-Dense Dashboard
        if (category.includes('data-dense') || category.includes('dashboard')) {
            return `<div style="background:#F5F5F5;height:100%;display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:6px;padding:12px;">
                <div style="background:#FFF;border-radius:4px;grid-row:span 2;display:flex;align-items:flex-end;justify-content:center;padding:8px;">
                    <div style="display:flex;gap:4px;align-items:flex-end;">
                        <div style="width:12px;height:30px;background:#3B82F6;border-radius:2px;"></div>
                        <div style="width:12px;height:45px;background:#3B82F6;border-radius:2px;"></div>
                        <div style="width:12px;height:25px;background:#3B82F6;border-radius:2px;"></div>
                        <div style="width:12px;height:55px;background:#22C55E;border-radius:2px;"></div>
                    </div>
                </div>
                <div style="background:#FFF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#22C55E;font-size:14px;">+24%</div>
                <div style="background:#FFF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#3B82F6;font-size:14px;">$12K</div>
            </div>`;
        }
        // Heat Map
        if (category.includes('heat')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="display:grid;grid-template-columns:repeat(5,20px);gap:2px;">
                    ${Array(25).fill().map(() => {
                const colors = ['#0080FF', '#00BFFF', '#FFFF00', '#FF8000', '#FF0000'];
                return `<div style="width:20px;height:20px;background:${colors[Math.floor(Math.random() * 5)]};border-radius:2px;"></div>`;
            }).join('')}
                </div>
            </div>`;
        }
        // Executive Dashboard
        if (category.includes('executive')) {
            return `<div style="background:#1E293B;height:100%;display:flex;align-items:center;justify-content:center;gap:16px;">
                <div style="text-align:center;color:#FFF;">
                    <div style="font-size:24px;font-weight:700;">$2.4M</div>
                    <div style="font-size:10px;color:#94A3B8;">Revenue</div>
                </div>
                <div style="width:1px;height:40px;background:#475569;"></div>
                <div style="text-align:center;color:#FFF;">
                    <div style="font-size:24px;font-weight:700;color:#22C55E;">↑ 18%</div>
                    <div style="font-size:10px;color:#94A3B8;">Growth</div>
                </div>
            </div>`;
        }
        // Real-Time Monitoring
        if (category.includes('real-time') || category.includes('monitoring')) {
            return `<div style="background:#0F172A;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:12px;height:12px;background:#22C55E;border-radius:50%;animation:pulse 1s infinite;"></div>
                    <span style="color:#22C55E;font-family:monospace;font-size:12px;">LIVE</span>
                    <div style="width:60px;height:2px;background:#22C55E;border-radius:1px;"></div>
                </div>
            </div>`;
        }
        // Financial Dashboard
        if (category.includes('financial')) {
            return `<div style="background:#003366;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="text-align:center;">
                    <div style="color:#22C55E;font-size:20px;font-weight:700;">+$45,230</div>
                    <div style="color:#94A3B8;font-size:11px;margin-top:4px;">Net Profit</div>
                </div>
            </div>`;
        }
        // HUD / Sci-Fi FUI
        if (category.includes('hud') || category.includes('fui') || category.includes('sci-fi')) {
            return `<div style="background:#000;height:100%;display:flex;align-items:center;justify-content:center;position:relative;">
                <div style="width:80px;height:80px;border:2px solid #00FFFF;border-radius:50%;position:relative;">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border:1px solid #00FFFF;border-radius:50%;"></div>
                    <div style="position:absolute;top:0;left:50%;width:2px;height:20px;background:#00FFFF;transform:translateX(-50%);"></div>
                </div>
            </div>`;
        }
        // E-Ink / Paper
        if (category.includes('e-ink') || category.includes('paper')) {
            return `<div style="background:#FDFBF7;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:80px;padding:12px;border:1px solid #1A1A1A;">
                    <div style="width:100%;height:6px;background:#1A1A1A;margin-bottom:6px;"></div>
                    <div style="width:70%;height:4px;background:#4A4A4A;margin-bottom:4px;"></div>
                    <div style="width:85%;height:4px;background:#4A4A4A;"></div>
                </div>
            </div>`;
        }
        // Gen Z Chaos / Maximalism
        if (category.includes('chaos') || category.includes('maximalism') || category.includes('gen z')) {
            return `<div style="background:linear-gradient(45deg,#FF00FF,#00FF00,#FFFF00,#0000FF);height:100%;display:flex;align-items:center;justify-content:center;position:relative;">
                <span style="font-size:24px;transform:rotate(-10deg);">🔥</span>
                <span style="font-size:28px;transform:rotate(15deg);">✨</span>
                <span style="font-size:20px;transform:rotate(-5deg);">💀</span>
            </div>`;
        }
        // Biomimetic / Organic 2.0
        if (category.includes('biomimetic') || category.includes('organic')) {
            return `<div style="background:linear-gradient(135deg,#228B22,#90EE90);height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:60px;height:60px;background:radial-gradient(circle,#00FF41,#228B22);border-radius:50% 20% 50% 20%;box-shadow:0 0 20px rgba(0,255,65,0.4);"></div>
            </div>`;
        }
        // Exaggerated Minimalism
        if (category.includes('exaggerated')) {
            return `<div style="background:#FFF;height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:48px;font-weight:900;color:#000;letter-spacing:-0.05em;">Aa</span>
            </div>`;
        }
        // Kinetic Typography
        if (category.includes('kinetic') && category.includes('typography')) {
            return `<div style="background:#000;height:100%;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:32px;font-weight:700;color:#FFF;letter-spacing:0.1em;animation:pulse 2s infinite;">TYPE</span>
            </div>`;
        }
        // Parallax Storytelling
        if (category.includes('parallax')) {
            return `<div style="background:linear-gradient(180deg,#87CEEB 0%,#E0F0FF 100%);height:100%;position:relative;overflow:hidden;">
                <div style="position:absolute;bottom:0;left:0;right:0;height:40px;background:#228B22;"></div>
                <div style="position:absolute;bottom:30px;left:20%;width:30px;height:50px;background:#8B4513;"></div>
                <div style="position:absolute;bottom:60px;left:25%;width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:40px solid #228B22;"></div>
            </div>`;
        }
        // Dimensional Layering
        if (category.includes('dimensional') || category.includes('layer')) {
            return `<div style="background:#F0F0F0;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="position:relative;">
                    <div style="width:50px;height:50px;background:#FFF;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);position:absolute;top:0;left:0;"></div>
                    <div style="width:50px;height:50px;background:#FFF;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:absolute;top:-8px;left:8px;"></div>
                    <div style="width:50px;height:50px;background:#FFF;border-radius:8px;box-shadow:0 10px 15px rgba(0,0,0,0.15);position:relative;top:-16px;left:16px;"></div>
                </div>
            </div>`;
        }
        // Default fallback - use extracted colors
        const bgColor = primary || '#E0E0E0';
        return `<div style="background:${bgColor};height:100%;display:flex;align-items:center;justify-content:center;">
            <div style="width:50px;height:50px;background:${secondary || '#FFF'};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"></div>
        </div>`;
    }

    // Extract all hex codes from a string
    function extractAllHex(str) {
        if (!str) return [];
        const matches = str.match(/#[0-9A-Fa-f]{6}/g);
        return matches || [];
    }

    // Initial Render
    renderCards(data);

    // Filter Logic
    function applyFilters() {
        const term = document.getElementById('search-styles').value.toLowerCase();
        const favorites = JSON.parse(localStorage.getItem('favorites_styles') || '[]');

        const filtered = data.filter(item => {
            // Favorites Filter
            if (activeFilters.favoritesOnly) {
                const itemId = item['Style Category'] || '';
                if (!favorites.includes(itemId)) return false;
            }

            // Text Search
            const textMatch = (item['Style Category'] || '').toLowerCase().includes(term) ||
                (item.Keywords || '').toLowerCase().includes(term);

            if (!textMatch) return false;

            // Category Filter
            if (activeFilters.category && item['Style Category'] !== activeFilters.category) return false;

            // Type Filter
            if (activeFilters.type && item['Type'] !== activeFilters.type) return false;

            // Era Filter
            if (activeFilters.era && item['Era/Origin'] !== activeFilters.era) return false;

            return true;
        });

        renderCards(filtered);
    }

    // Link Search to Filter Logic
    document.getElementById('search-styles').addEventListener('input', applyFilters);
}

function renderColors(data) {
    const container = document.getElementById('colors-grid');

    // === Color Wheel Setup ===
    const canvas = document.getElementById('color-wheel');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('selected-color-preview');
    const colorInfo = document.getElementById('color-info');
    let selectedHue = null;
    let currentMode = 'all';

    // Draw color wheel
    function drawColorWheel() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 5;

        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 2) * Math.PI / 180;
            const endAngle = (angle + 2) * Math.PI / 180;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 25%)`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    drawColorWheel();

    // Get hue from hex
    function hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    // Check if color matches filter
    function colorMatchesFilter(primaryHex, mode, targetHue) {
        if (mode === 'all' || targetHue === null) return true;
        const hsl = hexToHsl(primaryHex);
        const hueDiff = (angle) => Math.min(Math.abs(hsl.h - angle), 360 - Math.abs(hsl.h - angle));
        const tolerance = 30;

        switch (mode) {
            case 'primary':
                return hueDiff(targetHue) <= tolerance;
            case 'complementary':
                return hueDiff((targetHue + 180) % 360) <= tolerance;
            case 'triadic':
                return hueDiff(targetHue) <= tolerance ||
                    hueDiff((targetHue + 120) % 360) <= tolerance ||
                    hueDiff((targetHue + 240) % 360) <= tolerance;
            case 'analogous':
                return hueDiff(targetHue) <= tolerance ||
                    hueDiff((targetHue + 30) % 360) <= tolerance ||
                    hueDiff((targetHue - 30 + 360) % 360) <= tolerance;
            default:
                return true;
        }
    }

    // Canvas click handler
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvas.width / 2;
        const y = e.clientY - rect.top - canvas.height / 2;
        const angle = Math.atan2(y, x) * 180 / Math.PI;
        selectedHue = (angle + 360) % 360;

        const color = `hsl(${selectedHue}, 70%, 50%)`;
        preview.style.background = color;
        colorInfo.textContent = `色相 Hue: ${Math.round(selectedHue)}°`;

        applyColorFilter();
    });

    // Harmony button handlers
    document.querySelectorAll('.harmony-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.harmony-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            applyColorFilter();
        });
    });

    function applyColorFilter() {
        const term = document.getElementById('search-colors').value.toLowerCase();
        Array.from(container.children).forEach(card => {
            const primaryHex = card.dataset.primary;
            const textMatch = card.textContent.toLowerCase().includes(term);
            const colorMatch = colorMatchesFilter(primaryHex, currentMode, selectedHue);
            card.style.display = (textMatch && colorMatch) ? 'block' : 'none';
        });
    }

    // Scene category mapping based on product type keywords
    const sceneMapping = {
        '電商': ['commerce', 'shop', 'store', 'luxury', 'marketplace'],
        '社交': ['social', 'dating', 'community', 'membership'],
        '醫療': ['health', 'medical', 'clinic', 'pharmacy', 'dental', 'veterinary', 'mental'],
        '金融': ['financial', 'fintech', 'banking', 'insurance', 'crypto'],
        '商務': ['b2b', 'consulting', 'professional', 'service', 'legal'],
        '政府': ['government', 'public'],
        '公益': ['charity', 'non-profit', 'sustainability', 'climate'],
        '教育': ['educational', 'learning', 'course', 'bootcamp'],
        '科技': ['saas', 'ai', 'tech', 'developer', 'code', 'cyber', 'quantum', 'space'],
        '娛樂': ['gaming', 'music', 'video', 'streaming', 'theater', 'cinema'],
        '生活': ['food', 'restaurant', 'cafe', 'fitness', 'beauty', 'wellness', 'travel', 'hotel']
    };

    // Calculate accessibility rating based on contrast
    function calcAccessibility(textHex, bgHex) {
        if (!textHex || !bgHex) return 2;
        const getLum = (hex) => {
            const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
            const lum = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
            return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
        };
        const L1 = getLum(textHex), L2 = getLum(bgHex);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (ratio >= 7) return 3;      // AAA
        if (ratio >= 4.5) return 2;    // AA
        return 1;                       // Fail
    }

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.primary = item['Primary (Hex)'] || '#000000';

        const palette = [
            { name: 'Primary', hex: item['Primary (Hex)'] },
            { name: 'Secondary', hex: item['Secondary (Hex)'] },
            { name: 'CTA', hex: item['CTA (Hex)'] },
            { name: 'Bg', hex: item['Background (Hex)'] },
            { name: 'Text', hex: item['Text (Hex)'] }
        ].filter(c => c.hex);

        // Category badge
        const category = item['Category'] || 'General';
        const categoryColors = {
            'Minimal': { bg: '#F1F5F9', text: '#475569' },
            'Warm': { bg: '#FEF3C7', text: '#92400E' },
            'Cool': { bg: '#DBEAFE', text: '#1E40AF' },
            'Vibrant': { bg: '#FCE7F3', text: '#9D174D' },
            'Modern': { bg: '#E0E7FF', text: '#3730A3' }
        };
        const catStyle = categoryColors[category] || { bg: '#F3F4F6', text: '#374151' };

        // Calculate accessibility
        const accessRating = calcAccessibility(item['Text (Hex)'], item['Background (Hex)']);
        const stars = '⭐'.repeat(accessRating) + '☆'.repeat(3 - accessRating);

        // Reference
        const reference = item['Reference'] || '';

        card.innerHTML = `
            <div class="style-preview" style="padding:0;">
                <div style="display:flex;height:100%;">
                    ${palette.map(c => `
                        <div style="flex:1;background-color:${c.hex};cursor:pointer;" 
                             title="${c.name}: ${c.hex}"
                             onclick="navigator.clipboard.writeText('${c.hex}')">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card-body">
                <div class="card-header-row">
                    <span class="card-index">#${String(index + 1).padStart(2, '0')}</span>
                    <span class="accessibility-rating" title="無障礙評分 (Accessibility)">${stars}</span>
                </div>
                <h3>${item['Name'] || 'Color Palette'}</h3>
                <p class="color-notes">${item['Notes'] || ''}</p>
                <div class="card-footer-row">
                    <span class="category-badge" style="background:${catStyle.bg};color:${catStyle.text};">${category}</span>
                    ${reference ? `<span class="reference-badge" title="來源 Source">📚 ${reference}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('search-colors').addEventListener('input', applyColorFilter);
}


function renderTypography(data) {
    const container = document.getElementById('typography-grid');
    if (!data || data.length === 0) return;

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        // Generate a gradient background based on category
        const categoryColors = {
            'Modern': 'linear-gradient(135deg, #667eea, #764ba2)',
            'Classic': 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
            'Creative': 'linear-gradient(135deg, #ff6b6b, #feca57)',
            'Corporate': 'linear-gradient(135deg, #2c3e50, #34495e)',
            'Playful': 'linear-gradient(135deg, #a8e6cf, #dcedc1)'
        };
        const bg = categoryColors[item.Category] || 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
        const textColor = ['Corporate', 'Modern'].includes(item.Category) ? '#FFF' : '#1a1a1a';

        card.innerHTML = `
            <div class="style-preview" style="background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
                <div style="font-size:28px;font-weight:700;color:${textColor};margin-bottom:8px;font-family:system-ui;">Aa</div>
                <div style="font-size:13px;color:${textColor};opacity:0.7;text-align:center;">${item['Header Font'] || 'Header'} + ${item['Body Font'] || 'Body'}</div>
            </div>
            <div class="card-body">
                <span class="card-index">#${String(index + 1).padStart(2, '0')}</span>
                <h3>${item['Pairing Name'] || 'Font Pair'}</h3>
                <p class="keywords">${item.Category || ''}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCharts(data) {
    const container = document.getElementById('charts-grid');
    if (!data || data.length === 0) return;

    // Map chart types to visual representations
    const chartIcons = {
        'Bar Chart': '📊',
        'Line Chart': '📈',
        'Pie Chart': '🥧',
        'Scatter Plot': '⭐',
        'Area Chart': '📉',
        'Histogram': '📊',
        'Heatmap': '🗺️',
        'Treemap': '🌳',
        'Sankey': '🔀',
        'Gauge': '🎯',
        'Table': '📋',
        'KPI Card': '💹'
    };

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        const chartType = item['Best Chart Type'] || 'Chart';
        const icon = Object.entries(chartIcons).find(([key]) => chartType.toLowerCase().includes(key.toLowerCase()))?.[1] || '📊';

        card.innerHTML = `
            <div class="style-preview" style="background:#f8fafc;display:flex;align-items:center;justify-content:center;">
                <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <span style="font-size:48px;">${icon}</span>
                    <span style="font-size:12px;color:#64748b;font-weight:500;">${chartType}</span>
                </div>
            </div>
            <div class="card-body">
                <span class="card-index">#${String(index + 1).padStart(2, '0')}</span>
                <h3>${item['Data Type'] || 'Data Visualization'}</h3>
                <p class="keywords">${item['Interactive Level'] || ''}</p>
            </div>
        `;
        container.appendChild(card);
    });
}


function renderGuidelines(data) {
    const container = document.getElementById('guidelines-grid');
    const filterContainer = document.getElementById('filter-guidelines-category');

    if (!data || data.length === 0) return;
    if (!container || !filterContainer) return; // Fix: Safety check if elements are removed from HTML

    // Clear existing filters
    filterContainer.innerHTML = '';

    // Create "All" pill
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-pill active';
    allBtn.textContent = '所有 (All)';
    allBtn.dataset.category = 'all';
    filterContainer.appendChild(allBtn);

    // Populate Category Filter
    const categories = [...new Set(data.map(item => item.Category))].sort();
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-pill';
        btn.textContent = cat;
        btn.dataset.category = cat;
        filterContainer.appendChild(btn);
    });

    // Handle Pill Clicks
    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            // Remove active class from all
            Array.from(filterContainer.children).forEach(p => p.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            filterItems();
        }
    });

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'guideline-item';
        // Store category for filtering
        div.dataset.category = item.Category;

        div.innerHTML = `
            <div class="guideline-header">
                <span class="badgex ${item.Severity.toLowerCase()}">${item.Severity}</span>
                <h3>${item.Category}: ${item.Issue}</h3>
            </div>
            <div class="guideline-body">
                <p><strong>平台 (Platform):</strong> ${item.Platform}</p>
                <p>${item.Description}</p>
                <div class="guideline-dos-donts">
                    <div class="do">✅ ${item.Do}</div>
                    <div class="dont">❌ ${item["Don't"]}</div>
                </div>
            </div>
        `;

        // Add Accordion Logic
        div.querySelector('.guideline-header').addEventListener('click', () => {
            div.classList.toggle('expanded');
        });

        container.appendChild(div);
    });

    const filterItems = () => {
        const term = document.getElementById('search-guidelines').value.toLowerCase();
        const activePill = filterContainer.querySelector('.filter-pill.active');
        const category = activePill ? activePill.dataset.category : 'all';

        Array.from(container.children).forEach(item => {
            const textMatch = item.textContent.toLowerCase().includes(term);
            const catMatch = category === 'all' || item.dataset.category === category;
            item.style.display = (textMatch && catMatch) ? 'block' : 'none';
        });
    };

    document.getElementById('search-guidelines').addEventListener('input', filterItems);

    // Update guidelines count badge
    const countBadge = document.getElementById('guidelines-count');
    if (countBadge) {
        countBadge.textContent = `${data.length} 項目`;
    }

    // Initialize collapsible toggle
    const toggleHeader = document.getElementById('guidelines-toggle');
    const collapsibleContent = document.getElementById('guidelines-collapsible');

    if (toggleHeader && collapsibleContent) {
        toggleHeader.addEventListener('click', () => {
            const toggleBtn = toggleHeader.querySelector('.collapse-toggle-btn');
            const toggleIcon = toggleHeader.querySelector('.toggle-icon');
            const toggleText = toggleHeader.querySelector('.toggle-text');
            const isExpanded = !collapsibleContent.classList.contains('collapsed');

            if (isExpanded) {
                // Collapse
                collapsibleContent.classList.add('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleText.textContent = '展開 (Expand)';
            } else {
                // Expand
                collapsibleContent.classList.remove('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'true');
                toggleText.textContent = '收起 (Collapse)';
            }
        });
    }
}

function renderStacks(stacks) {
    const container = document.getElementById('stacks-grid');
    if (!stacks || stacks.length === 0) return;

    // Map stack names to colors and icons
    const stackStyles = {
        'HTML + Tailwind': { bg: '#38BDF8', icon: '🌊', color: '#FFF' },
        'React': { bg: '#61DAFB', icon: '⚛️', color: '#1a1a1a' },
        'Next.js': { bg: '#000', icon: '▲', color: '#FFF' },
        'Vue': { bg: '#42B883', icon: '🌿', color: '#FFF' },
        'Svelte': { bg: '#FF3E00', icon: '🔥', color: '#FFF' },
        'SwiftUI': { bg: '#007AFF', icon: '🍎', color: '#FFF' },
        'React Native': { bg: '#61DAFB', icon: '📱', color: '#1a1a1a' },
        'Flutter': { bg: '#02569B', icon: '💙', color: '#FFF' }
    };

    stacks.forEach((stack, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        const rules = stack.data.length;
        const style = stackStyles[stack.name] || { bg: '#6366F1', icon: '📦', color: '#FFF' };

        card.innerHTML = `
            <div class="style-preview" style="background:${style.bg};display:flex;align-items:center;justify-content:center;">
                <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <span style="font-size:48px;">${style.icon}</span>
                    <span style="font-size:14px;color:${style.color};font-weight:600;">${stack.name}</span>
                </div>
            </div>
            <div class="card-body">
                <span class="card-index">#${String(index + 1).padStart(2, '0')}</span>
                <h3>${stack.name}</h3>
                <p class="keywords">${rules} 規則 (Rules)</p>
            </div>
        `;
        container.appendChild(card);
    });
    document.getElementById('search-stacks').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        Array.from(container.children).forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
        });
    });
}

function renderDashboard(styles, colors, typography, charts, guidelines, stacks) {
    const container = document.getElementById('dashboard-stats');
    if (!container) return; // Fix: Safety check
    container.innerHTML = `
        <span class="stat"><strong>${styles.length}</strong> 風格 (Styles)</span>
        <span class="stat"><strong>${colors.length}</strong> 色彩 (Palettes)</span>
        <span class="stat"><strong>${typography.length}</strong> 字體 (Fonts)</span>
        <span class="stat"><strong>${charts.length}</strong> 圖表 (Charts)</span>
        <span class="stat"><strong>${stacks.length}</strong> 技術棧 (Stacks)</span>
        <span class="stat"><strong>${guidelines.length}</strong> 準則 (Guidelines)</span>
    `;
}

function initGenerator(prompts, styles, colors) {
    const btn = document.getElementById('generate-btn');
    if (!btn) return;

    const input = document.getElementById('prompt-input');
    const resultsArea = document.getElementById('generator-results');
    const card = document.getElementById('recommendation-card');

    btn.addEventListener('click', () => {
        const userPrompt = input.value.toLowerCase();
        if (!userPrompt) return;

        // 1. Find best matching prompt template
        let bestMatch = null;
        let maxScore = 0;

        prompts.forEach(p => {
            const keywords = (p['AI Prompt Keywords (Copy-Paste Ready)'] || '').toLowerCase();
            const keywordList = keywords.match(/\b\w+\b/g) || [];

            let score = 0;
            // Simple keyword matching
            keywordList.forEach(k => {
                if (userPrompt.includes(k) && k.length > 3) {
                    score++;
                }
            });

            if (p['Style Category'] && userPrompt.includes(p['Style Category'].toLowerCase())) {
                score += 5; // Bonus for exact style match
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = p;
            }
        });

        // Fallback if no match
        if (!bestMatch) {
            bestMatch = prompts.find(p => p['Style Category'] === 'Minimalism & Swiss Style') || prompts[0];
        }

        // 2. Find relevant colors (simple heuristic)
        // Check for color names in prompt or use style defaults
        let matchedPalette = colors.find(c => {
            const keywords = (c.Keywords || '').toLowerCase();
            return keywords.split(',').some(k => userPrompt.includes(k.trim()));
        }) || colors[0];

        renderRecommendation(card, bestMatch, matchedPalette, userPrompt);
        resultsArea.style.display = 'block';
    });
}

function renderRecommendation(container, style, colorPalette, userPrompt) {
    const cssVars = style['Design System Variables'] || '';
    const checklist = style['Implementation Checklist'] || '';
    const technical = style['CSS/Technical Keywords'] || '';

    // Format CSS variables for display
    const formattedCss = cssVars.split(',').map(v => v.trim()).join(';\n') + ';';

    // Format Checklist
    const formattedChecklist = checklist.split(',').map(i => `<div style="margin-bottom:4px">${i.trim()}</div>`).join('');

    container.innerHTML = `
        <div class="card-header">
            <h3>${style['Style Category']}</h3>
            <span class="tag">Match Score: ${style['Style Category'] === 'Minimalism' ? 'Default' : 'High'}</span>
        </div>
        
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
            Based on your request, we recommend a <strong>${style['Style Category']}</strong> approach.
        </p>

        <div class="rec-section">
             <div class="rec-title">Recommended Palette: ${colorPalette['Product Type']}</div>
             <div class="color-palette" style="margin-bottom: 16px;">
                <div class="color-swatch" style="background:${colorPalette['Primary (Hex)']}" title="Primary"></div>
                <div class="color-swatch" style="background:${colorPalette['Secondary (Hex)']}" title="Secondary"></div>
                <div class="color-swatch" style="background:${colorPalette['CTA (Hex)']}" title="CTA"></div>
                <div class="color-swatch" style="background:${colorPalette['Background (Hex)']}" title="Background"></div>
            </div>
        </div>

        <div class="rec-section">
            <div class="rec-title">Key CSS Variables</div>
            <div class="code-block">${formattedCss}</div>
        </div>

        <div class="rec-section">
            <div class="rec-title">Technical Implementation</div>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                ${technical}
            </p>
        </div>
        
        <div class="rec-section">
            <div class="rec-title">Implementation Checklist</div>
            <div style="font-size: 13px;">${formattedChecklist}</div>
        </div>
    `;
}

function extractHex(str) {
    if (!str) return null;
    const match = str.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : null;
}

// ========================================
// DARK PATTERN ANNOTATED CASES
// ========================================

function renderDarkPatternCases() {
    const cases = window.DS_DATA.darkPatterns || [];
    const grid = document.getElementById('dark-pattern-cases-grid');
    if (!grid) return;

    grid.innerHTML = '';

    cases.forEach(dpCase => {
        const card = document.createElement('div');
        card.className = 'dp-case-card';
        card.dataset.severity = dpCase.Severity;
        card.dataset.type = dpCase.PatternType;
        card.dataset.platform = dpCase.Platform;

        card.innerHTML = `
            <div class="dp-card-preview">
                <div class="dp-card-placeholder">📸 Screenshot Placeholder</div>
            </div>
            <div class="dp-card-body">
                <div class="dp-card-badges">
                    <span class="pattern-type-badge ${dpCase.PatternType.toLowerCase()}">${dpCase.PatternType}</span>
                    <span class="severity-badge ${dpCase.Severity.toLowerCase()}">${dpCase.Severity}</span>
                </div>
                <h4>${dpCase.Subtype}</h4>
                <p class="dp-card-meta">
                    ${dpCase.Category} • ${dpCase.Platform}<br>
                    ${dpCase.ComponentType} component
                </p>
            </div>
        `;

        card.addEventListener('click', () => showDarkPatternModal(dpCase));
        grid.appendChild(card);
    });
}

function showDarkPatternModal(dpCase) {
    const modal = document.getElementById('dp-modal');
    if (!modal) return;

    // Populate modal content
    document.getElementById('dp-badge-type').textContent = dpCase.PatternType;
    document.getElementById('dp-badge-type').className = `pattern-type-badge ${dpCase.PatternType.toLowerCase()}`;
    document.getElementById('dp-badge-severity').textContent = dpCase.Severity;
    document.getElementById('dp-badge-severity').className = `severity-badge ${dpCase.Severity.toLowerCase()}`;

    document.getElementById('dp-subtype').textContent = dpCase.Subtype;
    document.getElementById('dp-psychology').textContent = dpCase.Psychology;
    document.getElementById('dp-component').textContent = dpCase.ComponentType;

    // COT Analysis
    document.getElementById('dp-cot-observation').textContent = dpCase.ObservationCOT;
    document.getElementById('dp-cot-reasoning').textContent = dpCase.ReasoningCOT;

    // Remediation list
    const remediationDiv = document.getElementById('dp-cot-remediation');
    const remediations = dpCase.RemediationCOT.split('\n').filter(r => r.trim());
    remediationDiv.innerHTML = '<ul>' + remediations.map(r => `<li>${r}</li>`).join('') + '</ul>';

    // Citation
    document.getElementById('dp-citation').textContent = dpCase.Citation;
    const citationLink = document.getElementById('dp-citation-link');
    if (dpCase.Citation.includes('arXiv')) {
        citationLink.href = 'https://arxiv.org/abs/2512.18269';
    } else if (dpCase.Citation.includes('Deceptive.design')) {
        citationLink.href = 'https://www.deceptive.design';
    }

    // Screenshot metadata
    document.getElementById('dp-meta-url').textContent = dpCase.URL;
    document.getElementById('dp-meta-platform').textContent = dpCase.Platform;

    // Draw bounding box (simplified - would be more complex with real coordinates)
    const svg = document.getElementById('dp-bounding-boxes');
    svg.innerHTML = `
        <rect x="${dpCase.BBoxX * 0.6}" y="${dpCase.BBoxY * 0.6}" 
              width="${dpCase.BBoxW * 0.6}" height="${dpCase.BBoxH * 0.6}" 
              class="bbox-dark"/>
        <text x="${dpCase.BBoxX * 0.6 + 5}" y="${dpCase.BBoxY * 0.6 + 20}" class="bbox-label">
            ${dpCase.Subtype}
        </text>
    `;

    modal.classList.remove('hidden');
}

function initDarkPatternFilters() {
    const severityFilter = document.getElementById('dp-filter-severity');
    const typeFilter = document.getElementById('dp-filter-type');
    const platformFilter = document.getElementById('dp-filter-platform');

    const applyFilters = () => {
        const cards = document.querySelectorAll('.dp-case-card');
        cards.forEach(card => {
            const matchSeverity = severityFilter.value === 'all' || card.dataset.severity === severityFilter.value;
            const matchType = typeFilter.value === 'all' || card.dataset.type === typeFilter.value;
            const matchPlatform = platformFilter.value === 'all' || card.dataset.platform === platformFilter.value;

            card.style.display = (matchSeverity && matchType && matchPlatform) ? 'block' : 'none';
        });
    };

    if (severityFilter) severityFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (platformFilter) platformFilter.addEventListener('change', applyFilters);
}

function initDarkPatternModal() {
    const modal = document.getElementById('dp-modal');
    const closeBtn = document.querySelector('.dp-modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

// Initialize when guidelines tab is active
const originalInitGuidelines = window.initGuidelinesTab || function () { };
window.initGuidelinesTab = function () {
    originalInitGuidelines();
    renderDarkPatternCases();
    initDarkPatternFilters();
    initGuidelinesFlow();
};

/* =========================================
   PHASE 14: INTERACTIVE GUIDELINES FLOW
   ========================================= */

let guidelinesState = {
    perspective: null, // 'ic' or 'manager'
    activeCase: null   // caseId string
};

window.showScreen = function (screenName) {
    document.querySelectorAll('.guidelines-screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });

    const target = document.getElementById(`guidelines-screen-${screenName}`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
};

window.selectPersona = function (perspective) {
    guidelinesState.perspective = perspective;

    // Update Badge in Library
    const badge = document.getElementById('current-persona-badge');
    if (badge) badge.textContent = perspective === 'ic' ? 'IC (Individual Contributor)' : 'Manager';

    // Highlight selected card (optional visual feedback)
    document.querySelectorAll('.perspective-card').forEach(c => {
        c.classList.toggle('active', c.dataset.perspective === perspective);
    });

    showScreen('library');
};

window.selectCase = function (caseId) {
    guidelinesState.activeCase = caseId;

    // Update Context Screen Header
    const titleMap = {
        'account-deletion': 'Account Deletion Flow',
        'logout-flow': 'Log Out Flow',
        'macro-balance': 'Macro Balance Display'
    };
    document.getElementById('active-case-title').textContent = titleMap[caseId] || caseId;

    // Filter Contextual Data
    filterContextContent(caseId);

    // Filter Annotated DB
    filterAnnotatedDB(caseId);

    // Open Case Study in New Tab (Perspective based)
    const perspective = guidelinesState.perspective || 'ic';
    const url = perspective === 'ic'
        ? 'assets/case-studies/design_review_IC.html'
        : 'assets/case-studies/design_review_Manager_perspective.html';

    window.open(url, '_blank');

    // Transition to Context Screen
    showScreen('context');
};

function filterContextContent(caseId) {
    // Filter Psychology Cards
    document.querySelectorAll('.psychology-card').forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        if (tags.includes(caseId)) {
            card.style.display = 'block';
            card.style.border = '2px solid #3b82f6'; // Highlight
        } else {
            card.style.display = 'none';
        }
    });

    // Filter Taxonomy Items
    document.querySelectorAll('.dark-pattern-item').forEach(item => {
        const tags = (item.dataset.tags || '').split(' ');
        if (tags.includes(caseId)) {
            item.style.display = 'block';
            item.style.border = '2px solid #ef4444'; // Highlight
        } else {
            item.style.display = 'none';
        }
    });
}

function filterAnnotatedDB(caseId) {
    // Filter annotated cases in the grid based on the active case context
    // Ideally, we would map caseId to specific DP cases in the DB.
    // For now, we can show ALL related to the pattern type of the active case.

    // Mapping Case ID to Pattern Type
    const patternMap = {
        'account-deletion': 'Data Hostage',
        'logout-flow': 'Interaction Friction',
        'macro-balance': 'Confirmshaming'
    };

    const targetPattern = patternMap[caseId];

    const cards = document.querySelectorAll('.dp-case-card');
    let visibleCount = 0;
    cards.forEach(card => {
        // We look for pattern type in the card (we need to ensure data attributes exist)
        // Implementation assumption: renderDarkPatternCases adds data-type or similar.
        // Let's assume we filter by text content if data attribute missing, or update render

        // Actually, renderDarkPatternCases passes full object. 
        // Let's filter by checking if the card's Pattern Type matches target.
        const typeBadge = card.querySelector('.pattern-type-badge');
        if (typeBadge && typeBadge.textContent.includes(targetPattern)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // If no exact match (e.g. data might be limited), show all High severity as fallback?
    if (visibleCount === 0) {
        cards.forEach(c => c.style.display = 'block'); // Fallback: show all
    }
}

function initGuidelinesFlow() {
    // Reset to Persona Screen on load
    showScreen('persona');
}

