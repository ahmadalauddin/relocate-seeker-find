// Content script for job analysis
class JobAnalyzer {
  constructor() {
    this.relocationKeywords = [
      'relocation assistance', 'relocation package', 'relocation support',
      'moving allowance', 'moving expenses', 'relocation stipend',
      'visa sponsorship', 'work permit', 'immigration support',
      'relocate', 'willing to relocate', 'relocation available',
      'moving costs covered', 'relocation bonus'
    ];

    this.jobTypeKeywords = {
      remote: ['remote', 'work from home', 'wfh', 'telecommute', 'distributed'],
      hybrid: ['hybrid', 'flexible work', 'part remote', 'mixed location'],
      onsite: ['on-site', 'onsite', 'office based', 'in office'],
      contract: ['contract', 'contractor', 'freelance', 'temporary', 'fixed term'],
      permanent: ['permanent', 'full-time', 'full time', 'perm', 'indefinite']
    };
    this.negativeRelocationKeywords = [
      'no relocation', 'relocation not available', 'relocation not provided', 'relocation not supported'
    ];
    this.negativeJobTypeKeywords = [
      'no remote', 'remote not possible', 'onsite only', 'must be onsite'
    ];

    this.analysisResults = null;
    this.indicator = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.isInitialLoad = true; // Flag to prevent duplicate analysis
    this.hasAnalyzed = false; // Track if we've already analyzed

    this.init();
  }

  init() {
    console.log('Career Navigator: Job Analyzer initialized on', window.location.href);

    this.addMessageListener();

    // Wait for page to be fully loaded before analyzing
    if (document.readyState === 'complete') {
      console.log('Career Navigator: Page already loaded, analyzing now');
      this.performInitialAnalysis();
    } else {
      console.log('Career Navigator: Waiting for page to fully load...');
      window.addEventListener('load', () => {
        console.log('Career Navigator: Page fully loaded, starting analysis');
        this.performInitialAnalysis();
      });
    }
  }

  performInitialAnalysis() {
    // Perform initial analysis
    this.waitForContent().then(() => {
      // Mark initial load as complete
      this.isInitialLoad = false;

      // Now set up MutationObserver to watch for dynamic content changes
      this.setupMutationObserver();
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      // Skip if we're still in initial load
      if (this.isInitialLoad) {
        return;
      }

      // Ignore mutations caused by the indicator itself
      for (const mutation of mutations) {
        if (
          mutation.target.classList &&
          mutation.target.classList.contains('job-analyzer-indicator')
        ) {
          return; // Don't re-analyze if the indicator is being added/removed/changed
        }
        // Also check for our indicator in added/removed nodes
        if (
          Array.from(mutation.addedNodes).some(
            node => node.classList && node.classList.contains('job-analyzer-indicator')
          ) ||
          Array.from(mutation.removedNodes).some(
            node => node.classList && node.classList.contains('job-analyzer-indicator')
          )
        ) {
          return;
        }
      }

      // Only re-analyze if significant content was added (not just minor DOM changes)
      const hasSignificantChange = mutations.some(mutation =>
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(node =>
          node.nodeType === Node.ELEMENT_NODE &&
          node.textContent &&
          node.textContent.length > 100
        )
      );

      if (hasSignificantChange) {
        this.debounce(() => {
          console.log('Career Navigator: Significant content change detected, re-analyzing...');
          this.waitForContent();
        }, 3000); // Increased debounce to 3 seconds
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('Career Navigator: MutationObserver active, watching for content changes');
  }

  async waitForContent() {
    const content = this.getJobContent();
    console.log('Career Navigator: Content length found:', content.length);
    console.log('Career Navigator: First 200 chars:', content.substring(0, 200));

    if (content && content.length > 50) {
      this.retryCount = 0;
      await this.analyzeJobPosting();
    } else if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Career Navigator: Insufficient content, retry ${this.retryCount}/${this.maxRetries}`);
      setTimeout(() => this.waitForContent(), 2000);
    } else {
      console.log('Career Navigator: Max retries reached, content may not be available');
      this.showNoContentIndicator();
    }
  }

  debounce(func, wait) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, wait);
  }

  addMessageListener() {
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getAnalysis') {
          console.log('Career Navigator: Analysis requested');
          sendResponse({ analysis: this.analysisResults });
        }
      });
    }
  }

  getJobContent() {
    // Try to extract job content from any page (no LinkedIn-specific check)
    const iframes = Array.from(document.getElementsByTagName('iframe'));
    for (const iframe of iframes) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          const iframeText = doc.body ? doc.body.innerText : '';
          if (iframeText && iframeText.length > 100) {
            return iframeText;
          }
        }
      } catch (e) {
        // Cross-origin iframe, ignore or show a warning if needed
        console.warn('Career Navigator: Cannot access cross-origin iframe.');
      }
    }

    const selectors = [
      // Generic selectors for any job page
      '[class*="job-description"]',
      '[id*="job-description"]',
      '[class*="description"]',
      '[id*="description"]',
      '[class*="job"]',
      '[id*="job"]',
      '[class*="posting"]',
      '[id*="posting"]',
      '[class*="content"]',
      '[id*="content"]',
      '[class*="section"]',
      '[id*="section"]',
      '[class*="main"]',
      '[id*="main"]',
      '[class*="body"]',
      '[id*="body"]',
      '[class*="desc"]',
      '[id*="desc"]',
      '[class*="details"]',
      '[id*="details"]',
      '[class*="info"]',
      '[id*="info"]',
      '[class*="text"]',
      '[id*="text"]',
      '[class*="summary"]',
      '[id*="summary"]',
      '[role="main"]',
      'main',
      'article',
      'section'
    ];

    let content = '';
    let allText = '';

    // Try each selector, combine all matching elements' text
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Career Navigator: Trying selector "${selector}", found ${elements.length} elements`);

      if (elements.length > 0) {
        elements.forEach(element => {
          // Only include visible elements with substantial text
          const style = window.getComputedStyle(element);
          const isVisible = style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          const text = element.textContent || element.innerText || '';
          if (isVisible && text.trim().length > 50) {
            allText += ' ' + text;
          }
        });
      }
    }

    if (allText.trim().length > 100) {
      // Use the largest block of text as content
      const blocks = allText.split('\n').map(t => t.trim()).filter(Boolean);
      const largestBlock = blocks.reduce((a, b) => (a.length > b.length ? a : b), '');
      content = largestBlock.length > 100 ? largestBlock : allText.trim();
    }

    // If still no good content, try broader search
    if (content.length < 100) {
      console.log('Career Navigator: Trying broader content search...');

      // Look for any element that might contain job description
      const potentialElements = document.querySelectorAll('div, section, article, main');

      for (const element of potentialElements) {
        const text = element.textContent || '';
        // Look for elements with substantial text that mention job-related keywords
        if (text.length > 500 && (
          text.toLowerCase().includes('responsibilities') ||
          text.toLowerCase().includes('requirements') ||
          text.toLowerCase().includes('experience') ||
          text.toLowerCase().includes('qualifications') ||
          text.toLowerCase().includes('about the role') ||
          text.toLowerCase().includes('job description')
        )) {
          console.log('Career Navigator: Found content via keyword search');
          content = text;
          break;
        }
      }
    }

    return content;
  }

  async analyzeJobPosting() {
    const content = this.getJobContent().toLowerCase();

    if (!content || content.length < 50) {
      console.log('Career Navigator: Insufficient content for analysis');
      this.showNoContentIndicator();
      return;
    }

    // Hash the content for caching
    const hash = await this.hashContent(content);
    if (!this.analysisCache) this.analysisCache = {};
    if (this.analysisCache[hash]) {
      if (this.lastAnalysisHash !== hash) {
        this.analysisResults = this.analysisCache[hash];
        this.lastAnalysisHash = hash;
        this.showIndicator();
      }
      return;
    }

    // Smart pre-filtering: Try keyword matching first
    const relocationAnalysis = this.analyzeRelocation(content);
    const jobTypeAnalysis = this.analyzeJobType(content);

    // Check if AI analysis is enabled and needed
    const aiEnabled = await this.isAIEnabled();
    const needsAI = !relocationAnalysis.found && !jobTypeAnalysis.found &&
                    relocationAnalysis.type === 'Not Mentioned';

    if (aiEnabled && needsAI) {
      // Try OpenAI analysis for uncertain cases
      try {
        const apiKey = await this.getOpenAIApiKey();
        if (!apiKey) throw new Error('No OpenAI API key set');
        console.log('Career Navigator: Using AI analysis (uncertain case)');
        const openAIResult = await this.analyzeWithOpenAI(content, apiKey);
        this.analysisResults = openAIResult;
        this.analysisCache[hash] = openAIResult;
        this.lastAnalysisHash = hash;
        this.showIndicator();
        return;
      } catch (err) {
        console.warn('OpenAI analysis failed, using keyword results:', err);
      }
    } else {
      if (!aiEnabled) {
        console.log('Career Navigator: AI analysis disabled, using keyword-only mode');
      } else {
        console.log('Career Navigator: Using keyword analysis (confident match)');
      }
    }

    // Use keyword matching results
    const detectedKeywords = this.getDetectedKeywords(content);
    this.analysisResults = {
      relocation: relocationAnalysis,
      jobType: jobTypeAnalysis,
      keywords: detectedKeywords,
      contentLength: content.length
    };
    this.analysisCache[hash] = this.analysisResults;
    this.lastAnalysisHash = hash;
    this.showIndicator();
  }

  async getOpenAIApiKey() {
    // First try to get from chrome.storage (user-configured)
    try {
      const result = await chrome.storage.local.get('settings');
      if (result.settings && result.settings.apiKey) {
        return result.settings.apiKey;
      }
    } catch (error) {
      console.warn('Failed to read from chrome.storage:', error);
    }

    // Fallback to injected config (for development/default)
    if (window.EXTENSION_CONFIG && window.EXTENSION_CONFIG.OPENAI_API_KEY) {
      return window.EXTENSION_CONFIG.OPENAI_API_KEY;
    }

    console.log('Career Navigator: No API key configured. AI analysis disabled.');
    return '';
  }

  async isAIEnabled() {
    // Check chrome.storage first
    try {
      const result = await chrome.storage.local.get('settings');
      if (result.settings && typeof result.settings.enableAI !== 'undefined') {
        return result.settings.enableAI;
      }
    } catch (error) {
      console.warn('Failed to read AI setting from chrome.storage:', error);
    }

    // Fallback to config
    if (window.EXTENSION_CONFIG && typeof window.EXTENSION_CONFIG.ENABLE_AI_ANALYSIS !== 'undefined') {
      return window.EXTENSION_CONFIG.ENABLE_AI_ANALYSIS;
    }

    return true; // Default to enabled
  }

  async hashContent(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async analyzeWithOpenAI(content, apiKey) {
    // Truncate content to save tokens (first 2000 chars usually contain key info)
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + '...' : content;

    // Optimized shorter prompt to reduce token usage
    const prompt = `Analyze this job posting. Return only JSON:\n{"relocation":true/false/null,"relocation_details":"","remote":true/false/null,"job_type":"remote/hybrid/onsite/contract/permanent/unknown","region_restriction":""}\n\nJob: """${truncatedContent}"""`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0
      })
    });

    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    const text = data.choices[0].message.content;

    // Parse JSON from the response
    let result;
    try {
      result = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (e) {
      throw new Error('Failed to parse OpenAI response');
    }

    // Adapt to your UI structure
    return {
      relocation: {
        found: result.relocation === true,
        type: result.relocation_details || (result.relocation ? 'Available' : 'Not Mentioned'),
        keywords: result.relocation_details ? [result.relocation_details] : []
      },
      jobType: {
        found: !!result.job_type && result.job_type !== 'unknown',
        type: result.job_type ? result.job_type.charAt(0).toUpperCase() + result.job_type.slice(1) : 'Unknown',
        keywords: []
      },
      regionRestriction: result.region_restriction || '',
      regionDetails: result.region_details || '',
      keywords: [],
      contentLength: content.length
    };
  }

  analyzeRelocation(content) {
    // Check for negative keywords first
    if (
      this.negativeRelocationKeywords.some(neg => content.includes(neg)) ||
      content.includes('must be located') // Add this line for stricter check
    ) {
      return { found: false, type: 'Explicitly Not Available', keywords: [] };
    }

    // Use regex for word boundaries, but avoid matching "located"
    const foundKeywords = this.relocationKeywords.filter(keyword => {
      if (keyword === 'relocate') {
        // Only match "relocate" as a standalone word
        return /\brelocate\b/i.test(content);
      }
      return new RegExp(`\\b${keyword}\\b`, 'i').test(content);
    });

    if (foundKeywords.length > 0) {
      let type = 'Available';
      if (foundKeywords.some(k => k.includes('visa') || k.includes('immigration'))) {
        type = 'Visa Sponsorship';
      } else if (foundKeywords.some(k => k.includes('package') || k.includes('allowance'))) {
        type = 'Financial Assistance';
      }
      return {
        found: true,
        type: type,
        keywords: foundKeywords
      };
    }

    return {
      found: false,
      type: 'Not Mentioned',
      keywords: []
    };
  }

  analyzeJobType(content) {
    // Check for negative job type keywords
    if (this.negativeJobTypeKeywords.some(neg => content.includes(neg))) {
      return { found: false, type: 'Explicitly Not Available', keywords: [] };
    }
    for (const [type, keywords] of Object.entries(this.jobTypeKeywords)) {
      const foundKeywords = keywords.filter(keyword =>
        new RegExp(`\\b${keyword}\\b`, 'i').test(content)
      );
      if (foundKeywords.length > 0) {
        console.log(`Career Navigator: Job type "${type}" found with keywords:`, foundKeywords);
        return {
          found: true,
          type: type.charAt(0).toUpperCase() + type.slice(1),
          keywords: foundKeywords
        };
      }
    }

    return {
      found: false,
      type: 'Unknown',
      keywords: []
    };
  }

  getDetectedKeywords(content) {
    const allKeywords = [
      ...this.relocationKeywords,
      ...Object.values(this.jobTypeKeywords).flat()
    ];

    // Use regex for word boundaries to avoid partial matches
    return allKeywords.filter(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(content)
    );
  }

  // Helper: Extract region/country restriction from content
  extractRegionRestriction(content) {
    // Common patterns for region/country restrictions
    const patterns = [
      // e.g. "already living in the Netherlands", "must reside in Germany", etc.
      /already living in ([A-Za-z ]+)/i,
      /must reside in ([A-Za-z ]+)/i,
      /must be located in ([A-Za-z ]+)/i,
      /candidates.*?in ([A-Za-z ]+)/i,
      /open to candidates.*?in ([A-Za-z ]+)/i,
      /only for candidates.*?in ([A-Za-z ]+)/i,
      /limited to ([A-Za-z ]+)/i,
      /restricted to ([A-Za-z ]+)/i,
      /applicants.*?in ([A-Za-z ]+)/i,
      /applicants.*?from ([A-Za-z ]+)/i,
      /must be based in ([A-Za-z ]+)/i,
      /work authorization.*?in ([A-Za-z ]+)/i,
      /work permit.*?in ([A-Za-z ]+)/i
    ];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        // Clean up the region/country name
        let region = match[1].trim();
        // Remove trailing words like 'only', 'required', etc.
        region = region.replace(/\b(only|required|needed|is required|is needed)\b/i, '').trim();
        // Capitalize first letter
        region = region.charAt(0).toUpperCase() + region.slice(1);
        return region;
      }
    }
    return null;
  }

  showNoContentIndicator() {
    this.removeIndicator();

    this.indicator = document.createElement('div');
    this.indicator.setAttribute('role', 'status');
    this.indicator.setAttribute('aria-live', 'polite');
    this.indicator.className = 'job-analyzer-indicator';

    this.indicator.innerHTML = `
      <div id="job-analyzer-no-content" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f39c12 0%, #d68910 100%);
        color: white;
        padding: 14px 22px;
        border-radius: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset;
        z-index: 10000;
        max-width: 320px;
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: default;
        backdrop-filter: blur(10px);
        transition: box-shadow 0.3s ease, filter 0.3s ease;
      ">
        Unable to analyze this page
      </div>
    `;

    document.body.appendChild(this.indicator);

    // Add hover effect
    const indicatorEl = document.getElementById('job-analyzer-no-content');
    if (indicatorEl) {
      indicatorEl.addEventListener('mouseenter', () => {
        indicatorEl.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2) inset';
        indicatorEl.style.filter = 'brightness(1.05)';
      });
      indicatorEl.addEventListener('mouseleave', () => {
        indicatorEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset';
        indicatorEl.style.filter = 'brightness(1)';
      });
    }

    // Remove after 5 seconds
    setTimeout(() => {
      this.removeIndicator();
    }, 5000);
  }

  removeIndicator() {
    const existing = document.querySelector('.job-analyzer-indicator');
    if (existing) existing.remove();
    this.indicator = null;
  }

  showIndicator() {
    this.removeIndicator();

    const { relocation, jobType, regionRestriction } = this.analysisResults;

    this.indicator = document.createElement('div');
    this.indicator.setAttribute('role', 'status');
    this.indicator.setAttribute('aria-live', 'polite');
    this.indicator.className = 'job-analyzer-indicator';

    let indicatorContent = '';
    let backgroundColor = '#e74c3c'; // Default red

    // If neither relocation nor visa sponsorship info is available
    const noRelocationInfo = !relocation.found && relocation.type !== 'Explicitly Not Available';

    // Add: If job is remote and/or region-limited, show that clearly
    let regionNote = '';
    // Prefer OpenAI result for region restriction, fallback to regex
    let region = regionRestriction;
    const contentLower = this.getJobContent().toLowerCase(); // <-- FIX: ensure contentLower is always defined
    if (!region) {
      region = this.extractRegionRestriction(contentLower);
    }
    if (region) {
      region = region.replace(/[^a-zA-Z ]/g, '').trim(); // Clean non-alphabetic characters
    }
    if (contentLower.includes('remote') || contentLower.includes('work from anywhere') || contentLower.includes('work from home')) {
      indicatorContent = '🌍 Remote position';
      backgroundColor = '#2980b9';
      if (region) {
        regionNote = ` (${region} only)`;
      } else if (contentLower.includes('eu-based') || contentLower.includes('european union') || contentLower.includes('only for eu') || contentLower.includes('limited to eu')) {
        regionNote = ' (EU only)';
      } else if (contentLower.includes('germany')) {
        regionNote = ' (Germany only)';
      }
      indicatorContent += regionNote;
    } else if (noRelocationInfo) {
      indicatorContent = 'ℹ️ No information about relocation or visa sponsorship available';
      backgroundColor = '#95a5a6'; // Neutral gray
      if (region) {
        indicatorContent += ` | 🌍 ${region} only`;
      }
    } else if (relocation.found) {
      backgroundColor = '#27ae60'; // Green
      indicatorContent = `🏢 Relocation: ${relocation.type}`;
      if (region) {
        indicatorContent += ` | 🌍 ${region} only`;
      }
    } else if (relocation.type === 'Explicitly Not Available') {
      backgroundColor = '#e67e22'; // Orange
      indicatorContent = '❌ Relocation Not Available';
      if (region) {
        indicatorContent += ` | 🌍 ${region} only`;
      }
    } else {
      indicatorContent = '❌ No Relocation';
      if (region) {
        indicatorContent += ` | 🌍 ${region} only`;
      }
    }

    if (jobType.found) {
      indicatorContent += ` | 📍 ${jobType.type}`;
    } else if (jobType.type === 'Explicitly Not Available') {
      indicatorContent += ' | 📍 Not Remote/Hybrid';
    }

    // Only show the indicator content
    this.indicator.innerHTML = `
      <div id="job-analyzer-indicator-inner" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, ${backgroundColor} 0%, ${this.adjustColor(backgroundColor, -15)} 100%);
        color: white;
        padding: 14px 22px;
        border-radius: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset;
        z-index: 10000;
        max-width: 380px;
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: default;
        backdrop-filter: blur(10px);
        transition: box-shadow 0.3s ease, filter 0.3s ease;
      ">
        ${indicatorContent}
      </div>
    `;

    document.body.appendChild(this.indicator);

    // Pause auto-removal on hover + add subtle hover effect
    const indicatorInner = document.getElementById('job-analyzer-indicator-inner');
    let removeTimeout;
    const setRemoveTimeout = () => {
      removeTimeout = setTimeout(() => this.removeIndicator(), 7000);
    };
    setRemoveTimeout();

    if (indicatorInner) {
      indicatorInner.addEventListener('mouseenter', () => {
        clearTimeout(removeTimeout);
        // Subtle hover effect without transform (which breaks position:fixed)
        indicatorInner.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2) inset';
        indicatorInner.style.filter = 'brightness(1.05)';
      });
      indicatorInner.addEventListener('mouseleave', () => {
        setRemoveTimeout();
        // Reset to original
        indicatorInner.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset';
        indicatorInner.style.filter = 'brightness(1)';
      });
    }
  }

  // Helper to darken/lighten hex colors
  adjustColor(color, amount) {
    // Handle named colors
    const colorMap = {
      '#27ae60': amount < 0 ? '#1e8449' : '#2ecc71',
      '#e74c3c': amount < 0 ? '#c0392b' : '#e74c3c',
      '#2980b9': amount < 0 ? '#1f6692' : '#3498db',
      '#95a5a6': amount < 0 ? '#7f8c8d' : '#bdc3c7',
      '#e67e22': amount < 0 ? '#d35400' : '#f39c12',
      '#f39c12': amount < 0 ? '#d68910' : '#f7b731'
    };
    return colorMap[color] || color;
  }
}

// Initialize the extension
// Note: The JobAnalyzer.init() method will handle waiting for page to fully load
new JobAnalyzer();