// GAME STATE MANAGEMENT
// ===========================================

export const INIT_GAME_STATE = (params) => {
  const { trackInstance, obstaclesInstance, playerInstance, Physics } = params;

  // Game state managed internally
  let isGameRunning = true;
  let isGameOver = false;

  const freezeGame = () => {
    isGameRunning = false;
    isGameOver = true;
    console.log("Game frozen!");
  };

  const updateGame = () => {
    // Check if game is over
    if (!isGameRunning || isGameOver) {
      // Still update physics to show collision impact
      Physics.updatePhysics();
      return; // Stop updating everything else
    }

    // Normal game updates
    trackInstance.updateGroundTiles();
    obstaclesInstance.updateObstacles();
    playerInstance.updatePlayer();
    Physics.updatePhysics();
  };

  const getGameState = () => {
    return {
      isGameRunning,
      isGameOver,
    };
  };

  return {
    updateGame,
    freezeGame,
    getGameState,
  };
};
