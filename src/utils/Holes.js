import * as THREE from "/modules/three.module.js";
class Holes {
  constructor(scene, camera, list_of_targets) {
    this.scene = scene;
    this.camera = camera;
    this.list_of_targets = list_of_targets;
    this.list_of_holes = [];
    console.log(list_of_targets);

    let createHole = function (_x, _y, _z, list_of_holes, scene) {
      let r = 2;
      let geo = new THREE.IcosahedronGeometry(r, 2);
      let mat = new THREE.MeshPhongMaterial({
        color: 0x010010,
        wireframe: false,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = _x || 60;
      mesh.position.y = _y || 25;
      mesh.position.z = _z || 0;

      scene.add(mesh);

      list_of_holes.push(mesh);
    };

    for (let i = 0; i < 3; i++) {
      createHole(
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        this.list_of_holes,
        this.scene
      );
    }
  }

  update() {
    for (let i = 0; i < this.list_of_holes.length; i++) {
      for (let j = 0; j < this.list_of_targets.length; j++) {
        if (
          this.list_of_holes[i].position.distanceTo(
            this.list_of_targets[j].mesh.position
          ) < 2
        ) {
          console.log("You scored!");
          const score = document.getElementById("score");
          score.innerHTML = `${parseInt(score.innerHTML) + 1}`;
          break;
        }
      }
    }
  }
}
export { Holes };
