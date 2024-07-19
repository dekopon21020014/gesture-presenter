import { DrawingUtils, GestureRecognizer, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react"
import { useMediaPipe } from "./useMediapipe";
import { PoseCanvas } from "./PoseCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { useStream } from "./useStream";

interface MediapipeProps {
  nextSlide: () => void;
  prevSlide: () => void;
}

export const Mediapipe = ({ nextSlide, prevSlide }: MediapipeProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { poseResultRef } = useMediaPipe(videoRef, nextSlide, prevSlide);

  useStream(videoRef, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  return(
    <div>
      <video
        autoPlay
        id="inputVideo"
        ref={videoRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        // style={{ display: "none" }}
      />
      <PoseCanvas poseResult={poseResultRef.current ?? null} videoRef={videoRef} />
    </div>
  )
}
