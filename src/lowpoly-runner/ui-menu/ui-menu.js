// UI AND MENU SYSTEM
// ===========================================

export const INIT_UI = () => {
  let onStartCallback = null;
  let onRestartCallback = null;
  let onResumeCallback = null;
  let onPauseCallback = null;

  // Create main menu
  const mainMenu = document.createElement("div");
  mainMenu.id = "main-menu";
  mainMenu.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    gap: 30px;
  `;

  // ========================================
  // GAME TITLE
  // ========================================
  const title = document.createElement("h1");
  title.textContent = "Low Poly Runner";
  title.style.cssText = `
    color: #00ff00;
    font-size: 48px;
    font-family: Arial, sans-serif;
    margin: 0;

  `;

  // ========================================
  // INSTRUCTIONS
  // ========================================
  const instructions = document.createElement("div");
  instructions.style.cssText = `
    color: white;
    font-size: 18px;
    font-family: Arial, sans-serif;
    text-align: center;
    line-height: 1.6;
  `;
  instructions.innerHTML = `
    <p><strong>Desktop:</strong> Use Arrow Keys or A/D to switch lanes</p>
    <p><strong>Mobile:</strong> Swipe Left/Right to switch lanes</p>
    <p><strong>Pause:</strong> Press ESC</p>
  `;

  // ========================================
  // LOADING INDICATOR - NEW
  // ========================================
  const loadingContainer = document.createElement("div");
  loadingContainer.id = "loading-container";
  loadingContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  `;

  const loadingSpinner = document.createElement("div");
  loadingSpinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top: 5px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const loadingText = document.createElement("div");
  loadingText.textContent = "Loading...";
  loadingText.style.cssText = `
    color: white;
    font-size: 24px;
    font-family: Arial, sans-serif;
  `;

  loadingContainer.appendChild(loadingSpinner);
  loadingContainer.appendChild(loadingText);

  // Add spinner animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // ========================================
  // START BUTTON - INITIALLY HIDDEN
  // ========================================
  const startButton = document.createElement("button");
  startButton.textContent = "START GAME";
  startButton.style.cssText = `
    display: none;
    padding: 20px 40px;
    font-size: 24px;
    background: #00ff00;
    color: black;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  `;

  startButton.addEventListener("click", () => {
    console.log("Start button clicked!");
    mainMenu.style.display = "none";
    if (onStartCallback) {
      console.log("Calling onStartCallback...");
      onStartCallback();
    }
  });

  mainMenu.appendChild(title);
  mainMenu.appendChild(instructions);
  mainMenu.appendChild(loadingContainer);
  mainMenu.appendChild(startButton);
  document.body.appendChild(mainMenu);

  // ========================================
  // GAME OVER MENU - UNCHANGED
  // ========================================
  const gameOverMenu = document.createElement("div");
  gameOverMenu.id = "game-over-menu";
  gameOverMenu.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const gameOverText = document.createElement("h1");
  gameOverText.textContent = "GAME OVER";
  gameOverText.style.cssText = `
    color: #ff0000;
    font-size: 48px;
    margin-bottom: 30px;
  `;

  const restartButton = document.createElement("button");
  restartButton.textContent = "RESTART";
  restartButton.style.cssText = `
    padding: 20px 40px;
    font-size: 24px;
    background: #00ff00;
    color: black;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  `;
  

  restartButton.addEventListener("click", () => {
    gameOverMenu.style.display = "none";
    if (onRestartCallback) {
      onRestartCallback();
    }
  });

  gameOverMenu.appendChild(gameOverText);
  gameOverMenu.appendChild(restartButton);
  document.body.appendChild(gameOverMenu);

  // ========================================
  // PAUSE MENU - UNCHANGED
  // ========================================
  const pauseMenu = document.createElement("div");
  pauseMenu.id = "pause-menu";
  pauseMenu.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const pauseText = document.createElement("h1");
  pauseText.textContent = "PAUSED";
  pauseText.style.cssText = `
    color: #ffffff;
    font-size: 48px;
    margin-bottom: 30px;
  `;

  const resumeButton = document.createElement("button");
  resumeButton.textContent = "RESUME";
  resumeButton.style.cssText = `
    padding: 20px 40px;
    font-size: 24px;
    background: #00ff00;
    color: black;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 20px;
  `;

  const pauseRestartButton = document.createElement("button");
  pauseRestartButton.textContent = "RESTART";
  pauseRestartButton.style.cssText = `
    padding: 20px 40px;
    font-size: 24px;
    background: #ff8800;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  `;

  resumeButton.addEventListener("click", () => {
    pauseMenu.style.display = "none";
    if (onResumeCallback) {
      onResumeCallback();
    }
  });

  pauseRestartButton.addEventListener("click", () => {
    pauseMenu.style.display = "none";
    if (onRestartCallback) {
      onRestartCallback();
    }
  });

  pauseMenu.appendChild(pauseText);
  pauseMenu.appendChild(resumeButton);
  pauseMenu.appendChild(pauseRestartButton);
  document.body.appendChild(pauseMenu);

  // ========================================
  // MOBILE PAUSE BUTTON - NEW
  // ========================================
  const mobilePauseButton = document.createElement("button");
  mobilePauseButton.textContent = "PAUSE";
  mobilePauseButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: rgba(0, 255, 0, 0.8);
    color: black;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    z-index: 999;
    display: none;
  `;

  // Detect if device is mobile
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  mobilePauseButton.addEventListener("click", () => {
    pauseMenu.style.display = "flex";
    mobilePauseButton.style.display = "none";
    if (onPauseCallback) {
      onPauseCallback();
    }
  });

  if (isMobile) {
    document.body.appendChild(mobilePauseButton);
  }

  // ========================================
  // PUBLIC METHODS
  // ========================================

  // NEW: Method to hide loading and show start button
  const onLoadingComplete = () => {
    loadingContainer.style.display = "none";
    startButton.style.display = "block";
    console.log("Loading complete! Start button now visible.");
  };

  const showGameOverMenu = () => {
    gameOverMenu.style.display = "flex";
  };

  const hideGameOverMenu = () => {
    gameOverMenu.style.display = "none";
  };

  const showPauseMenu = () => {
    pauseMenu.style.display = "flex";
  };

  const hidePauseMenu = () => {
    pauseMenu.style.display = "none";
  };

  const showMobilePauseButton = () => {
    if (isMobile) {
      mobilePauseButton.style.display = "block";
    }
  };

  const hideMobilePauseButton = () => {
    mobilePauseButton.style.display = "none";
  };

  const onStart = (callback) => {
    onStartCallback = callback;
  };

  const onRestart = (callback) => {
    onRestartCallback = callback;
  };

  const onResume = (callback) => {
    onResumeCallback = callback;
  };

  const onPause = (callback) => {
    onPauseCallback = callback;
  };

  return {
    showGameOverMenu,
    hideGameOverMenu,
    showPauseMenu,
    hidePauseMenu,
    onStart,
    onRestart,
    onResume,
    onPause,
    onLoadingComplete,
    showMobilePauseButton,
    hideMobilePauseButton,
  };
};