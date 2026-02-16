// PHYSICS WORLD
// ========================================


import RAPIER from "@dimforge/rapier3d";



export const INIT_PHYSICS = () => {
  let world = null;
  let eventQueue = null;


  /**
   * Initialize Rapier physics world
   * Must be called before any other physics functions
   */
  async function initPhysics() {
    // No explicit init needed for npm version
   
    // Create physics world with gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    world = new RAPIER.World(gravity);

    // Create event queue for collision detection
    eventQueue = new RAPIER.EventQueue(true);

    console.log("Rapier physics initialized");
    return world;
  }

  // ========================================
  // RIGID BODY MANAGEMENT
  // ========================================

  /**
   * Create a dynamic rigid body (affected by physics)
   * Used for: player character
   */
  function createDynamicBody(position) {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      position.x,
      position.y,
      position.z,
    );

    return world.createRigidBody(rigidBodyDesc);
  }

  /**
   * Create a kinematic position-based rigid body (controlled manually)
   * Used for: player character with manual lane switching
   */
  function createKinematicBody(position) {
    const rigidBodyDesc =
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        position.x,
        position.y,
        position.z,
      );

    return world.createRigidBody(rigidBodyDesc);
  }

  /**
   * Create a fixed rigid body (static, doesn't move)
   * Used for: obstacles
   */
  function createFixedBody(position) {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x,
      position.y,
      position.z,
    );

    return world.createRigidBody(rigidBodyDesc);
  }

  /**
   * Convert kinematic body to dynamic (for collision impact)
   */
  function convertToDynamic(rigidBody) {
    rigidBody.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    // Lock rotations around X and Z to prevent tipping during normal movement
    rigidBody.setEnabledRotations(false, true, false, true);
  }

  // ========================================
  // COLLIDER MANAGEMENT
  // ========================================

  /**
   * Create a cuboid (box-shaped) collider
   * @param {Object} rigidBody - The rigid body to attach collider to
   * @param {Object} size - {width, height, depth} in units
   */
  function createBoxCollider(rigidBody, size) {
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      size.width / 2, // Half-width
      size.height / 2, // Half-height
      size.depth / 2, // Half-depth
    ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    return world.createCollider(colliderDesc, rigidBody);
  }

  /**
   * Create a capsule collider (good for player character)
   * @param {Object} rigidBody - The rigid body to attach collider to
   * @param {Number} radius - Capsule radius
   * @param {Number} height - Capsule height
   */
  function createCapsuleCollider(rigidBody, radius, height) {
    const colliderDesc = RAPIER.ColliderDesc.capsule(
      height / 2, // Half-height
      radius,
    ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    return world.createCollider(colliderDesc, rigidBody);
  }

  // ========================================
  // PHYSICS OBJECTS STORE
  // ========================================

  // Store mapping between Three.js objects and Rapier bodies
  const physicsObjects = new Map();

  /**
   * Register a Three.js object with its Rapier rigid body
   * This allows us to sync visual position with physics position
   */
  function registerPhysicsObject(threejsMesh, rigidBody, collider) {
    physicsObjects.set(threejsMesh, {
      rigidBody,
      collider,
      type: threejsMesh.userData.type || "unknown",
    });
  }

  /**
   * Remove a physics object from tracking
   */
  function unregisterPhysicsObject(threejsMesh) {
    const physicsData = physicsObjects.get(threejsMesh);

    if (physicsData) {
      // Remove collider and rigid body from Rapier world
      world.removeCollider(physicsData.collider, false);
      world.removeRigidBody(physicsData.rigidBody);

      // Remove from our tracking map
      physicsObjects.delete(threejsMesh);
    }
  }

  // ========================================
  // COLLISION DETECTION
  // ========================================

  let collisionCallback = null;

  /**
   * Set a callback function to be called when collisions occur
   * @param {Function} callback - Function(obj1, obj2) called on collision
   */
  function onCollision(callback) {
    collisionCallback = callback;
  }

  /**
   * Process collision events from the physics world
   */
  function processCollisions() {
    if (!collisionCallback) return;

    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      // Only process collision start events (not ongoing or ended)
      if (!started) return;

      // Find the Three.js objects involved in collision
      let obj1 = null;
      let obj2 = null;

      for (let [mesh, data] of physicsObjects) {
        if (data.collider.handle === handle1) obj1 = mesh;
        if (data.collider.handle === handle2) obj2 = mesh;
      }

      // Call the callback if both objects found
      if (obj1 && obj2) {
        collisionCallback(obj1, obj2);
      }
    });
  }

  // ========================================
  // PHYSICS UPDATE LOOP
  // ========================================

  /**
   * Step the physics simulation forward
   * Should be called every frame
   */
  function stepPhysics() {
    if (!world) {
      console.warn("Physics world not initialized");
      return;
    }

    // Step the physics world forward by one frame (1/60 second)
    world.step(eventQueue);

    // Process any collisions that occurred
    processCollisions();

    // Sync Three.js object positions with Rapier rigid body positions
    syncVisualPositions();
  }

  /**
   * Sync Three.js mesh positions with Rapier rigid body positions
   * This makes the visual representation match the physics simulation
   */
  function syncVisualPositions() {
    for (let [mesh, data] of physicsObjects) {
      const rigidBody = data.rigidBody;

      // Get position from Rapier
      const position = rigidBody.translation();
      mesh.position.set(position.x, position.y, position.z);

      // Get rotation from Rapier
      const rotation = rigidBody.rotation();
      mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Get the physics world instance
   */
  function getWorld() {
    return world;
  }

  /**
   * Check if physics is initialized
   */
  function isPhysicsReady() {
    return world !== null;
  }

  /**
   * Move a kinematic rigid body to a new position
   * Used for: player lane switching
   */
  function moveKinematicBody(rigidBody, newPosition) {
    rigidBody.setNextKinematicTranslation(newPosition);
  }

  const updatePhysics = () => {
    const isReady = isPhysicsReady();
    if (isReady) stepPhysics();
  };

  return {
    initPhysics,
    createDynamicBody,
    createKinematicBody,
    createFixedBody,
    createBoxCollider,
    createCapsuleCollider,
    registerPhysicsObject,
    unregisterPhysicsObject,
    onCollision,
    stepPhysics,
    moveKinematicBody,
    getWorld,
    isPhysicsReady,
    updatePhysics,
    convertToDynamic,
  };
};