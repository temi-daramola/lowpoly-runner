// INDEX.JS - MAIN ENTRY POINT
// ========================================

import * as Three from "three";
import { InitAnimation } from "../animate/animate";
import { InitCamera } from "../camera/camera";
import { InitScene } from "../environment/scene";
import { INIT_GAME_STATE } from "../game-state/game-state";
import { INIT_OBSTACLES } from "../objects";
import { INIT_PHYSICS } from "../physics/rapier";
import { INIT_TRACK } from "../track/track";
import { INIT_CONTROLS } from "../controls/controls";
import { INIT_PLAYER } from "../player/player";
import { INIT_UI } from "../ui-menu/ui-menu";
import { INIT_AUDIO } from "../audio/audio";

let GAME_SPEED = 0.3;

const Physics = INIT_PHYSICS();

// init the scene and renderer
const sceneInstance = InitScene();

// Init the camera
const cameraInstance = InitCamera(sceneInstance.scene, sceneInstance.renderer);

// ========================================
// INITIALIZE AUDIO
// ========================================
const Audio = INIT_AUDIO();

// ========================================
// INITIALIZE UI
// ========================================
const UI = INIT_UI();

// ========================================
// INITIALIZE TRACK
// ========================================
const trackInstance = INIT_TRACK(sceneInstance.scene, GAME_SPEED);

// INITIALIZE OBJECTS OR OBSTACLES (but don't spawn yet)
let obstaclesInstance = INIT_OBSTACLES(
  sceneInstance.scene,
  Physics,
  trackInstance,
  GAME_SPEED,
);

// INITIALIZE CHARACTER
let characterInstance = INIT_PLAYER(sceneInstance.scene, Physics);

// ========================================
// INITIALIZE GAME STATE
// ========================================
let params = {
  trackInstance,
  obstaclesInstance,
  characterInstance,
  Physics,
  controlsInstance: null,
};
let gameState = INIT_GAME_STATE(params);

// ========================================
// INITIALIZE CONTROLS
// ========================================
let controlsInstance = INIT_CONTROLS(characterInstance, trackInstance, Physics, gameState, UI, Audio);
params.controlsInstance = controlsInstance;
gameState.setControlsInstance(controlsInstance);

// ========================================
// COLLISION HANDLING
// ========================================
const setupCollisionHandler = () => {
  Physics.onCollision((obj1, obj2) => {
    console.log("Collision detected between:", obj1.userData, obj2.userData);
    
    const player = characterInstance.getPlayer();
    
    // Check if player exists and is loaded
    if (!player) return;
    
    // Check if player collided with obstacle
    if (obj1 === player || obj2 === player) {
      const state = gameState.getGameState();
      
      // Only trigger collision once
      if (!state.isGameOver) {
        console.log("COLLISION! Game Over!");
        
        // Play collision sound
        Audio.playCollision();
        
        // Hide mobile pause button on game over
        UI.hideMobilePauseButton();
        
        // Identify which object is the obstacle
        const obstacle = obj1 === player ? obj2 : obj1;
        
        // Change obstacle color to white to show collision point
        if (obstacle.userData.isObstacle) {
          obstacle.material.color.set(0xffffff);
        }
        
        // Switch player to dynamic for physics impact
        characterInstance.switchToDynamic();
        
        // Add impulse to knock player back dramatically
        const playerBody = player.userData.rigidBody;
        if (playerBody) {
          playerBody.applyImpulse({ x: 0, y: 5, z: 3 }, true);
          playerBody.applyTorqueImpulse({ x: 2, y: 0, z: 0 }, true);
        }
        
        // Freeze the game (stop track and obstacles)
        gameState.freezeGame();
        
        // Show game over menu after delay
        setTimeout(() => {
          UI.showGameOverMenu();
        }, 2000);
      }
    }
  });
};

const Animation = InitAnimation({
  sceneInstance,
  cameraInstance,
  update: (deltaTime) => gameState.updateGame(deltaTime),
});

// ========================================
// RESTART GAME FUNCTION
// ========================================
const restartGame = () => {
  console.log("Restarting game...");
  
  // Clear existing obstacles
  obstaclesInstance.obstacles.forEach(obstacle => {
    Physics.unregisterPhysicsObject(obstacle);
    sceneInstance.scene.remove(obstacle);
  });
  
  // Reinitialize obstacles
  obstaclesInstance = INIT_OBSTACLES(
    sceneInstance.scene,
    Physics,
    trackInstance,
    GAME_SPEED,
  );
  obstaclesInstance.initObstacles();
  
  // Reset character
  const player = characterInstance.getPlayer();
  if (player) {
    // FIRST: Reset physics body completely
    if (player.userData.rigidBody) {
      const rigidBody = player.userData.rigidBody;
      
      // Stop all movement
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
      
      // Reset position
      rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
      
      // Reset rotation to face forward (Math.PI on Y axis)
      player.rotation.set(0, Math.PI, 0);
      const playerQuaternion = new Three.Quaternion();
      playerQuaternion.setFromEuler(player.rotation);
      rigidBody.setRotation(
        { x: playerQuaternion.x, y: playerQuaternion.y, z: playerQuaternion.z, w: playerQuaternion.w },
        true
      );
      
      // Re-lock rotations and translations
      rigidBody.setEnabledRotations(false, false, false, true);
      rigidBody.lockTranslations(false, false, true, true);
    }
    
    // THEN: Set visual position (will be maintained by physics sync)
    player.position.set(0, 0, 0);
    player.rotation.set(0, Math.PI, 0);
    
    // Mark as non-dynamic
    player.userData.isDynamic = false;
  }
  
  // Reinitialize game state
  params.obstaclesInstance = obstaclesInstance;
  gameState = INIT_GAME_STATE(params);
  
  // Reinitialize controls with new game state
  controlsInstance.destroyControls();
  controlsInstance = INIT_CONTROLS(characterInstance, trackInstance, Physics, gameState, UI, Audio);
  params.controlsInstance = controlsInstance;
  gameState.setControlsInstance(controlsInstance);
  controlsInstance.initControls();
  
  // Re-setup collision handler
  setupCollisionHandler();
  
  // Start the game
  gameState.startGame();
  UI.hideGameOverMenu();
  UI.hidePauseMenu();
  
  // Show mobile pause button after restart
  UI.showMobilePauseButton();
};

// ========================================
// UI CALLBACKS
// ========================================
UI.onStart(() => {
  console.log("UI.onStart callback triggered!");
  gameState.startGame();
  Audio.playBackgroundMusic();
  
  // Show mobile pause button when game starts
  UI.showMobilePauseButton();
});

UI.onRestart(() => {
  restartGame();
  Audio.playBackgroundMusic();
});

UI.onResume(() => {
  gameState.resumeGame();
  UI.hidePauseMenu();
  
  // Show mobile pause button when resuming
  UI.showMobilePauseButton();
});

UI.onPause(() => {
  gameState.pauseGame();
});

// ========================================
// INITIALIZATION
// ========================================
async function init() {
  // Initialize physics first
  await Physics.initPhysics();
  
  // Initialize audio (preload sounds)
  await Audio.initAudio();

  // CREATE INVISIBLE GROUND FOR PLAYER TO STAND ON
  const groundBody = Physics.createFixedBody({ x: 0, y: -0.5, z: 0 });
  const groundCollider = Physics.createBoxCollider(groundBody, {
    width: 20,
    height: 1,
    depth: 200,
  });

  // Wait for character to load before creating physics body
  const waitForCharacter = setInterval(() => {
    const player = characterInstance.getPlayer();
    
    if (player && characterInstance.isModelLoaded()) {
      clearInterval(waitForCharacter);
      
      console.log("Character loaded, setting up physics...");
      
      // Create character physics body as DYNAMIC
      const characterRigidBody = Physics.createDynamicBody({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      });

      // Set the physics body rotation to match character's visual rotation
      const playerQuaternion = new Three.Quaternion();
      playerQuaternion.setFromEuler(player.rotation);
      characterRigidBody.setRotation(
        { x: playerQuaternion.x, y: playerQuaternion.y, z: playerQuaternion.z, w: playerQuaternion.w },
        true
      );

      // Lock rotations completely (no tipping or spinning)
      characterRigidBody.setEnabledRotations(false, false, false, true);
      // Lock Z translation completely (player stays at Z=0)
      characterRigidBody.lockTranslations(false, false, true, true);
      // Disable linear damping to prevent drift
      characterRigidBody.setLinearDamping(0.0);
      // Set mass to make collisions more noticeable
      characterRigidBody.setAdditionalMass(1.0, true);

      const characterCollider = Physics.createCapsuleCollider(
        characterRigidBody,
        0.25,
        0.8,
      );

      Physics.registerPhysicsObject(
        player,
        characterRigidBody,
        characterCollider,
      );

      // Set rigid body reference in character
      characterInstance.setRigidBody(characterRigidBody);

      // NOW spawn obstacles after physics is ready
      obstaclesInstance.initObstacles();

      // Initialize controls with Audio parameter
      controlsInstance.destroyControls();
      controlsInstance = INIT_CONTROLS(characterInstance, trackInstance, Physics, gameState, UI, Audio);
      controlsInstance.initControls();
      
      // Update game state with controls instance
      gameState.setControlsInstance(controlsInstance);
      
      // Setup collision handler
      setupCollisionHandler();

      console.log("Game initialized with physics!");
      console.log("Character position:", player.position);
      
      // Play idle animation
      characterInstance.playAnimation("idle");

      // Start game loop
      Animation.animate();

      UI.onLoadingComplete()
    }
  }, 100);
}

init();