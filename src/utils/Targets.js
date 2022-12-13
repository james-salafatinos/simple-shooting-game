import * as THREE from "/modules/three.module.js";
class Targets {
  constructor(scene, camera, worldOctree) {
    this.scene = scene;
    this.camera = camera;
    this.targets = [];
    this.worldOctree = worldOctree;
    this.frameIndex = 0;

    this.time_beginning = 0;
    this.clock = new THREE.Clock();

    let createTarget = function (_x, _y, _z, targets, scene) {
      let r = 2;
      let geo = new THREE.IcosahedronGeometry(r, 2);
      let mat = new THREE.MeshPhongMaterial({
        color: 0xff2200,
        wireframe: false,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = _x || 60;
      mesh.position.y = _y || 25;
      mesh.position.z = _z || 0;

      scene.add(mesh);
      // targets.push(mesh);
      targets.push({
        mesh: mesh,
        collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), r),
        velocity: new THREE.Vector3(),
      });
    };
    for (let i = 0; i < 10; i++) {
      createTarget(
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        this.targets,
        this.scene
      );
    }
  }

  updateTargets(deltaTime) {
    // console.log("hi");

    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].mesh.position.addScaledVector(
        this.targets[i].velocity,
        deltaTime
      );

      this.targets[i].collider.center.copy(this.targets[i].mesh.position);

      const result = this.worldOctree.sphereIntersect(this.targets[i].collider);
      if (result) {
        this.targets[i].velocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.targets[i].velocity) * 1.5
        );
        this.targets[i].mesh.position.add(
          result.normal.multiplyScalar(result.depth)
        );
      } else {
        // s  elocity.y -= this.GRAVITY * deltaTime;
      }

      const damping = Math.exp(-0.4 * deltaTime) - 1;
      this.targets[i].velocity.addScaledVector(
        this.targets[i].velocity,
        damping
      );
    }
  }

  update() {
    const deltaTime = Math.min(0.05, this.clock.getDelta());

    this.updateTargets(deltaTime);

    this.frameIndex += 1;
  }
}
export { Targets };
