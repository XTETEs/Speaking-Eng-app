
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useSpeechRecognition = (lang: string = 'en-US'): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Types are now globally declared via types.ts
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false; 
      recognition.interimResults = true;
      recognition.lang = lang;
      setRecognitionInstance(recognition);
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser.");
    }
  }, [lang]);

  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
        setTranscript(prev => prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript.trim());
    }
  }, []);
  
  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    setError(event.error); // event.error is SpeechRecognitionErrorCode
    setIsListening(false);
  }, []);

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!recognitionInstance) return;

    recognitionInstance.onresult = handleResult;
    recognitionInstance.onerror = handleError;
    recognitionInstance.onend = handleEnd;

    return () => {
      // Clear event handlers when component unmounts or recognitionInstance changes
      // to prevent trying to call handlers on a stale instance.
      // Check if recognitionInstance still exists and has these properties before nullifying.
      // This is mostly for robustness, as the instance itself should be managed by the outer useEffect.
      if (recognitionInstance.onresult) recognitionInstance.onresult = null;
      if (recognitionInstance.onerror) recognitionInstance.onerror = null;
      if (recognitionInstance.onend) recognitionInstance.onend = null;
    };
  }, [recognitionInstance, handleResult, handleError, handleEnd]);

  const startListening = useCallback(() => {
    if (recognitionInstance && !isListening) {
      try {
        setTranscript(''); 
        setError(null);
        recognitionInstance.start();
        setIsListening(true);
      } catch (e: any) {
        setError(`Could not start recognition: ${e.message}`);
        setIsListening(false);
      }
    }
  }, [recognitionInstance, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionInstance && isListening) {
      recognitionInstance.stop();
      setIsListening(false); // onend will also set this, but good to be explicit
    }
  }, [recognitionInstance, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { isListening, transcript, error, isSupported, startListening, stopListening, resetTranscript };
};

export default useSpeechRecognition;
