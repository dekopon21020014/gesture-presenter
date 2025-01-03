import { RefObject, useEffect, useRef, useState } from "react";

export const useStream = (inputVideo: RefObject<HTMLVideoElement>, width: number, height: number) => {
  const mediaStream = useRef<MediaStream | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  
   // コンポーネントのマウント時にカメラのストリームを確保する
   useEffect(() => {
    let ignore = false;
    const setupCamera = async () => {
      mediaStream.current?.getTracks().forEach(track => track.stop()); // 念の為ストリームを一度解放
      if(!ignore) { // アンマウント時は実行しない．
        // clientのカメラを確認．映像を取得する．
        mediaStream.current = await navigator.mediaDevices.getUserMedia({
          video: { width: width, height: height },
          audio: false
        });
      }

      if (inputVideo && mediaStream.current) {
        inputVideo.current!.srcObject = mediaStream.current;
      }

      setStreamReady(true);
    }
    setupCamera();
    
    return (() => {
      ignore = true;
      mediaStream.current?.getTracks().forEach(track => track.stop())
    });

  }, [inputVideo, width, height]);

  return { streamReady }
}