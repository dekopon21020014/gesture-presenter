"use client";

import React from "react";
import { DrawingUtils, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
// import { PoseDetectionResult } from "./types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { PoseDetectionResult } from "./type";

interface PoseCanvasProps {
  poseResult: PoseDetectionResult | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const PoseCanvas: React.FC<PoseCanvasProps> = ({ poseResult, videoRef }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    console.log(poseResult, videoRef);
    if (!poseResult || !canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext("2d")!;
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasCtx.drawImage(videoRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    poseResult.landmarks.forEach((landmarks, index) => {
      const colorString = index === 0 ? "red" : "blue";
      drawingUtils.drawLandmarks(landmarks, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
        color: colorString,
      });
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
    });

    canvasCtx.restore();
  }, [poseResult, videoRef]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};