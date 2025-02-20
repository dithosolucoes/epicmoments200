
declare global {
  const AFRAME: {
    registerComponent: (name: string, config: any) => void;
    components: {
      [key: string]: any;
    };
  };

  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-video': any;
      'a-marker': any;
    }
  }
}

interface AFrameSystem {
  stop: () => void;
}

interface AFrameScene extends HTMLElement {
  systems: {
    'mindar-image-system': AFrameSystem;
  };
}

export {};
