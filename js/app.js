// ============================================================
// App - Main Application Controller
// ============================================================

class App {
    constructor() {
        this.currentScreen = 'dashboard';
        this.updateTimer = null;
        this.activeMetric = 'co2';
    }

    // ----------------------------------------------------------
    // Initialization
    // ----------------------------------------------------------
    init() {
        // Store instance reference for cross-module access
        App._instance = this;

        // 1. Initialize DataManager (generates mock data)
        window.DataManager.init();

        // Translate UI
        this.translateStaticUI();

        // 2. GaugeRenderer is ready (no init needed)

        // 3. Initialize AlertManager
        window.AlertManager.init();

        // 4. Initialize ChartManager
        window.ChartManager.init();

        // 5. Setup navigation
        this.setupNavigation();

        // 6. Setup room selector (Disabled in single vehicle mode)

        // 7. Initial navigation to dashboard
        this.navigate('dashboard');

        // 8. Start realtime updates
        this.startRealtimeUpdates();

        // 9. Update connection status
        this.updateConnectionStatus(true);

        console.log('🌿 AtmoCar initialized successfully');
    }

    updateLanguage() {
        this.translateStaticUI();
        this.navigate(this.currentScreen);
    }

    translateStaticUI() {
        // App title in header
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = 'AtmoCar';
        }

        // Header vehicle title
        const vehicleTitle = document.getElementById('vehicle-title');
        if (vehicleTitle) {
            vehicleTitle.textContent = `🚗 ${window.i18n.t('default_car_single')}`;
        }

        // Nav tabs
        const navDashboard = document.querySelector('.nav-item[data-screen="dashboard"] span');
        if (navDashboard) navDashboard.textContent = window.i18n.t('nav_dashboard');
        const navCharts = document.querySelector('.nav-item[data-screen="charts"] span');
        if (navCharts) navCharts.textContent = window.i18n.t('nav_charts');
        const navAlerts = document.querySelector('.nav-item[data-screen="alerts"] span');
        if (navAlerts) navAlerts.textContent = window.i18n.t('nav_alerts');
        const navSettings = document.querySelector('.nav-item[data-screen="settings"] span');
        if (navSettings) navSettings.textContent = window.i18n.t('nav_settings');
        const navReports = document.querySelector('.nav-item[data-screen="reports"] span');
        if (navReports) navReports.textContent = window.i18n.t('nav_reports');

        // Header connection status
        const statusText = document.querySelector('.connection-status .status-text');
        if (statusText) {
            const isOnline = document.getElementById('connection-status').classList.contains('online');
            statusText.textContent = isOnline ? window.i18n.t('status_online') : window.i18n.t('status_offline');
        }

        // Alerts page title
        const alertsTitle = document.querySelector('.alerts-title');
        if (alertsTitle) alertsTitle.textContent = window.i18n.t('alerts_title');
        const clearAllAlertsBtn = document.getElementById('clear-all-alerts');
        if (clearAllAlertsBtn) clearAllAlertsBtn.textContent = window.i18n.t('alerts_clear_all');

        // Update charts toggles text
        const toggleTemp = document.querySelector('.chart-toggle[data-metric="temp"]');
        if (toggleTemp) toggleTemp.textContent = window.i18n.t('metric_temp');
        const toggleHumidity = document.querySelector('.chart-toggle[data-metric="humidity"]');
        if (toggleHumidity) toggleHumidity.textContent = window.i18n.t('metric_humidity');

        // Time tabs in charts
        const timeTab24h = document.querySelector('.time-tab[data-range="24h"]');
        if (timeTab24h) timeTab24h.textContent = window.i18n.t('range_24h');
        const timeTab7d = document.querySelector('.time-tab[data-range="7d"]');
        if (timeTab7d) timeTab7d.textContent = window.i18n.t('range_7d');
        const timeTab30d = document.querySelector('.time-tab[data-range="30d"]');
        if (timeTab30d) timeTab30d.textContent = window.i18n.t('range_30d');
    }

    // ----------------------------------------------------------
    // Navigation
    // ----------------------------------------------------------
    navigate(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
        }

        // Update nav active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenId);
        });

        this.currentScreen = screenId;
        
        // Position the sliding nav indicator pill
        const screenIndexes = {
            'dashboard': 0,
            'charts': 1,
            'alerts': 2,
            'settings': 3,
            'reports': 4
        };
        const navIdx = screenIndexes[screenId];
        const pill = document.getElementById('nav-indicator-pill');
        if (pill && typeof navIdx === 'number') {
            pill.style.transform = `translateX(${navIdx * 100}%)`;
        }

        // Trigger screen-specific renders
        switch (screenId) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'charts':
                // Small delay to ensure canvas is visible before Chart.js measures it
                setTimeout(() => {
                    window.ChartManager.renderLineChart(
                        'main-chart',
                        window.DataManager.currentRoomId,
                        window.ChartManager.activeRange
                    );
                    window.ChartManager.updateStats();
                }, 50);
                break;
            case 'alerts':
                window.AlertManager.renderAlertsList();
                break;
            case 'settings':
                window.SettingsManager.renderSettings();
                break;
            case 'reports':
                // Small delay for canvas visibility
                setTimeout(() => {
                    window.ReportManager.renderReports();
                }, 50);
                break;
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                if (screen) {
                    this.navigate(screen);
                }
            });
        });

        // Event listener for swappable metrics on preview cards
        const container = document.querySelector('.preview-cards-container');
        if (container) {
            container.addEventListener('click', (e) => {
                const card = e.target.closest('.preview-card');
                if (card) {
                    const type = card.getAttribute('data-type');
                    if (type) {
                        this.activeMetric = type;
                        this.renderDashboard();
                    }
                }
            });
        }
    }

    // ----------------------------------------------------------
    // Dashboard Rendering
    // ----------------------------------------------------------
    renderDashboard() {
        const data = window.DataManager.getCurrentData();
        if (!data) return;

        const thresholds = window.DataManager.getThresholds();

        // Update phone frame status glow classes
        const status = window.DataManager.getStatus(data);
        const frame = document.querySelector('.phone-frame');
        if (frame) {
            frame.classList.remove('status-good', 'status-warning', 'status-danger');
            frame.classList.add(`status-${status}`);
        }



        // Setup metric configurations
        const unitSetting = window.DataManager.getSettings().unit || 'C';
        const metricConfigs = {
            co2: {
                min: 0,
                max: 5000,
                color: data.co2 > thresholds.co2.max ? '#e74c3c' : '#2ecc71',
                glowColor: data.co2 > thresholds.co2.max ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)',
                label: window.i18n.t('metric_co2'),
                unit: 'ppm',
                type: 'co2',
                icon: '💨'
            },
            temp: {
                min: 0,
                max: 50,
                color: '#f39c12',
                glowColor: 'rgba(243, 156, 18, 0.3)',
                label: window.i18n.t('metric_temp'),
                unit: '°C',
                type: 'temp',
                icon: '🌡️'
            },
            humidity: {
                min: 0,
                max: 100,
                color: '#3498db',
                glowColor: 'rgba(52, 152, 219, 0.3)',
                label: window.i18n.t('metric_humidity'),
                unit: '%',
                type: 'humidity',
                icon: '💧'
            }
        };

        if (unitSetting === 'F') {
            metricConfigs.temp.min = 32;
            metricConfigs.temp.max = 122;
            metricConfigs.temp.unit = '°F';
        }

        const getDisplayValue = (type) => {
            const val = data[type];
            if (type === 'temp' && unitSetting === 'F') {
                return (val * 9 / 5) + 32;
            }
            return val;
        };

        // Render main gauge card
        const mainCard = document.getElementById('main-gauge-card');
        const mainIcon = document.getElementById('main-gauge-icon');
        const mainTitle = document.getElementById('main-gauge-title');
        
        if (mainCard) {
            mainCard.setAttribute('data-type', this.activeMetric);
            if (this.activeMetric === 'co2') {
                const isDanger = data.co2 > thresholds.co2.max;
                mainCard.classList.toggle('status-danger', isDanger);
                mainCard.classList.toggle('status-good', !isDanger);
            } else {
                mainCard.classList.remove('status-danger', 'status-good');
            }
        }
        if (mainIcon) mainIcon.textContent = metricConfigs[this.activeMetric].icon;
        if (mainTitle) mainTitle.textContent = metricConfigs[this.activeMetric].label;

        const mainConfig = metricConfigs[this.activeMetric];
        const mainVal = getDisplayValue(this.activeMetric);

        window.GaugeRenderer.updateGauge('main-gauge-svg-container', mainVal, {
            min: mainConfig.min,
            max: mainConfig.max,
            color: mainConfig.color,
            glowColor: mainConfig.glowColor,
            label: mainConfig.label,
            unit: mainConfig.unit,
            type: mainConfig.type
        });

        // Determine health advice description under the main gauge
        let descKey = '';
        if (this.activeMetric === 'co2') {
            descKey = data.co2 > thresholds.co2.max ? 'desc_co2_danger' : 'desc_co2_good';
        } else if (this.activeMetric === 'temp') {
            if (data.temp > thresholds.temp.max + 3 || data.temp < thresholds.temp.min - 3) {
                descKey = 'desc_temp_danger';
            } else if (data.temp > thresholds.temp.max || data.temp < thresholds.temp.min) {
                descKey = 'desc_temp_warning';
            } else {
                descKey = 'desc_temp_good';
            }
        } else if (this.activeMetric === 'humidity') {
            if (data.humidity > thresholds.humidity.max + 10 || data.humidity < thresholds.humidity.min - 10) {
                descKey = 'desc_humidity_danger';
            } else if (data.humidity > thresholds.humidity.max || data.humidity < thresholds.humidity.min) {
                descKey = 'desc_humidity_warning';
            } else {
                descKey = 'desc_humidity_good';
            }
        }

        const gaugeDescEl = document.getElementById('main-gauge-desc');
        if (gaugeDescEl) {
            gaugeDescEl.textContent = window.i18n.t(descKey);
        }

        // Render main gauge sparkline
        const history = window.DataManager.getHistory(window.DataManager.currentRoomId, '24h');
        const recentHistory = history.slice(-20);
        const activeHistory = this.activeMetric === 'temp' && unitSetting === 'F'
            ? recentHistory.map(d => (d.temp * 9 / 5) + 32)
            : recentHistory.map(d => d[this.activeMetric]);
        
        window.GaugeRenderer.renderSparkline('main-gauge-sparkline', activeHistory, mainConfig.color);

        // Render preview cards for the other two metrics
        const allMetrics = ['co2', 'temp', 'humidity'];
        const previewMetrics = allMetrics.filter(m => m !== this.activeMetric);

        const renderPreviewCard = (elId, type) => {
            const card = document.getElementById(elId);
            if (!card) return;

            const config = metricConfigs[type];
            const val = getDisplayValue(type);
            const valFormatted = type === 'temp' ? `${val.toFixed(1)}${config.unit}` : `${Math.round(val)} ${config.unit}`;

            card.setAttribute('data-type', type);
            if (type === 'co2') {
                const isDanger = data.co2 > thresholds.co2.max;
                card.classList.toggle('status-danger', isDanger);
                card.classList.toggle('status-good', !isDanger);
            } else {
                card.classList.remove('status-danger', 'status-good');
            }

            card.innerHTML = `
                <div class="preview-card-icon">${config.icon}</div>
                <div class="preview-card-info">
                    <span class="preview-card-label">${config.label}</span>
                    <span class="preview-card-value">${valFormatted}</span>
                </div>
            `;
        };

        renderPreviewCard('preview-card-left', previewMetrics[0]);
        renderPreviewCard('preview-card-right', previewMetrics[1]);

        // Update last-update time
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            const now = new Date();
            const locale = window.i18n.lang === 'vi' ? 'vi-VN' : window.i18n.lang === 'zh' ? 'zh-CN' : 'en-US';
            const timeStr = now.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdate.textContent = `${window.i18n.t('last_update')}: ${timeStr}`;
        }
    }

    // ----------------------------------------------------------
    // Realtime Updates
    // ----------------------------------------------------------
    startRealtimeUpdates() {
        const interval = window.DataManager.getSettings().updateInterval || 3000;

        this.updateTimer = setInterval(() => {
            // Generate new readings for all rooms
            window.DataManager.getRooms().forEach(room => {
                const reading = window.DataManager.generateReading(room.id);

                // Check thresholds for current room
                if (reading) {
                    window.AlertManager.checkAndAlert(reading, room.id, room.name);
                }
            });

            // Update phone frame status glow globally in background
            const currentReading = window.DataManager.getCurrentData();
            if (currentReading) {
                const globalStatus = window.DataManager.getStatus(currentReading);
                const globalFrame = document.querySelector('.phone-frame');
                if (globalFrame) {
                    globalFrame.classList.remove('status-good', 'status-warning', 'status-danger');
                    globalFrame.classList.add(`status-${globalStatus}`);
                }
            }

            // Update current screen
            if (this.currentScreen === 'dashboard') {
                this.renderDashboard();
            } else if (this.currentScreen === 'charts') {
                // Update chart with new data
                window.ChartManager.renderLineChart(
                    'main-chart',
                    window.DataManager.currentRoomId,
                    window.ChartManager.activeRange
                );
                window.ChartManager.updateStats();
            } else if (this.currentScreen === 'alerts') {
                window.AlertManager.renderAlertsList();
            }
        }, interval);
    }

    restartRealtimeUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.startRealtimeUpdates();
    }

    // ----------------------------------------------------------
    // Room Selector
    // ----------------------------------------------------------
    setupRoomSelector() {
        // Disabled in single vehicle mode
    }

    // ----------------------------------------------------------
    // Connection Status
    // ----------------------------------------------------------
    updateConnectionStatus(online = true) {
        const statusEl = document.getElementById('connection-status');
        if (!statusEl) return;

        if (online) {
            statusEl.classList.add('online');
            statusEl.classList.remove('offline');
            statusEl.querySelector('.status-text').textContent = 'Online';
        } else {
            statusEl.classList.remove('online');
            statusEl.classList.add('offline');
            statusEl.querySelector('.status-text').textContent = 'Offline';
        }
    }
}

// ----------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

window.App = App;
