// ANIMATION LOOP
// ========================================

import * as Three from "three";

export const InitAnimation = ({ sceneInstance, cameraInstance, update }) => {
  const { scene, renderer } = sceneInstance;
  const { camera } = cameraInstance;

  const clock = new Three.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    update(deltaTime);
    renderer.render(scene, camera);
  };

  return { animate };
};