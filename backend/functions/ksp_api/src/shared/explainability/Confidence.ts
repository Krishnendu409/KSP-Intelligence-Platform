export interface Confidence {
  score: number; // 0.0 to 1.0
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}
