console.info(
  `%c DART-CARD-PRO %c v1.0.0 `,
  'color: white; background: #d91604; font-weight: bold;',
  'color: #d91604; background: white; font-weight: bold;'
);

class DartCardProEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (this._rendered) {
      this._updateFormValues();
    } else {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._hass && this._config && !this._rendered) {
      this._render();
    }
  }

  _hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const inputNumbers = Object.keys(this._hass.states)
      .filter((eid) => eid.startsWith('input_number.'))
      .sort();

    const currentEntity = this._config.entity || '';
    const currentName = this._config.name || '';
    const currentText = this._config.text || '';
    const currentTheme = this._config.theme || 'auto';
    const callerFolder = this._config.caller_folder || 'caller';

    const btnColor = this._config.btn_color || '#aa1414';
    const btnTextColor = this._config.btn_text_color || '#ffffff';
    const iconBtnColor = this._config.icon_btn_color || '#ffffff';
    const iconBtnTextColor = this._config.icon_btn_text_color || '#aa1414)';
    const gridColor = this._config.grid_color || '#328232';
    const gridTextColor = this._config.grid_text_color || '#ffffff';
    const bgColor = this._config.bg_color || '#ffffff';

    const showGrid = this._config.show_grid !== false;
    const showAvg = this._config.show_avg !== false;
    const enableSound = this._config.enable_sound !== false;

    this.innerHTML = `
      <style>
        .card-editor { padding: 8px 0; }
        .form-group { margin-bottom: 14px; display: flex; flex-direction: column; }
        .form-group-checkbox { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .color-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .color-row { display: flex; align-items: center; gap: 10px; }
        label { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
        .form-group label { margin-bottom: 6px; }
        input[type="text"], select {
          padding: 8px 10px; font-size: 14px;
          background: var(--card-background-color, #ffffffff);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color, #ccccccff);
          border-radius: 4px; outline: none;
        }
        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        input[type="color"] {
          border: 1px solid var(--divider-color, #ccccccff);
          width: 44px; height: 36px; border-radius: 6px;
          cursor: pointer; background: transparent; padding: 2px;
        }
        input[type="range"] { flex: 1; }
        .rgba-val { font-family: monospace; font-size: 12px; color: var(--secondary-text-color); }
      </style>
      <div class="card-editor">
        <div class="form-group">
          <label for="entity-select">Entität (input_number):</label>
          <select id="entity-select">
            <option value="">-- Entität wählen --</option>
            ${inputNumbers.map((eid) => `<option value="${eid}" ${currentEntity === eid ? 'selected' : ''}>${eid}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="theme-select">Kartendesign / Theme:</label>
          <select id="theme-select">
            <option value="auto" ${currentTheme === 'auto' ? 'selected' : ''}>HA System-Theme (Automatisch)</option>
            <option value="classic" ${currentTheme === 'classic' ? 'selected' : ''}>Classic Dart (Schwarz/Grün/Rot)</option>
            <option value="neon" ${currentTheme === 'neon' ? 'selected' : ''}>Neon Cyberpunk</option>
            <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Deep Dark Mode</option>
            <option value="minimal" ${currentTheme === 'minimal' ? 'selected' : ''}>Minimalist Light</option>
            <option value="custom" ${currentTheme === 'custom' ? 'selected' : ''}>Benutzerdefiniert (RGBA Colors)</option>
          </select>
        </div>

        <div id="custom-color-settings" style="display: ${currentTheme === 'custom' ? 'block' : 'none'};">
          <div class="color-group">
            <label>Keypad Buttons (Hintergrund):</label>
            <div class="color-row">
              <input type="color" id="btn-color-picker" value="#aa1414ff">
              <label>Deckkraft:</label>
              <input type="range" id="btn-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="btn-rgba-display">${btnColor}</span>
          </div>

          <div class="color-group">
            <label>Keypad Buttons (Schriftfarbe):</label>
            <div class="color-row">
              <input type="color" id="btn-text-picker" value="#ffffffff">
              <label>Deckkraft:</label>
              <input type="range" id="btn-text-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="btn-text-rgba-display">${btnTextColor}</span>
          </div>

          <div class="color-group">
            <label>Top Buttons - Reset & Undo (Hintergrund):</label>
            <div class="color-row">
              <input type="color" id="icon-btn-color-picker" value="#ffffff26">
              <label>Deckkraft:</label>
              <input type="range" id="icon-btn-alpha" min="0" max="1" step="0.05" value="0.15">
            </div>
            <span class="rgba-val" id="icon-btn-rgba-display">${iconBtnColor}</span>
          </div>

          <div class="color-group">
            <label>Top Buttons - Reset & Undo (Icon-Farbe):</label>
            <div class="color-row">
              <input type="color" id="icon-btn-text-picker" value="#aa1414ff">
              <label>Deckkraft:</label>
              <input type="range" id="icon-btn-text-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="icon-btn-text-rgba-display">${iconBtnTextColor}</span>
          </div>

          <div class="color-group">
            <label>Fast-Score Grid (Hintergrund):</label>
            <div class="color-row">
              <input type="color" id="grid-color-picker" value="#328232ff">
              <label>Deckkraft:</label>
              <input type="range" id="grid-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="grid-rgba-display">${gridColor}</span>
          </div>

          <div class="color-group">
            <label>Fast-Score Grid (Schriftfarbe):</label>
            <div class="color-row">
              <input type="color" id="grid-text-picker" value="#ffffffff">
              <label>Deckkraft:</label>
              <input type="range" id="grid-text-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="grid-text-rgba-display">${gridTextColor}</span>
          </div>

          <div class="color-group">
            <label>Karten-Hintergrund:</label>
            <div class="color-row">
              <input type="color" id="bg-color-picker" value="#ffffff80">
              <label>Deckkraft:</label>
              <input type="range" id="bg-alpha" min="0" max="1" step="0.05" value="1">
            </div>
            <span class="rgba-val" id="bg-rgba-display">${bgColor}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="input-name">Kartentitel (z.B. Spielername):</label>
          <input type="text" id="input-name" value="${currentName}" placeholder="Restscore">
        </div>

        <div class="form-group">
          <label for="input-text">Zusatztext:</label>
          <input type="text" id="input-text" value="${currentText}" placeholder="Punkte eingeben:">
        </div>

        <div class="form-group-checkbox">
          <input type="checkbox" id="show-avg-check" ${showAvg ? 'checked' : ''}>
          <label for="show-avg-check">Average & Statistik anzeigen</label>
        </div>

        <div class="form-group-checkbox">
          <input type="checkbox" id="show-grid-check" ${showGrid ? 'checked' : ''}>
          <label for="show-grid-check">Fast-Score Grid anzeigen (26, 41, 60, ...)</label>
        </div>

        <div class="form-group-checkbox">
          <input type="checkbox" id="enable-sound-check" ${enableSound ? 'checked' : ''}>
          <label for="enable-sound-check">Sound / Caller aktivieren (Browser)</label>
        </div>

        <div id="sound-settings-group" style="display: ${enableSound ? 'block' : 'none'};">
          <div class="form-group">
            <label for="caller-folder-input">Caller Sound-Ordner (in /local/):</label>
            <input type="text" id="caller-folder-input" value="${callerFolder}" placeholder="caller">
          </div>
        </div>
      </div>
    `;

    this._setupColorListeners();

    const selectElem = this.querySelector('#entity-select');
    const themeElem = this.querySelector('#theme-select');
    const nameElem = this.querySelector('#input-name');
    const textElem = this.querySelector('#input-text');
    const avgCheckElem = this.querySelector('#show-avg-check');
    const gridCheckElem = this.querySelector('#show-grid-check');
    const soundCheckElem = this.querySelector('#enable-sound-check');
    const folderInputElem = this.querySelector('#caller-folder-input');

    if (selectElem) selectElem.addEventListener('change', (e) => this._valueChanged('entity', e.target.value));
    
    if (themeElem) {
      themeElem.addEventListener('change', (e) => {
        const val = e.target.value;
        const customDiv = this.querySelector('#custom-color-settings');
        if (customDiv) customDiv.style.display = val === 'custom' ? 'block' : 'none';
        this._valueChanged('theme', val);
      });
    }

    if (nameElem) nameElem.addEventListener('input', (e) => this._valueChanged('name', e.target.value));
    if (textElem) textElem.addEventListener('input', (e) => this._valueChanged('text', e.target.value));
    if (avgCheckElem) avgCheckElem.addEventListener('change', (e) => this._valueChanged('show_avg', e.target.checked));
    if (gridCheckElem) gridCheckElem.addEventListener('change', (e) => this._valueChanged('show_grid', e.target.checked));
    
    if (soundCheckElem) {
      soundCheckElem.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const soundGrp = this.querySelector('#sound-settings-group');
        if (soundGrp) soundGrp.style.display = checked ? 'block' : 'none';
        this._valueChanged('enable_sound', checked);
      });
    }

    if (folderInputElem) folderInputElem.addEventListener('input', (e) => this._valueChanged('caller_folder', e.target.value));

    this._rendered = true;
  }

  _setupColorListeners() {
    const updateRgba = (colorId, alphaId, displayId, configKey) => {
      const colorInput = this.querySelector(colorId);
      const alphaInput = this.querySelector(alphaId);
      const displayElem = this.querySelector(displayId);

      const handler = () => {
        const rgba = this._hexToRgba(colorInput.value, alphaInput.value);
        if (displayElem) displayElem.textContent = rgba;
        this._valueChanged(configKey, rgba);
      };

      if (colorInput) colorInput.addEventListener('input', handler);
      if (alphaInput) alphaInput.addEventListener('input', handler);
    };

    updateRgba('#btn-color-picker', '#btn-alpha', '#btn-rgba-display', 'btn_color');
    updateRgba('#btn-text-picker', '#btn-text-alpha', '#btn-text-rgba-display', 'btn_text_color');
    updateRgba('#icon-btn-color-picker', '#icon-btn-alpha', '#icon-btn-rgba-display', 'icon_btn_color');
    updateRgba('#icon-btn-text-picker', '#icon-btn-text-alpha', '#icon-btn-text-rgba-display', 'icon_btn_text_color');
    updateRgba('#grid-color-picker', '#grid-alpha', '#grid-rgba-display', 'grid_color');
    updateRgba('#grid-text-picker', '#grid-text-alpha', '#grid-text-rgba-display', 'grid_text_color');
    updateRgba('#bg-color-picker', '#bg-alpha', '#bg-rgba-display', 'bg_color');
  }

  _updateFormValues() {
    if (!this._config) return;
    const selectElem = this.querySelector('#entity-select');
    const themeElem = this.querySelector('#theme-select');
    const nameElem = this.querySelector('#input-name');
    const textElem = this.querySelector('#input-text');
    const folderInputElem = this.querySelector('#caller-folder-input');

    if (selectElem && this._config.entity !== undefined) selectElem.value = this._config.entity;
    if (themeElem && this._config.theme !== undefined) themeElem.value = this._config.theme || 'auto';
    if (nameElem && document.activeElement !== nameElem) nameElem.value = this._config.name || '';
    if (textElem && document.activeElement !== textElem) textElem.value = this._config.text || '';
    if (folderInputElem && document.activeElement !== folderInputElem) folderInputElem.value = this._config.caller_folder || 'caller';
  }

  _valueChanged(key, value) {
    if (!this._config || this._config[key] === value) return;
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

customElements.define('dart-card-pro-editor', DartCardProEditor);


class DartCardPro extends HTMLElement {

  constructor() {
    super();
    this._history = [];
    this._audioCache = {};
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      this._audioCtx = new AudioCtx();
    }
  }

  static getConfigElement() {
    return document.createElement('dart-card-pro-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      theme: 'auto',
      btn_color: '#aa1414',
      btn_text_color: '#ffffff',
      icon_btn_color: '#ffffff',
      icon_btn_text_color: '#aa1414)',
      grid_color: '#328232',
      grid_text_color: '#ffffff',
      bg_color: '#ffffff',
      name: 'Spieler 1',
      text: 'Punkte eingeben:',
      show_grid: true,
      show_avg: true,
      enable_sound: true,
      caller_folder: 'caller'
    };
  }

  setConfig(config) {
    this.config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config ? this.config.entity : null;
    const state = entityId ? hass.states[entityId] : null;
    this._currentScore = state ? parseInt(state.state, 10) : 501;

    if (!this._rendered) {
      this._render();
    } else {
      this._updateDisplay();
    }
  }

  async _loadAudioBuffer(url) {
    if (this._audioCache[url]) return this._audioCache[url];
    if (!this._audioCtx) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._audioCtx.decodeAudioData(arrayBuffer);
      this._audioCache[url] = audioBuffer;
      return audioBuffer;
    } catch (err) {
      return null;
    }
  }

  _playCallerSound(score) {
    if (this.config && this.config.enable_sound === false) return;

    const folder = (this.config && this.config.caller_folder) ? this.config.caller_folder : 'caller';
    const soundPath = `/local/${folder}/${score}.mp3`;

    // Direct Web Audio API im Browser (0 ms Latenz)
    if (this._audioCtx) {
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }

      this._loadAudioBuffer(soundPath).then((buffer) => {
        if (!buffer) return;
        const source = this._audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this._audioCtx.destination);
        source.start(0);
      });
    } else {
      const audio = new Audio(soundPath);
      audio.play().catch(() => {});
    }
  }

  _calculateAverage() {
    if (this._history.length === 0) return "0.0";
    const totalPoints = this._history.reduce((a, b) => a + b, 0);
    return (totalPoints / this._history.length).toFixed(1);
  }

  _resetGame() {
    const entityId = this.config ? this.config.entity : null;
    if (!entityId) return;

    if (confirm("Möchtest du das Spiel wirklich zurücksetzen? (Restscore 501 & Average löschen)")) {
      this._history = [];
      this._previousScore = null;
      this._typedInput = '';

      this._hass.callService('input_number', 'set_value', {
        entity_id: entityId,
        value: 501,
      });

      this._updateDisplay();
    }
  }

  _undoLastThrow() {
    const entityId = this.config ? this.config.entity : null;
    if (!entityId) return;

    if (this._previousScore !== undefined && this._previousScore !== null) {
      this._hass.callService('input_number', 'set_value', {
        entity_id: entityId,
        value: this._previousScore,
      });
      this._previousScore = null;
      this._history.pop();
      this._typedInput = '';
      this._updateDisplay();
    }
  }

  _render() {
    if (this._typedInput === undefined) this._typedInput = '';

    const scoreLabel = (this.config && this.config.name) ? this.config.name : "Restscore";
    const infoText = (this.config && this.config.text) ? this.config.text : "Punkte eingeben:";
    const entityId = this.config ? this.config.entity : null;
    const theme = (this.config && this.config.theme) ? this.config.theme : 'auto';
    
    const customBtn = (this.config && this.config.btn_color) ? this.config.btn_color : '#aa1414ff';
    const customBtnText = (this.config && this.config.btn_text_color) ? this.config.btn_text_color : '#ffffffff';
    const customIconBtn = (this.config && this.config.icon_btn_color) ? this.config.icon_btn_color : '#ffffff26';
    const customIconBtnText = (this.config && this.config.icon_btn_text_color) ? this.config.icon_btn_text_color : '#ffffffff';
    const customGrid = (this.config && this.config.grid_color) ? this.config.grid_color : '#328232ff';
    const customGridText = (this.config && this.config.grid_text_color) ? this.config.grid_text_color : '#aa1414ff';
    const customBg = (this.config && this.config.bg_color) ? this.config.bg_color : '#ffffff80';

    const showGrid = this.config ? this.config.show_grid !== false : true;
    const showAvg = this.config ? this.config.show_avg !== false : true;

    const fastScores = [26, 41, 45, 57, 60, 80, 100, 120, 140, 180];

    this.innerHTML = `
      <style>
        :host {
          --dart-card-bg: var(--ha-card-background, var(--card-background-color, #ffffffff));
          --dart-card-text: var(--primary-text-color, #ffffff);
          --dart-subtext: var(--secondary-text-color, #8e8e93);
          --dart-accent-red: #aa1414ff;
          --dart-accent-green: #328232ff;
          --dart-accent-orange: #e67e22;
          --dart-btn-bg: var(--card-background-color, #ffffff14);
          --dart-btn-text: var(--primary-text-color, #ffffff);
          --dart-icon-btn-bg: #ffffff1f;
          --dart-icon-btn-text: #aa1414ff;
          --dart-fast-btn-bg: var(--primary-color, #328232ff);
          --dart-fast-btn-text: #ffffff;
        }

        .theme-classic {
          --dart-card-bg: #1e242b;
          --dart-card-text: #ffffff;
          --dart-subtext: #94a3b8;
          --dart-accent-red: #f87171;
          --dart-accent-green: #4ade80;
          --dart-accent-orange: #fb923c;
          --dart-btn-bg: #2d3748;
          --dart-btn-text: #ffffff;
          --dart-icon-btn-bg: #ffffff1f;
          --dart-icon-btn-text: #ffffff;
          --dart-fast-btn-bg: #15803d;
          --dart-fast-btn-text: #ffffff;
        }

        .theme-neon {
          --dart-card-bg: #0d0f183d;
          --dart-card-text: #00f0ff;
          --dart-subtext: #ff007f;
          --dart-accent-red: #ff0055;
          --dart-accent-green: #00ff66;
          --dart-accent-orange: #ffb700;
          --dart-btn-bg: #181b2a;
          --dart-btn-text: #00f0ff;
          --dart-icon-btn-bg: #00f0ff26;
          --dart-icon-btn-text: #00f0ff;
          --dart-fast-btn-bg: #7928ca;
          --dart-fast-btn-text: #ffffff;
        }

        .theme-dark {
          --dart-card-bg: #0a0a0c;
          --dart-card-text: #f3f4f6;
          --dart-subtext: #6b7280;
          --dart-accent-red: #ef4444;
          --dart-accent-green: #10b981;
          --dart-accent-orange: #f59e0b;
          --dart-btn-bg: #1f2937;
          --dart-btn-text: #f3f4f6;
          --dart-icon-btn-bg: #ffffff1a;
          --dart-icon-btn-text: #f3f4f6;
          --dart-fast-btn-bg: #3b82f6;
          --dart-fast-btn-text: #ffffff;
        }

        .theme-minimal {
          --dart-card-bg: #f8fafc;
          --dart-card-text: #0f172a;
          --dart-subtext: #64748b;
          --dart-accent-red: #dc2626;
          --dart-accent-green: #16a34a;
          --dart-accent-orange: #ea580c;
          --dart-btn-bg: #ffffff;
          --dart-btn-text: #0f172a;
          --dart-icon-btn-bg: #0f172a14;
          --dart-icon-btn-text: #0f172a;
          --dart-fast-btn-bg: #2563eb;
          --dart-fast-btn-text: #ffffff;
        }

        .theme-custom {
          --dart-btn-bg: ${customBtn};
          --dart-btn-text: ${customBtnText};
          --dart-icon-btn-bg: ${customIconBtn};
          --dart-icon-btn-text: ${customIconBtnText};
          --dart-fast-btn-bg: ${customGrid};
          --dart-fast-btn-text: ${customGridText};
          --dart-card-bg: ${customBg};
        }

        .dart-card {
          position: relative;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          background: var(--dart-card-bg);
          color: var(--dart-card-text);
          border-radius: 16px;
          box-shadow: 0 8px 24px #00000033;
          transition: all 0.3s ease;
        }

        .top-btn {
          position: absolute;
          top: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ffffff33;
          background: var(--dart-icon-btn-bg);
          color: var(--dart-icon-btn-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px #00000026;
          transition: transform 0.15s ease, background-color 0.2s ease, opacity 0.2s ease;
          padding: 0;
          z-index: 2;
        }

        .top-btn:hover { filter: brightness(1.25); }
        .top-btn:active { transform: scale(0.92); }
        .top-btn svg { width: 17px; height: 17px; fill: currentColor; }

        .top-btn-reset { left: 10px; }
        .top-btn-reset:hover { transform: rotate(-45deg); }
        .top-btn-reset:active { transform: scale(0.9) rotate(-90deg); }

        .top-btn-undo { right: 10px; }

        .rest-score-label {
          font-size: 13px; font-weight: 700;
          color: var(--dart-subtext); text-transform: uppercase;
          letter-spacing: 1.2px; margin-bottom: 2px; margin-top: 2px;
        }

        .rest-score-value {
          font-size: 52px; font-weight: 900;
          color: var(--dart-accent-red); line-height: 1;
          margin-bottom: 8px; text-shadow: 0 0 12px #e74c3c33;
          font-variant-numeric: tabular-nums;
        }

        .stats-bar {
          display: flex; justify-content: space-around;
          width: 100%; max-width: 210px;
          background: #00000026; border-radius: 6px;
          padding: 3px 6px; margin-bottom: 10px;
          font-size: 10px; font-weight: 600; color: var(--dart-subtext);
        }

        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-value { font-size: 12px; font-weight: 800; color: var(--dart-card-text); }
        .custom-text { font-size: 12px; color: var(--dart-card-text); margin-bottom: 4px; font-weight: 600; opacity: 0.8; }

        .input-display {
          font-size: 24px; font-weight: 800;
          color: var(--dart-card-text); height: 36px; line-height: 36px;
          background: #0000001a;
          border: 1.5px solid var(--divider-color, #ffffff1a);
          border-radius: 8px; width: 100%; max-width: 230px;
          text-align: center; margin-bottom: 10px;
          box-shadow: inset 0 2px 4px #0000001a;
        }

        .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 100%; max-width: 230px; }

        .key {
          background: var(--dart-btn-bg);
          border: 1px solid var(--divider-color, #ffffff1a);
          border-radius: 8px; padding: 8px 0; font-size: 17px; font-weight: 700;
          color: var(--dart-btn-text); text-align: center; cursor: pointer;
          user-select: none; box-shadow: 0 2px 4px #00000014; transition: all 0.1s ease;
        }

        .key:hover { filter: brightness(1.15); }
        .key:active { transform: scale(0.94); }

        .key.action-clear { color: var(--dart-accent-red); background: #e74c3c26; border-color: #e74c3c4d; }
        .key.action-submit { color: var(--dart-accent-green); background: #2ecc7126; border-color: #2ecc714d; }

        .fast-score-container {
          width: 100%; max-width: 230px; margin-top: 10px; padding-top: 10px;
          border-top: 1px solid var(--divider-color, #ffffff1a);
        }

        .grid-container { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }

        .fast-btn {
          background-color: var(--dart-fast-btn-bg);
          color: var(--dart-fast-btn-text); border: none; border-radius: 5px;
          padding: 6px 2px; font-size: 12px; font-weight: bold;
          cursor: pointer; user-select: none; box-shadow: 0 2px 4px #00000033;
          transition: transform 0.08s ease, filter 0.2s ease; text-align: center;
        }

        .fast-btn:hover { filter: brightness(1.2); }
        .fast-btn:active { transform: scale(0.92); }

        .error-msg { color: var(--dart-accent-red); font-size: 12px; font-weight: bold; margin-bottom: 8px; }
      </style>
      <div class="dart-card theme-${theme}">
        <button class="top-btn top-btn-reset" id="btn-reset" title="Spiel auf 501 zurücksetzen">
          <svg viewBox="0 0 24 24">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>

        <button class="top-btn top-btn-undo" id="btn-undo" title="Letzten Wurf rückgängig machen">
          <svg viewBox="0 0 24 24">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-0.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
        </button>

        ${!entityId ? '<div class="error-msg">Bitte eine Entität im Editor wählen!</div>' : ''}
        
        <div class="rest-score-label">${scoreLabel}</div>
        <div class="rest-score-value" id="score-val">${this._currentScore || 501}</div>

        ${showAvg ? `
          <div class="stats-bar">
            <div class="stat-item">
              <span>Ø 3-Dart</span>
              <span class="stat-value" id="avg-val">${this._calculateAverage()}</span>
            </div>
            <div class="stat-item">
              <span>Aufnahmen</span>
              <span class="stat-value" id="throws-val">${this._history.length}</span>
            </div>
          </div>
        ` : ''}
        
        <div class="custom-text">${infoText}</div>
        <div class="input-display" id="input-val">${this._typedInput || '—'}</div>
        
        <div class="keypad">
          <div class="key" data-val="1">1</div><div class="key" data-val="2">2</div><div class="key" data-val="3">3</div>
          <div class="key" data-val="4">4</div><div class="key" data-val="5">5</div><div class="key" data-val="6">6</div>
          <div class="key" data-val="7">7</div><div class="key" data-val="8">8</div><div class="key" data-val="9">9</div>
          <div class="key action-clear" data-val="C">C</div><div class="key" data-val="0">0</div><div class="key action-submit" data-val="OK">✔</div>
        </div>

        ${showGrid ? `
          <div class="fast-score-container">
            <div class="grid-container">
              ${fastScores.map(score => `<button class="fast-btn" data-score="${score}">${score}</button>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    const resetBtn = this.querySelector('#btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => this._resetGame());

    const undoBtn = this.querySelector('#btn-undo');
    if (undoBtn) undoBtn.addEventListener('click', () => this._undoLastThrow());

    this.querySelectorAll('.key').forEach((button) => {
      button.addEventListener('click', (e) => this._handleKeyPress(e.currentTarget.getAttribute('data-val')));
    });

    if (showGrid) {
      this.querySelectorAll('.fast-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
          const score = parseInt(e.currentTarget.getAttribute('data-score'), 10);
          this._submitScore(score);
        });
      });
    }

    this._rendered = true;
  }

  _updateDisplay() {
    const scoreElem = this.querySelector('#score-val');
    const inputElem = this.querySelector('#input-val');
    const avgElem = this.querySelector('#avg-val');
    const throwsElem = this.querySelector('#throws-val');

    if (scoreElem) scoreElem.textContent = this._currentScore;
    if (inputElem) inputElem.textContent = this._typedInput || '—';
    if (avgElem) avgElem.textContent = this._calculateAverage();
    if (throwsElem) throwsElem.textContent = this._history.length;
  }

  _submitScore(pointsScored) {
    const entityId = this.config ? this.config.entity : null;
    if (!entityId || isNaN(pointsScored) || pointsScored <= 0) return;

    let newScore = this._currentScore - pointsScored;

    if (newScore < 0) {
      alert("Bust! Ungültiger Wurf.");
      this._typedInput = '';
      this._updateDisplay();
      return;
    }

    this._previousScore = this._currentScore;
    this._currentScore = newScore;
    this._history.push(pointsScored);
    this._typedInput = '';

    this._playCallerSound(pointsScored);
    this._updateDisplay();

    this._hass.callService('input_number', 'set_value', {
      entity_id: entityId,
      value: newScore,
    });
  }

  _handleKeyPress(val) {
    const entityId = this.config ? this.config.entity : null;
    if (!entityId) return;

    if (val === 'C') {
      this._typedInput = '';
    } else if (val === 'OK') {
      const points = parseInt(this._typedInput, 10);
      this._submitScore(points);
    } else {
      const potentialInput = this._typedInput + val;
      if (parseInt(potentialInput, 10) <= 180) {
        this._typedInput = potentialInput;
      }
    }

    this._updateDisplay();
  }

  getCardSize() { return 5; }
}

customElements.define('dart-card-pro', DartCardPro);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'dart-card-pro',
  name: 'Dart Card Pro',
  preview: true,
  description: 'Profi Dart Counter mit Instant-Audio-Caller & Themes',
});
