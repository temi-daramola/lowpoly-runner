// AUDIO SYSTEM
// ========================================

export const INIT_AUDIO = () => {
  // Audio file paths
  const AUDIO_PATHS = {
    background: './sounds/background.mp3',
    crash: './sounds/crash.wav',
    switch: './sounds/switch.wav',
  };

  // Audio elements
  let backgroundMusic = null;
  let crashSound = null;
  let switchSound = null;
  let isLoaded = false;

  /**
   * Initialize and preload all audio files
   * Returns a promise that resolves when all sounds are loaded
   */
  const initAudio = () => {
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      const totalSounds = 3;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalSounds) {
          isLoaded = true;
          console.log("All audio files loaded successfully!");
          resolve();
        }
      };

      const handleError = (soundName) => {
        console.error(`Failed to load ${soundName}`);
        // Still resolve even if sounds fail - game should work without audio
        checkAllLoaded();
      };

      // Create and load background music
      backgroundMusic = new Audio(AUDIO_PATHS.background);
      backgroundMusic.loop = true; // Loop background music
      backgroundMusic.volume = 0.5; // 50% volume
      backgroundMusic.addEventListener('canplaythrough', checkAllLoaded, { once: true });
      backgroundMusic.addEventListener('error', () => handleError('background music'), { once: true });
      backgroundMusic.load();

      // Create and load crash sound
      crashSound = new Audio(AUDIO_PATHS.crash);
      crashSound.volume = 0.7; // 70% volume
      crashSound.addEventListener('canplaythrough', checkAllLoaded, { once: true });
      crashSound.addEventListener('error', () => handleError('crash sound'), { once: true });
      crashSound.load();

      // Create and load switch sound
      switchSound = new Audio(AUDIO_PATHS.switch);
      switchSound.volume = 0.4; // 40% volume (quieter so it doesn't get annoying)
      switchSound.addEventListener('canplaythrough', checkAllLoaded, { once: true });
      switchSound.addEventListener('error', () => handleError('switch sound'), { once: true });
      switchSound.load();
    });
  };

  /**
   * Play background music
   */
  const playBackgroundMusic = () => {
    if (!isLoaded || !backgroundMusic) return;
    
    backgroundMusic.currentTime = 0; // Start from beginning
    backgroundMusic.play().catch(err => {
      console.warn("Background music play failed:", err);
    });
  };

  /**
   * Stop background music
   */
  const stopBackgroundMusic = () => {
    if (!isLoaded || !backgroundMusic) return;
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  };

  /**
   * Play lane switch sound
   */
  const playLaneSwitch = () => {
    
    if (!isLoaded || !switchSound) return;
    
    // Reset to start and play (allows rapid successive plays)
    switchSound.currentTime = 0;
    switchSound.play().catch(err => {
      console.warn("Switch sound play failed:", err);
    });
  };

  /**
   * Play collision/crash sound
   */
  const playCollision = () => {
    if (!isLoaded || !crashSound) return;
    
    crashSound.currentTime = 0;
    crashSound.play().catch(err => {
      console.warn("Crash sound play failed:", err);
    });
  };

  /**
   * Check if audio is loaded
   */
  const isAudioLoaded = () => {
    return isLoaded;
  };

  return {
    initAudio,
    playBackgroundMusic,
    stopBackgroundMusic,
    playLaneSwitch,
    playCollision,
    isAudioLoaded,
  };
};