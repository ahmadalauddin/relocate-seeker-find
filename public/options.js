// Options page script for Career Navigator

// Default settings
const DEFAULT_SETTINGS = {
  apiKey: '',
  enableAI: true,
  autoHide: true,
  showAlways: true
};

// DOM Elements
const elements = {
  apiKey: document.getElementById('apiKey'),
  enableAI: document.getElementById('enableAI'),
  autoHide: document.getElementById('autoHide'),
  showAlways: document.getElementById('showAlways'),
  saveBtn: document.getElementById('saveBtn'),
  status: document.getElementById('status')
};

// Load settings from chrome.storage.local
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = { ...DEFAULT_SETTINGS, ...result.settings };

    // Populate form
    elements.apiKey.value = settings.apiKey || '';
    elements.enableAI.checked = settings.enableAI;
    elements.autoHide.checked = settings.autoHide;
    elements.showAlways.checked = settings.showAlways;

    console.log('Settings loaded:', { ...settings, apiKey: settings.apiKey ? '***' : '' });
  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('Failed to load settings', 'error');
  }
}

// Save settings to chrome.storage.local
async function saveSettings() {
  const settings = {
    apiKey: elements.apiKey.value.trim(),
    enableAI: elements.enableAI.checked,
    autoHide: elements.autoHide.checked,
    showAlways: elements.showAlways.checked
  };

  // Validate API key format if provided
  if (settings.apiKey && !settings.apiKey.startsWith('sk-')) {
    showStatus('Invalid API key format. Should start with "sk-"', 'error');
    return;
  }

  try {
    // Disable button while saving
    elements.saveBtn.disabled = true;
    elements.saveBtn.innerHTML = '<span>⏳</span> Saving...';

    await chrome.storage.local.set({ settings });

    console.log('Settings saved successfully');
    showStatus('Settings saved successfully!', 'success');

    // Reset button
    setTimeout(() => {
      elements.saveBtn.disabled = false;
      elements.saveBtn.innerHTML = '<span>💾</span> Save Settings';
    }, 1000);
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
    elements.saveBtn.disabled = false;
    elements.saveBtn.innerHTML = '<span>💾</span> Save Settings';
  }
}

// Show status message
function showStatus(message, type) {
  elements.status.textContent = message;
  elements.status.className = `status show ${type}`;

  // Add icon
  const icon = type === 'success' ? '✓' : '✕';
  elements.status.innerHTML = `<span>${icon}</span> ${message}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    elements.status.classList.remove('show');
  }, 3000);
}

// Event listeners
elements.saveBtn.addEventListener('click', saveSettings);

// Save on Enter key in API key input
elements.apiKey.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// Toggle AI warning when disabled
elements.enableAI.addEventListener('change', () => {
  if (!elements.enableAI.checked) {
    showStatus('AI analysis disabled. Only keyword matching will be used.', 'success');
  }
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
