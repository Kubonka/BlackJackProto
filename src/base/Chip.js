import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import getId from "../helperClasses/Id";
class Chip {
  #initialPos;
  #position;
  #code;
  #tableTarget = new THREE.Vector3();
  constructor(world, initialPos = new THREE.Vector3(0, 0, 0)) {
    this.world = world;
    this.id = getId();
    this.value;
    this.mesh;
    this.name;
    this.active = false;
    this.#initialPos = initialPos;
  }
  async createMesh(code) {
    const mesh = this.world.assets.get(code);
    const geo = mesh.geometry;
    const mat = mesh.material;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = code;
    this.mesh.position.copy(this.#initialPos);
    this.mesh.scale.set(7, 10, 7);
    this.mesh.rotateY(-Math.PI / 4 - 0.3);
    this.value = parseInt(code);
    this.name = code;
    this.world.scene.add(this.mesh);
  }
  set position(pos) {
    this.mesh.position.set(pos.x, pos.y, pos.z);
    this.#position = pos;
  }
  get position() {
    return this.#position;
  }
  move(to, duration) {
    const pos = this.mesh.position;
    const moveAnim = new TWEEN.Tween({ x: pos.x, y: pos.y, z: pos.z }).to({ x: to.x, y: to.y, z: to.z }, duration);
    moveAnim.onUpdate(({ x, y, z }, elapsed) => {
      this.mesh.position.set(x, y, z);
    });
    moveAnim.start();
  }
}
export default Chip;
