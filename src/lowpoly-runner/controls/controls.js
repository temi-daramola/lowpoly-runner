// PLAYER CONTROLS
// ===========================================

export const INIT_CONTROLS = (
  Character,
  Track,
  Physics,
  GameState,
  UI,
  Audio,
) => {


   console.log("INIT_CONTROLS called with Audio:", !!Audio); // ADD THIS LINE
  // Visual lane centers (centered between lane lines)
  const VISUAL_LANE_CENTERS = {
    LEFT: -2.25, // Centered in left lane
    CENTER: 0, // Centered in middle lane
    RIGHT: 2.25, // Centered in right lane
  };

  // Track current lane
  let currentLane = "CENTER"; // START IN CENTER
  let targetX = VISUAL_LANE_CENTERS.CENTER;
  let isTransitioning = false;

  const TRANSITION_SPEED = 0.3; // How fast player moves between lanes

  // ========================================
  // MOBILE TOUCH CONTROLS - NEW ADDITION
  // ========================================
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50; // Minimum distance for swipe detection

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    const state = GameState.getGameState();

    // Don't process if game not running
    if (!state.isGameRunning || state.isGameOver || state.isPaused) return;

    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Check if it's a horizontal swipe (not vertical scroll)
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > SWIPE_THRESHOLD
    ) {
      event.preventDefault(); // Prevent default only for valid swipes

      // Prevent lane switching during transition
      if (isTransitioning) return;

      // Check if character is in dynamic mode (game over)
      const player = Character.getPlayer();
      if (player && player.userData.isDynamic) return;

      if (deltaX > 0) {
        // Swipe RIGHT
        if (currentLane === "LEFT") {
          currentLane = "CENTER";
          targetX = VISUAL_LANE_CENTERS.CENTER;
          isTransitioning = true;
          if (Audio) Audio.playLaneSwitch(); // Play switch sound
        } else if (currentLane === "CENTER") {
          currentLane = "RIGHT";
          targetX = VISUAL_LANE_CENTERS.RIGHT;
          isTransitioning = true;
          if (Audio) Audio.playLaneSwitch(); // Play switch sound
        }
      } else {
        // Swipe LEFT
        if (currentLane === "CENTER") {
          currentLane = "LEFT";
          targetX = VISUAL_LANE_CENTERS.LEFT;
          isTransitioning = true;
          if (Audio) Audio.playLaneSwitch(); // Play switch sound
        } else if (currentLane === "RIGHT") {
          currentLane = "CENTER";
          targetX = VISUAL_LANE_CENTERS.CENTER;
          isTransitioning = true;
          if (Audio) Audio.playLaneSwitch(); // Play switch sound
        }
      }
    }
  };

  // ========================================
  // DESKTOP KEYBOARD CONTROLS - UNCHANGED
  // ========================================
  const handleKeyDown = (event) => {
    const state = GameState.getGameState();

    // Handle pause key (ESC)
    if (event.key === "Escape") {
      if (!state.gameStarted || state.isGameOver) return;

      if (state.isPaused) {
        GameState.resumeGame();
        UI.hidePauseMenu();
      } else {
        GameState.pauseGame();
        UI.showPauseMenu();
      }
      return;
    }

    // Don't process movement if game not running
    if (!state.isGameRunning || state.isGameOver || state.isPaused) return;

    // Prevent lane switching during transition
    if (isTransitioning) return;

    // Check if character is in dynamic mode (game over)
    const player = Character.getPlayer();
    if (player && player.userData.isDynamic) return;

    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      // Move left
      if (currentLane === "CENTER") {
        currentLane = "LEFT";
        targetX = VISUAL_LANE_CENTERS.LEFT;
        isTransitioning = true;
        if (Audio) Audio.playLaneSwitch(); // Play switch sound
      } else if (currentLane === "RIGHT") {
        currentLane = "CENTER";
        targetX = VISUAL_LANE_CENTERS.CENTER;
        isTransitioning = true;
        if (Audio) Audio.playLaneSwitch(); // Play switch sound
      }
    } else if (
      event.key === "ArrowRight" ||
      event.key === "d" ||
      event.key === "D"
    ) {
      // Move right
      if (currentLane === "CENTER") {
        currentLane = "RIGHT";
        targetX = VISUAL_LANE_CENTERS.RIGHT;
        isTransitioning = true;
        if (Audio) Audio.playLaneSwitch(); // Play switch sound
      } else if (currentLane === "LEFT") {
        currentLane = "CENTER";
        targetX = VISUAL_LANE_CENTERS.CENTER;
        isTransitioning = true;
        if (Audio) Audio.playLaneSwitch(); // Play switch sound
      }
    }
  };

  // Start listening for keyboard and touch input
  const initControls = () => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    console.log(
      "Controls initialized - Keyboard: Arrow Keys/A/D, Mobile: Swipe Left/Right, ESC to pause",
    );
  };

  // Update player position smoothly - UNCHANGED
  const updateControls = () => {
    const player = Character.getPlayer();

    // Don't update if character is in dynamic mode (game over)
    if (player && player.userData.isDynamic) return;

    if (isTransitioning && player) {
      // Smoothly move player to target lane
      const currentX = player.position.x;
      const diff = targetX - currentX;

      if (Math.abs(diff) < 0.05) {
        // Close enough, snap to target
        player.position.x = targetX;
        isTransitioning = false;
      } else {
        // Move towards target
        player.position.x += diff * TRANSITION_SPEED;
      }

      // Update physics body to match visual position
      if (Physics.isPhysicsReady() && player.userData.rigidBody) {
        const rigidBody = player.userData.rigidBody;
        rigidBody.setTranslation(
          {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
          },
          true,
        );
      }
    }
  };

  // Cleanup - NOW INCLUDES TOUCH LISTENERS
  const destroyControls = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  return {
    initControls,
    updateControls,
    destroyControls,
  };
};
