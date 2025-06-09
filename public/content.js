
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
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getAnalysis') {
        console.log('Career Navigator: Analysis requested');
        sendResponse({ analysis: this.analysisResults });
      }
    });
  }
  
  getJobContent() {
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
    
    // Try each selector
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Career Navigator: Trying selector "${selector}", found ${elements.length} elements`);
      
      if (elements.length > 0) {
        // Get text from all matching elements
        elements.forEach(element => {
          const text = element.textContent || element.innerText || '';
          if (text.length > content.length) {
            content = text;
          }
        });
        
        if (content.length > 100) {
          console.log(`Career Navigator: Found content with selector: ${selector}`);
          break;
        }
      }
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
    const foundKeywords = this.relocationKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    console.log('Career Navigator: Relocation keywords found:', foundKeywords);
    
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
    for (const [type, keywords] of Object.entries(this.jobTypeKeywords)) {
      const foundKeywords = keywords.filter(keyword => content.includes(keyword.toLowerCase()));
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
    
    return allKeywords.filter(keyword => content.includes(keyword.toLowerCase()));
  }
  
  showNoContentIndicator() {
    this.removeIndicator();
    
    this.indicator = document.createElement('div');
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
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (this.indicator) {
        this.indicator.style.opacity = '0.7';
      }
    }, 8000);
  }
  
  removeIndicator() {
    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
  }
  
  showIndicator() {
    this.removeIndicator();
    
    const { relocation, jobType } = this.analysisResults;
    
    // Create indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'job-analyzer-indicator';
    
    let indicatorContent = '';
    let backgroundColor = '#e74c3c'; // Default red
    
    if (relocation.found) {
      backgroundColor = '#27ae60'; // Green
      indicatorContent = `🏢 Relocation: ${relocation.type}`;
    } else {
      indicatorContent = '❌ No Relocation';
    }
    
    if (jobType.found) {
      indicatorContent += ` | 📍 ${jobType.type}`;
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
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      if (this.indicator) {
        this.indicator.style.opacity = '0.7';
      }
    }, 15000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new JobAnalyzer());
} else {
  new JobAnalyzer();
}
