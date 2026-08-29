import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Download, PlusCircle, Send, Bot, Loader2, Volume2, Star, MessageSquare } from 'lucide-react';
import { api, friendlyMessage, ApiError } from '../../services/api';
import { useError } from '../../context/ErrorContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function renderRichText(text) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function FeedbackWidget({ audioId, userId, userRole, isDark }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    if (!audioId || !userId) return;
    api.get(`/api/feedbacks/audio/${audioId}`)
      .then(res => {
        if (res.feedbackId) {
          setRating(res.rating);
          setComment(res.comment || '');
          setIsSaved(true);
        }
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 404) return; // no feedback yet, perfectly fine
        console.error('[FeedbackWidget] Failed to load feedback:', err);
        showError(friendlyMessage(err), 'error');
      });
  }, [audioId, userId]);

  const handleSubmit = async () => {
    if (rating === 0 || isSaved) return; // feedback can only be submitted once
    setIsSubmitting(true);
    try {
      const payload = {
        rating,
        comment,
        registeredUser: { userId },
        audio: { audioId }
      };

      await api.post('/api/feedbacks', payload);
      showError('Thank you for your feedback!', 'success', { duration: 2000 });
      setIsSaved(true);
      setIsExpanded(false);
    } catch (err) {
      console.error('[FeedbackWidget] Failed to save feedback:', err);
      showError(friendlyMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId || userRole === 'GUEST') return null; // Guest users can't leave feedback

  const isEditing = !isSaved && (isExpanded || rating > 0);

  return (
    <div style={{
      marginTop: 10,
      display: 'inline-block',
      width: isEditing ? 280 : 'auto',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 12,
      padding: '8px 10px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              disabled={isSaved}
              onMouseEnter={() => !isSaved && setHoverRating(star)}
              onMouseLeave={() => !isSaved && setHoverRating(0)}
              onClick={() => {
                if (isSaved) return;
                setRating(star);
                setIsExpanded(true);
              }}
              style={{
                background: 'none', border: 'none', cursor: isSaved ? 'default' : 'pointer', padding: 2,
                color: (hoverRating || rating) >= star ? '#fbbf24' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
                transition: 'color 0.2s, transform 0.1s',
                transform: hoverRating === star ? 'scale(1.15)' : 'scale(1)'
              }}
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star size={18} fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {isEditing && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ position: 'relative' }}>
            <MessageSquare size={14} style={{ position: 'absolute', top: 10, left: 10, color: isDark ? '#9ca3af' : '#6b7280' }} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about this response... (optional)"
              style={{
                width: '100%',
                background: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 8,
                padding: '8px 12px 8px 32px',
                color: isDark ? '#f3f4f6' : '#1f2937',
                fontSize: 13,
                resize: 'none',
                minHeight: 50,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => setRating(0)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              style={{
                background: isSubmitting ? (isDark ? '#374151' : '#e5e7eb') : '#0ea5e9',
                color: isSubmitting ? (isDark ? '#9ca3af' : '#9ca3af') : '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: isSubmitting || rating === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AudioPlayer({ audioId, audioDuration, isDark, userId }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);

  const streamUrl = `${BASE_URL}/api/audios/${audioId}/stream`;

  // Fetch the audio as a Blob with Authorization header
  useEffect(() => {
    let objectUrl = null;
    const fetchAudio = async () => {
      try {
        const token = localStorage.getItem('voicelk_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(streamUrl, { headers });
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error('Audio fetch error:', err);
        setIsLoading(false); // Stop loading on error
      }
    };
    
    fetchAudio();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      
      // Apply user playback speed setting
      const savedSpeed = localStorage.getItem('vlk_playbackSpeed');
      if (savedSpeed) {
        audio.playbackRate = parseFloat(savedSpeed);
      }
      
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => { setIsLoading(false); setIsPlaying(false); };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, [blobUrl]); // re-bind when blobUrl changes

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const handleDownload = useCallback(() => {
    if (!blobUrl) return;

    // Log the download to the backend
    if (userId && audioId) {
      api.post('/api/download-logs', {
        user: { userId: userId },
        audio: { audioId: audioId }
      }).catch(err => console.warn('Failed to log download:', err));
    }

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `voicelk-audio-${audioId}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [blobUrl, audioId, userId]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Theme colors
  const colors = {
    bg: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    border: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    playBtnBg: isDark ? '#0ea5e9' : '#3b82f6',
    playBtnHover: isDark ? '#38bdf8' : '#2563eb',
    trackBg: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    trackFill: isDark ? '#0ea5e9' : '#3b82f6',
    timeText: isDark ? '#94a3b8' : '#6b7280',
    iconColor: isDark ? '#94a3b8' : '#6b7280',
    iconHover: isDark ? '#e2e8f0' : '#374151',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: colors.bg,
      borderRadius: 16,
      padding: '10px 14px',
      border: `1px solid ${colors.border}`,
      marginTop: 12,
      maxWidth: 420,
      transition: 'all 0.2s ease',
    }}>
      {blobUrl && <audio ref={audioRef} src={blobUrl} preload="metadata" />}

      {/* Play / Pause button */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: colors.playBtnBg,
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLoading ? 'wait' : 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s, transform 0.1s',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.playBtnHover;
          e.currentTarget.style.transform = 'scale(1.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.playBtnBg;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isLoading ? (
          <Loader2 size={16} color="#fff" strokeWidth={2.5} style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : isPlaying ? (
          <Pause size={16} color="#fff" fill="#fff" />
        ) : (
          <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
        )}
      </button>

      {/* Progress bar + time */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div
          ref={progressRef}
          onClick={handleSeek}
          style={{
            height: 6, background: colors.trackBg, borderRadius: 3,
            position: 'relative', cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: colors.trackFill,
            borderRadius: 3,
            transition: isPlaying ? 'none' : 'width 0.15s ease',
          }} />
          {/* Thumb indicator */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12,
            borderRadius: '50%',
            background: colors.trackFill,
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)'}`,
            opacity: isPlaying || progress > 0 ? 1 : 0,
            transition: 'opacity 0.15s',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: colors.timeText, fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        title="Download audio"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.iconColor, padding: 4,
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s, transform 0.1s',
          borderRadius: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.iconHover;
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.iconColor;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Download size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

function ThinkingBubble({ isDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      color: isDark ? '#94a3b8' : '#6b7280',
      fontSize: 14, fontStyle: 'italic',
    }}>
      <Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} />
      <span>Thinking...</span>
    </div>
  );
}

export default function ChatView({ t, isDark, initialMessage = '', initialHistoryItem = null, userData }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const initialSentRef = useRef(false);
  const { showError } = useError();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch audio metadata for an answer and update the message (with polling)
  const fetchAudioForMessage = useCallback((msgId, answerId, attempt = 1) => {
    if (!answerId) return;
    
    // Stop polling after 15 attempts (45 seconds)
    if (attempt > 15) {
      setMessages(prev => prev.map(msg =>
        msg.id === msgId ? { ...msg, isAudioLoading: false } : msg
      ));
      return;
    }

    api.get(`/api/audios/answer/${answerId}`)
      .then(audio => {
        if (audio && audio.audioId) {
          setMessages(prev => prev.map(msg =>
            msg.id === msgId
              ? { ...msg, audioId: audio.audioId, audioDuration: audio.duration, isAudioLoading: false }
              : msg
          ));
        }
      })
      .catch(err => {
        if (err?.status === 404) {
          // Audio not ready yet, poll again in 3 seconds
          setTimeout(() => fetchAudioForMessage(msgId, answerId, attempt + 1), 3000);
        } else {
          console.warn('[ChatView] Failed to fetch audio for answer:', answerId, err);
          setMessages(prev => prev.map(msg =>
            msg.id === msgId ? { ...msg, isAudioLoading: false } : msg
          ));
        }
      });
  }, []);

  const sendToBackend = async (text) => {
    // Add a "thinking" placeholder
    const thinkingId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: thinkingId,
      type: 'ai',
      content: '',
      isThinking: true,
    }]);

    try {
      console.log('[ChatView] Sending to /api/ask:', { inputText: text, syllabusTopic: '', userId: userData?.userId || '' });
      const data = await api.post('/api/ask', {
        inputText: text,
        syllabusTopic: '',
        userId: userData?.userId || '',
      });
      console.log('[ChatView] Response:', data);

      // Replace thinking bubble with real response
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? {
              ...msg,
              content: data.responseText || 'No response received.',
              isThinking: false,
              answerId: data.answerId,
              audioId: data.audioId || null,
              audioDuration: data.audioDuration || null,
              isAudioLoading: !data.audioId && data.answerId ? true : false,
            }
          : msg
      ));

      // If the backend didn't return audioId directly, try fetching it
      if (!data.audioId && data.answerId) {
        fetchAudioForMessage(thinkingId, data.answerId);
      }
    } catch (err) {
      console.error('[ChatView] Error:', err);
      showError(friendlyMessage(err), 'error');
      // Replace thinking bubble with a brief inline note
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, content: 'Something went wrong. Please try again.', isThinking: false, isError: true }
          : msg
      ));
    }
  };

  useEffect(() => {
    if (initialHistoryItem && !initialSentRef.current) {
      initialSentRef.current = true;
      const userMsgId = Date.now();
      const aiMsgId = Date.now() + 1;
      const msgs = [];
      msgs.push({ id: userMsgId, type: 'user', content: initialHistoryItem.content });
      if (initialHistoryItem.responseText) {
        const aiMsg = {
          id: aiMsgId,
          type: 'ai',
          content: initialHistoryItem.responseText,
          answerId: initialHistoryItem.answerId || null,
          audioId: initialHistoryItem.audioId || null,
          audioDuration: initialHistoryItem.audioDuration || null,
          isAudioLoading: !initialHistoryItem.audioId && initialHistoryItem.answerId ? true : false,
        };
        msgs.push(aiMsg);

        // If we have an answerId but no audioId, try fetching audio
        if (!initialHistoryItem.audioId && initialHistoryItem.answerId) {
          // Fetch after state update
          setTimeout(() => fetchAudioForMessage(aiMsgId, initialHistoryItem.answerId), 100);
        }
      }
      setMessages(msgs);
    } else if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      const userMsg = { id: Date.now(), type: 'user', content: initialMessage };
      setMessages([userMsg]);
      sendToBackend(initialMessage);
    }
  }, [initialMessage, initialHistoryItem]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;
    
    const text = inputVal.trim();
    const newUserMsg = { id: Date.now(), type: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsSending(true);

    await sendToBackend(text);
    setIsSending(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', 
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              {msg.type === 'ai' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginRight: 12, marginTop: 4
                }}>
                  <Bot size={18} color="#ffffff" />
                </div>
              )}
              
              <div style={{
                maxWidth: '90%',
                background: msg.type === 'user' ? (isDark ? '#1e293b' : '#f3f4f6') : 'transparent',
                color: msg.isError
                  ? (isDark ? '#fca5a5' : '#dc2626')
                  : msg.type === 'user'
                    ? (isDark ? '#f8fafc' : '#111827')
                    : (isDark ? '#f1f5f9' : '#1f2937'),
                padding: msg.type === 'user' ? '10px 16px' : '0',
                borderRadius: msg.type === 'user' ? 20 : 0,
                fontSize: 14.5,
                lineHeight: 1.6,
                fontWeight: msg.type === 'user' ? 500 : 400
              }}>
                {msg.isThinking ? (
                  <ThinkingBubble isDark={isDark} />
                ) : (
                  renderRichText(msg.content)
                )}
                
                {msg.isAudioLoading && !msg.audioId && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                    borderRadius: 16, padding: '10px 14px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                    marginTop: 12, maxWidth: 420, color: isDark ? '#94a3b8' : '#6b7280', fontSize: 13
                  }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating audio...
                  </div>
                )}
                
                {msg.audioId && (
                  <>
                    <AudioPlayer
                      audioId={msg.audioId}
                      audioDuration={msg.audioDuration}
                      isDark={isDark}
                      userId={userData?.userId}
                    />
                    <FeedbackWidget
                      audioId={msg.audioId}
                      userId={userData?.userId}
                      userRole={userData?.role}
                      isDark={isDark}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px',
        background: `linear-gradient(to bottom, transparent, ${t.pageBg} 20%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
      }}>
        <form
          onSubmit={handleSend}
          style={{
            width: '100%', maxWidth: 760,
            display: 'flex', alignItems: 'center', gap: 12,
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
            borderRadius: 9999,
            padding: '10px 12px 10px 16px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <button
            type="button"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center'
            }}
          >
            <PlusCircle size={22} strokeWidth={2} />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a topic or paste text to generate Sinhala audio..."
            disabled={isSending}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: isDark ? '#f8fafc' : '#111827', fontFamily: 'inherit',
              opacity: isSending ? 0.6 : 1,
            }}
          />

          <button
            type="submit"
            disabled={isSending || !inputVal.trim()}
            style={{
              background: 'none', border: 'none',
              cursor: (inputVal.trim() && !isSending) ? 'pointer' : 'default',
              color: (inputVal.trim() && !isSending) ? '#3b82f6' : '#9ca3af', padding: 0,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s, transform 0.1s',
              transform: (inputVal.trim() && !isSending) ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </form>

        <p style={{
          margin: 0, fontSize: 12, textAlign: 'center',
          color: isDark ? '#64748b' : '#9ca3af'
        }}>
          VoiceLK can make mistakes. Double check it.
        </p>
      </div>

    </div>
  );
}
