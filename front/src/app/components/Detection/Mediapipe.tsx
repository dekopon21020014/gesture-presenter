import { GestureRecognizer, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react"
import { setupGestureRecognizer, setupPoseLandmarker } from "./modelSettings";

export const Mediapipe = () => {
  const inputVideo = useRef<HTMLVideoElement>(null);
  const outputVideo = useRef<HTMLCanvasElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  
  const [canvasWidth, canvasHeight] = [380, 460];
  const oneSecMs = 1000; // 1秒のミリ秒換算

  // コンポーネントのマウント時にカメラのストリームを確保する
  useEffect(() => {
    let ignore = false;
    const setupCamera = async () => {
      if(!ignore) { // アンマウント時は実行しない．
        // clientのカメラを確認．映像を取得する．
        mediaStream.current = await navigator.mediaDevices.getUserMedia({
          video: { width: canvasWidth, height: canvasHeight },
          audio: false
        });
      }

      if (inputVideo && mediaStream.current) {
        inputVideo.current!.srcObject = mediaStream.current;
      }
    }
    setupCamera();
    
    return (() => {
      ignore = true;
      mediaStream.current?.getTracks().forEach(track => track.stop())
    })
  }, []);

  useEffect(() => {
    const video = inputVideo.current;
    let lastVideoTime = -1;
    let poseLandmarker: PoseLandmarker | null = null;
    let gestureRecognizer: GestureRecognizer | null = null;

    const makeTasks = async () => {
      poseLandmarker = await setupPoseLandmarker(); // from ./modelSettings.ts 全身座標のモデル
      gestureRecognizer = await setupGestureRecognizer(); // from ./modelSettings.ts ジェスチャー認識のモデル
    
      const renderLoop = () => {
        if(video && video.currentTime !== lastVideoTime) {
          try {
            const time = video.currentTime * oneSecMs;
            const poseResult = poseLandmarker!.detectForVideo(video, time);
            const gestureResult = gestureRecognizer!.recognizeForVideo(video, time);
            const gestureLeft = gestureResult.gestures.at(0)?.at(0);
            const gestureRight = gestureResult.gestures.at(1)?.at(0);
            console.log(gestureLeft, gestureRight);
            lastVideoTime = video.currentTime;
          } catch(e) {
            console.log(e);
          }
          requestAnimationFrame(renderLoop);
        }
      }

      if(video) {
        video.addEventListener('loadeddata', renderLoop);
      }

    }
    makeTasks();

    return(() => {
      poseLandmarker?.close();
      gestureRecognizer?.close();
    });

  }, [inputVideo]);
  
  return(
    <div>
      <video autoPlay id='inputVideo' ref={inputVideo} width={canvasWidth} height={canvasHeight} />
      <canvas id="outputVideo" ref={outputVideo} width={canvasWidth} height={canvasHeight} />
    </div>
  )
}