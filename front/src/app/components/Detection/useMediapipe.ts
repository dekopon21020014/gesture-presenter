import { useCallback, useEffect, useRef, useState } from "react";
import { PoseLandmarker, GestureRecognizer, PoseLandmarkerResult, GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { setupGestureRecognizer, setupPoseLandmarker } from "./modelSettings";
import { ONE_SEC_MS, FRAME_RATE } from "../../consts/videoInfo";
import { PoseIndex } from "@/app/consts/landmarkIndex";
import { Good } from "../Effects/good";
import { Sad } from "../Effects/sad";
import { Clap } from "../Effects/clap";
import { playBadSound, playClapSound, playGoodSound } from "../Sounds/Sounds";

export const useMediaPipe = (
  videoRef: React.RefObject<HTMLVideoElement>,
  nextSlide: () => void,
  prevSlide: () => void
) => {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const [isReady, setIsReady] = useState(false);
  // const [isPostImageTime, setIsPostImageTime] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);
  const [gestureResult, setGestureResult] = useState<GestureRecognizerResult | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastPostTimeRef = useRef(0);
  const isRenderLoopRunning = useRef(false);


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
    const resultPose = poseLandmarkerRef.current!.detectForVideo(video, time);
    const resultGesture = gestureRecognizerRef.current!.recognizeForVideo(video, time);

    if (!resultPose || !resultGesture) return;

    setPoseResult(resultPose);
    setGestureResult(resultGesture);
    const landmark = resultPose.landmarks[0];
    const gestures = resultGesture.gestures;

    if (!landmark || gestures.length === 0) return;

    const [gestureA, gestureB] = gestures;
    
    const gestureLabelA = gestureA?.[0]?.categoryName ?? '';
    const gestureLabelB = gestureB?.[0]?.categoryName ?? '';

    const { wrist, shoulder, eye } = PoseIndex.Side;

    const isHandAboveShoulder = (side: 'left' | 'right') => 
      landmark[wrist[side]].y < landmark[shoulder[side]].y;
  
    const isHandBelowEyes = () => 
      landmark[wrist.right].y < landmark[eye.outer.right].y &&
      landmark[wrist.left].y < landmark[eye.outer.left].y;
  
    const areHandsCloseToEyes = () => 
      landmark[eye.outer.right].x - landmark[wrist.right].x < 0.2 &&
      landmark[wrist.left].x - landmark[eye.outer.left].x < 0.2;

    switch(gestureLabelA) {
      case 'Open_Palm':
        if (isHandAboveShoulder('right') && !isHandAboveShoulder('left')) {
          nextSlide();
        } else if (isHandAboveShoulder('left') && !isHandAboveShoulder('right')) {
          prevSlide();
        } else if (gestureLabelB == 'Open_Palm') {
          Clap();
          playClapSound();
        }
        break;
      case 'Thumb_Up':
        Good();
        playGoodSound();
        break;
      default:
        if (isHandBelowEyes() && areHandsCloseToEyes()) {
          Sad();
          playBadSound();
        }
        break;
    }
    
  }, [nextSlide, prevSlide, Good, Sad, Clap, playGoodSound, playBadSound, playClapSound]);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;
    const currentTime = video.currentTime;
    if (currentTime !== lastVideoTimeRef.current) {
      try {
        const time = currentTime * ONE_SEC_MS;
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
