'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

interface UseSpeechRecognitionReturn {
  state: SpeechState;
  error: string | null;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetError: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(
  onResult: (transcript: string) => void,
  options?: { lang?: string; timeout?: number }
): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setState('unsupported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options?.lang || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (finalTranscript) {
        setState('processing');
        setInterimTranscript(finalTranscript);
        // Small delay so user sees the final transcript before confirmation
        setTimeout(() => {
          onResultRef.current(finalTranscript.trim());
        }, 300);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const errorMessages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
        'no-speech': 'No speech detected. Tap the mic and try again.',
        'network': 'Network error. Check your connection and try again.',
        'audio-capture': 'No microphone found. Please connect a microphone.',
        'aborted': '', // User cancelled - not an error
      };

      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      if (message) {
        setError(message);
        setState('error');
      } else {
        setState('idle');
      }
    };

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Only reset to idle if we're still in listening state (not processing or error)
      setState(prev => prev === 'listening' ? 'idle' : prev);
    };

    recognitionRef.current = recognition;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      recognition.abort();
    };
  }, [options?.lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setError(null);
    setInterimTranscript('');
    setState('listening');

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started - restart
      recognitionRef.current.abort();
      setTimeout(() => {
        recognitionRef.current?.start();
      }, 100);
    }

    // Auto-stop after timeout (default 10s)
    const timeout = options?.timeout || 10000;
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, timeout);
  }, [isSupported, options?.timeout]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setState('idle');
    setInterimTranscript('');
  }, []);

  return {
    state,
    error,
    interimTranscript,
    startListening,
    stopListening,
    resetError,
    isSupported,
  };
}
