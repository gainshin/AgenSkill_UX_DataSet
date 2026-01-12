/**
 * Generative Backgrounds for AI/UX Bento Grid
 * Implements 4 distinct mathematical visualizations using HTML5 Canvas
 */

class GenerativeEffect {
    constructor(canvasId, cardId) {
        this.canvas = document.getElementById(canvasId);
        this.card = document.getElementById(cardId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.isHovered = false;
        this.time = 0;

        // Handle Retina displays
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);

        this.initEvents();
        this.resize();
    }

    initEvents() {
        this.card.addEventListener('mouseenter', () => { this.isHovered = true; });
        this.card.addEventListener('mouseleave', () => { this.isHovered = false; });
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.card.offsetWidth;
        this.height = this.card.offsetHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
    }

    animate() {
        // Base animation loop - override in subclasses
    }
}

// 01. Vertical Lines (Frequency/Order)
class VerticalLinesEffect extends GenerativeEffect {
    animate() {
        this.time += 0.02;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const lineCount = 40;
        const spacing = this.width / lineCount;

        for (let i = 0; i < lineCount; i++) {
            const x = i * spacing;
            // Math: Sin wave modulation + noise
            let h = Math.sin(i * 0.2 + this.time) * 40 + 60;

            // Interaction: Grow taller on hover
            if (this.isHovered) {
                h *= 1.5 + Math.sin(i * 0.5 + this.time * 2) * 0.5;
            }

            // Gradient Opacity
            const alpha = (i / lineCount) * 0.3 + 0.1;

            this.ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`; // Accent Purple
            this.ctx.beginPath();
            this.ctx.rect(x, this.height - h, 2, h); // Bottom aligned
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// 02. Rotating Arcs (Constraints/Radar)
class RotatingArcsEffect extends GenerativeEffect {
    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width / 2;
        const cy = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) * 0.8;

        const count = 8;

        for (let i = 0; i < count; i++) {
            const r = (i + 1) * (maxRadius / count) * 0.5;
            const startAngle = this.time * (i + 1) * 0.2;
            const endAngle = startAngle + Math.PI * (0.5 + Math.sin(this.time * 0.5) * 0.5);

            this.ctx.strokeStyle = `rgba(202, 138, 4, ${0.1 + (i / count) * 0.2})`; // Terracotta
            this.ctx.lineWidth = this.isHovered ? 4 : 2;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, startAngle, endAngle);
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// 03. Triangles (Logic/Structure)
class TriangleMeshEffect extends GenerativeEffect {
    animate() {
        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const count = 5;
        const spacing = this.width / count;

        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                const x = i * spacing + spacing / 2;
                const y = j * spacing + spacing / 2;

                // Breathing logic
                const size = (Math.sin(this.time + i + j) * 10) + 20;

                this.ctx.strokeStyle = `rgba(52, 211, 153, ${0.1 + ((i + j) / 10) * 0.2})`; // Green
                this.ctx.lineWidth = this.isHovered ? 3 : 1;

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(this.time * 0.5 + (this.isHovered ? i : 0));

                this.ctx.beginPath();
                this.ctx.moveTo(0, -size);
                this.ctx.lineTo(size, size);
                this.ctx.lineTo(-size, size);
                this.ctx.closePath();
                this.ctx.stroke();

                this.ctx.restore();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// 04. Sine Waves (Documentation/Flow)
class SineWaveEffect extends GenerativeEffect {
    animate() {
        this.time += 0.03;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const waves = 5;

        for (let i = 0; i < waves; i++) {
            this.ctx.beginPath();

            const amplitude = this.isHovered ? 30 : 15;
            const yOffset = this.height / 2 + (i - waves / 2) * 20;

            this.ctx.strokeStyle = `rgba(200, 200, 200, ${0.1 + (i * 0.1)})`;
            this.ctx.lineWidth = 2;

            for (let x = 0; x < this.width; x += 5) {
                const y = Math.sin(x * 0.01 + this.time + i) * amplitude;
                this.ctx.lineTo(x, yOffset + y);
            }

            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only init if canvas elements exist
    if (document.getElementById('canvas-01')) new VerticalLinesEffect('canvas-01', 'card-01');
    if (document.getElementById('canvas-02')) new RotatingArcsEffect('canvas-02', 'card-02');
    if (document.getElementById('canvas-03')) new TriangleMeshEffect('canvas-03', 'card-03');
    if (document.getElementById('canvas-04')) new SineWaveEffect('canvas-04', 'card-04');
});
