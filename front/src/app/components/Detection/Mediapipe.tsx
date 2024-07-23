import { useRef } from "react"
import { useMediaPipe } from "./useMediapipe";
import { PoseCanvas } from "./PoseCanvas";
import { CAMERA_HEIGHT, CAMERA_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH } from "../../consts/videoInfo";
import { useStream } from "../Media/useStream";

interface MediapipeProps {
  nextSlide: () => void;
  prevSlide: () => void;
}

export const Mediapipe = ({ nextSlide, prevSlide }: MediapipeProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { streamReady } = useStream(videoRef, CAMERA_WIDTH, CAMERA_HEIGHT);
  const { poseResult, isModelReady } = useMediaPipe(videoRef, streamReady, nextSlide, prevSlide);
  
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
