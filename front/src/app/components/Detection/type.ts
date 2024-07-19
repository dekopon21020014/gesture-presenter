import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface PoseDetectionResult {
  landmarks: NormalizedLandmark[][];
}