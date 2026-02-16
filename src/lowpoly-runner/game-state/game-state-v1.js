// GAME STATE MANAGEMENT
// ===========================================


export const INIT_GAME_STATE = (params) => {
    const {trackInstance, obstaclesInstance, playerInstance, Physics, isGameOver} = params

  const updateGame = () => {
  

   // Check if game is over
    if (isGameOver) {
      return; // Stop updating game
    }
  

  
  // updateGroundTiles();
  trackInstance.updateGroundTiles();

  // updateObstacles();
  obstaclesInstance.updateObstacles();

  // updatePlayer();
  playerInstance.updatePlayer();

  // updatePhysics();
  Physics.updatePhysics();
};


return {updateGame}
}

