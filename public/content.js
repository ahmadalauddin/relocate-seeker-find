
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
    
    this.init();
  }
  
  init() {
    console.log('Job Analyzer initialized');
    this.analyzeJobPosting();
    this.addMessageListener();
    
    // Re-analyze when content changes
    const observer = new MutationObserver(() => {
      this.debounce(() => this.analyzeJobPosting(), 1000);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  debounce(func, wait) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, wait);
  }
  
  addMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getAnalysis') {
        sendResponse({ analysis: this.analysisResults });
      }
    });
  }
  
  getJobContent() {
    const selectors = [
      // LinkedIn
      '.job-view-layout .jobs-description-content__text',
      '.job-view-layout .jobs-box__html-content',
      
      // Indeed
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      
      // Seek
      '.job-detail',
      '[data-automation="jobDescription"]',
      '.job-description'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent || element.innerText || '';
      }
    }
    
    // Fallback: get all text content
    return document.body.textContent || '';
  }
  
  analyzeJobPosting() {
    const content = this.getJobContent().toLowerCase();
    
    if (!content || content.length < 100) {
      console.log('Insufficient content for analysis');
      return;
    }
    
    console.log('Analyzing job content...');
    
    // Analyze relocation
    const relocationAnalysis = this.analyzeRelocation(content);
    
    // Analyze job type
    const jobTypeAnalysis = this.analyzeJobType(content);
    
    // Get detected keywords
    const detectedKeywords = this.getDetectedKeywords(content);
    
    this.analysisResults = {
      relocation: relocationAnalysis,
      jobType: jobTypeAnalysis,
      keywords: detectedKeywords
    };
    
    console.log('Analysis results:', this.analysisResults);
    
    this.showIndicator();
  }
  
  analyzeRelocation(content) {
    const foundKeywords = this.relocationKeywords.filter(keyword => 
      content.includes(keyword)
    );
    
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
      const foundKeywords = keywords.filter(keyword => content.includes(keyword));
      if (foundKeywords.length > 0) {
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
    
    return allKeywords.filter(keyword => content.includes(keyword));
  }
  
  showIndicator() {
    // Remove existing indicator
    if (this.indicator) {
      this.indicator.remove();
    }
    
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
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (this.indicator) {
        this.indicator.style.opacity = '0.7';
      }
    }, 10000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new JobAnalyzer());
} else {
  new JobAnalyzer();
}
