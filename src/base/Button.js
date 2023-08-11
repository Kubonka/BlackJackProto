import * as THREE from "three";
class Button {
  #onClick; //? callback que maneja el onclick
  #light; //todo crear y setear luz
  #name;
  #inactivePosition;
  #activePosition;
  #mesh;
  #active = false;
  constructor(world, mesh) {
    this.world = world;
    this.#mesh = mesh;
    this.#name = mesh.name;
    this.#activePosition = new THREE.Vector3();
    this.#inactivePosition = new THREE.Vector3(0, +5, 0).add(this.#activePosition);
  }
  set position(pos) {
    this.#activePosition = pos;
    this.#inactivePosition = new THREE.Vector3(0, +5, 0).add(this.#activePosition);
  }
  get position() {
    return this.#mesh.position;
  }
  set active(value) {
    if (typeof value === "boolean") {
      if (value) {
        this.#mesh.position.copy(this.#activePosition);
        this.#active = true;
      } else {
        this.#mesh.position.copy(this.#inactivePosition);
        this.#active = false;
      }
    } else throw new Error("argument must be TRUE or FALSE");
  }
  get active() {
    return this.#active;
  }
  set onClick(handler) {
    this.#onClick = handler;
  }
  get mesh() {
    return this.#mesh;
  }
  get name() {
    return this.#name;
  }
  click() {
    this.#onClick();
  }
}
export default Button;
