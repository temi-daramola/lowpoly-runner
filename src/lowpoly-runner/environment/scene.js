// SCENE SETUP

// ===========================================

import * as Three from "three";

export const InitScene = () => {
  const sceneColor = 0x87ceeb;
  const scene = new Three.Scene();
  scene.background = new Three.Color(sceneColor);

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const renderer = new Three.WebGLRenderer({ antialias: true });
  renderer.setSize(windowWidth, windowHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new Three.DirectionalLight(0xffffff, 2);
  light.position.set(10, 10, 10);
  scene.add(light);

  // Optionally, add some ambient light for softer shadows:
  const ambient = new Three.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  return { scene, renderer };
};

