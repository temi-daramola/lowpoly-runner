// OBSTACLE SYSTEM
// ========================================

import * as Three from "three";

export const INIT_OBSTACLES = (Scene, Physics, Track, GAME_SPEED) => {
  const { LANE_CENTERS } = Track.constants;

  // CONSTANTS
  const obstacles = [];
  const REMOVE_DISTANCE = 10;

  const OBSTACLES_PER_WAVE = 6;
  const GAP_BETWEEN_OBSTACLES = 6;
  const GAP_BETWEEN_WAVES = 2;

  const SHORT_OBSTACLE_DEPTH = 2;
  const LONG_OBSTACLE_DEPTH = 8;  // Back to 8 - we'll handle overlaps properly

  let nextWaveSpawnZ = -20;
  let wavesSpawned = 0;

  const createObstacle = (type, laneX, zPosition) => {
    let geometry;
    let color;

    if (type === "short") {
      // Short barrier - reduced height
      geometry = new Three.BoxGeometry(2.4, 1.8, SHORT_OBSTACLE_DEPTH);
      color = 0xff8800; // Bright orange for short obstacles
    } else {
      // Long barrier - reduced height but MUCH longer depth
      geometry = new Three.BoxGeometry(2.4, 2, LONG_OBSTACLE_DEPTH);
      color = 0xff00ff; // Bright magenta/pink for long obstacles
    }

    const material = new Three.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      emissive: color,        // Make it glow with its own color
      emissiveIntensity: 0.4, // Brightness of the glow
    });

    const obstacle = new Three.Mesh(geometry, material);
    
    // Position obstacle so bottom sits on ground
    const obstacleHeight = type === "short" ? 1.8 : 2;
    obstacle.position.set(laneX, obstacleHeight / 2, zPosition);
    
    obstacle.userData.type = type;
    obstacle.userData.isObstacle = true;
    obstacle.userData.depth =
      type === "short" ? SHORT_OBSTACLE_DEPTH : LONG_OBSTACLE_DEPTH;
    obstacle.userData.height = obstacleHeight;

    // CREATE PHYSICS BODY FOR OBSTACLE - USE KINEMATIC SO WE CAN MOVE IT
    if (Physics.isPhysicsReady()) {
      const rigidBody = Physics.createKinematicBody({
        x: laneX,
        y: obstacle.userData.height / 2,
        z: zPosition,
      });

      const collider = Physics.createBoxCollider(rigidBody, {
        width: 2.4,  // Match visual width
        height: obstacle.userData.height,  // Match visual height
        depth: obstacle.userData.depth,
      });

      Physics.registerPhysicsObject(obstacle, rigidBody, collider);
      
      // Store rigid body reference for updates
      obstacle.userData.rigidBody = rigidBody;
    }

    return obstacle;
  };

  const spawnWave = () => {
    const allLanes = [
      LANE_CENTERS.LEFT,
      LANE_CENTERS.CENTER,
      LANE_CENTERS.RIGHT,
    ];
    let currentZ = nextWaveSpawnZ;
    
    // Track which Z-ranges are occupied in each lane
    const laneOccupancy = {
      [LANE_CENTERS.LEFT]: [],
      [LANE_CENTERS.CENTER]: [],
      [LANE_CENTERS.RIGHT]: []
    };

    for (let i = 0; i < OBSTACLES_PER_WAVE; i++) {
      const obstacleType = Math.random() < 0.5 ? "short" : "long";
      const obstacleDepth =
        obstacleType === "short" ? SHORT_OBSTACLE_DEPTH : LONG_OBSTACLE_DEPTH;
      
      const obstacleStart = currentZ;
      const obstacleEnd = currentZ + obstacleDepth;
      
      // Find which lanes are currently free at this Z position
      const freeLanes = allLanes.filter(lane => {
        // Check if this lane has any obstacles overlapping with this position
        for (const occupied of laneOccupancy[lane]) {
          if (!(obstacleEnd < occupied.start || obstacleStart > occupied.end)) {
            return false; // Overlap detected
          }
        }
        return true; // No overlap, lane is free
      });
      
      // If all lanes would be blocked, force at least one to be free
      let lanesToBlock;
      if (freeLanes.length === 0) {
        console.warn("All lanes blocked! Forcing one free lane");
        // Pick a random lane to keep free
        const forcedFreeLane = allLanes[Math.floor(Math.random() * 3)];
        lanesToBlock = allLanes.filter(lane => lane !== forcedFreeLane);
      } else if (freeLanes.length === 1) {
        // Only one free lane, block the others
        lanesToBlock = allLanes.filter(lane => lane !== freeLanes[0]);
      } else {
        // Multiple free lanes available
        // Randomly block 1 or 2 of them, but guarantee at least 1 stays free
        const numToBlock = Math.min(freeLanes.length - 1, Math.random() < 0.6 ? 1 : 2);
        const shuffled = [...freeLanes].sort(() => Math.random() - 0.5);
        lanesToBlock = shuffled.slice(0, numToBlock);
      }

      // Spawn obstacles and record occupancy
      lanesToBlock.forEach((laneX) => {
        const obstacle = createObstacle(obstacleType, laneX, currentZ);
        obstacles.push(obstacle);
        Scene.add(obstacle);
        
        // Record this lane's occupancy
        laneOccupancy[laneX].push({
          start: obstacleStart,
          end: obstacleEnd
        });
      });

      currentZ -= obstacleDepth + GAP_BETWEEN_OBSTACLES;
    }

    nextWaveSpawnZ = currentZ - GAP_BETWEEN_WAVES;
    wavesSpawned++;
  };

  const updateObstacles = () => {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      
      // Move visual mesh
      obstacle.position.z += GAME_SPEED;
      
      // Update physics body position using kinematic movement
      if (obstacle.userData.rigidBody && Physics.isPhysicsReady()) {
        Physics.moveKinematicBody(obstacle.userData.rigidBody, {
          x: obstacle.position.x,
          y: obstacle.position.y,
          z: obstacle.position.z
        });
      }
      
      if (obstacle.position.z > REMOVE_DISTANCE) {
        // Remove physics body before removing visual
        Physics.unregisterPhysicsObject(obstacle);
        
        Scene.remove(obstacle);
        obstacles.splice(i, 1);
        spawnWave();
      }
    }
  };

  // NEW: Initialize obstacles - called after physics is ready
  const initObstacles = () => {
    // Spawn initial waves
    for (let i = 0; i < 10; i++) {
      spawnWave();
    }
    console.log("Obstacles initialized with physics");
  };

  return { obstacles, updateObstacles, initObstacles };
};