import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function StreamingMarkdown({ endpoint, requestBody }) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // Tracks the in-flight request so we can cancel it on unmount or re-run.
  const abortControllerRef = useRef(null);

  const startStream = useCallback(async () => {
    // Cancel any previous stream before starting a new one.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setContent('');
    setError(null);
    setIsStreaming(true);

    let reader = null;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      if (!response.body) {
        throw new Error('ReadableStream not supported by this response.');
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // stream: true keeps partial multi-byte UTF-8 sequences across chunks.
        const chunkText = decoder.decode(value, { stream: true });
        setContent(prev => prev + chunkText);
      }

      // Flush any bytes buffered by the decoder for a trailing partial sequence.
      const remaining = decoder.decode();
      if (remaining) setContent(prev => prev + remaining);
    } catch (err) {
      // AbortError fires when we intentionally cancel — not a real failure.
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong while streaming the response.');
      }
    } finally {
      reader?.releaseLock();
      setIsStreaming(false);
    }
  }, [endpoint, requestBody]);

  useEffect(() => {
    startStream();
    return () => abortControllerRef.current?.abort();
  }, [startStream]);

  return (
    <div>
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}

      <ReactMarkdown>{content}</ReactMarkdown>

      {isStreaming && (
        <span style={{ display: 'inline-block', width: 8, height: 16, background: '#333', animation: 'blink 1s step-end infinite' }} />
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
