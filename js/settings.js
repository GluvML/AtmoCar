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

        container.innerHTML = `
            <!-- Bluetooth Connection -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">📶</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_bluetooth')}</h3>
                </div>
                
                ${localStorage.getItem('co2app_bluetooth_connected') === 'true' 
                  ? `<!-- Connected Status Card -->
                     <div class="ble-connected-card">
                         <div class="ble-card-top">
                             <div class="ble-device-info-main">
                                 <span class="ble-device-icon-large">🚗</span>
                                 <div class="ble-device-text-main">
                                     <span class="ble-device-name-bold">${localStorage.getItem('co2app_bluetooth_device') || 'AtmoCar BLE'}</span>
                                     <span class="ble-device-status-connected">● Connected</span>
                                 </div>
                             </div>
                             <div class="ble-battery-info">
                                 <span class="battery-voltage">14.2V</span>
                                 <span class="battery-label">OBD Volts</span>
                             </div>
                         </div>
                         <div class="ble-card-details">
                             <div class="ble-detail-row">
                                 <span class="ble-detail-lbl">OBD-II Link</span>
                                 <span class="ble-detail-val val-green">OK</span>
                             </div>
                             <div class="ble-detail-row">
                                 <span class="ble-detail-lbl">Signal Strength</span>
                                 <span class="ble-detail-val">Excellent (-58 dBm)</span>
                             </div>
                         </div>
                         <div class="ble-card-actions">
                             <button class="btn btn-danger btn-sm" id="btn-bluetooth-action" style="width: 100%; border-radius: var(--radius-12);">${window.i18n.t('bluetooth_btn_disconnect')}</button>
                         </div>
                     </div>`
                  : `<!-- Disconnected Status Card -->
                     <div class="ble-disconnected-card">
                         <div class="ble-card-top">
                             <div class="ble-device-info-main">
                                 <span class="ble-device-icon-large" style="background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.3);">📶</span>
                                 <div class="ble-device-text-main">
                                     <span class="ble-device-name-bold" style="color: var(--color-text-secondary);">${window.i18n.lang === 'vi' ? 'Thiết bị cảm biến OBD' : window.i18n.lang === 'zh' ? '车内OBD传感器' : 'OBD Sensor'}</span>
                                     <span class="ble-device-status-disconnected">● ${window.i18n.t('bluetooth_status_disconnected')}</span>
                                 </div>
                             </div>
                         </div>
                         <div class="ble-card-details" style="border-bottom: none; padding-bottom: 0;">
                             <p class="ble-desc-text" style="font-size: 0.75rem; color: rgba(255,255,255,0.35); line-height: 1.4;">
                                 ${window.i18n.lang === 'vi' ? 'Kết nối không dây với thiết bị cảm biến OBD-II trên xe để nhận dữ liệu thời gian thực.' : window.i18n.lang === 'zh' ? '无线连接车载OBD-II传感器设备以接收实时监测数据。' : 'Wireless connection to the vehicle OBD-II sensor device to receive real-time telemetry data.'}
                             </p>
                         </div>
                         <div class="ble-card-actions" style="margin-top: var(--sp-12);">
                             <button class="btn btn-primary btn-sm" id="btn-bluetooth-action" style="width: 100%; background: linear-gradient(135deg, #00d2ff 0%, #00a8ff 100%); border: none; font-size: 0.85rem; border-radius: var(--radius-12); padding: var(--sp-10);">${window.i18n.t('bluetooth_btn_scan')}</button>
                         </div>
                     </div>`
                }
            </div>

            <!-- Threshold Settings -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">⚙️</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_thresholds')}</h3>
                </div>

                <!-- CO2 Thresholds -->
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-co2-min">💨</span>
                            <span>${window.i18n.t('settings_co2_min')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Mức CO₂ tối thiểu trong cabin' : window.i18n.lang === 'zh' ? '车内最低CO₂目标值' : 'Minimum target CO₂ level'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-co2-min"
                            min="200" max="800" step="50" value="${thresholds.co2.min}">
                        <span class="setting-value" id="value-co2-min">${thresholds.co2.min} ppm</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-co2-max">💨</span>
                            <span>${window.i18n.t('settings_co2_max')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Ngưỡng nguy hiểm cần thông gió' : window.i18n.lang === 'zh' ? 'CO₂危险警报阈值' : 'CO₂ danger threshold'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-co2-max"
                            min="200" max="5000" step="50" value="${thresholds.co2.max}">
                        <span class="setting-value" id="value-co2-max">${thresholds.co2.max} ppm</span>
                    </div>
                </div>

                <!-- Temp Thresholds -->
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-temp-min">🌡️</span>
                            <span>${window.i18n.t('settings_temp_min')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Giới hạn nhiệt độ lạnh tối thiểu' : window.i18n.lang === 'zh' ? '最低舒适温度限制' : 'Minimum temp threshold'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-temp-min"
                            min="0" max="25" step="1" value="${thresholds.temp.min}">
                        <span class="setting-value" id="value-temp-min">${thresholds.temp.min}°C</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-temp-max">🌡️</span>
                            <span>${window.i18n.t('settings_temp_max')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Giới hạn nhiệt độ nóng tối đa' : window.i18n.lang === 'zh' ? '最高舒适温度限制' : 'Maximum temp threshold'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-temp-max"
                            min="20" max="50" step="1" value="${thresholds.temp.max}">
                        <span class="setting-value" id="value-temp-max">${thresholds.temp.max}°C</span>
                    </div>
                </div>

                <!-- Humidity Thresholds -->
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-humidity-min">💧</span>
                            <span>${window.i18n.t('settings_humidity_min')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Mức độ ẩm thấp tối thiểu' : window.i18n.lang === 'zh' ? '最低湿度建议值' : 'Minimum humidity threshold'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-humidity-min"
                            min="0" max="60" step="5" value="${thresholds.humidity.min}">
                        <span class="setting-value" id="value-humidity-min">${thresholds.humidity.min}%</span>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-humidity-max">💧</span>
                            <span>${window.i18n.t('settings_humidity_max')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Mức độ ẩm cao tối đa' : window.i18n.lang === 'zh' ? '最高湿度限制值' : 'Maximum humidity threshold'}</span>
                    </div>
                    <div class="setting-control">
                        <input type="range" class="setting-slider" id="slider-humidity-max"
                            min="50" max="100" step="5" value="${thresholds.humidity.max}">
                        <span class="setting-value" id="value-humidity-max">${thresholds.humidity.max}%</span>
                    </div>
                </div>
            </div>#00a8ff 100%); border: none; padding: var(--sp-8) var(--sp-20); font-size: 0.85rem; border-radius: var(--radius-12);">${window.i18n.t('bluetooth_btn_scan')}</button>
                     </div>`
                }
            </div>

            <!-- General Settings -->
            <div class="settings-group">
                <div class="settings-group-header">
                    <span class="settings-group-icon">🔧</span>
                    <h3 class="settings-group-title">${window.i18n.t('settings_general')}</h3>
                </div>

                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-interval">⏱️</span>
                            <span>${window.i18n.t('settings_interval')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Tần suất đọc dữ liệu từ cảm biến' : window.i18n.lang === 'zh' ? '传感器数据读取周期' : 'Sensor reading update frequency'}</span>
                    </div>
                    <div class="setting-control">
                        <select class="setting-select" id="select-interval">
                            <option value="3000" ${settings.updateInterval === 3000 ? 'selected' : ''}>3s</option>
                            <option value="5000" ${settings.updateInterval === 5000 ? 'selected' : ''}>5s</option>
                            <option value="10000" ${settings.updateInterval === 10000 ? 'selected' : ''}>10s</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-unit">🌡️</span>
                            <span>${window.i18n.t('settings_unit')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Hệ thống đo lường nhiệt độ' : window.i18n.lang === 'zh' ? '温度测量单位系统' : 'Temperature measurement system'}</span>
                    </div>
                    <div class="setting-control">
                        <div class="toggle-group" id="unit-toggle">
                            <button class="toggle-btn ${settings.unit === 'C' ? 'active' : ''}" data-unit="C">°C</button>
                            <button class="toggle-btn ${settings.unit === 'F' ? 'active' : ''}" data-unit="F">°F</button>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-lang">🌐</span>
                            <span>${window.i18n.t('settings_lang')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Ngôn ngữ hiển thị của ứng dụng' : window.i18n.lang === 'zh' ? '应用程序的显示语言' : 'Application display language'}</span>
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
                    <div class="setting-info-block">
                        <div class="setting-label">
                            <span class="setting-icon-wrapper icon-alerts">🔊</span>
                            <span>${window.i18n.t('settings_voice_alerts')}</span>
                        </div>
                        <span class="setting-desc-text">${window.i18n.lang === 'vi' ? 'Báo động còi khi chỉ số vượt ngưỡng' : window.i18n.lang === 'zh' ? '指标超限时蜂鸣器报警' : 'Buzzer beep on threshold violation'}</span>
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
        this.setupBluetoothListeners();
        this.setupGeneralListeners();
    }

    // ----------------------------------------------------------
    // Slider Event Listeners
    // ----------------------------------------------------------
    updateSliderTrackFill(slider, color) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const percentage = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, rgba(255, 255, 255, 0.08) ${percentage}%, rgba(255, 255, 255, 0.08) 100%)`;
    }

    setupSliderListeners() {
        const sliderMap = {
            'slider-co2-min': { key: 'co2', prop: 'min', unit: ' ppm', valueId: 'value-co2-min', color: 'rgba(255, 255, 255, 0.35)' },
            'slider-co2-max': { key: 'co2', prop: 'max', unit: ' ppm', valueId: 'value-co2-max', color: 'rgba(255, 255, 255, 0.35)' },
            'slider-temp-min': { key: 'temp', prop: 'min', unit: '°C', valueId: 'value-temp-min', color: 'rgba(255, 255, 255, 0.35)' },
            'slider-temp-max': { key: 'temp', prop: 'max', unit: '°C', valueId: 'value-temp-max', color: 'rgba(255, 255, 255, 0.35)' },
            'slider-humidity-min': { key: 'humidity', prop: 'min', unit: '%', valueId: 'value-humidity-min', color: 'rgba(255, 255, 255, 0.35)' },
            'slider-humidity-max': { key: 'humidity', prop: 'max', unit: '%', valueId: 'value-humidity-max', color: 'rgba(255, 255, 255, 0.35)' }
        };

        Object.entries(sliderMap).forEach(([sliderId, config]) => {
            const slider = document.getElementById(sliderId);
            if (!slider) return;

            // Initial fill calculation
            this.updateSliderTrackFill(slider, config.color);

            slider.addEventListener('input', () => {
                const val = parseInt(slider.value);
                document.getElementById(config.valueId).textContent = `${val}${config.unit}`;

                const thresholds = window.DataManager.getThresholds();
                thresholds[config.key][config.prop] = val;
                window.DataManager.setThresholds(thresholds);

                // Update track progress fill dynamically
                this.updateSliderTrackFill(slider, config.color);
            });
        });
    }

    setupRoomListeners() {
        // Disabled in single vehicle mode
    }

    // ----------------------------------------------------------
    // Bluetooth Settings Listeners
    // ----------------------------------------------------------
    setupBluetoothListeners() {
        const btnAction = document.getElementById('btn-bluetooth-action');
        if (!btnAction) return;

        btnAction.addEventListener('click', () => {
            const isConnected = localStorage.getItem('co2app_bluetooth_connected') === 'true';
            if (isConnected) {
                // Disconnect flow
                localStorage.removeItem('co2app_bluetooth_connected');
                localStorage.removeItem('co2app_bluetooth_device');
                
                // Show toast
                if (window.AlertManager) {
                    window.AlertManager.showToast(
                        window.i18n.lang === 'vi' ? 'Đã ngắt kết nối Bluetooth' : window.i18n.lang === 'zh' ? '已断开蓝牙连接' : 'Bluetooth disconnected',
                        'warning'
                    );
                }
                
                // Refresh settings UI
                this.renderSettings();
                
                // Update connection status
                if (window.App && window.App._instance) {
                    window.App._instance.updateConnectionStatus(false);
                }
            } else {
                // Connect flow - Open BLE scan modal
                this.openBleScanModal();
            }
        });
    }

    openBleScanModal() {
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        const closeBtn = document.getElementById('modal-close');

        if (!overlay || !title || !body || !footer) return;

        title.textContent = window.i18n.t('bluetooth_modal_title');
        
        // Show radar scanner first
        body.innerHTML = `
            <div class="ble-scanner-container">
                <div class="ble-radar-circle">
                    <div class="ble-radar-icon">📶</div>
                </div>
                <div class="ble-status-text" id="ble-status-text">${window.i18n.t('bluetooth_scanning')}</div>
                <div class="ble-device-list" id="ble-device-list" style="display: none;">
                    <!-- Devices will be populated after scanning -->
                </div>
            </div>
        `;
        
        footer.innerHTML = `
            <button class="btn btn-cancel" id="btn-modal-cancel" style="width: 100%;">${window.i18n.t('btn_cancel')}</button>
        `;

        // Show modal
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Set up close actions
        const closeAction = () => {
            this.closeModal();
            if (this._scanTimeout) clearTimeout(this._scanTimeout);
        };
        
        closeBtn.onclick = closeAction;
        const cancelBtn = document.getElementById('btn-modal-cancel');
        if (cancelBtn) cancelBtn.onclick = closeAction;

        // Mock Scanning simulation
        this._scanTimeout = setTimeout(() => {
            const statusText = document.getElementById('ble-status-text');
            const deviceList = document.getElementById('ble-device-list');
            if (statusText && deviceList) {
                statusText.style.display = 'none';
                deviceList.style.display = 'flex';
                
                // List of mocked devices
                const mockDevices = [
                    { name: 'AtmoCar OBD-II BLE', id: 'AC:8B:E3:4F:91:02', rssi: 4 },
                    { name: 'CarPlay-BT-9F8A', id: '7E:24:99:A0:87:6C', rssi: 3 },
                    { name: 'AtmoCar Sensor V2', id: 'D0:C5:F3:11:8B:74', rssi: 2 },
                    { name: 'SmartBuzzer-Air', id: '40:9B:CD:72:0F:D5', rssi: 1 }
                ];
                
                deviceList.innerHTML = mockDevices.map(dev => `
                    <div class="ble-device-item" data-name="${dev.name}" data-id="${dev.id}">
                        <div class="ble-device-info">
                            <div class="ble-device-avatar">🚗</div>
                            <div class="ble-device-name-container">
                                <span class="ble-device-name">${dev.name}</span>
                                <span class="ble-device-id">${dev.id}</span>
                            </div>
                        </div>
                        <div class="ble-device-rssi">
                            <span class="ble-rssi-bar active"></span>
                            <span class="ble-rssi-bar ${dev.rssi >= 2 ? 'active' : ''}"></span>
                            <span class="ble-rssi-bar ${dev.rssi >= 3 ? 'active' : ''}"></span>
                            <span class="ble-rssi-bar ${dev.rssi >= 4 ? 'active' : ''}"></span>
                        </div>
                    </div>
                `).join('');
                
                // Set up click on devices
                deviceList.querySelectorAll('.ble-device-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const name = item.dataset.name;
                        const id = item.dataset.id;
                        this.connectToDevice(name, id);
                    });
                });
            }
        }, 2000); // scan for 2 seconds
    }

    connectToDevice(name, id) {
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        if (!body) return;

        // Clear scanning timeout
        if (this._scanTimeout) clearTimeout(this._scanTimeout);

        // Show connecting spinner state
        body.innerHTML = `
            <div class="ble-scanner-container">
                <div class="ble-spinner" style="width: 48px; height: 48px; margin-bottom: var(--sp-12);"></div>
                <div class="ble-status-text">${window.i18n.t('bluetooth_connecting')}</div>
                <div style="font-size: 0.85rem; font-weight: 600; margin-top: var(--sp-4); text-align: center;">${name}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-secondary); font-family: var(--font-mono); text-align: center;">${id}</div>
            </div>
        `;
        if (footer) footer.innerHTML = ''; // hide cancel button during connection

        // Connection timeout simulation (1.5 seconds)
        setTimeout(() => {
            localStorage.setItem('co2app_bluetooth_connected', 'true');
            localStorage.setItem('co2app_bluetooth_device', name);
            
            // Show toast success
            if (window.AlertManager) {
                window.AlertManager.showToast(window.i18n.t('bluetooth_connect_success'), 'success');
            }
            
            // Close modal
            this.closeModal();
            
            // Re-render settings
            this.renderSettings();
            
            // Update connection status
            if (window.App && window.App._instance) {
                window.App._instance.updateConnectionStatus(true);
            }
        }, 1500);
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
