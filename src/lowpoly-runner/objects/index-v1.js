// OBSTACLE SYSTEM
// ========================================

import * as Three from "three";

export const INIT_OBSTACLES = (Scene, Physics, Track, GAME_SPEED) => {
  const { LANE_CENTERS } = Track.constants;

  // CONSTATS
  const obstacles = [];
  const REMOVE_DISTANCE = 10;

  const OBSTACLES_PER_WAVE = 6;
  const GAP_BETWEEN_OBSTACLES = 3;
  const GAP_BETWEEN_WAVES = 0.5;

  const SHORT_OBSTACLE_DEPTH = 3;
  const LONG_OBSTACLE_DEPTH = 6;

  let nextWaveSpawnZ = -20;
  let wavesSpawned = 0;

  const createObstacle = (type, laneX, zPosition) => {
    let geometry;

    if (type === "short") {
      geometry = new Three.BoxGeometry(2.8, 1, SHORT_OBSTACLE_DEPTH);
    } else {
      geometry = new Three.BoxGeometry(2.8, 1, LONG_OBSTACLE_DEPTH);
    }

    const material = new Three.MeshStandardMaterial({
      color: 0xff4444,
      roughness: 0.7,
    });

    const obstacle = new Three.Mesh(geometry, material);
    obstacle.position.set(laneX, 0.5, zPosition);
    obstacle.userData.type = type;
    obstacle.userData.depth =
      type === "short" ? SHORT_OBSTACLE_DEPTH : LONG_OBSTACLE_DEPTH;

    // CREATE PHYSICS BODY FOR OBSTACLE
    if (Physics.isPhysicsReady()) {
      const rigidBody = Physics.createFixedBody({
        x: laneX,
        y: 0.5,
        z: zPosition,
      });

      const collider = Physics.createBoxCollider(rigidBody, {
        width: 2.8,
        height: 1,
        depth: obstacle.userData.depth,
      });

      Physics.registerPhysicsObject(obstacle, rigidBody, collider);
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

    for (let i = 0; i < OBSTACLES_PER_WAVE; i++) {
      const numLanesToBlock = Math.random() < 0.7 ? 1 : 2;
      const shuffled = [...allLanes].sort(() => Math.random() - 0.5);
      const lanesToBlock = shuffled.slice(0, numLanesToBlock);

      const obstacleType = Math.random() < 0.5 ? "short" : "long";
      const obstacleDepth =
        obstacleType === "short" ? SHORT_OBSTACLE_DEPTH : LONG_OBSTACLE_DEPTH;

      lanesToBlock.forEach((laneX) => {
        const obstacle = createObstacle(obstacleType, laneX, currentZ);
        obstacles.push(obstacle);
        Scene.add(obstacle);
      });

      currentZ -= obstacleDepth + GAP_BETWEEN_OBSTACLES;
    }

    nextWaveSpawnZ = currentZ - GAP_BETWEEN_WAVES;
    wavesSpawned++;
  };


const updateObstacles = () => {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.position.z += GAME_SPEED;
    
    // Update physics body position to match visual
    if (Physics.isPhysicsReady()) {
      const physicsData = Physics.getWorld().getRigidBody(obstacle.userData.rigidBodyHandle);
      if (physicsData) {
        physicsData.setTranslation({
          x: obstacle.position.x,
          y: obstacle.position.y,
          z: obstacle.position.z
        }, true);
      }
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


  // Spawn initial waves
  for (let i = 0; i < 10; i++) {
    spawnWave();
  }



  return { obstacles, updateObstacles };
};

// export const  objects = {
//     box: {
//         boxObject,
//         rotateBox
//     }
// }
