import { useRef, useState, useEffect } from "react";
import { addTranscription } from '@/app/firebase/form/fileInfo'
import { useSearchParams } from 'next/navigation';
import { connect } from "http2";

type Hooks = {
  startRecording: () => void;
  stopRecording: (page: number) => void;
  isAudio: boolean;
  recording: boolean;
  audioFile: File | null; 
};

export const useWhisperHook = (): Hooks => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioFileRef = useRef<File | null>(null);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [recording, setRecording] = useState(false);
  const searchParams = useSearchParams();  

  const handleDataAvailable = (event: BlobEvent) => {
    // 音声ファイル生成
    const file = new File([event.data], "audio.webm", {
      type: event.data.type,
      lastModified: Date.now(),
    });
    audioFileRef.current = file;
    setAudioFile(file);
  };

  const startRecording = async () => {
    setAudioFile(null);
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
    const options = { mimeType: "audio/webm" }; 
    mediaRecorder.current = new MediaRecorder(stream, options);
    
    mediaRecorder.current.start();
    mediaRecorder.current.addEventListener("dataavailable", handleDataAvailable);
    setIsAudio(true);
  };

  const stopRecording = async (page: number) => {
    setRecording(false);
    // setAudioFile();
    // 録音停止
    // mediaRecorder.current?.requestData();
    mediaRecorder.current?.stop();
    setIsAudio(false);    
    await fetchTranscription(page);
  };

  const fetchTranscription = async (page: number) => {
    const transcription = await transcribe();
    if (transcription != null) {
      const pdfId = searchParams.get('pdf_id');
      if (pdfId) {
        addTranscription(pdfId, String(page-1), transcription,);
      }
    }
  };

  const transcribe = async (): Promise<string | null> => {    
    if (!audioFileRef.current) {      
      return null;
    } 
    // ファイルを送信するためにFormDataを作成
    const formData = new FormData();
    formData.append("voice", audioFileRef.current);
    
    try {
      const response = await fetch('/api/transcribe', {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return data.transcription;
      } else {
        console.error("Failed to send audio file:", response.statusText);
        console.log("Response:", response);
      }
    } catch (error) {      
      console.error("Error while sending audio file:", error);
      return null;
    }
    return null;
  };

  return {
    startRecording,
    stopRecording,
    isAudio,
    recording,
    audioFile
  };
}