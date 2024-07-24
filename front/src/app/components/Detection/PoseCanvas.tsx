"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../consts/videoInfo";
import { PoseDetectionResult } from "./type";
import { postCaptureImage } from "../Media/imageSender";

interface PoseCanvasProps {
  poseResult: PoseDetectionResult | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPresenting: boolean;
  // addFacialId: (id: number | null) => void;
}


export const PoseCanvas = ({ poseResult, videoRef, isPresenting }: PoseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCaptureTimeRef = useRef(0);
  const [facialId, setFacialId] = useState<number|null>(null);

  useEffect(() => {
    if (!poseResult || !canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d")!;
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // 10秒ごとに画像を api fetch
    if (isPresenting) {
      const currentTime = Date.now();
      if (currentTime - lastCaptureTimeRef.current >= 10000) {

        const handleCapture = async () => {
          try{
            const facial = await postCaptureImage(canvas);
            setFacialId(facial);
          } catch(e) {
            console.error('Error capturing image:', e);
            setFacialId(null);
            // addFacialId(null);
          }
        };

        handleCapture();
        lastCaptureTimeRef.current = currentTime;
      }
    }

    poseResult.landmarks.forEach((landmarks, index) => {
      const colorString = isPresenting ? "red" : "blue";
      drawingUtils.drawLandmarks(landmarks, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
        color: colorString,
      });
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
    });

    canvasCtx.restore();
  }, [poseResult, videoRef, isPresenting]);

  // useEffect(() => {
  //   addFacialId(facialId);
  // }, [facialId])


  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};
