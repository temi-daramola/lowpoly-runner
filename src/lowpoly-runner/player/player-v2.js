// PLAYER SETUP
// ===========================================

import * as Three from "three";

export const INIT_PLAYER = (Scene, Physics) => {
  const playerGeometry = new Three.BoxGeometry(0.8, 1.5, 0.8);
  const playerMaterial = new Three.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new Three.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0.75, 0);
  
  // MARK AS PLAYER
  player.userData.isPlayer = true;
  player.userData.isDynamic = false;
  
  Scene.add(player);

  let playerRigidBody = null;

  // Store rigid body reference
  const setRigidBody = (rigidBody) => {
    playerRigidBody = rigidBody;
    // Also store on player for easy access
    player.userData.rigidBody = rigidBody;
  };

  // Convert player to fully dynamic (unlocks all constraints for impact)
  const switchToDynamic = () => {
    if (playerRigidBody && Physics.isPhysicsReady() && !player.userData.isDynamic) {
      // Unlock all rotations to allow tumbling
      playerRigidBody.setEnabledRotations(true, true, true, true);
      // Unlock Z translation so player can be knocked back
      playerRigidBody.lockTranslations(false, false, false, true);
      player.userData.isDynamic = true;
      // Store reference to rigid body on player for collision impulse
      player.userData.rigidBody = playerRigidBody;
      console.log("Player switched to full dynamic mode for collision impact");
    }
  };

  const updatePlayer = () => {
    // Player physics body updates automatically via syncVisualPositions
    // Just keep Z position locked during normal gameplay
    if (playerRigidBody && Physics.isPhysicsReady() && !player.userData.isDynamic) {
      const currentPos = playerRigidBody.translation();
      if (Math.abs(currentPos.z) > 0.1) {
        playerRigidBody.setTranslation({ x: currentPos.x, y: currentPos.y, z: 0 }, true);
      }
    }
  };

  return { player, updatePlayer, setRigidBody, switchToDynamic };
};