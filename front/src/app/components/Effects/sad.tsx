export const Sad = async () => {
    const img = document.createElement('img');
    img.src = '/EffectsRoom/sad.png';
    img.style.position = 'fixed';
    img.style.right = '0%';
    img.style.bottom = '0%';
    img.style.zIndex = '9999'; // 最前面に表示するためのz-index
    img.style.height = '300px';
    document.body.appendChild(img);

    setTimeout(() => {
        img.parentNode?.removeChild(img);
    }, 3000);
  };