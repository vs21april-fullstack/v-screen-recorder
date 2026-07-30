import React, { useState, useEffect, useRef } from 'react';
import { 
  saveRecording, 
  getRecordingsList, 
  getRecordingBlob, 
  deleteRecording, 
  updateRecordingTitle 
} from './db';
import { uploadVideo } from './upload';

// ==========================================================================
// High-Fidelity SVG Icon Components
// ==========================================================================
const ScreenIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);
const CameraIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
);
const MicIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
);
const LockIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const DatabaseIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
);
const LinkIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const BoltIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const FolderIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
);
const CalendarIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const GearIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const PencilIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);
const TrashIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const PlayIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const DownloadIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const ShareIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);
const CloseIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const WarningIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px', color: 'var(--accent-red)' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const CheckIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px', color: 'var(--accent-green)' }}><polyline points="20 6 9 17 4 12"/></svg>
);
const PauseIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const StopIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
);
const RecordIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
);
const SyncIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
);
const UserPlusIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
);
const LoginIcon = () => (
  <svg className="svg-icon" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
);

const LogoIcon = () => (
  <div className="logo-graphic"></div>
);

const formatTime = (durationInSeconds) => {
  const parsedDuration = Number(durationInSeconds);
  const totalSeconds = Number.isFinite(parsedDuration)
    ? Math.max(0, Math.floor(parsedDuration))
    : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('home');

  // User Auth State (HTTP-Only Cookie Backed)
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authFormTab, setAuthFormTab] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Library scope: 'cloud' or 'local' (Visible only when logged in)
  const [libraryType, setLibraryType] = useState('local');

  // Local Sync state
  const [localUnsyncedCount, setLocalUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Recorder Configuration State
  const [captureSource, setCaptureSource] = useState('screen');
  const [resolution, setResolution] = useState('1080p');
  const [frameRate, setFrameRate] = useState(30);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [systemAudioEnabled, setSystemAudioEnabled] = useState(true);

  // Available Devices
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');

  // Recording State Machine
  const [recorderStatus, setRecorderStatus] = useState('idle'); // 'idle' | 'recording' | 'paused' | 'stopped'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState('');

  // Review & Download State
  const [currentBlob, setCurrentBlob] = useState(null);
  const [currentBlobUrl, setCurrentBlobUrl] = useState('');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // History State (Unified local vs cloud)
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(5);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitleVal, setEditingTitleVal] = useState('');

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewVideoUrl, setReviewVideoUrl] = useState('');
  const [reviewVideoTitle, setReviewVideoTitle] = useState('');
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharingStatus, setSharingStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [shareViewLink, setShareViewLink] = useState('');
  const [shareErrorMsg, setShareErrorMsg] = useState('');
  const [shareItemName, setShareItemName] = useState('');

  // Custom alert dialog
  const [customAlert, setCustomAlert] = useState(null);
  const [customConfirm, setCustomConfirm] = useState(null);

  // Refs for background control
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const activeStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const videoElementRef = useRef(null);
  
  // Audio Visualizer Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const visualizerCanvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const confirmationResolverRef = useRef(null);

  const showAlert = (message, type = 'error') => {
    setCustomAlert({
      message: String(message || 'Something went wrong.'),
      type,
      title: type === 'success' ? 'Success' : 'Something went wrong'
    });
  };

  const requestConfirmation = (options) => (
    new Promise((resolve) => {
      confirmationResolverRef.current = resolve;
      setCustomConfirm({
        title: 'Please confirm',
        confirmLabel: 'Continue',
        destructive: false,
        ...options
      });
    })
  );

  const closeConfirmation = (confirmed) => {
    confirmationResolverRef.current?.(confirmed);
    confirmationResolverRef.current = null;
    setCustomConfirm(null);
  };

  // 1. Fetch Session on mount
  useEffect(() => {
    checkSession();
    loadDevices();
    checkLocalUnsynced();

    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
      stopMediaTracks();
      cleanupAudioVisualizer();
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.authenticated) {
        setCurrentUser(data.user);
        setLibraryType('cloud'); // Default to Cloud Library if logged in
      } else {
        setCurrentUser(null);
        setLibraryType('local');
      }
    } catch (err) {
      console.warn('Authentication me check failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const checkLocalUnsynced = async () => {
    try {
      const res = await getRecordingsList({ page: 1, pageSize: 999 });
      setLocalUnsyncedCount(res.total);
    } catch (err) {
      console.warn('Error counting local recordings:', err);
    }
  };

  // Sync Local IndexedDB records to Cloud Library
  const handleCloudSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Get all local items
      const localDB = await getRecordingsList({ page: 1, pageSize: 999 });
      const items = localDB.items;
      const total = items.length;

      for (let i = 0; i < total; i++) {
        const item = items[i];
        
        // 1. Fetch binary blob
        const blob = await getRecordingBlob(item.id);
        const filename = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;

        // 2. Upload video file via proxy
        const uploadRes = await uploadVideo(blob, filename);
        if (!uploadRes.success) throw new Error(`Upload failed for ${item.title}`);

        // 3. Register record in Cloud Database API
        const registerRes = await fetch('/api/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            title: item.title,
            mode: item.mode,
            duration: item.duration,
            videoUrl: uploadRes.url
          })
        });

        const registerData = await registerRes.json();
        if (!registerData.success) throw new Error(registerData.error || `DB sync failed for ${item.title}`);

        // 4. Delete local IndexedDB copy
        await deleteRecording(item.id);
        
        // Update progress
        setSyncProgress(Math.round(((i + 1) / total) * 100));
      }

      showAlert('All local recordings synced successfully to V-Screen Recorder Cloud!', 'success');
      setLocalUnsyncedCount(0);
      setHistoryPage(1);
      loadHistory();
    } catch (err) {
      showAlert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  async function loadDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          stream.getTracks().forEach(t => t.stop());
        })
        .catch(() => {
          console.log('Partial media permission. scanning devices.');
        });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const mics = devices.filter(d => d.kind === 'audioinput');

      setVideoDevices(cameras);
      setAudioDevices(mics);

      if (cameras.length > 0) setSelectedVideoId(cameras[0].deviceId);
      if (mics.length > 0) setSelectedAudioId(mics[0].deviceId);
    } catch (err) {
      console.error('Error fetching media devices:', err);
    }
  }

  // Load History lists depending on Local or Cloud state
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, libraryType, historyPage, searchQuery, startDate, endDate]);

  const handleTabChange = async (tabName) => {
    // Route Guard: redirect unauthenticated users to sign-in auth tab
    if (!currentUser && (tabName === 'record' || tabName === 'history')) {
      setActiveTab('auth');
      return;
    }

    if (tabName !== 'record' && (recorderStatus === 'recording' || recorderStatus === 'paused')) {
      const confirmLeave = await requestConfirmation({
        title: 'Leave recording?',
        message: 'Recording is in progress. Leaving will stop and save the session.',
        confirmLabel: 'Stop and leave'
      });
      if (!confirmLeave) return;
      stopRecording();
    }
    if (tabName !== 'record') {
      stopMediaTracks();
      cleanupAudioVisualizer();
    }
    setActiveTab(tabName);
  };

  const stopMediaTracks = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
  };

  const cleanupAudioVisualizer = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const loadHistory = async () => {
    setHistoryItems([]);
    setHistoryTotal(0);

    try {
      if (libraryType === 'cloud' && currentUser) {
        // Query serverless API
        const queryParams = new URLSearchParams({
          page: historyPage,
          pageSize: historyPageSize,
          searchQuery,
          startDate,
          endDate
        });
        const res = await fetch(`/api/recordings?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setHistoryItems(data.items);
          setHistoryTotal(data.total);
        }
      } else {
        // Query local IndexedDB database
        const result = await getRecordingsList({
          page: historyPage,
          pageSize: historyPageSize,
          startDate,
          endDate,
          searchQuery
        });
        setHistoryItems(result.items);
        setHistoryTotal(result.total);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'record' && captureSource === 'camera' && recorderStatus === 'idle') {
      setupCameraPreview();
    } else if (captureSource === 'screen' && recorderStatus === 'idle') {
      stopMediaTracks();
    }
  }, [captureSource, selectedVideoId, activeTab]);

  const setupCameraPreview = async () => {
    stopMediaTracks();
    try {
      const constraints = {
        video: { deviceId: selectedVideoId ? { exact: selectedVideoId } : undefined },
        audio: false
      };
      const previewStream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = previewStream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = previewStream;
        videoElementRef.current.muted = true;
        videoElementRef.current.play().catch(e => console.log('Preview play blocked:', e));
      }
    } catch (err) {
      console.warn('Camera preview failed:', err.message);
    }
  };

  const startRecording = async () => {
    recordedChunksRef.current = [];
    stopMediaTracks();
    cleanupAudioVisualizer();
    setSecondsElapsed(0);
    setRecorderStatus('preparing');

    const constraintsWidth = resolution === '1080p' ? 1920 : resolution === '720p' ? 1280 : 854;
    const constraintsHeight = resolution === '1080p' ? 1080 : resolution === '720p' ? 720 : 480;

    try {
      let combinedStream = null;

      if (captureSource === 'screen') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: constraintsWidth,
            height: constraintsHeight,
            frameRate: frameRate,
            cursor: 'always'
          },
          audio: systemAudioEnabled ? { echoCancellation: true } : false
        });

        let micStream = null;
        if (audioEnabled) {
          try {
            micStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: selectedAudioId ? { exact: selectedAudioId } : undefined,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            });
          } catch (micErr) {
            console.warn('Microphone stream blocked.', micErr);
          }
        }

        const tracks = [...screenStream.getVideoTracks()];

        if (micStream && micStream.getAudioTracks().length > 0) {
          tracks.push(micStream.getAudioTracks()[0]);
          setupVisualizer(micStream);
        }

        if (screenStream.getAudioTracks().length > 0) {
          tracks.push(screenStream.getAudioTracks()[0]);
        }

        combinedStream = new MediaStream(tracks);

        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopRecording();
        });

      } else {
        combinedStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedVideoId ? { exact: selectedVideoId } : undefined,
            width: constraintsWidth,
            height: constraintsHeight,
            frameRate: frameRate
          },
          audio: audioEnabled ? {
            deviceId: selectedAudioId ? { exact: selectedAudioId } : undefined,
            echoCancellation: true,
            noiseSuppression: true
          } : false
        });

        if (audioEnabled && combinedStream.getAudioTracks().length > 0) {
          setupVisualizer(combinedStream);
        }
      }

      activeStreamRef.current = combinedStream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = combinedStream;
        videoElementRef.current.muted = true;
        videoElementRef.current.play().catch(e => console.error(e));
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const options = { mimeType };
      const recorder = new MediaRecorder(combinedStream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setRecorderStatus('stopped');
        stopMediaTracks();
        cleanupAudioVisualizer();
        clearInterval(timerIntervalRef.current);

        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setCurrentBlob(videoBlob);
        
        const blobUrl = URL.createObjectURL(videoBlob);
        setCurrentBlobUrl(blobUrl);

        setReviewVideoUrl(blobUrl);
        setReviewVideoTitle(`Recording ${new Date().toLocaleDateString()}`);
        setIsReviewOpen(true);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecorderStatus('recording');

      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to capture stream:', err);
      showAlert(`Could not start recording: ${err.message || err}`);
      setRecorderStatus('idle');
      if (captureSource === 'camera') setupCameraPreview();
    }
  };

  const setupVisualizer = (audioStream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;

      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawVisualizer();
    } catch (e) {
      console.warn('Could not initialize audio visualizer:', e);
    }
  };

  const drawVisualizer = () => {
    if (!visualizerCanvasRef.current || !analyserRef.current) return;

    const canvas = visualizerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;

    const renderFrame = () => {
      if (!analyserRef.current) return;
      animationFrameIdRef.current = requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#00f0ff');
      gradient.addColorStop(0.5, '#8a2be2');
      gradient.addColorStop(1, '#00f0ff');

      ctx.fillStyle = gradient;

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight - 4, barWidth - 2, barHeight + 4, 4);
        ctx.fill();
        x += barWidth;
      }
    };

    renderFrame();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderStatus('paused');
      clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderStatus('recording');
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Save recording logic (Handles local DB vs Cloud API dynamically)
  const handleSaveRecording = async (titleInput) => {
    if (!currentBlob) return;
    const savingTitle = titleInput.trim() || `Recording ${new Date().toLocaleString()}`;

    try {
      if (currentUser) {
        // 1. Upload file to Vercel API proxy
        setSharingStatus('uploading');
        setUploadProgress(0);
        setShareItemName(savingTitle);
        setIsShareOpen(true);
        setIsReviewOpen(false);

        const filename = `${savingTitle.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
        const uploadRes = await uploadVideo(currentBlob, filename, (pct) => {
          setUploadProgress(pct);
        });

        if (!uploadRes.success) throw new Error('Proxy upload failed');

        // 2. Save record details to Cloud database API
        const id = 'rec_' + Date.now();
        const res = await fetch('/api/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            title: savingTitle,
            mode: captureSource,
            duration: secondsElapsed,
            videoUrl: uploadRes.url
          })
        });

        const data = await res.json();
        if (data.success) {
          setIsShareOpen(false);
          showAlert('Recording uploaded and saved successfully to V-Screen Recorder Cloud Library!', 'success');
          
          setCurrentBlob(null);
          setCurrentBlobUrl('');
          setActiveTab('history');
          setLibraryType('cloud');
          setHistoryPage(1);
          loadHistory();
        } else {
          throw new Error(data.error || 'Failed to save record to Cloud database.');
        }

      } else {
        // Save locally to IndexedDB
        await saveRecording({
          blob: currentBlob,
          title: savingTitle,
          mode: captureSource,
          duration: secondsElapsed
        });

        setCurrentBlob(null);
        setCurrentBlobUrl('');
        setIsReviewOpen(false);
        checkLocalUnsynced();
        
        setActiveTab('history');
        setLibraryType('local');
        setHistoryPage(1);
        loadHistory();
      }
    } catch (err) {
      setIsShareOpen(false);
      showAlert('Error saving video: ' + err.message);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError('Email and password fields are required.');
      return;
    }

    try {
      const endpoint = authFormTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      const data = await res.json();

      if (data.success) {
        setAuthSuccess(authFormTab === 'login' ? 'Logged in successfully!' : 'Account registered successfully!');
        setCurrentUser(data.user);
        setAuthEmail('');
        setAuthPassword('');
        setLibraryType('cloud'); // Redirect view target
        checkLocalUnsynced();
        
        setTimeout(() => {
          setActiveTab('record');
          setAuthSuccess('');
        }, 1000);
      } else {
        setAuthError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError('Network error connecting to Vercel Auth proxy.');
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(null);
        setLibraryType('local');
        setActiveTab('home');
      }
    } catch (err) {
      showAlert('Sign out request failed.');
    }
  };

  // Action methods on History Items (Dynamic based on Local vs Cloud mode)
  const handlePlayRecording = async (id, title, videoUrl) => {
    if (libraryType === 'cloud' && videoUrl) {
      setReviewVideoUrl(videoUrl);
      setReviewVideoTitle(title);
      setIsReviewOpen(true);
    } else {
      try {
        const blob = await getRecordingBlob(id);
        const url = URL.createObjectURL(blob);
        setReviewVideoUrl(url);
        setReviewVideoTitle(title);
        setIsReviewOpen(true);
      } catch (e) {
        showAlert(e.message);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    const confirmed = await requestConfirmation({
      title: 'Delete recording?',
      message: 'This recording will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete recording',
      destructive: true
    });

    if (confirmed) {
      try {
        if (libraryType === 'cloud') {
          const res = await fetch(`/api/recordings?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
        } else {
          await deleteRecording(id);
          checkLocalUnsynced();
        }
        loadHistory();
      } catch (err) {
        showAlert(err.message);
      }
    }
  };

  const handleDownloadItem = async (id, title, videoUrl) => {
    try {
      if (libraryType === 'cloud' && videoUrl) {
        // Direct download file link
        const a = document.createElement('a');
        a.href = videoUrl;
        a.target = '_blank';
        a.download = `${title.replace(/\s+/g, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const blob = await getRecordingBlob(id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (e) {
      showAlert('Download failed: ' + e.message);
    }
  };

  const handleUploadClick = async (id, title, videoUrl) => {
    if (libraryType === 'cloud' && videoUrl) {
      setShareItemName(title);
      setShareLink(videoUrl);
      setShareViewLink(videoUrl.replace('/dl/', '/'));
      setSharingStatus('success');
      setIsShareOpen(true);
      return;
    }

    try {
      setShareItemName(title);
      setSharingStatus('uploading');
      setUploadProgress(0);
      setShareLink('');
      setShareViewLink('');
      setIsShareOpen(true);

      const blob = await getRecordingBlob(id);
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;

      const uploadRes = await uploadVideo(blob, filename, (pct) => {
        setUploadProgress(pct);
      });

      if (uploadRes.success) {
        setShareLink(uploadRes.url); 
        setShareViewLink(uploadRes.viewUrl); 
        setSharingStatus('success');
      } else {
        setSharingStatus('error');
        setShareErrorMsg('Server returned unsuccessful response.');
      }
    } catch (err) {
      setSharingStatus('error');
      if (err.message.includes('404')) {
        setShareErrorMsg('Proxy Serverless Endpoint Not Found (Status 404).\n\nNOTE: Vercel serverless function routes (/api/share) do not execute natively inside the standard "vite" local dev server. They will function correctly once deployed on Vercel, or when run locally using the "vercel dev" CLI utility.');
      } else {
        setShareErrorMsg(err.message || 'An error occurred during upload.');
      }
    }
  };

  const startEditing = (id, currentTitle) => {
    setEditingId(id);
    setEditingTitleVal(currentTitle);
  };

  const saveEditedTitle = async (id) => {
    if (!editingTitleVal.trim()) return;
    try {
      if (libraryType === 'cloud') {
        const res = await fetch('/api/recordings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, title: editingTitleVal })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        await updateRecordingTitle(id, editingTitleVal.trim());
      }
      setEditingId(null);
      loadHistory();
    } catch (err) {
      showAlert(err.message);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Link copied to clipboard!', 'success');
    } catch (err) {
      showAlert('Could not copy the link. Please copy it manually.');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Navigation Header */}
      <header className="site-header">
        <div className="header-container">
          <div onClick={() => handleTabChange('home')} className="logo-link">
            <LogoIcon />
            <span className="logo-name">V-Screen<span className="logo-accent"> Recorder</span></span>
          </div>

          <nav className="nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => handleTabChange('home')} 
              className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            {currentUser && (
              <>
                <button 
                  onClick={() => handleTabChange('record')} 
                  className={`nav-tab-btn ${activeTab === 'record' ? 'active' : ''}`}
                >
                  Recorder
                </button>
                <button 
                  onClick={() => handleTabChange('history')} 
                  className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                >
                  Library
                </button>
              </>
            )}

            {/* Profile or Sign In button */}
            {authLoading ? (
              <span style={{ fontSize: '12px', opacity: 0.5 }}>Checking...</span>
            ) : currentUser ? (
              <div className="user-badge">
                <span className="user-badge-email">{currentUser.email}</span>
                <button onClick={handleSignOut} className="user-badge-signout">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={() => handleTabChange('auth')} 
                className={`nav-tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Top Local-to-Cloud Sync Banner */}
      {currentUser && localUnsyncedCount > 0 && activeTab !== 'auth' && (
        <div className="main-content" style={{ paddingBottom: 0, paddingTop: '24px' }}>
          <div className="sync-banner">
            <div className="sync-banner-text">
              <SyncIcon style={{ marginRight: '8px', color: 'var(--cyan)' }} />
              <span>You have <strong>{localUnsyncedCount}</strong> recording(s) stored locally in this browser. <strong>Sync to Cloud</strong> to access them on any device securely.</span>
            </div>
            <button 
              onClick={handleCloudSync} 
              disabled={isSyncing}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              {isSyncing ? `Syncing (${syncProgress}%)` : 'Sync to Cloud Library'}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="main-content">
        
        {/* ==================== TAB: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="fade-in">
            <section className="hero-section">
              <h1 className="hero-title">Record Screen & Webcam Directly in the Browser</h1>
              <p className="hero-subtitle">
                A secure, premium, zero-install screen capture utility. Capture system audio, microphones, and webcams, saving output to the cloud database or offline device sandbox.
              </p>
              {currentUser ? (
                <div className="hero-ctas">
                  <button onClick={() => handleTabChange('record')} className="btn btn-primary btn-pulse">
                    <ScreenIcon />
                    <span>Start Recording Free</span>
                  </button>
                  <button onClick={() => handleTabChange('history')} className="btn btn-secondary">
                    <FolderIcon />
                    <span>View Saved Library</span>
                  </button>
                </div>
              ) : (
                <div className="hero-ctas">
                  <button 
                    onClick={() => { setAuthFormTab('signup'); setActiveTab('auth'); }} 
                    className="btn btn-primary btn-pulse"
                  >
                    <UserPlusIcon />
                    <span>Create Free Account</span>
                  </button>
                  <button 
                    onClick={() => { setAuthFormTab('login'); setActiveTab('auth'); }} 
                    className="btn btn-secondary"
                  >
                    <LoginIcon />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </section>

            {/* Core Features */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-container"><ScreenIcon /></div>
                <h3 className="feature-title">Flexible Capture Modes</h3>
                <p className="feature-desc">Choose between recording your full browser screen, specific windows, webcams, or merging both into a combined track.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-container"><MicIcon /></div>
                <h3 className="feature-title">System Audio Mixing</h3>
                <p className="feature-desc">Blend microphone speech and computer system sound output simultaneously into a single synchronized audio track.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-container"><LockIcon /></div>
                <h3 className="feature-title">Secure Cookie Sessions</h3>
                <p className="feature-desc">Access account profiles via HTTPS-secure HttpOnly cookies. Your authentication tokens remain invisible to XSS browser scripts.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-container"><DatabaseIcon /></div>
                <h3 className="feature-title">Sync Cloud Library</h3>
                <p className="feature-desc">Sign up to sync your captures to the cloud database. Retain, rename, play, and share videos from any machine.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-container"><LinkIcon /></div>
                <h3 className="feature-title">Hidden Proxy Share Links</h3>
                <p className="feature-desc">Generate view links securely. The browser uploads media through a secure Vercel API proxy that completely masks serverless storage details.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-container"><BoltIcon /></div>
                <h3 className="feature-title">Zero Installation Required</h3>
                <p className="feature-desc">No extension, wrapper, or desktop application needed. Works natively in Chrome, Edge, and Firefox browsers in one tap.</p>
              </div>
            </div>

            {/* Spec capabilities section */}
            <section className="specs-section">
              <div className="specs-grid">
                <div className="specs-column">
                  <h3>System Compatibility</h3>
                  <table className="spec-table">
                    <tbody>
                      <tr>
                        <td className="lbl">Browser Support</td>
                        <td className="val">Chrome, Edge, Firefox, Opera</td>
                      </tr>
                      <tr>
                        <td className="lbl">OS Support</td>
                        <td className="val">macOS, Windows, Linux, ChromeOS</td>
                      </tr>
                      <tr>
                        <td className="lbl">Mobile Support</td>
                        <td className="val">Webcam Only (Screen Share Limited by OS)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="specs-column">
                  <h3>Recording Performance</h3>
                  <table className="spec-table">
                    <tbody>
                      <tr>
                        <td className="lbl">Resolution</td>
                        <td className="val">Up to 1080p Full HD</td>
                      </tr>
                      <tr>
                        <td className="lbl">Framerate Limit</td>
                        <td className="val">60 FPS (Hardware Dependent)</td>
                      </tr>
                      <tr>
                        <td className="lbl">Output Format</td>
                        <td className="val">WebM (VP9/VP8 Video, Opus Audio)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Dynamic FAQ */}
            <section className="faq-section">
              <h2 className="faq-title">Frequently Asked Questions</h2>
              <div className="faq-list">
                {[
                  {
                    q: "Is there a limit to how long my screen recording can be?",
                    a: "No! Since the video is saved locally in your browser's IndexedDB database, the duration is only limited by your device's free hard disk space. You can record for hours without issues."
                  },
                  {
                    q: "How does the browser-side storage database work?",
                    a: "We utilize IndexedDB, a database running locally inside your browser sandbox. It saves the raw video binary data. This data is private to you and persists even if you reload the browser tab or restart your computer."
                  },
                  {
                    q: "How secure is the user login / authentication?",
                    a: "We route authentication through secure HTTPS. Unlike basic apps that save JWT tokens inside local storage, we issue HTTP-Only cookies. JavaScript cannot access HTTP-Only cookies, rendering your session safe from malicious browser scripts (XSS)."
                  },
                  {
                    q: "Can I record screen sharing and webcam at the same time?",
                    a: "Modern web standard APIs let us capture screen inputs or webcam inputs. To combine them side-by-side or picture-in-picture, look out for future versions that layer canvas tracks. Currently, you can toggle between Screen and Camera inputs with mixed microphone tracks."
                  }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="faq-question"
                    >
                      <span>{item.q}</span>
                      <span className="faq-icon">+</span>
                    </button>
                    <div className="faq-answer">
                      <div className="faq-answer-inner">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB: RECORDER ==================== */}
        {activeTab === 'record' && (
          <div className="fade-in">
            <div className="recorder-layout">
              
              {/* Left Column: Viewport Video Preview */}
              <div className="viewport-card">
                
                {/* Floating Badges */}
                <div className="floating-overlay">
                  {(recorderStatus === 'recording' || recorderStatus === 'paused') && (
                    <div className="live-badge">
                      <span className="live-dot"></span>
                      <span>Live</span>
                    </div>
                  )}
                  {recorderStatus === 'paused' && (
                    <div className="paused-badge">Paused</div>
                  )}
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    {recorderStatus !== 'idle' && recorderStatus !== 'preparing' && (
                      <>
                        {captureSource === 'screen' ? <ScreenIcon /> : <CameraIcon />}
                        <span>{captureSource.toUpperCase()}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Main Video Element */}
                <video 
                  ref={videoElementRef} 
                  className="live-video"
                  autoPlay 
                  playsInline 
                  muted
                  style={{ display: (captureSource === 'camera' || recorderStatus === 'recording') ? 'block' : 'none' }}
                />

                {/* Pre-recording Placeholders */}
                {captureSource === 'screen' && recorderStatus === 'idle' && (
                  <div className="viewport-placeholder">
                    <div className="placeholder-icon-pulse"><ScreenIcon /></div>
                    <h3>Ready to Share Screen</h3>
                    <p>Click "Start Capture" below to select application window or desktop feed.</p>
                  </div>
                )}

                {captureSource === 'camera' && recorderStatus === 'idle' && !videoElementRef.current?.srcObject && (
                  <div className="viewport-placeholder">
                    <div className="placeholder-icon-pulse"><CameraIcon /></div>
                    <h3>Webcam Preview</h3>
                    <p>Permit webcam access to position yourself before recording.</p>
                  </div>
                )}

                {recorderStatus === 'preparing' && (
                  <div className="viewport-placeholder">
                    <div className="progress-spinner"></div>
                    <h3>Requesting System Permissions...</h3>
                    <p>Select the screen or window you want to record in the browser dialog.</p>
                  </div>
                )}

                {/* Audio Level Canvas Overlay */}
                {(recorderStatus === 'recording' || recorderStatus === 'paused') && audioEnabled && (
                  <div className="visualizer-overlay">
                    <canvas ref={visualizerCanvasRef} className="visualizer-canvas" width="600" height="60" />
                  </div>
                )}
              </div>

              {/* Right Column: Controls Panel */}
              <div className="controls-card">
                <h4 className="dashboard-title">Recording Panel</h4>

                <div className="status-row">
                  <span className="status-lbl">Engine State</span>
                  <span className={`status-val ${recorderStatus === 'recording' ? 'recording' : ''}`}>
                    {recorderStatus.toUpperCase()}
                  </span>
                </div>

                <div className={`timer-hero ${recorderStatus === 'recording' ? 'active' : ''}`}>
                  {formatTime(secondsElapsed)}
                </div>

                {recorderStatus === 'idle' && (
                  <>
                    <div className="control-group">
                      <label className="control-label">Capture Source</label>
                      <select 
                        value={captureSource} 
                        onChange={(e) => setCaptureSource(e.target.value)}
                        className="custom-select"
                      >
                        <option value="screen">💻 Screen & Window Share</option>
                        <option value="camera">📷 Webcam Capture</option>
                      </select>
                    </div>

                    {captureSource === 'camera' && videoDevices.length > 0 && (
                      <div className="control-group">
                        <label className="control-label">Select Webcam</label>
                        <select 
                          value={selectedVideoId} 
                          onChange={(e) => setSelectedVideoId(e.target.value)}
                          className="custom-select"
                        >
                          {videoDevices.map(d => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Camera ${d.deviceId.substr(0, 5)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="control-group">
                      <div className="toggle-row">
                        <span className="control-label">Enable Voice Microphone</span>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={audioEnabled}
                            onChange={(e) => setAudioEnabled(e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    {audioEnabled && audioDevices.length > 0 && (
                      <div className="control-group" style={{ marginTop: '-8px' }}>
                        <select 
                          value={selectedAudioId} 
                          onChange={(e) => setSelectedAudioId(e.target.value)}
                          className="custom-select"
                        >
                          {audioDevices.map(d => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Microphone ${d.deviceId.substr(0, 5)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {captureSource === 'screen' && (
                      <div className="control-group">
                        <div className="toggle-row">
                          <span className="control-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span>Include System Audio</span>
                            <span style={{ fontSize: '10px', textTransform: 'none', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                              Mix audio from videos/tabs (where supported)
                            </span>
                          </span>
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={systemAudioEnabled}
                              onChange={(e) => setSystemAudioEnabled(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="control-group">
                      <label className="control-label">Max Quality Target</label>
                      <select 
                        value={resolution} 
                        onChange={(e) => setResolution(e.target.value)}
                        className="custom-select"
                      >
                        <option value="1080p">1080p (Full HD)</option>
                        <option value="720p">720p (HD)</option>
                        <option value="480p">480p (SD)</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label className="control-label">Framerate (FPS)</label>
                      <select 
                        value={frameRate} 
                        onChange={(e) => setFrameRate(Number(e.target.value))}
                        className="custom-select"
                      >
                        <option value={60}>60 FPS (Super Smooth)</option>
                        <option value={30}>30 FPS (Standard Web)</option>
                        <option value={15}>15 FPS (Static / Low Bandwidth)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="buttons-deck">
                  {recorderStatus === 'idle' && (
                    <button onClick={startRecording} className="btn btn-primary btn-pulse" style={{ height: '50px' }}>
                      <RecordIcon />
                      <span>Start Capture Session</span>
                    </button>
                  )}

                  {recorderStatus === 'recording' && (
                    <>
                      <div className="btn-row">
                        <button onClick={pauseRecording} className="btn btn-secondary" style={{ flex: 1 }}>
                          <PauseIcon />
                          <span>Pause</span>
                        </button>
                        <button onClick={stopRecording} className="btn btn-danger" style={{ flex: 1 }}>
                          <StopIcon />
                          <span>Stop & Export</span>
                        </button>
                      </div>
                    </>
                  )}

                  {recorderStatus === 'paused' && (
                    <>
                      <div className="btn-row">
                        <button onClick={resumeRecording} className="btn btn-primary" style={{ flex: 1 }}>
                          <PlayIcon />
                          <span>Resume</span>
                        </button>
                        <button onClick={stopRecording} className="btn btn-danger" style={{ flex: 1 }}>
                          <StopIcon />
                          <span>Stop & Export</span>
                        </button>
                      </div>
                    </>
                  )}

                  {recorderStatus === 'stopped' && (
                    <div className="progress-spinner" style={{ margin: '20px auto' }}></div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB: HISTORY/LIBRARY ==================== */}
        {activeTab === 'history' && (
          <div className="fade-in">
            <div className="history-title-row">
              <h2 className="history-heading">Saved Library</h2>
              
              {/* Library Scope Selector (Local Sandbox vs Cloud DB) */}
              {currentUser ? (
                <nav className="nav-tabs" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <button 
                    onClick={() => { setLibraryType('cloud'); setHistoryPage(1); }} 
                    className={`nav-tab-btn ${libraryType === 'cloud' ? 'active' : ''}`}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Cloud Database
                  </button>
                  <button 
                    onClick={() => { setLibraryType('local'); setHistoryPage(1); }} 
                    className={`nav-tab-btn ${libraryType === 'local' ? 'active' : ''}`}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Local Browser Sandbox
                  </button>
                </nav>
              ) : (
                <span className="badge badge-premium">Local Device Sandbox</span>
              )}
            </div>

            {/* Sync reminder banner in local tab when user is logged in */}
            {currentUser && libraryType === 'local' && localUnsyncedCount > 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '-10px 0 20px 0' }}>
                You are viewing files stored on this browser. Click "Sync to Cloud" in the header to save them permanently to your account database.
              </p>
            )}

            <div className="filter-card">
              <div className="control-group">
                <label className="control-label">Search Recordings</label>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setHistoryPage(1); }}
                  placeholder="Filter by keyword..."
                  className="custom-input"
                />
              </div>
              <div className="control-group">
                <label className="control-label">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setHistoryPage(1); }}
                  className="custom-input"
                />
              </div>
              <div className="control-group">
                <label className="control-label">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setHistoryPage(1); }}
                  className="custom-input"
                />
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); setHistoryPage(1); }}
                className="btn btn-secondary"
                style={{ height: '46px' }}
              >
                Reset Filters
              </button>
            </div>

            {historyItems.length > 0 ? (
              <>
                <div className="recordings-list">
                  {historyItems.map((item) => (
                    <div key={item.id} className="recording-row">
                      
                      <div className={`rec-type-badge ${item.mode}`}>
                        {item.mode === 'screen' ? <ScreenIcon /> : <CameraIcon />}
                      </div>

                      <div className="rec-info">
                        {editingId === item.id ? (
                          <div className="rec-title-edit-container">
                            <input 
                              type="text" 
                              value={editingTitleVal}
                              onChange={(e) => setEditingTitleVal(e.target.value)}
                              className="rec-title-input"
                              onKeyDown={(e) => e.key === 'Enter' && saveEditedTitle(item.id)}
                              autoFocus
                            />
                            <button onClick={() => saveEditedTitle(item.id)} className="btn btn-primary btn-icon-only" style={{ width: '30px', height: '30px' }}>✓</button>
                            <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-icon-only" style={{ width: '30px', height: '30px' }}>✗</button>
                          </div>
                        ) : (
                          <div className="rec-title-edit-container">
                            <span className="rec-title-text">{item.title}</span>
                            <button 
                              onClick={() => startEditing(item.id, item.title)} 
                              className="btn btn-secondary btn-icon-only" 
                              style={{ width: '26px', height: '26px', background: 'transparent', border: 'none' }}
                              title="Rename"
                            >
                              <PencilIcon />
                            </button>
                          </div>
                        )}
                        
                        <div className="rec-meta">
                          <span className="rec-meta-item">
                            <CalendarIcon />
                            <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          <span className="rec-meta-item">
                            <GearIcon />
                            <span>{item.mode === 'screen' ? 'Screen Share' : 'Webcam'}</span>
                          </span>
                          {libraryType === 'cloud' && (
                            <span className="rec-meta-item" style={{ color: 'var(--cyan)' }}>
                              ☁️ Cloud Stored
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rec-duration">
                        {formatTime(item.duration)}
                      </div>

                      <div className="rec-actions">
                        <button 
                          onClick={() => handlePlayRecording(item.id, item.title, item.videoUrl)} 
                          className="btn btn-primary btn-icon-only"
                          title="Play & Review"
                        >
                          <PlayIcon />
                        </button>
                        <button 
                          onClick={() => handleDownloadItem(item.id, item.title, item.videoUrl)} 
                          className="btn btn-secondary btn-icon-only"
                          title="Download File"
                        >
                          <DownloadIcon />
                        </button>
                        <button 
                          onClick={() => handleUploadClick(item.id, item.title, item.videoUrl)} 
                          className="btn btn-secondary btn-icon-only"
                          style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
                          title="Generate Share Link"
                        >
                          <ShareIcon />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="btn btn-danger btn-icon-only"
                          title="Delete Recording"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {historyTotal > historyPageSize && (
                  <div className="pagination-row">
                    <span className="pagination-info">
                      Showing {Math.min(historyTotal, (historyPage - 1) * historyPageSize + 1)} - {Math.min(historyTotal, historyPage * historyPageSize)} of {historyTotal}
                    </span>
                    <button 
                      onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))} 
                      disabled={historyPage === 1}
                      className="pagination-btn"
                    >
                      «
                    </button>
                    {Array.from({ length: Math.ceil(historyTotal / historyPageSize) }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setHistoryPage(i + 1)}
                        className={`pagination-btn ${historyPage === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setHistoryPage(prev => Math.min(Math.ceil(historyTotal / historyPageSize), prev + 1))} 
                      disabled={historyPage === Math.ceil(historyTotal / historyPageSize)}
                      className="pagination-btn"
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-history">
                <div className="empty-icon"><FolderIcon /></div>
                <h3>No Recordings Found</h3>
                <p>
                  {libraryType === 'cloud' 
                    ? 'Your Cloud database library is empty. Record a new session while logged in to sync it to the cloud!'
                    : 'Your local browser sandboxed storage is empty. Record your first video to start building your library.'}
                </p>
                <button onClick={() => handleTabChange('record')} className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Open Recorder
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: AUTH (Login/Signup) ==================== */}
        {activeTab === 'auth' && (
          <div className="fade-in auth-layout">
            <div className="auth-card">
              <div className="auth-header">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <LogoIcon />
                </div>
                <h3 className="auth-title">
                  {authFormTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="auth-subtitle">
                  {authFormTab === 'login' 
                    ? 'Log in to securely sync and check existing recordings.' 
                    : 'Register an account for secure cloud-database recording history.'}
                </p>
              </div>

              {/* Secure Auth Toggle Tab */}
              <div className="auth-tabs-toggle">
                <button 
                  onClick={() => { setAuthFormTab('login'); setAuthError(''); setAuthSuccess(''); }}
                  className={`auth-tab-choice ${authFormTab === 'login' ? 'active' : ''}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthFormTab('signup'); setAuthError(''); setAuthSuccess(''); }}
                  className={`auth-tab-choice ${authFormTab === 'signup' ? 'active' : ''}`}
                >
                  Register
                </button>
              </div>

              {/* Status Alert Panels */}
              {authError && (
                <div className="auth-alert-error">
                  <WarningIcon />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="auth-alert-success">
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleAuthSubmit} className="auth-form">
                <div className="control-group">
                  <label className="control-label">Email Address</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="custom-input"
                    required
                  />
                </div>

                <div className="control-group">
                  <label className="control-label">Password</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="custom-input"
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ height: '48px', marginTop: '8px' }}>
                  <LockIcon />
                  <span>{authFormTab === 'login' ? 'Secure Sign In' : 'Create Secure Profile'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-logo">
            <LogoIcon />
            <span>V-Screen Recorder</span>
          </div>
          <span>&copy; {new Date().getFullYear()} V-Screen Recorder. Secure browser recording client.</span>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('home'); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('record'); }}>Recorder</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('history'); }}>Library</a>
          </div>
        </div>
      </footer>

      {/* ==================== CUSTOM ALERT DIALOG ==================== */}
      {customAlert && (
        <div className="custom-alert-overlay" onClick={() => setCustomAlert(null)}>
          <div
            className={`custom-alert-box ${customAlert.type}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="custom-alert-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-alert-icon" aria-hidden="true">
              {customAlert.type === 'success' ? <CheckIcon /> : <WarningIcon />}
            </div>
            <div className="custom-alert-content">
              <h3 id="custom-alert-title">{customAlert.title}</h3>
              <p>{customAlert.message}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary custom-alert-action"
              onClick={() => setCustomAlert(null)}
              autoFocus
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ==================== CUSTOM CONFIRM DIALOG ==================== */}
      {customConfirm && (
        <div className="custom-alert-overlay" onClick={() => closeConfirmation(false)}>
          <div
            className={`custom-alert-box confirm ${customConfirm.destructive ? 'destructive' : ''}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="custom-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-alert-icon" aria-hidden="true">
              <WarningIcon />
            </div>
            <div className="custom-alert-content">
              <h3 id="custom-confirm-title">{customConfirm.title}</h3>
              <p>{customConfirm.message}</p>
            </div>
            <div className="custom-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => closeConfirmation(false)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${customConfirm.destructive ? 'custom-alert-destructive' : 'btn-primary'}`}
                onClick={() => closeConfirmation(true)}
              >
                {customConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PLAYBACK REVIEW ==================== */}
      {isReviewOpen && (
        <div className="modal-overlay" onClick={() => { setIsReviewOpen(false); setReviewVideoUrl(''); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{reviewVideoTitle}</h3>
              <button 
                onClick={() => { setIsReviewOpen(false); setReviewVideoUrl(''); }} 
                className="modal-close-btn"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-video-container">
                <video 
                  src={reviewVideoUrl} 
                  controls 
                  autoPlay 
                  className="modal-video"
                />
              </div>

              {currentBlobUrl && reviewVideoUrl === currentBlobUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="control-group">
                    <label className="control-label">Save Title</label>
                    <input 
                      type="text" 
                      value={reviewVideoTitle}
                      onChange={(e) => setReviewVideoTitle(e.target.value)}
                      placeholder="Give your recording a name..."
                      className="custom-input"
                    />
                  </div>
                  <div className="btn-row" style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => handleSaveRecording(reviewVideoTitle)} 
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                    >
                      {currentUser ? '☁️ Upload to Cloud Library' : '💾 Save to Local Library'}
                    </button>
                    <button 
                      onClick={async () => {
                        const a = document.createElement('a');
                        a.href = currentBlobUrl;
                        a.download = `${reviewVideoTitle.replace(/\s+/g, '_')}_${Date.now()}.webm`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }} 
                      className="btn btn-secondary"
                    >
                      <DownloadIcon />
                      <span>Direct Download WebM</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    onClick={() => { setIsReviewOpen(false); setReviewVideoUrl(''); }} 
                    className="btn btn-secondary"
                  >
                    Close Player
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GENERATE & SHOW SHARE LINK ==================== */}
      {isShareOpen && (
        <div className="modal-overlay" onClick={() => { if (sharingStatus !== 'uploading') setIsShareOpen(false); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Share Recording Link</h3>
              {sharingStatus !== 'uploading' && (
                <button onClick={() => setIsShareOpen(false)} className="modal-close-btn">
                  <CloseIcon />
                </button>
              )}
            </div>
            <div className="modal-body">
              
              {/* UPLOADING STATE */}
              {sharingStatus === 'uploading' && (
                <div className="sharing-progress-box">
                  <div className="progress-spinner"></div>
                  <div className="progress-pct">{uploadProgress}%</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Uploading "{shareItemName}" through Vercel API proxy...
                  </p>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>
                    Do not close this tab. The API serverless function is writing chunk packets.
                  </p>
                </div>
              )}

              {/* SUCCESS STATE */}
              {sharingStatus === 'success' && (
                <div className="share-success-box">
                  <div className="share-success-icon">
                    <CheckIcon />
                  </div>
                  <h4 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>Video Link Generated!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '-10px' }}>
                    Upload complete. Anyone with these links can access this recording. Links expire automatically in 1 hour.
                  </p>
                  
                  <div className="control-group" style={{ marginTop: '10px' }}>
                    <label className="control-label">Video Page Link (Player & Download)</label>
                    <div className="share-link-input-group">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareViewLink} 
                        className="custom-input" 
                        onClick={(e) => e.target.select()}
                      />
                      <button onClick={() => copyToClipboard(shareViewLink)} className="btn btn-primary">
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label className="control-label">Raw Media Direct Link (VLC/External Player)</label>
                    <div className="share-link-input-group">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareLink} 
                        className="custom-input"
                        onClick={(e) => e.target.select()}
                      />
                      <button onClick={() => copyToClipboard(shareLink)} className="btn btn-secondary">
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="btn-row" style={{ marginTop: '16px' }}>
                    <a 
                      href={shareViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      🌐 Open View Page
                    </a>
                    <button onClick={() => setIsShareOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR STATE */}
              {sharingStatus === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <WarningIcon />
                  </div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>Share Generation Failed</h4>
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {shareErrorMsg}
                  </p>
                  <button onClick={() => setIsShareOpen(false)} className="btn btn-secondary" style={{ marginTop: '10px', width: '100%' }}>
                    Close Window
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
