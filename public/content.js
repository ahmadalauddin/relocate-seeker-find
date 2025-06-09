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

    this.init();
  }

  init() {
    console.log('Career Navigator: Job Analyzer initialized on', window.location.href);

    // Wait for page content to load
    this.waitForContent();
    this.addMessageListener();

    // Re-analyze when content changes
    const observer = new MutationObserver(() => {
      this.debounce(() => {
        console.log('Career Navigator: Content changed, re-analyzing...');
        this.waitForContent();
      }, 2000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  waitForContent() {
    const content = this.getJobContent();
    console.log('Career Navigator: Content length found:', content.length);
    console.log('Career Navigator: First 200 chars:', content.substring(0, 200));

    if (content && content.length > 50) {
      this.retryCount = 0;
      this.analyzeJobPosting();
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
      // LinkedIn - multiple selectors for different layouts
      '.jobs-description-content__text',
      '.job-view-layout .jobs-description-content__text',
      '.jobs-box__html-content',
      '.job-view-layout .jobs-box__html-content',
      '[data-job-id] .jobs-description-content__text',
      '.jobs-search__job-details--container .jobs-description-content__text',
      '.job-details-jobs-unified-top-card__content',
      '.jobs-description',

      // Indeed
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      '.jobsearch-JobComponent-description',

      // Seek
      '.job-detail',
      '[data-automation="jobDescription"]',
      '.job-description',

      // Generic fallbacks
      '[class*="job-description"]',
      '[class*="description"]',
      '[id*="description"]'
    ];

    let content = '';
    let allText = '';

    // Try each selector, combine all matching elements' text
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Career Navigator: Trying selector "${selector}", found ${elements.length} elements`);

      if (elements.length > 0) {
        elements.forEach(element => {
          const text = element.textContent || element.innerText || '';
          allText += ' ' + text;
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

  analyzeJobPosting() {
    const content = this.getJobContent().toLowerCase();

    if (!content || content.length < 50) {
      console.log('Career Navigator: Insufficient content for analysis');
      this.showNoContentIndicator();
      return;
    }

    console.log('Career Navigator: Analyzing job content, length:', content.length);

    // Analyze relocation
    const relocationAnalysis = this.analyzeRelocation(content);

    // Analyze job type
    const jobTypeAnalysis = this.analyzeJobType(content);

    // Get detected keywords
    const detectedKeywords = this.getDetectedKeywords(content);

    this.analysisResults = {
      relocation: relocationAnalysis,
      jobType: jobTypeAnalysis,
      keywords: detectedKeywords,
      contentLength: content.length
    };

    console.log('Career Navigator: Analysis results:', this.analysisResults);

    this.showIndicator();
  }

  analyzeRelocation(content) {
    // Check for negative keywords first
    if (
      this.negativeRelocationKeywords.some(neg => content.includes(neg)) ||
      content.includes('must be located') || // Add this line for stricter check
      content.includes('visa sponsorship is not available')
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

  showNoContentIndicator() {
    this.removeIndicator();

    this.indicator = document.createElement('div');
    this.indicator.setAttribute('role', 'status');
    this.indicator.setAttribute('aria-live', 'polite');
    this.indicator.className = 'job-analyzer-indicator';

    this.indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f39c12;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
      ">
        ⚠️ Unable to analyze this page
      </div>
    `;

    document.body.appendChild(this.indicator);

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

    const { relocation, jobType } = this.analysisResults;

    // Create indicator
    this.indicator = document.createElement('div');
    this.indicator.setAttribute('role', 'status');
    this.indicator.setAttribute('aria-live', 'polite');
    this.indicator.className = 'job-analyzer-indicator';

    let indicatorContent = '';
    let backgroundColor = '#e74c3c'; // Default red

    if (relocation.found) {
      backgroundColor = '#27ae60'; // Green
      indicatorContent = `🏢 Relocation: ${relocation.type}`;
    } else if (relocation.type === 'Explicitly Not Available') {
      backgroundColor = '#e67e22'; // Orange
      indicatorContent = '❌ Relocation Not Available';
    } else {
      indicatorContent = '❌ No Relocation';
    }

    if (jobType.found) {
      indicatorContent += ` | 📍 ${jobType.type}`;
    } else if (jobType.type === 'Explicitly Not Available') {
      indicatorContent += ' | 📍 Not Remote/Hybrid';
    }

    this.indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
      ">
        ${indicatorContent}
      </div>
    `;

    document.body.appendChild(this.indicator);

    // Remove after 5 seconds
    setTimeout(() => {
      this.removeIndicator();
    }, 5000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new JobAnalyzer());
} else {
  new JobAnalyzer();
}