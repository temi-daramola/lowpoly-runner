// TRACK SYSTEM
// ===========================================

import * as Three from "three";

const createLane = (xPosition, TRACK_LENGTH) => {
  // Make line length match the track tile length
  const lineGeometry = new Three.PlaneGeometry(.1, TRACK_LENGTH);
  // const mediumGrey =  0x222222
  //  const lightGrey =  0xcccccc
   const mediumGrey =  0x888888;
const lightGrey =  0xcccccc;
const lightGrey2 =  0xdddddd;

  const lineMaterial = new Three.MeshStandardMaterial({
    color: mediumGrey,
    side: Three.DoubleSide,
  // emissive: 0x000000,        // Add this - makes it emit black
  //  emissiveIntensity: 2.5,    // Add this - controls how "dark" it appears
  });
  const lineMesh = new Three.Mesh(lineGeometry, lineMaterial);
  lineMesh.rotation.x = -Math.PI / 2;
  lineMesh.position.set(xPosition, 0.01, 0); // Z position will be set relative to parent tile
  return lineMesh;
};

const createTrack = (TRACK_LENGTH, zPos) => {
  const leftLine = createLane(-1.5, TRACK_LENGTH);
  const rightLine = createLane(1.5, TRACK_LENGTH);

  const planeGeo = new Three.PlaneGeometry(9, TRACK_LENGTH);

  // const color = 0x555555; // Dark gray for track
  // const color = 0xaaaaaa; // Lighter gray for track
  const color = 0xffffff; // Even lighter gray for track
  const planeMaterial = new Three.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.8,
  side: Three.DoubleSide,
  emissive: 0xffffff,
  emissiveIntensity: 0.3,
});
  // const planeMaterial = new Three.MeshStandardMaterial({
  //   color: color,
  //   roughness: 0.8,
  //   side: Three.DoubleSide,
  // });

  const planeMesh = new Three.Mesh(planeGeo, planeMaterial);

  const rotationRadians = -Math.PI / 2;
  planeMesh.rotation.x = rotationRadians;

  planeMesh.position.set(0, 0, zPos);
  
  // Position lines at the same Z as the track tile
  leftLine.position.z = zPos;
  rightLine.position.z = zPos;
  
  return { planeMesh, leftLine, rightLine };
};

export const INIT_TRACK = (Scene, GAME_SPEED) => {
  // DEFINE CONSTANTS
  const TRACK_LENGTH = 40;
  const groundTiles = [];

  const LANE_WIDTH = 3;
  const LANE_CENTERS = {
    LEFT: -3,
    CENTER: 0,
    RIGHT: 3,
  };

  // CREATE INITIAL TRACK TILES
  for (let i = 0; i < 5; i++) {
    const zPos = -i * TRACK_LENGTH;
    const track = createTrack(TRACK_LENGTH, zPos);
    groundTiles.push(track);
    Scene.add(track.planeMesh, track.leftLine, track.rightLine);
  }

  const updateGroundTiles = () => {
    groundTiles.forEach((tile) => {
      tile.planeMesh.position.z += GAME_SPEED;
      tile.leftLine.position.z += GAME_SPEED;
      tile.rightLine.position.z += GAME_SPEED;

      if (tile.planeMesh.position.z > TRACK_LENGTH) {
        const totalLength = TRACK_LENGTH * groundTiles.length;
        tile.planeMesh.position.z -= totalLength;
        tile.leftLine.position.z -= totalLength;
        tile.rightLine.position.z -= totalLength;
      }
    });
  };

  return { groundTiles, updateGroundTiles, constants: { TRACK_LENGTH, LANE_WIDTH, LANE_CENTERS } };
};