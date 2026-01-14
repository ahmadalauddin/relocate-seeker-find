// Popup script for Chrome extension

// DOM Elements
const elements = {
  settingsBtn: null,
  setupCard: null,
  quickApiKey: null,
  quickSaveBtn: null,
  openOptionsLink: null,
  pageStatus: null,
  statusIndicator: null,
  detectedKeywords: null
};

// Initialize elements after DOM loads
function initElements() {
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.setupCard = document.getElementById('setupCard');
  elements.quickApiKey = document.getElementById('quickApiKey');
  elements.quickSaveBtn = document.getElementById('quickSaveBtn');
  elements.openOptionsLink = document.getElementById('openOptionsLink');
  elements.pageStatus = document.getElementById('pageStatus');
  elements.statusIndicator = document.getElementById('statusIndicator');
  elements.detectedKeywords = document.getElementById('detectedKeywords');
}

// Check if API key is configured
async function checkApiKeyStatus() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    const hasApiKey = settings.apiKey && settings.apiKey.length > 0;

    if (elements.setupCard) {
      if (hasApiKey) {
        elements.setupCard.classList.add('hidden');
      } else {
        elements.setupCard.classList.remove('hidden');
      }
    }

    return hasApiKey;
  } catch (error) {
    console.error('Failed to check API key status:', error);
    return false;
  }
}

// Save API key quickly from popup
async function saveQuickApiKey() {
  const apiKey = elements.quickApiKey.value.trim();

  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    alert('Invalid API key format. Should start with "sk-"');
    return;
  }

  try {
    // Get existing settings and merge
    const result = await chrome.storage.local.get('settings');
    const settings = { ...result.settings, apiKey, enableAI: true };

    await chrome.storage.local.set({ settings });

    // Hide setup card
    elements.setupCard.classList.add('hidden');

    // Clear input
    elements.quickApiKey.value = '';

    console.log('API key saved successfully');
  } catch (error) {
    console.error('Failed to save API key:', error);
    alert('Failed to save API key');
  }
}

// Open options page
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener('click', openOptionsPage);
  }

  // Quick save button
  if (elements.quickSaveBtn) {
    elements.quickSaveBtn.addEventListener('click', saveQuickApiKey);
  }

  // Quick API key input - save on Enter
  if (elements.quickApiKey) {
    elements.quickApiKey.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveQuickApiKey();
      }
    });
  }

  // Open options link
  if (elements.openOptionsLink) {
    elements.openOptionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openOptionsPage();
    });
  }
}

// Update status display with analysis results
function updateStatusDisplay(analysis) {
  if (!analysis) {
    elements.pageStatus.textContent = 'Extension is loading... Please wait a moment and try again';
    elements.pageStatus.classList.remove('has-results');
    elements.statusIndicator.classList.add('inactive');
    elements.detectedKeywords.innerHTML = '<div class="no-keywords">Analysis in progress...</div>';
    return;
  }

  const { relocation, jobType, keywords, contentLength } = analysis;

  // Update status indicator
  if (contentLength && contentLength >= 50) {
    elements.statusIndicator.classList.remove('inactive');
  }

  // Build status text
  let statusText = '';

  if (contentLength && contentLength < 50) {
    statusText = 'Unable to find job description content on this page';
    elements.pageStatus.classList.remove('has-results');
  } else if (relocation.found) {
    statusText = `Relocation: ${relocation.type}`;
    elements.pageStatus.classList.add('has-results');
  } else {
    statusText = 'No relocation assistance mentioned';
    elements.pageStatus.classList.remove('has-results');
  }

  if (jobType.found && contentLength >= 50) {
    statusText += `\nJob Type: ${jobType.type}`;
  }

  elements.pageStatus.textContent = statusText;
  elements.pageStatus.style.whiteSpace = 'pre-line';

  // Update keywords
  if (keywords && keywords.length > 0) {
    const keywordTags = keywords.map(keyword => {
      const isRelocation = ['relocation', 'visa', 'sponsor', 'moving'].some(k => keyword.toLowerCase().includes(k));
      const tagClass = isRelocation ? 'relocation' : 'job-type';
      return `<span class="keyword-tag ${tagClass}">${keyword}</span>`;
    }).join('');
    elements.detectedKeywords.innerHTML = keywordTags;
  } else if (contentLength >= 50) {
    elements.detectedKeywords.innerHTML = '<div class="no-keywords">No relevant keywords detected</div>';
  } else {
    elements.detectedKeywords.innerHTML = '<div class="no-keywords">Content not found - try refreshing the page</div>';
  }
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Career Navigator: Popup opened');

    // Initialize DOM elements
    initElements();

    // Setup event listeners
    setupEventListeners();

    // Check API key status
    await checkApiKeyStatus();

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Career Navigator: Current tab URL:', tab.url);

    // Check if we're on a supported job site
    const supportedPatterns = [
      '/jobs/',
      '/job/',
      '/careers/',
      '/career/',
      '/vacancies/',
      '/vacancy/',
      '/opportunities/'
    ];

    const isJobSite = supportedPatterns.some(pattern => tab.url?.includes(pattern));

    if (!isJobSite) {
      elements.pageStatus.textContent = 'Navigate to a job posting on LinkedIn, Indeed, or Seek to see analysis';
      elements.statusIndicator.classList.add('inactive');
      elements.detectedKeywords.innerHTML = '<div class="no-keywords">No job page detected</div>';
      return;
    }

    elements.pageStatus.textContent = 'Analyzing job posting...';
    elements.statusIndicator.classList.add('inactive');

    // Try to get analysis data from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAnalysis' });
      console.log('Career Navigator: Response from content script:', response);

      if (response && response.analysis) {
        updateStatusDisplay(response.analysis);
      } else {
        updateStatusDisplay(null);
      }
    } catch (error) {
      console.error('Career Navigator: Error communicating with content script:', error);
      elements.pageStatus.textContent = 'Unable to analyze this page. Try refreshing and reopening the extension.';
      elements.pageStatus.classList.remove('has-results');
      elements.detectedKeywords.innerHTML = '<div class="no-keywords">Make sure you\'re on a specific job posting page</div>';
    }

  } catch (error) {
    console.error('Career Navigator: Popup error:', error);
    if (elements.pageStatus) {
      elements.pageStatus.textContent = 'Extension error occurred';
    }
  }
});
