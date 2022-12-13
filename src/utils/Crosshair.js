import * as THREE from "/modules/three.module.js";
class Crosshair {
  constructor(scene, camera) {
    this.crosshair = null;
    this.scene = scene;
    this.camera = camera;

    this.cameraLookDir = function (camera) {
      var vector = new THREE.Vector3(0, 0, -1);
      vector.applyEuler(camera.rotation, camera.rotation.order);
      return vector;
    };

    let createCrosshair = function (_x, _y, _z) {
      let mat = new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: false,
        depthTest: true,
        side: THREE.FrontSide,
      });
      let geo = new THREE.IcosahedronGeometry(0.01, 2);

      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = _x;
      mesh.position.y = _y;
      mesh.position.z = _z;
      return mesh;
    };

    this.crosshair = createCrosshair(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
    this.scene.add(this.crosshair);
  }

  update() {
    this.crosshair.position.x =
      this.camera.position.x + 2 * this.cameraLookDir(this.camera).x;
    this.crosshair.position.y =
      this.camera.position.y + 2 * this.cameraLookDir(this.camera).y;
    this.crosshair.position.z =
      this.camera.position.z + 2 * this.cameraLookDir(this.camera).z;
  }
}
export { Crosshair };
