import { FilesetResolver, GestureRecognizer, PoseLandmarker } from "@mediapipe/tasks-vision";

const getVisionTasks = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  return vision;
}

export const setupPoseLandmarker = async () => {
  const vision = await getVisionTasks();

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`, // モデルは一番軽量のものを選択
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  return poseLandmarker;
};

export const setupGestureRecognizer = async () => {
  const vision = await getVisionTasks();
  const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
    },
    runningMode: "VIDEO",
    numHands: 2
  });

  return gestureRecognizer;
}