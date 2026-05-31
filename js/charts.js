// ============================================================
// ChartManager - Chart.js Line & Bar Charts
// ============================================================

class ChartManager {
    constructor() {
        this.lineChart = null;
        this.barChart = null;
        this.activeRange = '24h';
        this.activeMetrics = new Set(['co2', 'temp', 'humidity']);
    }

    // ----------------------------------------------------------
    // Initialization
    // ----------------------------------------------------------
    init() {
        // Ensure Chart.js is available (UMD build on window.Chart)
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded yet. Charts will initialize when available.');
            return;
        }

        // Dark theme defaults
        Chart.defaults.color = 'rgba(255,255,255,0.6)';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
        Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

        // Setup time tab listeners
        document.querySelectorAll('.time-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.time-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.setTimeRange(tab.dataset.range);
            });
        });

        // Setup metric toggle listeners
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                this.toggleMetric(btn.dataset.metric);
            });
        });
    }

    // ----------------------------------------------------------
    // Line Chart (History)
    // ----------------------------------------------------------
    renderLineChart(canvasId, roomId, timeRange) {
        if (typeof Chart === 'undefined') return;

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const range = timeRange || this.activeRange;
        const history = window.DataManager.getHistory(roomId, range);

        if (history.length === 0) return;

        // Downsample if too many points
        const maxPoints = range === '30d' ? 500 : range === '7d' ? 600 : 300;
        const sampled = this._downsample(history, maxPoints);

        const labels = sampled.map(d => new Date(d.timestamp));

        const datasets = [];

        const unitSetting = window.DataManager.getSettings().unit || 'C';

        if (this.activeMetrics.has('co2')) {
            datasets.push({
                label: window.i18n.t('metric_co2') + ' (ppm)',
                data: sampled.map(d => d.co2),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#2ecc71',
                borderWidth: 2,
                yAxisID: 'y-co2',
                order: 1
            });
        }

        if (this.activeMetrics.has('temp')) {
            datasets.push({
                label: window.i18n.t('metric_temp') + (unitSetting === 'F' ? ' (°F)' : ' (°C)'),
                data: sampled.map(d => unitSetting === 'F' ? (d.temp * 9 / 5) + 32 : d.temp),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#f39c12',
                borderWidth: 2,
                yAxisID: 'y-temp',
                order: 2
            });
        }

        if (this.activeMetrics.has('humidity')) {
            datasets.push({
                label: window.i18n.t('metric_humidity') + ' (%)',
                data: sampled.map(d => d.humidity),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#3498db',
                borderWidth: 2,
                yAxisID: 'y-temp',
                order: 3
            });
        }

        // Time format based on range
        let timeUnit, displayFormats;
        if (range === '24h') {
            timeUnit = 'hour';
            displayFormats = { hour: 'HH:mm' };
        } else if (range === '7d') {
            timeUnit = 'day';
            displayFormats = { day: 'dd/MM' };
        } else {
            timeUnit = 'day';
            displayFormats = { day: 'dd/MM' };
        }

        const config = {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 15,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 25, 0.95)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        titleFont: { size: 12 },
                        bodyFont: { size: 11 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            title: (items) => {
                                if (!items.length) return '';
                                const d = new Date(items[0].parsed.x || items[0].label);
                                const locale = window.i18n.lang === 'vi' ? 'vi-VN' : window.i18n.lang === 'zh' ? 'zh-CN' : 'en-US';
                                return d.toLocaleString(locale, {
                                    day: '2-digit', month: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: timeUnit, displayFormats },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: {
                            maxRotation: 0,
                            font: { size: 10 },
                            maxTicksLimit: 8
                        }
                    },
                    'y-co2': {
                        type: 'linear',
                        position: 'left',
                        display: this.activeMetrics.has('co2'),
                        title: {
                            display: true,
                            text: 'CO₂ (ppm)',
                            font: { size: 10 },
                            color: '#2ecc71'
                        },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { font: { size: 10 }, color: '#2ecc71' }
                    },
                    'y-temp': {
                        type: 'linear',
                        position: 'right',
                        display: this.activeMetrics.has('temp') || this.activeMetrics.has('humidity'),
                        title: {
                            display: true,
                            text: '°C / %',
                            font: { size: 10 },
                            color: '#f39c12'
                        },
                        grid: { drawOnChartArea: false },
                        ticks: { font: { size: 10 }, color: '#f39c12' }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        };

        // Destroy existing chart before creating new one
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }

        this.lineChart = new Chart(canvas, config);
    }

    // ----------------------------------------------------------
    // Toggle Metric Visibility
    // ----------------------------------------------------------
    toggleMetric(metric) {
        if (this.activeMetrics.has(metric)) {
            // Don't allow removing the last metric
            if (this.activeMetrics.size <= 1) {
                // Re-add the active class to the button
                document.querySelector(`.chart-toggle[data-metric="${metric}"]`)?.classList.add('active');
                return;
            }
            this.activeMetrics.delete(metric);
        } else {
            this.activeMetrics.add(metric);
        }

        // Re-render chart
        this.renderLineChart('main-chart', window.DataManager.currentRoomId, this.activeRange);
        this.updateStats();
    }

    // ----------------------------------------------------------
    // Set Time Range
    // ----------------------------------------------------------
    setTimeRange(range) {
        this.activeRange = range;
        this.renderLineChart('main-chart', window.DataManager.currentRoomId, range);
        this.updateStats();
    }

    // ----------------------------------------------------------
    // Bar Chart (Reports)
    // ----------------------------------------------------------
    renderBarChart(canvasId, data) {
        if (typeof Chart === 'undefined') return;

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.barChart) {
            this.barChart.destroy();
            this.barChart = null;
        }

        if (!data || data.length === 0) return;

        const unitSetting = window.DataManager.getSettings().unit || 'C';
        const locale = window.i18n.lang === 'vi' ? 'vi-VN' : window.i18n.lang === 'zh' ? 'zh-CN' : 'en-US';

        const labels = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
        });

        const config = {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: window.i18n.t('stat_avg_co2') + ' (ppm)',
                        data: data.map(d => d.co2.avg),
                        backgroundColor: 'rgba(46, 204, 113, 0.7)',
                        borderColor: '#2ecc71',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y-co2'
                    },
                    {
                        label: window.i18n.t('stat_avg_temp') + (unitSetting === 'F' ? ' (°F)' : ' (°C)'),
                        data: data.map(d => unitSetting === 'F' ? Math.round(((d.temp.avg * 9 / 5) + 32) * 10) / 10 : d.temp.avg),
                        backgroundColor: 'rgba(243, 156, 18, 0.7)',
                        borderColor: '#f39c12',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y-temp'
                    },
                    {
                        label: window.i18n.t('stat_avg_humidity') + ' (%)',
                        data: data.map(d => d.humidity.avg),
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: '#3498db',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y-temp'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rect',
                            padding: 12,
                            font: { size: 10 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 25, 0.95)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { font: { size: 10 }, maxRotation: 45 }
                    },
                    'y-co2': {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'CO₂ (ppm)',
                            font: { size: 10 },
                            color: '#2ecc71'
                        },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { font: { size: 10 } }
                    },
                    'y-temp': {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: '°C / %',
                            font: { size: 10 },
                            color: '#f39c12'
                        },
                        grid: { drawOnChartArea: false },
                        ticks: { font: { size: 10 } }
                    }
                },
                animation: {
                    duration: 600,
                    easing: 'easeOutQuart'
                }
            }
        };

        this.barChart = new Chart(canvas, config);
    }

    // ----------------------------------------------------------
    // Update Stat Cards
    // ----------------------------------------------------------
    updateStats() {
        const stats = window.DataManager.getStats(window.DataManager.currentRoomId, this.activeRange);

        // CO2
        const co2Avg = document.getElementById('stat-co2-avg');
        const co2Range = document.getElementById('stat-co2-range');
        if (co2Avg) co2Avg.textContent = `${Math.round(stats.co2.avg)} ppm`;
        if (co2Range) co2Range.textContent = `${Math.round(stats.co2.min)} ~ ${Math.round(stats.co2.max)}`;

        // Temp
        const tempAvg = document.getElementById('stat-temp-avg');
        const tempRange = document.getElementById('stat-temp-range');
        const unitSetting = window.DataManager.getSettings().unit || 'C';
        let tempAvgVal = stats.temp.avg;
        let tempMinVal = stats.temp.min;
        let tempMaxVal = stats.temp.max;
        let tempUnit = '°C';
        if (unitSetting === 'F') {
            tempAvgVal = Math.round(((stats.temp.avg * 9 / 5) + 32) * 10) / 10;
            tempMinVal = Math.round(((stats.temp.min * 9 / 5) + 32) * 10) / 10;
            tempMaxVal = Math.round(((stats.temp.max * 9 / 5) + 32) * 10) / 10;
            tempUnit = '°F';
        }
        if (tempAvg) tempAvg.textContent = `${tempAvgVal}${tempUnit}`;
        if (tempRange) tempRange.textContent = `${tempMinVal} ~ ${tempMaxVal}`;

        // Humidity
        const humidityAvg = document.getElementById('stat-humidity-avg');
        const humidityRange = document.getElementById('stat-humidity-range');
        if (humidityAvg) humidityAvg.textContent = `${stats.humidity.avg}%`;
        if (humidityRange) humidityRange.textContent = `${stats.humidity.min} ~ ${stats.humidity.max}`;
    }

    // ----------------------------------------------------------
    // Downsample data
    // ----------------------------------------------------------
    _downsample(data, maxPoints) {
        if (data.length <= maxPoints) return data;
        const step = Math.ceil(data.length / maxPoints);
        const result = [];
        for (let i = 0; i < data.length; i += step) {
            result.push(data[i]);
        }
        // Always include last point
        if (result[result.length - 1] !== data[data.length - 1]) {
            result.push(data[data.length - 1]);
        }
        return result;
    }

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------
    destroy() {
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }
        if (this.barChart) {
            this.barChart.destroy();
            this.barChart = null;
        }
    }
}

window.ChartManager = new ChartManager();
