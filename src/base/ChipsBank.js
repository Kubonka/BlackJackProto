import Chip from "./Chip.js";
import * as THREE from "three";
class ChipsBank {
  static #instance = null;
  #position = new THREE.Vector3(-6, 0, 6);
  constructor(world) {
    if (ChipsBank.#instance) {
      return ChipsBank.#instance;
    }
    this.world = world;
    //todo setear la posicion del bank correcta (atras de camara)
    this.chips = {
      1: [],
      5: [],
      10: [],
      25: [],
      50: [],
      100: [],
      500: [],
    };
    this.#start();
    ChipsBank.#instance = this;
  }
  #start() {
    for (const key in this.chips) {
      for (let i = 0; i < 16; i++) {
        const chipInstance = new Chip(this.world, this.#position);
        chipInstance.createMesh(key);
        this.chips[key].push(chipInstance);
      }
    }
    for (let i = 0; i < 16; i++) {
      const chipInstance = new Chip(this.world, this.#position);
      chipInstance.createMesh("500");
      this.chips[500].push(chipInstance);
    }
  }
  //todo metodos para "retirar" fichas del bank y para "retornar" fichas del bank
  getChips(map) {
    const result = [];
    for (const [key, count] of map) {
      const prop = "" + key;
      for (let i = 0; i < count; i++) {
        const foundChip = this.chips[prop].find((chip) => chip.active === false);
        if (foundChip) {
          foundChip.active = true;
          result.push(foundChip);
        }
      }
    }
    return result;
  }
  restoreChips(chips) {
    chips.forEach((chip) => {
      chip.active = false;
      chip.position = this.#position;
    });
  }
  #resetPosition() {}
}
export default ChipsBank;
