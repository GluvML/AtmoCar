// ============================================================
// AlertManager - Threshold Alerts & Toast Notifications
// ============================================================

class AlertManager {
    constructor() {
        this._lastAlertTimes = new Map(); // debounce: "roomId-type" → timestamp
        this._toastContainer = null;
        this._debounceMs = 30000; // 30 seconds
        this._lastVoiceAlertTime = 0;
    }

    // ----------------------------------------------------------
    // Initialization
    // ----------------------------------------------------------
    init() {
        this._toastContainer = document.getElementById('toast-container');
        this.updateBadge();
    }

    // ----------------------------------------------------------
    // Check and Alert
    // ----------------------------------------------------------
    checkAndAlert(reading, roomId, roomName) {
        const violations = window.DataManager.checkThresholds(reading);

        violations.forEach(v => {
            const key = `${roomId}-${v.type}-${v.direction}`;
            const lastTime = this._lastAlertTimes.get(key) || 0;
            const now = Date.now();

            // Debounce: skip if same alert fired within 30s
            if (now - lastTime < this._debounceMs) return;

            this._lastAlertTimes.set(key, now);

            // Determine level
            const level = this._getAlertLevel(v);

            // Create alert object
            const alert = {
                id: `alert-${now}-${Math.random().toString(36).substr(2, 6)}`,
                type: v.type,
                value: v.value,
                threshold: v.threshold,
                direction: v.direction,
                roomId,
                roomName,
                timestamp: now,
                read: false,
                level
            };

            window.DataManager.addAlert(alert);

            // Show toast
            const message = this._buildAlertMessage(v, roomName);
            this.showToast(message, level);

            // Speak voice alert if enabled
            this.speakVoiceAlert(v.type, level);

            // Update badge
            this.updateBadge();
        });
    }

    speakVoiceAlert(violationType, level) {
        if (!window.speechSynthesis) return;

        // Check settings
        const settings = window.DataManager.getSettings();
        if (!settings.voiceAlerts) return;

        // Only speak for danger CO2
        if (violationType !== 'co2' || level !== 'danger') return;

        // Debounce speaking: 1 minute voice warning debounce
        const now = Date.now();
        if (now - this._lastVoiceAlertTime < 60000) return;
        this._lastVoiceAlertTime = now;

        try {
            const text = window.i18n.t('voice_alert_co2_danger');
            const utterance = new SpeechSynthesisUtterance(text);

            const langCode = window.i18n.lang === 'vi' ? 'vi-VN' : window.i18n.lang === 'zh' ? 'zh-CN' : 'en-US';
            utterance.lang = langCode;

            // Find matching voice
            const voices = window.speechSynthesis.getVoices();
            const matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(langCode.toLowerCase()));
            if (matchedVoice) {
                utterance.voice = matchedVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('SpeechSynthesis warning failed:', e);
        }
    }

    _getAlertLevel(violation) {
        const t = window.DataManager.getThresholds();
        if (violation.type === 'co2') {
            return violation.value > t.co2.max * 1.2 ? 'danger' : 'warning';
        }
        if (violation.type === 'temp') {
            return (violation.value > t.temp.max + 3 || violation.value < t.temp.min - 3) ? 'danger' : 'warning';
        }
        if (violation.type === 'humidity') {
            return (violation.value > t.humidity.max + 10 || violation.value < t.humidity.min - 10) ? 'danger' : 'warning';
        }
        return 'warning';
    }

    _buildAlertMessage(violation, roomName) {
        const typeName = window.i18n.t('metric_' + violation.type);
        const dirText = violation.direction === 'above' ? window.i18n.t('alert_direction_above') : window.i18n.t('alert_direction_below');
        
        // Format temp value and threshold if unit is F
        const unitSetting = window.DataManager.getSettings().unit || 'C';
        let val = violation.value;
        let thresh = violation.threshold;
        let unit = '';
        if (violation.type === 'co2') {
            unit = 'ppm';
        } else if (violation.type === 'humidity') {
            unit = '%';
        } else if (violation.type === 'temp') {
            unit = unitSetting === 'F' ? '°F' : '°C';
            if (unitSetting === 'F') {
                val = (val * 9 / 5) + 32;
                thresh = (thresh * 9 / 5) + 32;
            }
        }
        val = Math.round(val * 10) / 10;
        thresh = Math.round(thresh * 10) / 10;

        return window.i18n.t('alert_msg_format', {
            car: roomName,
            metric: typeName,
            direction: dirText,
            value: val,
            threshold: thresh,
            unit: unit
        });
    }

    // ----------------------------------------------------------
    // Toast Notifications
    // ----------------------------------------------------------
    showToast(message, level = 'warning', duration = 4000) {
        if (!this._toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${level}`;

        const icon = level === 'danger' ? '🚨' : '⚠️';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Đóng">✕</button>
        `;

        // Dismiss on click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this._removeToast(toast);
        });

        this._toastContainer.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-dismiss
        setTimeout(() => {
            this._removeToast(toast);
        }, duration);
    }

    _removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.remove('show');

        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }

    // ----------------------------------------------------------
    // Render Alerts List
    // ----------------------------------------------------------
    renderAlertsList() {
        const container = document.getElementById('alerts-list');
        if (!container) return;

        const alerts = window.DataManager.getAlerts();

        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <div class="empty-title">${window.i18n.t('alerts_empty_title')}</div>
                    <div class="empty-desc">${window.i18n.t('alerts_empty_desc')}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => {
            const typeIcons = { co2: '💨', temp: '🌡️', humidity: '💧' };
            const typeName = window.i18n.t('metric_' + alert.type);
            const dirText = alert.direction === 'above' ? window.i18n.t('alert_direction_above') : window.i18n.t('alert_direction_below');
            
            // Format temp value and threshold if unit is F
            const unitSetting = window.DataManager.getSettings().unit || 'C';
            let val = alert.value;
            let thresh = alert.threshold;
            let unit = '';
            if (alert.type === 'co2') {
                unit = 'ppm';
            } else if (alert.type === 'humidity') {
                unit = '%';
            } else if (alert.type === 'temp') {
                unit = unitSetting === 'F' ? '°F' : '°C';
                if (unitSetting === 'F') {
                    val = (val * 9 / 5) + 32;
                    thresh = (thresh * 9 / 5) + 32;
                }
            }
            val = Math.round(val * 10) / 10;
            thresh = Math.round(thresh * 10) / 10;

            const alertTitleText = window.i18n.t('alert_' + alert.type + '_' + alert.direction);
            const alertDescText = window.i18n.t('alert_msg_format', {
                car: alert.roomName,
                metric: typeName,
                direction: dirText,
                value: val,
                threshold: thresh,
                unit: unit
            });

            return `
                <div class="alert-item ${alert.read ? '' : 'unread'} ${alert.level}" data-alert-id="${alert.id}">
                    <div class="alert-icon-wrapper alert-icon-${alert.level}">
                        <span class="alert-icon">${typeIcons[alert.type] || '⚠️'}</span>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">
                            ${alertTitleText}
                            ${!alert.read ? '<span class="alert-unread-dot"></span>' : ''}
                        </div>
                        <div class="alert-desc">
                            ${alertDescText}
                        </div>
                        <div class="alert-time">${this.formatTimeAgo(alert.timestamp)}</div>
                    </div>
                    <button class="alert-dismiss" data-alert-id="${alert.id}" title="${window.i18n.t('btn_delete')}">✕</button>
                </div>
            `;
        }).join('');

        // Bind events
        container.querySelectorAll('.alert-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.alert-dismiss')) return;
                const id = el.dataset.alertId;
                window.DataManager.markAlertRead(id);
                el.classList.remove('unread');
                el.querySelector('.alert-unread-dot')?.remove();
                this.updateBadge();
            });
        });

        container.querySelectorAll('.alert-dismiss').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.alertId;
                window.DataManager.clearAlert(id);
                this.renderAlertsList();
                this.updateBadge();
            });
        });

        // Setup clear all button
        const clearAllBtn = document.getElementById('clear-all-alerts');
        if (clearAllBtn) {
            // Remove old listeners by cloning
            const newBtn = clearAllBtn.cloneNode(true);
            clearAllBtn.parentNode.replaceChild(newBtn, clearAllBtn);
            newBtn.addEventListener('click', () => {
                window.DataManager.clearAllAlerts();
                this.renderAlertsList();
                this.updateBadge();
            });
        }
    }

    // ----------------------------------------------------------
    // Badge
    // ----------------------------------------------------------
    updateBadge() {
        const badge = document.getElementById('alerts-badge');
        if (!badge) return;

        const count = window.DataManager.getUnreadAlertCount();
        if (count > 0) {
            badge.style.display = 'flex';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }

    // ----------------------------------------------------------
    // Vietnamese Relative Time
    // ----------------------------------------------------------
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 30) return window.i18n.t('time_just_now');
        if (seconds < 60) return window.i18n.t('time_seconds_ago', { n: seconds });
        if (minutes < 60) return window.i18n.t('time_minutes_ago', { n: minutes });
        if (hours < 24) return window.i18n.t('time_hours_ago', { n: hours });
        if (days < 7) return window.i18n.t('time_days_ago', { n: days });

        const date = new Date(timestamp);
        const locale = window.i18n.lang === 'vi' ? 'vi-VN' : window.i18n.lang === 'zh' ? 'zh-CN' : 'en-US';
        return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}

window.AlertManager = new AlertManager();
