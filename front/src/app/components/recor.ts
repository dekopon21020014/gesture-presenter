import { useRef, useState, useEffect } from "react";

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

  useEffect(() => {
    if (audioFile) {
      sendAudioFile();
    }
  }, [audioFile]);

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
    // sendAudioFile();
  };

  const sendAudioFile = async () => {
    if (!audioFile) return;
    // ファイルを送信するためにFormDataを作成
    const formData = new FormData();
    console.log("Audio File Set: ", audioFile);
    formData.append("file", audioFile);

    try {
      console.log("==============");
      const response = await fetch("http://localhost:8000/analyze_voice", {
        method: "POST",
        body: formData,
      });      
      if (response.ok) {
        //alert("Audio file sent successfully!");
        console.log("Response:", response);
      } else {
        console.error("Failed to send audio file:", response.statusText);
        console.log("Response:", response);    
      }
    } catch (error) {
      console.error("Error while sending audio file:", error);
      alert("Error occurred while sending audio file.");
    }
  };

  return {
    startRecording,
    stopRecording,
    isAudio,
    recording,
    audioFile
  };
}