/**
 * Client-side service to upload recorded videos to the backend proxy.
 * Uses XMLHttpRequest to provide accurate upload progress monitoring.
 * 
 * @param {Blob} blob - The video Blob file to upload
 * @param {string} filename - Custom name of the file
 * @param {function} onProgress - Callback function triggered on upload progress, receives percentage (0-100)
 * @returns {Promise<{ success: boolean, url: string, viewUrl: string }>}
 */
export function uploadVideo(blob, filename, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/api/share', true);
    
    // Set headers for binary transmission
    xhr.setRequestHeader('Content-Type', blob.type || 'video/webm');
    xhr.setRequestHeader('X-Filename', encodeURIComponent(filename));

    // Upload progress event listener
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    // Success response handler
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Failed to parse upload server response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error || `Upload failed with status code ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Server error: Status code ${xhr.status}`));
        }
      }
    };

    // Error response handler
    xhr.onerror = () => {
      reject(new Error('Network error during upload. Please check your connection.'));
    };

    // Send the raw binary blob in the body
    xhr.send(blob);
  });
}
