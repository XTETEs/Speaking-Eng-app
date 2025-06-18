
import React, { useState, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import ChatInterface from './components/ChatInterface';
import ProgressDisplay from './components/ProgressDisplay';
import SettingsModal from './components/SettingsModal';
import { Scenario, Message, FeedbackItem, UserSettings, CEFRLevel, GroundingChunk } from './types';
import { DEFAULT_USER_SETTINGS, APP_NAME, GEMINI_MODEL_TEXT } from './constants'; // Added GEMINI_MODEL_TEXT
import { createChatSession, sendMessageToChat, getFeedbackOnUserMessage, getHintSuggestions } from './services/geminiService';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';

type AppView = 'scenario_selection' | 'chat';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

const cleanTextForSpeech = (text: string): string => {
  if (!text) return "";
  // Remove asterisks
  let cleanedText = text.replace(/\*/g, '');
  // Remove common emojis (this regex covers many common emoji blocks)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
  cleanedText = cleanedText.replace(emojiRegex, '');
  // Replace multiple spaces that might result from removals with a single space
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  return cleanedText;
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('scenario_selection');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isAiGreeting, setIsAiGreeting] = useState(false);
  
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getLocalStorageItem('userSettings', DEFAULT_USER_SETTINGS));
  const [scenariosCompleted, setScenariosCompleted] = useState<number>(() => getLocalStorageItem('scenariosCompleted', 0));
  const [messagesSentCount, setMessagesSentCount] = useState<number>(() => getLocalStorageItem('messagesSentCount', 0));
  const [currentStreak, setCurrentStreak] = useState<number>(() => getLocalStorageItem('currentStreak', 0));
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(() => getLocalStorageItem('lastPracticeDate', null));
  const [isSidePanelVisible, setIsSidePanelVisible] = useState<boolean>(() => getLocalStorageItem('isSidePanelVisible', true));

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  const { speak, cancel, isSpeaking, voices, isSupported: speechSynthesisSupported } = useSpeechSynthesis();

  const handleSettingsChange = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setUserSettings(prev => {
      const newSettings = {...prev, [key]: value };
      setLocalStorageItem('userSettings', newSettings);
      if (key === 'showFeedback' && !value) {
        // If feedback is turned off, clear existing feedback from messages
        setChatMessages(prevMsgs => prevMsgs.map(msg => msg.sender === 'user' ? { ...msg, feedback: undefined, isLoadingFeedback: false } : msg));
      }
      return newSettings;
    });
  }, []); 

  useEffect(() => {
    if (!process.env.API_KEY) {
      setAppError("Gemini API Key is not configured. AI features will be limited or non-functional. Please ensure the API_KEY environment variable is set.");
    }
  }, []);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastPracticeDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastPracticeDate === today) {
        // Already practiced today
      } else if (lastPracticeDate === yesterdayStr) {
        // Practiced yesterday, continue streak
      } else {
        // Streak broken
        setCurrentStreak(0);
        setLocalStorageItem('currentStreak', 0);
      }
    }
  }, [lastPracticeDate]);

   useEffect(() => {
    if (voices.length > 0 && userSettings.selectedVoiceURI === null) {
      const defaultUKFemaleVoice = voices.find(
        (voice) => voice.name === "Google UK English Female" && voice.lang === "en-GB"
      );
      if (defaultUKFemaleVoice) {
        handleSettingsChange('selectedVoiceURI', defaultUKFemaleVoice.voiceURI);
      }
    }
  }, [voices, userSettings.selectedVoiceURI, handleSettingsChange]);

  const toggleSidePanelVisibility = useCallback(() => {
    setIsSidePanelVisible(prev => {
        const newState = !prev;
        setLocalStorageItem('isSidePanelVisible', newState);
        return newState;
    });
  }, []);

  const handleScenarioSelect = useCallback(async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    const newChatSession = createChatSession(scenario.initialSystemMessage); 
    setChatSession(newChatSession);
    
    const systemWelcomeMessage: Message = {
      id: `system-start-${Date.now()}`,
      text: `Conversation started: ${scenario.title}. AI: ${scenario.aiPersona}. Waiting for AI's first message...`,
      sender: 'system',
      timestamp: new Date(),
    };
    setChatMessages([systemWelcomeMessage]); 
    setCurrentView('chat');
    setAppError(null);
    setIsAiGreeting(true);

    try {
      const { responseText, groundingChunks } = await sendMessageToChat(newChatSession, ""); 
      const aiGreetingMessage: Message = {
        id: `ai-greeting-${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        groundingChunks: groundingChunks || undefined,
      };
      setChatMessages([systemWelcomeMessage, aiGreetingMessage]); 
      if (userSettings.aiVoiceEnabled && speak) {
        const cleanedText = cleanTextForSpeech(responseText);
        if (cleanedText) speak(cleanedText, userSettings.selectedVoiceURI);
      }
    } catch (error: any) {
      setAppError(`Gemini API Error: ${error.message || 'Failed to get AI initial greeting.'}`);
      const systemErrorMsg: Message = {
        id: `system-error-greeting-${Date.now()}`,
        text: `Error: AI failed to start the conversation. ${error.message || ''}`,
        sender: 'system',
        timestamp: new Date(),
      };
      setChatMessages(prev => [prev[0], systemErrorMsg]); 
    } finally {
      setIsAiGreeting(false);
    }
  }, [speak, userSettings.aiVoiceEnabled, userSettings.selectedVoiceURI, handleSettingsChange]);

  const handleProcessUserTurn = useCallback(async (userInput: string, currentScenario: Scenario) => {
    if (!currentScenario) {
        setAppError("No scenario selected for processing turn.");
        return;
    }
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);

    if (userSettings.showFeedback) {
      setChatMessages(prevMsgs => prevMsgs.map(msg => 
        msg.id === userMessage.id ? { ...msg, isLoadingFeedback: true } : msg
      ));
      try {
        const feedbackItems = await getFeedbackOnUserMessage(userInput, "", currentScenario.description); 
        setChatMessages(prevMsgs => prevMsgs.map(msg => 
          msg.id === userMessage.id ? { ...msg, feedback: feedbackItems, isLoadingFeedback: false } : msg
        ));
      } catch (feedbackError: any) {
        setAppError(`Feedback Error: ${feedbackError.message || "Failed to get feedback."}`);
        const errorFeedbackItems: FeedbackItem[] = [{type: 'general', message: 'Could not load feedback due to an error.'}];
        setChatMessages(prevMsgs => prevMsgs.map(msg => 
          msg.id === userMessage.id ? { ...msg, feedback: errorFeedbackItems, isLoadingFeedback: false } : msg
        ));
      }
    }

    if (!chatSession) {
      const errorMsg = "Chat session not available for AI reply. Please start a new scenario.";
      setAppError(errorMsg);
      setChatMessages(prev => [...prev, { id: `error-no-session-${Date.now()}`, text: errorMsg, sender: 'system', timestamp: new Date() }]);
      return; 
    }

    try {
      const { responseText, groundingChunks } = await sendMessageToChat(chatSession, userInput);
      const aiMessage: Message = {
        id: `ai-reply-${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        groundingChunks: groundingChunks || undefined,
      };
      setChatMessages(prev => [...prev, aiMessage]);

      if (userSettings.aiVoiceEnabled && speak) {
        const cleanedText = cleanTextForSpeech(responseText);
        if (cleanedText) speak(cleanedText, userSettings.selectedVoiceURI);
      }

      setMessagesSentCount(prev => {
        const newCount = prev + 1;
        setLocalStorageItem('messagesSentCount', newCount);
        return newCount;
      });
      const today = new Date().toISOString().split('T')[0];
      if (lastPracticeDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          let newStreakValue = (lastPracticeDate === yesterdayStr) ? currentStreak + 1 : 1;
          setCurrentStreak(newStreakValue);
          setLastPracticeDate(today);
          setLocalStorageItem('currentStreak', newStreakValue);
          setLocalStorageItem('lastPracticeDate', today);
      }
    } catch (aiReplyError: any) {
      const errorMsg = `Gemini API Error for AI reply: ${aiReplyError.message || "Failed to get AI response."}`;
      setAppError(errorMsg);
      setChatMessages(prev => [...prev, { id: `error-ai-reply-${Date.now()}`, text: errorMsg, sender: 'system', timestamp: new Date() }]);
    }
  }, [chatSession, userSettings.showFeedback, userSettings.aiVoiceEnabled, userSettings.selectedVoiceURI, speak, lastPracticeDate, currentStreak]);


  const handleGetHints = useCallback(async (scenarioContext: string, lastUserMessage: string | null, lastAiMessage: string | null): Promise<string[]> => {
    try {
      return await getHintSuggestions(scenarioContext, lastUserMessage, lastAiMessage);
    } catch (error: any) {
      setAppError(`Gemini API Error: ${error.message || 'Failed to get hints.'}`);
      return ["Error: Could not fetch suggestions."];
    }
  }, []);

  const handleNewConversation = () => {
    if (selectedScenario && currentView === 'chat') {
        setScenariosCompleted(prev => {
            const newCount = prev + 1;
            setLocalStorageItem('scenariosCompleted', newCount);
            return newCount;
        });
    }
    setCurrentView('scenario_selection');
    setSelectedScenario(null);
    setChatSession(null);
    setChatMessages([]);
    cancel(); 
    setIsAiGreeting(false);
    setAppError(null);
  };

  const speakAiResponse = useCallback((text: string, voiceURI?: string | null) => {
    if (speechSynthesisSupported && userSettings.aiVoiceEnabled) {
      const cleanedText = cleanTextForSpeech(text);
      if (cleanedText) speak(cleanedText, voiceURI || userSettings.selectedVoiceURI);
    }
  }, [speak, speechSynthesisSupported, userSettings.aiVoiceEnabled, userSettings.selectedVoiceURI]);
  
  const availableEnglishVoices = React.useMemo(() => voices.filter(v => v.lang.startsWith('en')), [voices]);

  return (
    <div className="flex flex-col h-screen antialiased bg-slate-900 text-slate-100">
      <Header 
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onNewConversationClick={handleNewConversation}
        isInChatView={currentView === 'chat'}
        isSidePanelVisible={isSidePanelVisible}
        onToggleSidePanel={toggleSidePanelVisibility}
      />
      
      {appError && !appError.toLowerCase().includes("api key") && ( 
        <div className="bg-red-600 text-white p-3 text-sm text-center shadow-md">
          <strong>Application Error:</strong> {appError}
        </div>
      )}
       { !process.env.API_KEY && (
         <div className="bg-red-700 text-white p-4 text-sm font-semibold text-center shadow-lg">
           <strong>Critical Error:</strong> The API_KEY for Gemini is not configured. AI functionalities are disabled. Please contact support or check environment configuration.
         </div>
       )}


      <main className="flex-grow overflow-hidden p-2 sm:p-4">
        {currentView === 'scenario_selection' && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <ScenarioSelector onScenarioSelect={handleScenarioSelect} />
          </div>
        )}
        {currentView === 'chat' && selectedScenario && ( 
          <div className="flex flex-col lg:flex-row gap-4 h-full max-w-7xl mx-auto">
            
            <div className="flex-grow h-full overflow-hidden"> 
              <ChatInterface
                scenario={selectedScenario}
                initialMessages={chatMessages}
                onProcessUserTurn={(userInput) => handleProcessUserTurn(userInput, selectedScenario)} 
                onGetHints={handleGetHints}
                userSettings={userSettings}
                speakAiResponse={speakAiResponse}
                isAiSpeaking={isSpeaking}
                stopAiSpeaking={cancel}
                blockInput={isAiGreeting} 
              />
            </div>

            {isSidePanelVisible && (
              <div className="lg:w-80 lg:max-w-xs xl:w-96 xl:max-w-sm flex-shrink-0 max-h-72 lg:h-full lg:max-h-none overflow-y-auto custom-scrollbar p-4 lg:p-0">
                <ProgressDisplay 
                  scenariosCompleted={scenariosCompleted} 
                  messagesSent={messagesSentCount}
                  currentStreak={currentStreak}
                />
                <div className="mt-4 p-4 bg-slate-800 rounded-lg shadow">
                  <h4 className="text-md font-semibold text-sky-400 mb-2">Current Scenario</h4>
                  <p className="text-sm text-slate-300 mb-1"><strong>Title:</strong> {selectedScenario.title}</p>
                  <p className="text-sm text-slate-300 mb-1"><strong>Level:</strong> {selectedScenario.cefrLevel}</p>
                  <p className="text-sm text-slate-300"><strong>AI Persona:</strong> {selectedScenario.aiPersona}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={userSettings}
        onSettingsChange={handleSettingsChange}
        availableVoices={availableEnglishVoices}
      />
    </div>
  );
};

export default App;
