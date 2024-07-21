import { useEffect, useRef, useState } from "react"
import { useMediaPipe } from "./useMediapipe";
import { PoseCanvas } from "./PoseCanvas";
import { CAMERA_HEIGHT, CAMERA_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import { useStream } from "./useStream";

interface MediapipeProps {
  nextSlide: () => void;
  prevSlide: () => void;
}


export const Mediapipe = ({ nextSlide, prevSlide }: MediapipeProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { poseResult, isReady } = useMediaPipe(videoRef, nextSlide, prevSlide);
  useStream(videoRef, CAMERA_WIDTH, CAMERA_HEIGHT);
  
  return(
    <div>
      <video
        autoPlay
        id="inputVideo"
        ref={videoRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: "none" }}
      />
      <PoseCanvas poseResult={poseResult ?? null} videoRef={videoRef} />
    </div>
  )
}
