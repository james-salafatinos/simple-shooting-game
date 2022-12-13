import * as THREE from "/modules/three.module.js";
import Delaunator from "https://cdn.skypack.dev/delaunator@5.0.0";

import { createNoise2D, createNoise3D } from "/modules/simplex-noise.js";

const noise2D = createNoise2D();
const noise3D = createNoise3D();

class DelaunayGenerator {
  constructor(scene) {
    this.scene = scene;

    this.D_mesh_vertices = [];
    this.D_geometry = new THREE.BufferGeometry();
    this.D_points3d = [];
    this.updateDelauney;
    this.lastUUIDMesh_Wire = "";
    this.lastUUIDMesh_Texture = "";
    this.T = 0;
    this.geom_texture;
    this.geom_wire;

    this.LOD = 10;
    this.M = this.LOD;
    this.N = this.LOD;

    this.landscape_scale = 200;
    this.noise_scale = 40;
  }
  createPoints() {
    // let D_mesh_vertices = []; // global

    for (let x = -this.M; x <= this.M; x += 1) {
      for (let z = -this.N; z <= this.N; z += 1) {
        // vertices.push(x / scaler, 0 / scaler, z / scaler)
        let _x =
          75 + THREE.MathUtils.randFloatSpread(this.M * this.landscape_scale);

        let _z =
          -75 + THREE.MathUtils.randFloatSpread(this.N * this.landscape_scale);

        let _y = noise3D(_x / this.M, _z / this.N, this.T) * this.noise_scale;
        // let _y = 0;

        this.D_mesh_vertices.push(_x, _y, _z);
        this.D_points3d.push(new THREE.Vector3(_x, _y, _z));
      }
    }

    // const geometry = new THREE.BufferGeometry();
    this.D_geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.D_mesh_vertices, 3)
    );
    let material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
    });
    material.color.setHSL(0.5, 0.5, 0.6);

    const particles = new THREE.Points(this.D_geometry, material);
    this.scene.add(particles);
  }

  updatePoints() {
    // console.log("updating points");
    //take D_points3d (vector3s) and update the y componets with noise
    for (let i = 0; i < this.D_points3d.length; i++) {
      let _x = this.D_points3d[i].x;
      let _z = this.D_points3d[i].z;
      let _y = noise3D(_x / this.M, _z / this.N, this.T) * this.noise_scale;
      this.D_points3d[i].y = _y;
    }
  }

  updateDots() {
    let new_vertices = [];
    // console.log("updating points");
    //take D_points3d (vector3s) and update the y componets with noise
    for (let i = 0; i < this.D_mesh_vertices.length; i += 3) {
      let _x = this.D_mesh_vertices[i];
      // let _y = this.D_mesh_vertices[i + 1];
      let _z = this.D_mesh_vertices[i + 2];
      let _y = noise3D(_x / this.M, _z / this.N, this.T) * this.noise_scale;

      new_vertices.push(_x, _y, _z);
    }
    this.D_geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new_vertices, 3)
    );
    this.D_geometry.attributes.position.needsUpdate = true;
  }

  calculate() {
    this.geom_wire = new THREE.BufferGeometry().setFromPoints(this.D_points3d); //global access
    this.geom_texture = new THREE.BufferGeometry().setFromPoints(
      this.D_points3d
    ); //global access
    // triangulate x, z
    // let indexDelaunay = Delaunator.from(
    //   this.D_points3d.map((v) => {
    //     return [v.x, v.z];
    //   })
    // );

    let pre_index = [];
    for (let i = 0; i < this.D_points3d.length; i++) {
      let x = this.D_points3d[i].x;
      let z = this.D_points3d[i].z;
      pre_index.push([x, z]);
    }
    let indexDelaunay = Delaunator.from(pre_index);

    let meshIndex = []; // delaunay index => three.js index
    for (let i = 0; i < indexDelaunay.triangles.length; i++) {
      meshIndex.push(indexDelaunay.triangles[i]);
    }

    this.geom_wire.setIndex(meshIndex); // add three.js index to the existing geometry
    this.geom_wire.computeVertexNormals();
    var mesh_wire = new THREE.Mesh(
      this.geom_wire, // re-use the existing geometry
      new THREE.MeshBasicMaterial({
        color: "white",
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      })
    );

    this.geom_texture.setIndex(meshIndex); // add three.js index to the existing geometry
    this.geom_texture.computeVertexNormals();
    var mesh_texture = new THREE.Mesh(
      this.geom_texture, // re-use the existing geometry
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(0x017564),
        wireframe: false,
        transparent: true,
        opacity: 0.8,
        // map: this.texture,
      })
    );

    if (this.lastUUIDMesh_Wire != "") {
      const object = this.scene.getObjectByProperty(
        "uuid",
        this.lastUUIDMesh_Wire
      );
      object.geometry.dispose();
      object.material.dispose();
      this.scene.remove(object);
    }
    if (this.lastUUIDMesh_Texture != "") {
      const object = this.scene.getObjectByProperty(
        "uuid",
        this.lastUUIDMesh_Texture
      );
      object.geometry.dispose();
      object.material.dispose();
      this.scene.remove(object);
    }
    this.scene.add(mesh_wire);
    this.scene.add(mesh_texture);
    this.lastUUIDMesh_Wire = mesh_wire.uuid;
    this.lastUUIDMesh_Texture = mesh_texture.uuid;
  }

  updateNoiseT() {
    this.T += 0.001;
  }

  update() {
    //Force Application
    this.updateNoiseT();
    this.updatePoints();
    this.updateDots();
    this.calculate();
  }
}

export { DelaunayGenerator };
