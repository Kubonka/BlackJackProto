import * as THREE from "three";
import ChipsBank from "./ChipsBank";
import Chip from "./Chip";
Chip;
class Bet {
  //!settings
  #offsetX = 0.3;
  #offsetY = 0.05;
  #offsetZ = 0.1;
  /**
   * @typedef {Object} BetSection
   * @property {THREE.Vector3} position
   * @property {Chip[]} chips
   * @property {number} value
   */
  constructor(world, handPos) {
    this.world = world;
    this.chipsBank = new ChipsBank(this.world);
    this.base = { position: new THREE.Vector3(0, 0, -0.7).add(handPos), chips: [], value: 0, status: "" };
    this.double = { position: new THREE.Vector3(-0.7, 0, -0.7).add(handPos), chips: [], value: 0, status: "" };
    this.insu = { position: new THREE.Vector3(1, 0, -0.7).add(handPos), chips: [], value: 0, status: "" };
    this.payment = { position: new THREE.Vector3(0, 0, -1.1).add(handPos), chips: [], value: 0, status: "" };
  }
  addAmount(value) {
    if (this.base.value > 0) {
      this.chipsBank.restoreChips(this.base.chips);
    }
    this.#createChipsBet(value, this.base);
  }
  setDouble() {
    this.#createChipsBet(this.base.value, this.double);
  }
  setInsu(value) {
    //todo dividirs por 2 el valor (por lo pronto no lo divido y lo mando normal)
    this.#createChipsBet(value, this.insu);
  }
  setClear() {
    this.base.value = 0;
    this.chipsBank.restoreChips(this.base.chips);
  }
  setRebet(value) {
    this.chipsBank.restoreChips(this.base.chips);
    this.base.value = 0;
    this.addAmount(value);
  }
  setPayment(value) {
    this.#createChipsBet(value, this.payment);
  }
  #createChipsBet(value, betSection) {
    betSection.value += value;
    const encodedValue = this.#transformValue(betSection.value);
    betSection.chips = this.chipsBank.getChips(encodedValue);
    this.#placeChipsOnTable(betSection);
  }
  restoreChips() {
    if (this.base.value > 0) {
      this.chipsBank.restoreChips(this.base.chips);
    }
    if (this.insu.value > 0) {
      this.chipsBank.restoreChips(this.insu.chips);
    }
    if (this.double.value > 0) {
      this.chipsBank.restoreChips(this.double.chips);
    }
    if (this.payment.value > 0) {
      this.chipsBank.restoreChips(this.payment.chips);
    }
  }
  /**
   * @private
   * @param {BetSection} betSection
   * @type {THREE.Vector3} currentPos
   */
  #placeChipsOnTable(betSection) {
    //todo poner las chips en la posicion
    const chips = betSection.chips;
    let currentPos = new THREE.Vector3();
    currentPos.copy(betSection.position);
    let count = 1;
    chips.forEach((chip) => {
      if (count % 5 === 0) {
        count = 1;
        currentPos.set(currentPos.x - this.#offsetX, betSection.position.y, betSection.position.z);
      }
      currentPos.set(currentPos.x, currentPos.y + this.#offsetY, currentPos.z);
      chip.position = currentPos;
      count++;
    });
  }
  #transformValue(value) {
    const result = new Map();
    result.set(500, 0);
    result.set(100, 0);
    result.set(50, 0);
    result.set(25, 0);
    result.set(10, 0);
    result.set(5, 0);
    result.set(1, 0);
    //78 = 50 + 25 + 5 + 1 + 1 + 1
    for (const [key, count] of result) {
      let currentCount = count;
      while (value - key >= 0) {
        value -= key;
        currentCount++;
      }
      result.set(key, currentCount);
    }
    return result;
  }
}
export default Bet;
