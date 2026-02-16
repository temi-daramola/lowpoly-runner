// GAME STATE MANAGEMENT
// ===========================================

export const INIT_GAME_STATE = (params) => {
  let {
    trackInstance,
    obstaclesInstance,
    characterInstance,
    Physics,
    controlsInstance,
    Audio,
  } = params;

  // Allow updating controlsInstance reference
  const setControlsInstance = (controls) => {
    controlsInstance = controls;
  };

  // Allow updating Audio reference
  const setAudio = (audio) => {
    Audio = audio;
  };

  // Game state managed internally
  let isGameRunning = false; // Start as false, waiting for start menu
  let isGameOver = false;
  let isPaused = false;
  let gameStarted = false;

  const startGame = () => {
    isGameRunning = true;
    isGameOver = false;
    isPaused = false;
    gameStarted = true;

    // Hide mouse cursor during gameplay
    document.body.style.cursor = "none";

    // Start run animation
    characterInstance.playAnimation("run");

    console.log("Game started!");
    console.log("isGameRunning:", isGameRunning);
  };

  const pauseGame = () => {
    if (isGameOver || !gameStarted) return;
    isPaused = true;
    isGameRunning = false;

    // Show mouse cursor when paused
    document.body.style.cursor = "default";

    // Pause background music
    if (Audio) {
      Audio.stopBackgroundMusic();
    }

    console.log("Game paused!");
  };

  const resumeGame = () => {
    if (isGameOver || !gameStarted) return;
    isPaused = false;
    isGameRunning = true;

    // Hide mouse cursor when resumed
    document.body.style.cursor = "none";

    // Resume background music
    if (Audio) {
      Audio.playBackgroundMusic();
    }

    console.log("Game resumed!");
  };

  const freezeGame = () => {
    isGameRunning = false;
    isGameOver = true;

    // Show mouse cursor when game over
    document.body.style.cursor = "default";

    // Stop background music
    if (Audio) {
      Audio.stopBackgroundMusic();
    }

    console.log("Game frozen!");
  };

  const updateGame = (deltaTime) => {
    // Always update character animations
    characterInstance.updateCharacter(deltaTime);

    // Check if game is paused or over
    if (!isGameRunning) {
      // Still update physics to show collision impact
      if (isGameOver) {
        Physics.updatePhysics();
      }
      return; // Stop updating everything else
    }

    // Normal game updates
    trackInstance.updateGroundTiles();
    obstaclesInstance.updateObstacles();
    if (controlsInstance) {
      controlsInstance.updateControls();
    }
    Physics.updatePhysics();
  };

  const getGameState = () => {
    return {
      isGameRunning,
      isGameOver,
      isPaused,
      gameStarted,
    };
  };

  return {
    updateGame,
    startGame,
    pauseGame,
    resumeGame,
    freezeGame,
    getGameState,
    setControlsInstance,
    setAudio,
  };
};
