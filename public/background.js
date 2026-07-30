// Background worker for Screen & Webcam Recorder
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.action === 'openRecorder') {
    // Construct recorder URL with query parameters for capturing mode
    const mode = message.mode || 'screen'; // 'screen' | 'camera' | 'both'
    const recorderUrl = chrome.runtime.getURL('recorder.html') + `?mode=${mode}`;
    
    chrome.tabs.create({ url: recorderUrl }, () => {
      sendResponse({ success: true });
    });
    return true; // async reply
  }
});
