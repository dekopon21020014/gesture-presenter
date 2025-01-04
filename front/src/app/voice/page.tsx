"use client";

import { useWhisperHook } from "../components/recor";

const Page = () => {
  const { startRecording, stopRecording, recording, audioFile } = useWhisperHook();

  const downloadAudio = () => {
    if (!audioFile) return;
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(audioFile); // このままでも大丈夫
    link.download = audioFile.name;
    link.click();
    URL.revokeObjectURL(link.href);  // リンク生成後、URLを解放
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} /*disabled={recording}*/>
        Stop Recording
      </button>
      {recording && <div>Recording...</div>}
      {audioFile && (
        <div>
          <audio src={URL.createObjectURL(audioFile)} controls />
          <button onClick={downloadAudio}>Download</button>
        </div>
      )}
    </div>
  );
};

export default Page;
