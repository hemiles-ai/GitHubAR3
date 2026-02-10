
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
  aiVisual?: string | null;
}

export interface PersistentTag extends RecognitionResult {
  id: string;
  x: number;
  y: number;
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
  ERROR = 'ERROR'
}
