
import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, voiceURI?: string | null) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  error: string | null;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      const synth = window.speechSynthesis;
      
      const updateVoices = () => {
        setVoices(synth.getVoices());
      };
      
      updateVoices(); // Initial call
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = updateVoices;
      }

      return () => {
        synth.cancel(); // Cancel any ongoing speech when component unmounts
        if (synth.onvoiceschanged !== undefined) {
          synth.onvoiceschanged = null;
        }
      };
    } else {
      setIsSupported(false);
      setError("Speech synthesis is not supported in this browser.");
    }
  }, []);

  const speak = useCallback((text: string, voiceURI?: string | null) => {
    if (!isSupported || !text) return;

    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel(); // Cancel previous speech if any
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`Voice URI "${voiceURI}" not found. Using default.`);
      }
    } else {
      // Try to find a default English voice if no specific voice is selected
      const defaultEnVoice = voices.find(v => v.lang.startsWith('en') && v.default) || voices.find(v => v.lang.startsWith('en'));
      if (defaultEnVoice) {
        utterance.voice = defaultEnVoice;
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  }, [isSupported, voices]);

  const cancel = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported, voices, error };
};

export default useSpeechSynthesis;
