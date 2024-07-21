import { useCallback, useEffect, useRef, useState } from "react";
import { PoseLandmarker, GestureRecognizer, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { setupGestureRecognizer, setupPoseLandmarker } from "./modelSettings";
import { ONE_SEC_MS, FRAME_RATE } from "./constants";

export const useMediaPipe = (
  videoRef: React.RefObject<HTMLVideoElement>,
  nextSlide: () => void,
  prevSlide: () => void
) => {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const isRenderLoopRunning = useRef(false);
  // const poseResultRef = useRef<PoseLandmarkerResult | null>(null);

  const initializeTasks = useCallback(async () => {
    try {
      poseLandmarkerRef.current = await setupPoseLandmarker();
      gestureRecognizerRef.current = await setupGestureRecognizer();
      setIsReady(true);
    } catch (error) {
      console.error("Failed to initialize MediaPipe tasks:", error);
    }
  }, []);

  const processFrame = useCallback((video:HTMLVideoElement, time:number) => {
    const result = poseLandmarkerRef.current!.detectForVideo(video, time);
    setPoseResult(result);
    gestureRecognizerRef.current!.recognizeForVideo(video, time);

    if (result.landmarks[0][20].y < result.landmarks[0][12].y) {
      nextSlide();
    } else if (result.landmarks[0][19].y < result.landmarks[0][11].y) {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;
    if (video.currentTime !== lastVideoTimeRef.current) {
      try {
        const time = video.currentTime * ONE_SEC_MS;
        processFrame(video, time);
        lastVideoTimeRef.current = video.currentTime;
      } catch (error) {
        console.error("Error in render loop:", error);
      }
    }
    setTimeout(renderLoop, (1 / FRAME_RATE) * ONE_SEC_MS);
  }, [isReady, videoRef, processFrame]);

  const startRenderLoop = useCallback(() => {
    if (!isRenderLoopRunning.current) {
      console.log("Starting render loop");
      isRenderLoopRunning.current = true;
      renderLoop();
    }
  }, [renderLoop]);


  useEffect(() => {
    initializeTasks();
    return () => {
      poseLandmarkerRef.current?.close();
      gestureRecognizerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    video.addEventListener("canplay", startRenderLoop);
    if (video.readyState >= 2) {
      startRenderLoop();
    }

    return () => {
      video.removeEventListener("canplay", renderLoop);
      isRenderLoopRunning.current = false;
    };
  }, [isReady, videoRef, renderLoop]);

  return { poseResult, isReady };
};
