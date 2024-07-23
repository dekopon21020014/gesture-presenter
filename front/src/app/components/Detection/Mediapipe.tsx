import { useEffect, useRef, useState } from "react"
import { useMediaPipe } from "./useMediapipe";
import { PoseCanvas } from "./PoseCanvas";
import { CAMERA_HEIGHT, CAMERA_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH } from "../../consts/videoInfo";
import { useStream } from "../Media/useStream";

interface MediapipeProps {
  nextSlide: () => void;
  prevSlide: () => void;
}

export const Mediapipe = ({ nextSlide, prevSlide }: MediapipeProps) => {
  const [facialId, setFacialIds] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamReady } = useStream(videoRef, CAMERA_WIDTH, CAMERA_HEIGHT);
  const { poseResult, isPresenting } = useMediaPipe(videoRef, streamReady, facialId, nextSlide, prevSlide);

  const addFacialId = (id: number | null) => {
    if (id !== null) {
      setFacialIds(prev => [...prev, id]);
    }
  };

  
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
      <PoseCanvas poseResult={poseResult ?? null} videoRef={videoRef} isPresenting={isPresenting} addFacialId={addFacialId} />
    </div>
  )
}
