
export interface RecognitionResult {
  name: string;
  category: string;
  description: string;
  funFact: string;
  visualPrompt: string;
  confidence: number;
  tacticalAnalysis: string;
  materialComposition: string;
  referenceImage?: string;
}

export interface PersistentTag {
  id: string;
  x: number;
  y: number;
  name: string;
  category: string;
  timestamp: number;
}

export interface ClickPosition {
  x: number;
  y: number;
}

export enum AppStatus {
  INITIAL = 'INITIAL',
  CAMERA_REQUEST = 'CAMERA_REQUEST',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  VIEWING_RESULT = 'VIEWING_RESULT',
  ERROR = 'ERROR'
}
