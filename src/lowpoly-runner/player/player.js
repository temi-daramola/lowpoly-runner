// CHARACTER SETUP WITH GLTF MODEL
// ===========================================

import * as Three from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export const INIT_PLAYER = (Scene, Physics) => {
  // const MODEL_PATH = "./assets/y-bot-movement.glb";
    const MODEL_PATH = "./assets/boy.compressed-1.glb";

    const AnimationNames = {
    SAD_IDLE: "sad idle",
    RUN: "run",
    STANDARD_RUN: "standard run",
  };
  const AnimationAliases = {
    idle: "idle",
    run: "run",
  };

  let character = null;
  let characterMixer = null;
  let animations = {};
  let currentAnimation = null;
  let characterRigidBody = null;
  let isModelLoaded = false;

  // Load GLTF model with Draco support
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  // Set the path to the Draco decoder files (adjust if needed)
  dracoLoader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  
  loader.load(
    MODEL_PATH,
    (gltf) => {
      character = gltf.scene;
      
      // Position and scale character
      character.position.set(0, 0.75, 0);
      character.scale.set(0.6, 0.6, 0.6);
      
      // Rotate character to face away from camera (into the scene)
      character.rotation.y = Math.PI;
      
      // Mark as player
      character.userData.isPlayer = true;
      character.userData.isDynamic = false;
      
      // Setup animations
      characterMixer = new Three.AnimationMixer(character);
      
      gltf.animations.forEach((clip) => {
        const animationName = clip.name.toLowerCase();
        console.log("Found animation clip:", animationName);
        
        // if (animationName.includes("idle")) {
        //   animations.idle = characterMixer.clipAction(clip);
        // } else if (animationName.includes("run")) {
        //   animations.run = characterMixer.clipAction(clip);
        // }

         if (animationName.includes(AnimationNames.SAD_IDLE)) {
          animations.idle = characterMixer.clipAction(clip);
        } else if (animationName.includes(AnimationNames.STANDARD_RUN)) {
          animations.run = characterMixer.clipAction(clip);
        }
      });
      
      // Add character to scene
      Scene.add(character);
      isModelLoaded = true;
      
      console.log("Character model loaded successfully");
      console.log("Available animations keys:", Object.keys(animations));
        console.log("Available animations values:", Object.values(animations));
      
      // Auto-play idle animation when model loads
      if (animations.idle) {
        // playAnimation("idle");
          playAnimation(AnimationAliases.idle);
      }
    },
    (progress) => {
      console.log("Loading character:", (progress.loaded / progress.total * 100) + "%");
    },
    (error) => {
      console.error("Error loading character model:", error);
    }
  );

  // Play animation
  const playAnimation = (animationName) => {

    console.log(`Request to play animation: ${animationName}`);
    if (!isModelLoaded) {
      console.warn(`Cannot play animation "${animationName}" - model not loaded yet`);
      return;
    }
    
    if (!animations[animationName]) {
      console.warn(`Animation "${animationName}" not available. Available:`, Object.keys(animations));
      return;
    }

    // Stop current animation
    if (currentAnimation) {
      currentAnimation.fadeOut(0.3);
    }

    // Play new animation
    currentAnimation = animations[animationName];
    currentAnimation.reset().fadeIn(0.3).play();
    console.log(`Playing animation: ${animationName}`);
  };

  // Store rigid body reference
  const setRigidBody = (rigidBody) => {
    characterRigidBody = rigidBody;
    
    if (character) {
      character.userData.rigidBody = rigidBody;
    }
  };

  // Convert to fully dynamic for collision
  const switchToDynamic = () => {
    if (!character) return;
    
    if (characterRigidBody && Physics.isPhysicsReady() && !character.userData.isDynamic) {
      characterRigidBody.setEnabledRotations(true, true, true, true);
      characterRigidBody.lockTranslations(false, false, false, true);
      character.userData.isDynamic = true;
      character.userData.rigidBody = characterRigidBody;
      console.log("Character switched to full dynamic mode for collision impact");
    }
  };

  // Update character
  const updateCharacter = (deltaTime) => {
    // Update animation mixer
    if (characterMixer && isModelLoaded) {
      characterMixer.update(deltaTime);
    }

    // Update physics position lock if not dynamic
    if (!character) return;
    
    if (characterRigidBody && Physics.isPhysicsReady() && !character.userData.isDynamic) {
      const currentPos = characterRigidBody.translation();
      if (Math.abs(currentPos.z) > 0.1) {
        characterRigidBody.setTranslation({ x: currentPos.x, y: currentPos.y, z: 0 }, true);
      }
    }
  };

  // Get the current player object
  const getPlayer = () => {
    return character;
  };

  return {
    getPlayer,
    updateCharacter,
    setRigidBody,
    switchToDynamic,
    playAnimation,
    isModelLoaded: () => isModelLoaded,
    AnimationAliases
  };
};