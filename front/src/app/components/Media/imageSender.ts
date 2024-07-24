export const postCaptureImage = async (canvas: HTMLCanvasElement): Promise<number | null> => {
  if (!canvas) {
    return null;
  }

  try {
    const blob = await new Promise<Blob | null>((resolve) => 
      canvas.toBlob((result) => resolve(result), 'image/jpeg')
    );

    if (!blob) {
      throw new Error('Failed to create blob from canvas');
    }

    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');

    const response = await fetch('http://localhost:8000/yolo', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('画像がアップロードされました。表情id:', result.class_ids[0]);
    return result.class_ids[0];
  } catch (error) {
    console.error('画像のアップロードに失敗しました:', error);
    return null;
  }
};