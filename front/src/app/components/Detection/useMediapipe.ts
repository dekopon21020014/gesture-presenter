import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, GestureRecognizer, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { setupGestureRecognizer, setupPoseLandmarker } from "./modelSettings";
import { ONE_SEC_MS, FRAME_RATE } from "./constants";

export const useMediaPipe = (
  videoRef: React.RefObject<HTMLVideoElement>,
  nextSlide: () => void,
  prevSlide: () => void
) => {
  const [isReady, setIsReady] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const poseResultRef = useRef<PoseLandmarkerResult | null>(null);

  useEffect(() => {
    const initializeTasks = async () => {
      try {
        poseLandmarkerRef.current = await setupPoseLandmarker();
        gestureRecognizerRef.current = await setupGestureRecognizer();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize MediaPipe tasks:", error);
      }
    };

    initializeTasks();

    return () => {
      poseLandmarkerRef.current?.close();
      gestureRecognizerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    const video = videoRef.current;
    let lastVideoTime = -1;

    const renderLoop = () => {
      if (video.currentTime !== lastVideoTime) {
        try {
          const time = video.currentTime * ONE_SEC_MS;
          poseResultRef.current = poseLandmarkerRef.current!.detectForVideo(video, time);
          console.log(poseResultRef.current.landmarks[0]);
          gestureRecognizerRef.current!.recognizeForVideo(video, time);

          if (poseResultRef.current.landmarks[0][20].y < poseResultRef.current.landmarks[0][12].y) {
            nextSlide();
          } else if (poseResultRef.current.landmarks[0][19].y < poseResultRef.current.landmarks[0][11].y) {
            prevSlide();
          }

          lastVideoTime = video.currentTime;
        } catch (error) {
          console.error("Error in render loop:", error);
        }
      }
      setTimeout(renderLoop, (1 / FRAME_RATE) * ONE_SEC_MS);
    };

    video.addEventListener("loadeddata", renderLoop);

    return () => {
      video.removeEventListener("loadeddata", renderLoop);
    };
  }, [isReady, videoRef, nextSlide, prevSlide]);

  return { poseResultRef };
};
