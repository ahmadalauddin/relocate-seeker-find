// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Career Navigator: Popup opened');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Career Navigator: Current tab URL:', tab.url);
    
    // Check if we're on a supported job site
    const supportedSites = [
      'linkedin.com/jobs',
      'linkedin.com/in/',
      'indeed.com/viewjob',
      'indeed.com/jobs',
      'seek.com.au/job',
      'seek.co.nz/job'
    ];
    
    const isJobSite = supportedSites.some(site => tab.url?.includes(site));
    
    const pageStatusElement = document.getElementById('pageStatus');
    const keywordsElement = document.getElementById('detectedKeywords');
    
    if (!isJobSite) {
      pageStatusElement.textContent = 'Navigate to a job posting on LinkedIn, Indeed, or Seek to see analysis';
      pageStatusElement.style.color = '#666';
      return;
    }
    
    pageStatusElement.textContent = 'Analyzing job posting...';
    pageStatusElement.style.color = '#0066cc';
    
    // Try to get analysis data from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAnalysis' });
      console.log('Career Navigator: Response from content script:', response);
      
      if (response && response.analysis) {
        const { relocation, jobType, keywords, contentLength } = response.analysis;
        
        // Update status
        let statusText = '';
        let statusColor = '#333';
        
        if (contentLength && contentLength < 50) {
          statusText = 'Unable to find job description content on this page';
          statusColor = '#e74c3c';
        } else if (relocation.found) {
          statusText = `✅ Relocation: ${relocation.type}`;
          statusColor = '#27ae60';
        } else {
          statusText = '❌ No relocation assistance mentioned';
          statusColor = '#e74c3c';
        }
        
        if (jobType.found && contentLength >= 50) {
          statusText += `\n📍 Job Type: ${jobType.type}`;
        }
        
        pageStatusElement.textContent = statusText;
        pageStatusElement.style.color = statusColor;
        pageStatusElement.style.whiteSpace = 'pre-line';
        
        // Update keywords
        if (keywords && keywords.length > 0) {
          keywordsElement.textContent = keywords.join(', ');
          keywordsElement.style.color = '#333';
        } else if (contentLength >= 50) {
          keywordsElement.textContent = 'No relevant keywords detected';
          keywordsElement.style.color = '#666';
        } else {
          keywordsElement.textContent = 'Content not found - try refreshing the page';
          keywordsElement.style.color = '#e74c3c';
        }
      } else {
        pageStatusElement.textContent = 'Extension is loading... Please wait a moment and try again';
        pageStatusElement.style.color = '#f39c12';
        keywordsElement.textContent = 'Analysis in progress...';
      }
    } catch (error) {
      console.error('Career Navigator: Error communicating with content script:', error);
      pageStatusElement.textContent = 'Unable to analyze this page. Try refreshing and reopening the extension.';
      pageStatusElement.style.color = '#e74c3c';
      keywordsElement.textContent = 'Make sure you\'re on a specific job posting page';
      keywordsElement.style.color = '#666';
    }

  } catch (error) {
    console.error('Career Navigator: Popup error:', error);
    document.getElementById('pageStatus').textContent = 'Extension error occurred';
  }
});
