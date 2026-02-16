// PLAYER SETUP
// ===========================================

import * as Three from "three";

export const INIT_PLAYER = (Scene, Physics) => {
  const playerGeometry = new Three.BoxGeometry(0.8, 1.5, 0.8);
  const playerMaterial = new Three.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new Three.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0.75, 0);
  
  // MARK AS PLAYER (important for physics sync)
  player.userData.isPlayer = true;
  
  Scene.add(player);

  let playerRigidBody = null;

  // Store rigid body reference
  const setRigidBody = (rigidBody) => {
    playerRigidBody = rigidBody;
  };

  const updatePlayer = () => {
    // Update Rapier body to match visual position
    if (playerRigidBody && Physics.isPhysicsReady()) {
      Physics.moveKinematicBody(playerRigidBody, {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      });
    }
  };

  return { player, updatePlayer, setRigidBody };
};