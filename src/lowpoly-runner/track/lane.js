import * as Three from "three";

// export const initLane = () => {
//   const lineGeometry = new Three.PlaneGeometry(.1, 100);
//   const lineMaterial = new Three.MeshStandardMaterial({
//     color: 0xffffff,
//     side: Three.DoubleSide,
//   });
//   const lineMesh = new Three.Mesh(lineGeometry, lineMaterial);
//   lineMesh.rotation.x = -Math.PI / 2;

//   return lineMesh;
// };


export const initLane = (xPosition, zPosition, TRACK_LENGTH) => {
  const lineGeometry = new Three.PlaneGeometry(.1, TRACK_LENGTH);
  
  const color = 0x000000;
  // const lineMaterial = new Three.MeshStandardMaterial({
  //   color: color,
  //   side: Three.DoubleSide,
  //     emissive: 0x000000,        // Add this - makes it emit black
  // emissiveIntensity: 2.5,    // Add this - controls how "dark" it appears
  // });

    const lineMaterial = new Three.MeshBasicMaterial({
    color: color,
    side: Three.DoubleSide,
// Add this - controls how "dark" it appears
  });


  const lineMesh = new Three.Mesh(lineGeometry, lineMaterial);
  lineMesh.rotation.x = -Math.PI / 2;
  lineMesh.position.set(xPosition, 0.01, zPosition);
  return lineMesh;


};
