export const postCaptureImage = (canvas: HTMLCanvasElement) => {

  const handleUpload = async () => {
    if (canvas) {
      const imageData = canvas.toDataURL('image/jpeg');
      try {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('画像がアップロードされました:', result.fileName);
      } catch (error) {
        console.error('画像のアップロードに失敗しました:', error);
      }
    }
  };

  handleUpload();
}