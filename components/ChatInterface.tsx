
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Scenario, FeedbackItem, UserSettings, GroundingChunk } from '../types';
import MessageBubble from './MessageBubble';
import IconButton from './IconButton';
import LoadingSpinner from './LoadingSpinner';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import HintSuggestions from './HintSuggestions';

interface ChatInterfaceProps {
  scenario: Scenario;
  initialMessages?: Message[];
  onProcessUserTurn: (userInput: string, scenario: Scenario) => Promise<void>; // Updated prop
  onGetHints: (scenarioContext: string, lastUserMessage: string | null, lastAiMessage: string | null) => Promise<string[]>;
  userSettings: UserSettings;
  speakAiResponse: (text: string, voiceURI?: string | null) => void;
  isAiSpeaking: boolean;
  stopAiSpeaking: () => void;
  blockInput?: boolean;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v.75a4.5 4.5 0 0 0 9 0V11.25a.75.75 0 0 1 1.5 0v.75a6 6 0 0 1-12 0v-.75A.75.75 0 0 1 6 10.5Z" />
  </svg>
);

const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.25A.75.75 0 0 1 9 9h6a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v-4.5Z" clipRule="evenodd" />
  </svg>
);

const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

const SpeakerXMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-7.5-3-4.5 4.5m0 0h-2.25a2.25 2.25 0 0 0-2.25 2.25v2.25a2.25 2.25 0 0 0 2.25 2.25H7.5M12 18.75H7.5m4.5-4.5H7.5m4.5-4.5H7.5M12 9.75H7.5M12 4.5v1.5m0 7.5V12m0 0H7.5m4.5 0H12m0-3.75v1.5m0-1.5a2.25 2.25 0 0 0-4.5 0v2.25" />
  </svg>
);


const AiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
  <path d="M12 .998c-1.488 0-2.882.342-4.145.964C6.59 2.585 5.373 3.518 4.365 4.675A10.455 10.455 0 002.05 9.188 10.22 10.22 0 001 12.001c0 1.487.344 2.882.968 4.144.624 1.263 1.558 2.378 2.716 3.385a10.493 10.493 0 004.512 2.317c.009.002.016.004.025.004h.001A10.247 10.247 0 0012 23.002a10.247 10.247 0 002.724-.363h.001c.008 0 .016-.002.024-.004a10.493 10.493 0 004.512-2.317c1.158-1.007 2.092-2.122 2.716-3.385.624-1.262.968-2.657.968-4.144a10.22 10.22 0 00-1.05-4.513 10.455 10.455 0 00-2.315-4.513c-1.008-1.157-2.225-2.09-3.488-2.713A10.264 10.264 0 0012 .998zM7.5 10.498a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm9 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 14.248c-2.33 0-4.322 1.297-5.303 3.12.23.18.475.345.732.492A5.96 5.96 0 0112 16.497c1.643 0 3.14-.663 4.228-1.748a.75.75 0 011.06 1.06A7.476 7.476 0 0012 17.997a7.433 7.433 0 00-4.697-1.63c-.257-.147-.502-.313-.732-.492C7.587 14.508 9.61 12.748 12 12.748c2.392 0 4.413 1.76 5.303 3.37.23-.18.475-.345.732-.492A5.96 5.96 0 0112 14.248z" />
 </svg>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  scenario,
  initialMessages = [],
  onProcessUserTurn, 
  onGetHints,
  userSettings,
  speakAiResponse,
  isAiSpeaking,
  stopAiSpeaking,
  blockInput = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [showHints, setShowHints] = useState(false);
  const [hintSuggestions, setHintSuggestions] = useState<string[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [derivedGroundingLinks, setDerivedGroundingLinks] = useState<GroundingChunk[] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported: speechRecognitionSupported,
    error: speechError,
    resetTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (speechError) {
      setError(`Speech recognition error: ${speechError}`);
    }
  }, [speechError]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const lastAiMessageWithChunks = [...messages]
      .reverse()
      .find(m => m.sender === 'ai' && m.groundingChunks && m.groundingChunks.length > 0);
    
    if (lastAiMessageWithChunks) {
        setDerivedGroundingLinks(lastAiMessageWithChunks.groundingChunks!);
    } else {
        setDerivedGroundingLinks(null);
    }
  }, [messages]);


  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput && !isListening) return;
    if(isListening) {
        stopListening();
        if (!trimmedInput && !transcript.trim()){ 
             return;
        }
    }
    
    const textToSend = trimmedInput || transcript.trim();
    if(!textToSend) return;
    
    setInputValue('');
    resetTranscript();
    setIsLoading(true); 
    setError(null);
    setShowHints(false);

    try {
      await onProcessUserTurn(textToSend, scenario); 
    } catch (e: any) {
      const errorMessage = e.message || "An error occurred while processing your message.";
      setError(errorMessage);
      // App.tsx handles adding system error messages to the central chatMessages list
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleVoiceInput = () => {
    if (!speechRecognitionSupported) {
        setError("Speech recognition is not available on your browser.");
        return;
    }
    if (isListening) {
      stopListening();
    } else {
      setInputValue(''); 
      resetTranscript(); 
      startListening();
    }
  };

  const handleHintRequest = async () => {
    setShowHints(true);
    setIsHintLoading(true);
    const lastUserMsgObj = messages.filter(m => m.sender === 'user').pop();
    const lastAiMsgObj = messages.filter(m => m.sender === 'ai').pop();
    try {
        const hints = await onGetHints(scenario.description, lastUserMsgObj?.text || null, lastAiMsgObj?.text || null);
        setHintSuggestions(hints);
    } catch (e: any) {
        setError(e.message || "Failed to get hints.");
        setHintSuggestions([]);
    } finally {
        setIsHintLoading(false);
    }
  };

  const handleHintSelection = (hint: string) => {
    setInputValue(hint);
    setShowHints(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isInputDisabled = isLoading || blockInput || isListening; 
  const showAiTypingSpinner = isLoading && !blockInput;


  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-slate-700 border-b border-slate-600">
        <h2 className="text-xl font-semibold text-sky-400">{scenario.title}</h2>
        <p className="text-sm text-slate-300">{scenario.aiPersona} | {scenario.cefrLevel}</p>
      </div>

      <div className="flex-grow p-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} showFeedbackSetting={userSettings.showFeedback} />
        ))}
        {showAiTypingSpinner && ( 
          <div className="flex justify-start my-2">
            <div className="flex items-end">
                <AiIcon className="h-6 w-6 text-teal-400 mr-2" />
              <div className="p-3 bg-slate-700 rounded-r-xl rounded-tl-xl shadow-md">
                <LoadingSpinner size="sm" color="text-slate-300"/>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {derivedGroundingLinks && derivedGroundingLinks.length > 0 && (
        <div className="p-3 bg-slate-700 border-t border-slate-600 text-xs">
          <p className="font-semibold text-slate-300 mb-1">Sources:</p>
          <ul className="list-disc list-inside space-y-1">
            {derivedGroundingLinks.map((chunk, index) =>
              chunk.web && (
                <li key={index}>
                  <a
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 hover:underline"
                    title={chunk.web.title}
                  >
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-800 text-red-100 text-sm border-t border-red-700">
          Error: {error}
        </div>
      )}

      <div className="p-3 border-t border-slate-600 bg-slate-700 relative">
        {showHints && (
            <HintSuggestions 
                suggestions={hintSuggestions}
                isLoading={isHintLoading}
                onSuggestionClick={handleHintSelection}
                onClose={() => setShowHints(false)}
            />
        )}
        <div className="flex items-center space-x-2">
          {isAiSpeaking ? (
            <IconButton
              icon={<SpeakerXMarkIcon className="h-5 w-5 text-yellow-400" />}
              onClick={stopAiSpeaking}
              label="Stop AI speaking"
              variant="ghost"
              title="Stop AI speaking"
            />
          ) : (
            <IconButton 
              icon={isListening ? <StopCircleIcon className="h-5 w-5 text-red-400" /> : <MicrophoneIcon className="h-5 w-5" />}
              onClick={handleVoiceInput}
              disabled={!speechRecognitionSupported || blockInput || isLoading} 
              label={isListening ? "Stop recording" : "Record voice"}
              variant="ghost"
              title={isListening ? "Stop recording" : (speechRecognitionSupported ? "Record voice input" : "Speech recognition not supported")}
            />
          )}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : (blockInput ? "AI is preparing to speak..." : `Message ${scenario.aiPersona}...`)}
            className="flex-grow p-2.5 bg-slate-600 text-slate-100 rounded-lg border border-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none custom-scrollbar text-sm"
            rows={1}
            style={{ maxHeight: '80px', overflowY: 'auto' }}
            disabled={isInputDisabled}
          />
           <IconButton 
            icon={<QuestionMarkCircleIcon className="h-5 w-5" />}
            onClick={handleHintRequest}
            label="Get help / hints"
            variant="ghost"
            title="I'm stuck, get suggestions"
            disabled={isInputDisabled}
          />
          <IconButton
            icon={<SendIcon className="h-5 w-5" />}
            onClick={handleSendMessage}
            disabled={isInputDisabled || (!inputValue.trim() && !transcript.trim())} 
            label="Send message"
            variant="primary"
            title="Send message"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
