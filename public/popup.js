
// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a supported job site
    const supportedSites = [
      'linkedin.com/jobs',
      'indeed.com/viewjob',
      'seek.com.au/job',
      'seek.co.nz/job'
    ];
    
    const isJobSite = supportedSites.some(site => tab.url?.includes(site));
    
    const pageStatusElement = document.getElementById('pageStatus');
    const keywordsElement = document.getElementById('detectedKeywords');
    
    if (!isJobSite) {
      pageStatusElement.textContent = 'Not on a supported job site';
      return;
    }
    
    // Try to get analysis data from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAnalysis' });
      
      if (response && response.analysis) {
        const { relocation, jobType, keywords } = response.analysis;
        
        // Update status
        let statusText = '';
        if (relocation.found) {
          statusText = `✅ Relocation: ${relocation.type}`;
        } else {
          statusText = '❌ No relocation mentioned';
        }
        
        if (jobType.found) {
          statusText += `\n📍 Job Type: ${jobType.type}`;
        }
        
        pageStatusElement.textContent = statusText;
        
        // Update keywords
        if (keywords.length > 0) {
          keywordsElement.textContent = keywords.join(', ');
        }
      } else {
        pageStatusElement.textContent = 'Analysis in progress...';
      }
    } catch (error) {
      pageStatusElement.textContent = 'Unable to analyze this page';
    }
  } catch (error) {
    console.error('Popup error:', error);
  }
});
