// Browser media recorder controller
let mediaRecorder = null;
let recordedChunks = [];
let activeStream = null;

// Timer state
let timerInterval = null;
let secondsElapsed = 0;

// DOM Elements
const videoPreview = document.getElementById('preview-video');
const previewPlaceholder = document.getElementById('preview-placeholder');
const placeholderText = document.getElementById('placeholder-text');
const statusVal = document.getElementById('status-val');
const timerDisplay = document.getElementById('timer-display');
const captureSource = document.getElementById('capture-source');

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnDownload = document.getElementById('btn-download');

// Read URL parameters on startup to auto-select mode
const urlParams = new URLSearchParams(window.location.search);
const initialMode = urlParams.get('mode');
if (initialMode && (initialMode === 'screen' || initialMode === 'camera')) {
  captureSource.value = initialMode;
}

// Event Listeners
btnStart.addEventListener('click', startRecording);
btnStop.addEventListener('click', stopRecording);
btnDownload.addEventListener('click', downloadRecording);
captureSource.addEventListener('change', handleSourceChange);

// Handle stream preview when switching select inputs
async function handleSourceChange() {
  stopAllActiveTracks();
  btnDownload.style.display = 'none';
  statusVal.textContent = 'Ready';
  
  if (captureSource.value === 'camera') {
    try {
      // Show webcam preview on select to help user position themselves
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoPreview.srcObject = testStream;
      videoPreview.style.display = 'block';
      previewPlaceholder.style.display = 'none';
      activeStream = testStream;
    } catch (e) {
      console.log('Camera preview blocked or unavailable:', e.message);
    }
  } else {
    videoPreview.srcObject = null;
    videoPreview.style.display = 'none';
    previewPlaceholder.style.display = 'flex';
    placeholderText.textContent = 'Ready to capture screen share.';
  }
}
handleSourceChange();

// Main start recording logic
async function startRecording() {
  recordedChunks = [];
  stopAllActiveTracks();

  const sourceMode = captureSource.value;
  statusVal.textContent = 'Requesting permissions...';

  try {
    let combinedStream = null;

    if (sourceMode === 'screen') {
      // 1. Get Screen Stream (System audio + Video)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });

      // 2. Get Microphone Stream (Voice)
      let micStream = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn('Microphone permission denied or unavailable. Recording screen only.', err);
      }

      // 3. Merge audio/video tracks
      const tracks = [...screenStream.getVideoTracks()];
      
      // Merge screen audio and microphone audio if both exist
      if (micStream && micStream.getAudioTracks().length > 0) {
        tracks.push(...micStream.getAudioTracks());
      }
      if (screenStream.getAudioTracks().length > 0) {
        tracks.push(...screenStream.getAudioTracks());
      }

      combinedStream = new MediaStream(tracks);

      // Listen for screen share end (when user clicks Chrome's "Stop sharing" ribbon)
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

    } else {
      // Camera Mode: capturing webcam video and mic audio
      combinedStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
    }

    activeStream = combinedStream;
    videoPreview.srcObject = combinedStream;
    videoPreview.style.display = 'block';
    previewPlaceholder.style.display = 'none';

    // Mute preview playback to avoid echo feedback, but record audio normally
    videoPreview.muted = true;

    // Initialize MediaRecorder
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
    }

    mediaRecorder = new MediaRecorder(combinedStream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      statusVal.textContent = 'Recording stopped. Ready to export.';
      btnDownload.style.display = 'flex';
      btnStop.style.display = 'none';
      btnStart.style.display = 'flex';
      
      // Update preview video element to play the recorded file instead of live stream
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      videoPreview.srcObject = null;
      videoPreview.src = URL.createObjectURL(blob);
      videoPreview.muted = false; // Allow listening to recorded audio review
      videoPreview.controls = true;
    };

    // Start Recording
    mediaRecorder.start(1000); // chunk slices of 1 second
    statusVal.textContent = 'Recording...';
    btnStart.style.display = 'none';
    btnStop.style.display = 'flex';
    btnDownload.style.display = 'none';

    startTimer();

  } catch (error) {
    console.error('Recording initialization failed:', error);
    statusVal.textContent = 'Failed to start.';
    alert(`Could not start recording: ${error.message}`);
  }
}

// Stop capture logic
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  stopAllActiveTracks();
  stopTimer();
}

// Download local file
function downloadRecording() {
  if (recordedChunks.length === 0) return;

  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `gratify_recording_${new Date().getTime()}.webm`;
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// Helper to kill active capture tracks
function stopAllActiveTracks() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
}

// Stopwatch controller
function startTimer() {
  secondsElapsed = 0;
  timerDisplay.textContent = '00:00:00';
  timerDisplay.classList.add('timer-recording');
  
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const hrs = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerDisplay.classList.remove('timer-recording');
}
