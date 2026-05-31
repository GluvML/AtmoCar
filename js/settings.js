// ============================================================
// SettingsManager - Settings UI & Room Management
// ============================================================

class SettingsManager {
    constructor() {
        this._bound = false;
    }

    // ----------------------------------------------------------
    // Render Settings Screen
    // ----------------------------------------------------------
    renderSettings() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const thresholds = window.DataManager.getThresholds();
        const settings = window.DataManager.getSettings();
        const rooms = window.DataManager.getRooms();

        container.innerHTML = `
            <!-- Threshold Settings -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">⚙️</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_thresholds')}</h3>
                </div>

                <!-- CO2 Thresholds -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">💨</span>
                        <span>${window.i18n.t('settings_co2_min')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-co2-min"
                            min="200" max="800" step="50" value="${thresholds.co2.min}">
                        <span class="setting-value" id="value-co2-min">${thresholds.co2.min} ppm</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">💨</span>
                        <span>${window.i18n.t('settings_co2_max')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-co2-max"
                            min="200" max="5000" step="50" value="${thresholds.co2.max}">
                        <span class="setting-value" id="value-co2-max">${thresholds.co2.max} ppm</span>
                    </div>
                </div>

                <!-- Temp Thresholds -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">🌡️</span>
                        <span>${window.i18n.t('settings_temp_min')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-temp-min"
                            min="0" max="25" step="1" value="${thresholds.temp.min}">
                        <span class="setting-value" id="value-temp-min">${thresholds.temp.min}°C</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">🌡️</span>
                        <span>${window.i18n.t('settings_temp_max')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-temp-max"
                            min="20" max="50" step="1" value="${thresholds.temp.max}">
                        <span class="setting-value" id="value-temp-max">${thresholds.temp.max}°C</span>
                    </div>
                </div>

                <!-- Humidity Thresholds -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">💧</span>
                        <span>${window.i18n.t('settings_humidity_min')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-humidity-min"
                            min="0" max="60" step="5" value="${thresholds.humidity.min}">
                        <span class="setting-value" id="value-humidity-min">${thresholds.humidity.min}%</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">💧</span>
                        <span>${window.i18n.t('settings_humidity_max')}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-humidity-max"
                            min="50" max="100" step="5" value="${thresholds.humidity.max}">
                        <span class="setting-value" id="value-humidity-max">${thresholds.humidity.max}%</span>
                    </div>
                </div>
            </div>



            <!-- General Settings -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">🔧</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_general')}</h3>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">⏱️</span>
                        <span>${window.i18n.t('settings_interval')}</span>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" id="select-interval">
                            <option value="3000" ${settings.updateInterval === 3000 ? 'selected' : ''}>3 ${window.i18n.lang === 'vi' ? 'giây' : window.i18n.lang === 'zh' ? '秒' : 'seconds'}</option>
                            <option value="5000" ${settings.updateInterval === 5000 ? 'selected' : ''}>5 ${window.i18n.lang === 'vi' ? 'giây' : window.i18n.lang === 'zh' ? '秒' : 'seconds'}</option>
                            <option value="10000" ${settings.updateInterval === 10000 ? 'selected' : ''}>10 ${window.i18n.lang === 'vi' ? 'giây' : window.i18n.lang === 'zh' ? '秒' : 'seconds'}</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">🌡️</span>
                        <span>${window.i18n.t('settings_unit')}</span>
                    </div>
                    <div class="setting-control">
                        <div class="toggle-group" id="unit-toggle">
                            <button class="toggle-btn ${settings.unit === 'C' ? 'active' : ''}" data-unit="C">°C</button>
                            <button class="toggle-btn ${settings.unit === 'F' ? 'active' : ''}" data-unit="F">°F</button>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">🌐</span>
                        <span>${window.i18n.t('settings_lang')}</span>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" id="select-lang">
                            <option value="vi" ${window.i18n.lang === 'vi' ? 'selected' : ''}>${window.i18n.t('settings_lang_vi')}</option>
                            <option value="en" ${window.i18n.lang === 'en' ? 'selected' : ''}>${window.i18n.t('settings_lang_en')}</option>
                            <option value="zh" ${window.i18n.lang === 'zh' ? 'selected' : ''}>${window.i18n.t('settings_lang_zh')}</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-label">
                        <span class="setting-icon">🔊</span>
                        <span>${window.i18n.t('settings_voice_alerts')}</span>
                    </div>
                    <div class="setting-control">
                        <div class="toggle-switch ${settings.voiceAlerts ? 'active' : ''}" id="toggle-voice-alerts"></div>
                    </div>
                </div>
            </div>

            <!-- About Section -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">ℹ️</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_about')}</h3>
                </div>
                <div class="about-info">
                    <div class="about-row">
                        <span class="about-label">${window.i18n.t('settings_app')}</span>
                        <span class="about-value">AtmoCar Monitor</span>
                    </div>
                    <div class="about-row">
                        <span class="about-label">${window.i18n.t('settings_version')}</span>
                        <span class="about-value">1.0.0</span>
                    </div>
                    <div class="about-row">
                        <span class="about-label">${window.i18n.t('settings_desc')}</span>
                        <span class="about-value">${window.i18n.t('settings_desc_val')}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupSliderListeners();
        this.setupGeneralListeners();
    }

    // ----------------------------------------------------------
    // Slider Event Listeners
    // ----------------------------------------------------------
    setupSliderListeners() {
        const sliderMap = {
            'slider-co2-min': { key: 'co2', prop: 'min', unit: ' ppm', valueId: 'value-co2-min' },
            'slider-co2-max': { key: 'co2', prop: 'max', unit: ' ppm', valueId: 'value-co2-max' },
            'slider-temp-min': { key: 'temp', prop: 'min', unit: '°C', valueId: 'value-temp-min' },
            'slider-temp-max': { key: 'temp', prop: 'max', unit: '°C', valueId: 'value-temp-max' },
            'slider-humidity-min': { key: 'humidity', prop: 'min', unit: '%', valueId: 'value-humidity-min' },
            'slider-humidity-max': { key: 'humidity', prop: 'max', unit: '%', valueId: 'value-humidity-max' }
        };

        Object.entries(sliderMap).forEach(([sliderId, config]) => {
            const slider = document.getElementById(sliderId);
            if (!slider) return;

            slider.addEventListener('input', () => {
                const val = parseInt(slider.value);
                document.getElementById(config.valueId).textContent = `${val}${config.unit}`;

                const thresholds = window.DataManager.getThresholds();
                thresholds[config.key][config.prop] = val;
                window.DataManager.setThresholds(thresholds);
            });
        });
    }

    setupRoomListeners() {
        // Disabled in single vehicle mode
    }

    // ----------------------------------------------------------
    // General Settings Listeners
    // ----------------------------------------------------------
    setupGeneralListeners() {
        // Update interval
        const intervalSelect = document.getElementById('select-interval');
        if (intervalSelect) {
            intervalSelect.addEventListener('change', () => {
                const interval = parseInt(intervalSelect.value);
                window.DataManager.saveSettings({ updateInterval: interval });
                // Notify app to restart interval
                if (window.App && window.App._instance) {
                    window.App._instance.restartRealtimeUpdates();
                }
            });
        }

        // Unit toggle
        const unitToggle = document.getElementById('unit-toggle');
        if (unitToggle) {
            unitToggle.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    unitToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    window.DataManager.saveSettings({ unit: btn.dataset.unit });
                    // Refresh dashboard to apply unit immediately
                    if (window.App && window.App._instance && window.App._instance.currentScreen === 'dashboard') {
                        window.App._instance.renderDashboard();
                    }
                });
            });
        }

        // Language Selector listener
        const langSelect = document.getElementById('select-lang');
        if (langSelect) {
            langSelect.addEventListener('change', () => {
                const lang = langSelect.value;
                window.i18n.setLanguage(lang);
                // Call App to update language across the entire application
                if (window.App && window.App._instance) {
                    window.App._instance.updateLanguage();
                }
            });
        }

        // Voice alerts toggle switch
        const voiceToggle = document.getElementById('toggle-voice-alerts');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                const isActive = voiceToggle.classList.toggle('active');
                window.DataManager.saveSettings({ voiceAlerts: isActive });
            });
        }
    }

    // ----------------------------------------------------------
    // Modals
    // ----------------------------------------------------------


    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

window.SettingsManager = new SettingsManager();
