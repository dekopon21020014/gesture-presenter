import { useRef, useState } from "react";

type Hooks = {
  startRecording: () => void;
  stopRecording: () => void;
  isAudio: boolean;
  recording: boolean;
  audioFile: File | null; 
};

export const useWhisperHook = (): Hooks => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [recording, setRecording] = useState(false);

  const handleDataAvailable = (event: BlobEvent) => {
    // 音声ファイル生成
    const file = new File([event.data], "audio.webm", {
      type: event.data.type,
      lastModified: Date.now(),
    });
    setAudioFile(file);
  };

  const startRecording = async () => {
    setAudioFile(null);
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
    // ここで MimeType を指定
    const options = { mimeType: "audio/webm" }; // webm 形式がブラウザで広くサポートされています
    mediaRecorder.current = new MediaRecorder(stream, options);
    
    mediaRecorder.current.start();
    mediaRecorder.current.addEventListener("dataavailable", handleDataAvailable);
    setIsAudio(true);
  };

  const stopRecording = () => {
    setRecording(false);
    // 録音停止
    mediaRecorder.current?.stop();
    setIsAudio(false);
  };

  return {
    startRecording,
    stopRecording,
    isAudio,
    recording,
    audioFile
  };
}