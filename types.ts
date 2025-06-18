
export enum CEFRLevel {
  A1 = "A1 (Beginner)",
  A2 = "A2 (Elementary)",
  B1 = "B1 (Intermediate)",
  B2 = "B2 (Upper Intermediate)",
  C1 = "C1 (Advanced)",
  C2 = "C2 (Proficiency)",
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  cefrLevel: CEFRLevel;
  aiPersona: string;
  initialSystemMessage: string;
  sampleUserMessage?: string; // For prompting the user
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  audioUrl?: string; // For user's recorded audio or AI's spoken response
  groundingChunks?: GroundingChunk[]; // Optional sources for AI messages
  feedback?: FeedbackItem[]; // Feedback specific to this user message
  isLoadingFeedback?: boolean; // True if feedback for this message is being loaded
}

export interface FeedbackItem {
  type: "grammar" | "pronunciation" | "vocabulary" | "fluency" | "general";
  message: string;
  suggestion?: string;
}

export interface UserSettings {
  aiVoiceEnabled: boolean;
  selectedVoiceURI: string | null; // For speech synthesis
  showFeedback: boolean;
  darkMode: boolean; // Example, though app is dark by default
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Add other types of chunks if needed
}


// Web Speech API type declarations
declare global {
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
    // readonly emma?: Document | null;
    // readonly interpretation?: any;
  }

  type SpeechRecognitionErrorCode =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported";

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    grammars: any; // Actually SpeechGrammarList
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    // serviceURI: string; // Deprecated

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    abort(): void;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

// Ensure this file is treated as a module by having at least one export (which it already does)
// This empty export can be added if there were no other exports, to ensure `declare global` works correctly from a module.
// export {};
