// ============================================================
// GaugeRenderer - SVG Circular Gauges & Sparklines
// ============================================================

class GaugeRenderer {
    constructor() {
        this._animationFrames = new Map();
        this._currentValues = new Map();

        this.colors = {
            co2: { main: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)', gradient: ['#2ecc71', '#27ae60'] },
            temp: { main: '#f39c12', glow: 'rgba(243, 156, 18, 0.3)', gradient: ['#f39c12', '#f1c40f'] },
            humidity: { main: '#3498db', glow: 'rgba(52, 152, 219, 0.3)', gradient: ['#3498db', '#2980b9'] }
        };
    }

    // ----------------------------------------------------------
    // Render a full gauge (first time)
    // ----------------------------------------------------------
    renderGauge(containerId, options) {
        const { value, min, max, color, glowColor, label, unit, type } = options;
        const container = document.getElementById(containerId);
        if (!container) return;

        const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const activeLength = 282.74 * (percentage / 100);
        const strokeOpacity = percentage > 0 ? 1 : 0;

        const statusClass = this._getStatusForValue(type, value);
        const isDanger = statusClass === 'danger';

        let colorSet;
        if (type === 'co2') {
            colorSet = this._getCo2Colors(value);
        } else {
            colorSet = this.colors[type] || { main: color, glow: glowColor, gradient: [color, color] };
        }
        const gradientId = `gradient-${containerId}`;
        const filterId = `glow-${containerId}`;
        const centerGlowId = `center-glow-${containerId}`;

        const statusRingColor = statusClass === 'danger' ? '#ff4757' : statusClass === 'warning' ? '#ffa502' : colorSet.main;

        // Calculate progress tip coordinates (sweep starts at 135 deg and spans 270 deg)
        const sweepAngle = 135 + 270 * (percentage / 100);
        const sweepAngleRad = sweepAngle * Math.PI / 180;
        const dotX = 70 + radius * Math.cos(sweepAngleRad);
        const dotY = 70 + radius * Math.sin(sweepAngleRad);

        const svg = `
            <svg viewBox="0 0 140 140" class="gauge-svg ${isDanger ? 'flash-danger' : ''}">
                <defs>
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorSet.gradient[0]};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${colorSet.gradient[1]};stop-opacity:1" />
                    </linearGradient>
                    <radialGradient id="${centerGlowId}" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:${colorSet.gradient[0]};stop-opacity:0.18" />
                        <stop offset="100%" style="stop-color:${colorSet.gradient[0]};stop-opacity:0" />
                    </radialGradient>
                    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feColorMatrix in="blur" type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <clipPath id="clip-${containerId}">
                        <polygon points="70,70 -10,150 -10,-10 150,-10 150,150" />
                    </clipPath>
                </defs>

                <!-- Center soft glow -->
                <circle cx="70" cy="70" r="45"
                    fill="url(#${centerGlowId})"
                    class="gauge-center-glow" />

                <!-- Background track -->
                <circle cx="70" cy="70" r="${radius}"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray="282.74 377"
                    transform="rotate(135 70 70)" />

                <!-- Background subtle ticks -->
                <g clip-path="url(#clip-${containerId})">
                    <circle cx="70" cy="70" r="${radius}"
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        stroke-width="8"
                        stroke-dasharray="2 8"
                        transform="rotate(135 70 70)" />
                </g>

                <!-- Progress arc -->
                <circle cx="70" cy="70" r="${radius}"
                    fill="none"
                    stroke="url(#${gradientId})"
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray="${activeLength} 377"
                    stroke-opacity="${strokeOpacity}"
                    transform="rotate(135 70 70)"
                    filter="url(#${filterId})"
                    class="gauge-progress"
                    data-circumference="${circumference}" />

                <!-- Progress tip dot indicator -->
                <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="5.5"
                    fill="#ffffff"
                    stroke="${statusRingColor}"
                    stroke-width="2.5"
                    class="gauge-dot" />

                <!-- Center value -->
                <text x="70" y="62" text-anchor="middle" dominant-baseline="middle"
                    class="gauge-value-text"
                    fill="${statusRingColor}"
                    font-family="'Orbitron', 'Courier New', monospace"
                    font-size="22" font-weight="700">
                    ${this._formatValue(value, type)}
                </text>

                <!-- Unit label -->
                <text x="70" y="82" text-anchor="middle" dominant-baseline="middle"
                    fill="rgba(255,255,255,0.5)"
                    font-family="'Inter', sans-serif"
                    font-size="10" font-weight="400">
                    ${unit}
                </text>

                <!-- Min/Max labels (Aligned to 135 deg and 45 deg) -->
                <text x="38" y="104" text-anchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    font-family="'Inter', sans-serif"
                    font-size="9">
                    ${min}
                </text>
                <text x="102" y="104" text-anchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    font-family="'Inter', sans-serif"
                    font-size="9">
                    ${max}
                </text>
            </svg>
        `;

        container.innerHTML = svg;
        this._currentValues.set(containerId, { value, min, max, type, unit, color, glowColor });
    }

    // ----------------------------------------------------------
    // Update gauge with animation
    // ----------------------------------------------------------
    updateGauge(containerId, newValue, options) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const prev = this._currentValues.get(containerId);

        // If no previous render, or if the type has changed, do a full render to update labels/units
        if (!prev || prev.type !== options.type) {
            this.renderGauge(containerId, { ...options, value: newValue });
            return;
        }

        const oldValue = prev.value;
        const { min, max, type, unit } = { ...prev, ...options };

        // Cancel any running animation
        if (this._animationFrames.has(containerId)) {
            cancelAnimationFrame(this._animationFrames.get(containerId));
        }

        const duration = 600; // ms
        const startTime = performance.now();
        const radius = 60;

        const progressEl = container.querySelector('.gauge-progress');
        const valueTextEl = container.querySelector('.gauge-value-text');
        const dotEl = container.querySelector('.gauge-dot');
        const centerGlowStop = container.querySelector(`#center-glow-${containerId} stop[offset="0%"]`);

        if (!progressEl || !valueTextEl) {
            this.renderGauge(containerId, { ...options, value: newValue });
            return;
        }

        const colorSet = this.colors[type] || { main: '#ffffff' };

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentVal = oldValue + (newValue - oldValue) * eased;
            const percentage = Math.max(0, Math.min(100, ((currentVal - min) / (max - min)) * 100));
            const activeLength = 282.74 * (percentage / 100);
            const strokeOpacity = percentage > 0 ? 1 : 0;

            progressEl.setAttribute('stroke-dasharray', `${activeLength} 377`);
            progressEl.setAttribute('stroke-opacity', strokeOpacity);

            let activeColorSet;
            if (type === 'co2') {
                activeColorSet = this._getCo2Colors(currentVal);
                const stop0 = container.querySelector(`#gradient-${containerId} stop[offset="0%"]`);
                const stop1 = container.querySelector(`#gradient-${containerId} stop[offset="100%"]`);
                if (stop0) stop0.style.stopColor = activeColorSet.gradient[0];
                if (stop1) stop1.style.stopColor = activeColorSet.gradient[1];
            } else {
                activeColorSet = this.colors[type] || { main: '#ffffff', gradient: ['#ffffff', '#ffffff'] };
            }

            if (centerGlowStop) {
                centerGlowStop.style.stopColor = activeColorSet.gradient[0];
            }

            const statusClass = this._getStatusForValue(type, currentVal);
            const statusColor = statusClass === 'danger' ? '#ff4757' : statusClass === 'warning' ? '#ffa502' : activeColorSet.main;
            valueTextEl.setAttribute('fill', statusColor);
            valueTextEl.textContent = this._formatValue(Math.round(currentVal * 10) / 10, type);

            // Trigger needle dot updates
            if (dotEl) {
                const sweepAngle = 135 + 270 * (percentage / 100);
                const sweepAngleRad = sweepAngle * Math.PI / 180;
                const dotX = 70 + radius * Math.cos(sweepAngleRad);
                const dotY = 70 + radius * Math.sin(sweepAngleRad);
                dotEl.setAttribute('cx', dotX.toFixed(2));
                dotEl.setAttribute('cy', dotY.toFixed(2));
                dotEl.setAttribute('stroke', statusColor);
            }

            const svgEl = container.querySelector('.gauge-svg');
            if (svgEl) {
                if (statusClass === 'danger') {
                    svgEl.classList.add('flash-danger');
                } else {
                    svgEl.classList.remove('flash-danger');
                }
            }

            if (progress < 1) {
                this._animationFrames.set(containerId, requestAnimationFrame(animate));
            } else {
                this._currentValues.set(containerId, { value: newValue, min, max, type, unit });
                this._animationFrames.delete(containerId);
            }
        };

        this._animationFrames.set(containerId, requestAnimationFrame(animate));
    }

    // ----------------------------------------------------------
    // Sparkline
    // ----------------------------------------------------------
    renderSparkline(containerId, data, color) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        // Take last 20 data points
        const points = data.slice(-20);
        if (points.length < 2) return;

        const width = container.clientWidth || 120;
        const height = 40;
        const padding = 2;

        const values = points.map(p => (typeof p === 'number' ? p : p));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const stepX = (width - padding * 2) / (values.length - 1);

        const coords = values.map((v, i) => {
            const x = padding + i * stepX;
            const y = height - padding - ((v - min) / range) * (height - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        const polylinePoints = coords.join(' ');

        // Create fill polygon (area below the line)
        const fillPoints = `${padding},${height} ${polylinePoints} ${(padding + (values.length - 1) * stepX).toFixed(1)},${height}`;

        const sparklineId = `sparkline-grad-${containerId}`;

        const svg = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="sparkline-svg">
                <defs>
                    <linearGradient id="${sparklineId}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0.0" />
                    </linearGradient>
                </defs>
                <polygon points="${fillPoints}" fill="url(#${sparklineId})" />
                <polyline points="${polylinePoints}"
                    fill="none"
                    stroke="${color}"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke" />
                <circle cx="${coords[coords.length - 1].split(',')[0]}" cy="${coords[coords.length - 1].split(',')[1]}"
                    r="2.5" fill="${color}" class="sparkline-dot" />
            </svg>
        `;

        container.innerHTML = svg;
    }

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    _getCo2Colors(value) {
        if (!window.DataManager) return { main: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)', gradient: ['#2ecc71', '#27ae60'] };
        const t = window.DataManager.getThresholds();
        if (value > t.co2.max) {
            return { main: '#e74c3c', glow: 'rgba(231, 76, 60, 0.3)', gradient: ['#e74c3c', '#c0392b'] };
        } else {
            return { main: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)', gradient: ['#2ecc71', '#27ae60'] };
        }
    }

    _formatValue(value, type) {
        if (type === 'co2') return Math.round(value).toString();
        return value.toFixed(1);
    }

    _getStatusForValue(type, value) {
        if (!window.DataManager) return 'good';
        const t = window.DataManager.getThresholds();

        if (type === 'co2') {
            if (value > t.co2.max) return 'danger';
            return 'good';
        } else if (type === 'temp') {
            if (value > t.temp.max + 3 || value < t.temp.min - 3) return 'danger';
            if (value > t.temp.max || value < t.temp.min) return 'warning';
        } else if (type === 'humidity') {
            if (value > t.humidity.max + 10 || value < t.humidity.min - 10) return 'danger';
            if (value > t.humidity.max || value < t.humidity.min) return 'warning';
        }
        return 'good';
    }
}

window.GaugeRenderer = new GaugeRenderer();
