export async function processImageForMindAR(imageUrl: string): Promise<ArrayBuffer> {
  // Carregar a imagem
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // Converter para ArrayBuffer
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export async function initMindAR(container: HTMLElement, imageData: ArrayBuffer, videoUrl: string) {
  // Carregar scripts necessários
  await Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image.prod.js'),
    loadScript('https://aframe.io/releases/1.4.2/aframe.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js')
  ]);

  // Criar a cena AR
  const sceneEl = document.createElement('a-scene');
  sceneEl.setAttribute('mindar-image', `imageTargetSrc: ${URL.createObjectURL(new Blob([imageData]))}`);
  sceneEl.setAttribute('embedded', '');
  sceneEl.setAttribute('color-space', 'sRGB');
  sceneEl.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
  sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
  sceneEl.setAttribute('device-orientation-permission-ui', 'enabled: false');

  // Criar câmera AR
  const camera = document.createElement('a-camera');
  camera.setAttribute('position', '0 0 0');
  camera.setAttribute('look-controls', 'enabled: false');
  sceneEl.appendChild(camera);

  // Criar entidade para o vídeo
  const videoEl = document.createElement('a-video');
  videoEl.setAttribute('src', videoUrl);
  videoEl.setAttribute('width', '1');
  videoEl.setAttribute('height', '0.552');
  videoEl.setAttribute('position', '0 0 0');
  
  // Criar entidade target que mostrará o vídeo quando a estampa for detectada
  const target = document.createElement('a-entity');
  target.setAttribute('mindar-image-target', 'targetIndex: 0');
  target.appendChild(videoEl);
  sceneEl.appendChild(target);

  // Limpar e adicionar a cena ao container
  container.innerHTML = '';
  container.appendChild(sceneEl);

  // Iniciar o MindAR
  const mindar = new (window as any).MINDAR.IMAGE({
    container: container,
    imageTargetSrc: imageData,
  });

  await mindar.start();
  return mindar;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
