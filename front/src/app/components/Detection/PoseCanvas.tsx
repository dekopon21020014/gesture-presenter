"use client";

import React, { useEffect } from "react";
import { DrawingUtils, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
// import { PoseDetectionResult } from "./types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../consts/videoInfo";
import { PoseDetectionResult } from "./type";

interface PoseCanvasProps {
  poseResult: PoseDetectionResult | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const PoseCanvas = ({ poseResult, videoRef }: PoseCanvasProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // console.log(poseResult, canvasRef, videoRef);
    if (!poseResult || !canvasRef.current || !videoRef.current) return;

    const canvasCtx = canvasRef.current.getContext("2d")!;
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

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