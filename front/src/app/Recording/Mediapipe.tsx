"use client";

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react"

export const Mediapipe = () => {
  const inputVideo = useRef<HTMLVideoElement>(null);
  const outputVideo = useRef<HTMLCanvasElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  
  const [canvasWidth, canvasHeight] = [380, 460];

  // コンポーネントのマウント時にカメラのストリームを確保
  useEffect(() => {
    let ignore = false;

    const setup = async () => {
      if(!ignore) { // アンマウント時は実行しない．
        // clientのカメラを確認．映像を取得する．
        mediaStream.current = await navigator.mediaDevices.getUserMedia({
          video: { width: canvasWidth, height: canvasHeight },
          audio: false
        });
      }
    }
    setup();
    
    return (() => {
      ignore = true;
      mediaStream.current?.getTracks().forEach(track => track.stop())
    })
  }, []);

  // ストリームが接続できたら、videoのsourceにstreamを流し込む。
  useEffect(() => {
    if (inputVideo && mediaStream.current) {
      if(mediaStream.current instanceof Blob) {
        const blobUrl = URL.createObjectURL(mediaStream.current);
        inputVideo.current!.src = blobUrl;
      } else {
        inputVideo.current!.srcObject = mediaStream.current;
      }
    }
  }, [mediaStream.current]);

  useEffect(() => {
    const video = inputVideo.current;
    const oneSecMs = 1000; // 1秒のミリ秒換算
    let lastVideoTime = -1;
    let poseLandmarker: PoseLandmarker | null = null;
    
    const renderLoop = () => {
      if(video && video.currentTime !== lastVideoTime) {
        try {
          const time = video.currentTime * oneSecMs;
          const result = poseLandmarker!.detectForVideo(video, time);
          lastVideoTime = video.currentTime;
          console.log(result);
        } catch(e) {
          console.log(e);
        }
      }
    }
    const setupPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`, // モデルは一番軽量のものを選択
          delegate: "GPU", // GPUにすると滑らかに動作する
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      video!.addEventListener('loadeddata', renderLoop);

    };
    setupPoseLandmarker();

  }, [inputVideo.current])
  
  return(
    <div>
      <video autoPlay id='inputVideo' ref={inputVideo} width={canvasWidth} height={canvasHeight} />
      <canvas id="outputVideo" ref={outputVideo} width={canvasWidth} height={canvasHeight} />
    </div>
  )
}