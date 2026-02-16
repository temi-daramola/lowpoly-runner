// INDEX.JS - MAIN ENTRY POINT
// ========================================

import { InitAnimation } from "../animate/animate";
import { InitCamera } from "../camera/camera";
import { InitScene } from "../environment/scene";
import { INIT_GAME_STATE } from "../game-state/game-state";
import { INIT_OBSTACLES } from "../objects";
import { INIT_PHYSICS } from "../physics/rapier";
import { INIT_PLAYER } from "../player/player";
import { INIT_TRACK } from "../track/track";

let GAME_SPEED = 0.09; /// or 0.5
let isGameOver = false;

const Physics = INIT_PHYSICS();

// // init the scene and renderer
const sceneInstance = InitScene();

// // Init the camera
const cameraInstance = InitCamera(sceneInstance.scene, sceneInstance.renderer);

// ========================================
// INITIALIZE TRACK
// ========================================
const trackInstance = INIT_TRACK(sceneInstance.scene, GAME_SPEED);

// INITIALIZE OBJECTS OR OBSTACLES
const obstaclesInstance = INIT_OBSTACLES(
  sceneInstance.scene,
  Physics,
  trackInstance,
  GAME_SPEED,
);

// INITIALIZE PLAYER
const playerInstance = INIT_PLAYER(sceneInstance.scene, Physics, GAME_SPEED);

// ========================================
// COLLISION HANDLING
// ========================================
Physics.onCollision((obj1, obj2) => {
  // Check if player collided with obstacle
  if (obj1 === playerInstance.player || obj2 === playerInstance.player) {
    console.log("COLLISION! Game Over!");
    isGameOver = true;

    // Change player color to red to indicate collision
    playerInstance.player.material.color.set(0xff0000);
  }
});

const params = {
  trackInstance,
  obstaclesInstance,
  playerInstance,
  Physics,
  isGameOver,
};
const gameState = INIT_GAME_STATE(params);

const Animation = InitAnimation({
  sceneInstance,
  cameraInstance,
  update: gameState.updateGame,
});

// ========================================
// INITIALIZATION
// ========================================
async function init() {
  // Initialize physics first
  await Physics.initPhysics();

  // Create player physics body
  const playerRigidBody = Physics.createKinematicBody({
    x: playerInstance.player.position.x,
    y: playerInstance.player.position.y,
    z: playerInstance.player.position.z,
  });

  const playerCollider = Physics.createCapsuleCollider(
    playerRigidBody,
    0.4, // radius
    1.5, // height
  );

  Physics.registerPhysicsObject(
    playerInstance.player,
    playerRigidBody,
    playerCollider,
  );

  console.log("Game initialized with physics!");

  // Start game loop
  Animation.animate();
}

init();
