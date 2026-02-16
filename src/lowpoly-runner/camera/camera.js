// CAMERA SETUP

// ===========================================
import * as Three from "three";

export const InitCamera = (scene) => {
  //   setup the camera
  const fieldOfView = 50;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const range = { near: 0.1, far: 10000 };
  const camera = new Three.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    range.near,
    range.far
  );

  // Subway Surfers style camera positioning
  // Higher and further back, looking DOWN at a steep angle to see over obstacles
  camera.position.set(0, 9, 10);   // High elevation (y=9), far back (z=10)
  camera.lookAt(0, 0, -10);         // Look far ahead down the track, steep downward angle

  // add the camera to the scene
  scene.add(camera);

  return { camera };
};