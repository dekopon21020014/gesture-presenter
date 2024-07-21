import gsap from 'gsap';

export const Clap = async () => {
    const img = document.createElement('img');
    img.src = '/EffectsRoom/clap.png';
    img.style.position = 'fixed';
    img.style.whiteSpace = 'nowrap';
    img.style.left = `${document.documentElement.clientWidth}px`;
    img.style.zIndex = '9999'; // 最前面に表示するためのz-index
    const random = Math.round(Math.random() * document.documentElement.clientHeight);
    img.style.top = `${random}px`;
    img.style.height = '150px';
    document.body.appendChild(img);

    await gsap.to(img, {
      duration: 5, // 端から端まで5秒
      x: -1 * (document.documentElement.clientWidth + img.clientWidth),
      ease: 'linear' // 一定のスピードに設定
    });

    img.parentNode?.removeChild(img);
  };