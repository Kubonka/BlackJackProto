import * as THREE from "three";
import DebugTools from "../helperClasses/DebugTools";
import { damp, damp2, damp3, damp4, dampE, dampM, dampQ, dampS, dampC } from "maath/easing";
import * as TWEEN from "@tweenjs/tween.js";
class Card {
  #distanceThreshold = 0.01; //!set
  #isInterpolating = true;
  #isFlipping = false;
  #onComplete;
  #onPickComplete;
  #moving = false;
  #flip = false;
  #peekUp;
  #peekDown;
  #isPeeking = false;
  #isFlipUp = true;
  #toPeekDownRotation;
  #toPeekUpRotation;
  #from;
  #to;
  #up = new THREE.Vector3();
  #down = new THREE.Vector3();
  #toUpRotation;
  #toDownRotation;
  #mod = 1;
  #defaultRotation = new THREE.Quaternion();
  constructor(world, code) {
    this.world = world;
    this.debug = new DebugTools(this.world);
    this.#setValueAndChar(code);
    this.code = code;
    this.value;
    this.char;
    this.mesh = null;
    this.clock = new THREE.Clock();
  }
  async createMesh() {
    const mesh = this.world.assets.get(this.code);
    const geo = mesh.geometry;
    const mat = mesh.material;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = this.code;
    this.mesh.position.set(0, -1, 0);
    this.mesh.scale.set(9, 9, 9);
    this.mesh.rotation.set(0, Math.PI / 2, Math.PI);
    this.#defaultRotation = this.mesh.quaternion;
    this.name = this.code;
    this.world.scene.add(this.mesh);
  }
  removeMesh() {
    if (this.mesh.material.map) {
      this.mesh.material.map.dispose();
    }
    this.mesh.material.dispose();
    this.mesh.geometry.dispose();
    this.world.scene.remove(this.mesh);
  }
  #setValueAndChar(code) {
    //todo hacer el switch con los valores y las category correspondientes
    const value = code.split("_")[0];
    switch (value) {
      case "ace": {
        this.value = 11;
        this.char = "A";
        break;
      }
      case "2": {
        this.value = 2;
        this.char = "2";
        break;
      }
      case "3": {
        this.value = 3;
        this.char = "3";
        break;
      }
      case "4": {
        this.value = 4;
        this.char = "4";
        break;
      }
      case "5": {
        this.value = 5;
        this.char = "5";
        break;
      }
      case "6": {
        this.value = 6;
        this.char = "6";
        break;
      }
      case "7": {
        this.value = 7;
        this.char = "7";
        break;
      }
      case "8": {
        this.value = 8;
        this.char = "8";
        break;
      }
      case "9": {
        this.value = 9;
        this.char = "9";
        break;
      }
      case "10": {
        this.value = 10;
        this.char = "10";
        break;
      }
      case "jack": {
        this.value = 10;
        this.char = "J";
        break;
      }
      case "queen": {
        this.value = 10;
        this.char = "Q";
        break;
      }
      case "king": {
        this.value = 10;
        this.char = "K";
        break;
      }
    }
  }

  move(flip, from, to, onComplete) {
    //todo hacer animacion}
    this.#onComplete = onComplete;
    this.#moving = true;
    this.#from = from;
    this.#to = to;
    this.mesh.position.copy(from);
    //this.#moveCard();
    const moveAnim = new TWEEN.Tween({ x: from.x, y: from.y, z: from.z })
      .to({ x: to.x, y: to.y, z: to.z }, 500)
      .onComplete(() => {
        if (flip) {
          this.flip(onComplete);
        } else {
          onComplete();
        }
      });
    moveAnim.onUpdate(({ x, y, z }, elapsed) => {
      this.mesh.position.set(x, y, z);
    });
    moveAnim.start();
    //?this.#up = this.#to.clone().add(new THREE.Vector3(0, 0.5, 0));
    //? if (flip) {
    //?   const axis = new THREE.Vector3(1, 0, 0);
    //?   const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
    //?   this.#toRotation = this.mesh.quaternion.clone().multiply(rotationQuaternion);
    //? }
  }

  flip(onComplete) {
    this.#onComplete = onComplete;
    this.#isFlipping = true;
    this.#isFlipUp = true;
    this.#down.copy(this.mesh.position);
    this.#up = new THREE.Vector3(0, 1, 0).add(this.mesh.position);
    const axis = new THREE.Vector3(1, 0, 0);
    const rotationUpQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
    const rotationDownQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
    this.#toUpRotation = this.mesh.quaternion.clone().multiply(rotationUpQuaternion);
    this.#toDownRotation = this.#toUpRotation.clone().multiply(rotationDownQuaternion);
    //$defino
    const flipUpAnim = new TWEEN.Tween({
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      r: this.mesh.quaternion,
    }).to({ x: this.#up.x, y: this.#up.y, z: this.#up.z, r: this.#toUpRotation }, 300);
    const flipDownAnim = new TWEEN.Tween({
      x: this.#up.x,
      y: this.#up.y,
      z: this.#up.z,
      r: this.mesh.quaternion,
    })
      .to({ x: this.#down.x, y: this.#down.y, z: this.#down.z, r: this.#toDownRotation }, 300)
      .onComplete(() => {
        onComplete();
      });
    //$chaineo
    flipUpAnim.chain(flipDownAnim);
    //$mapeo
    flipUpAnim.onUpdate(({ x, y, z, r }, elapsed) => {
      this.mesh.position.set(x, y, z);
      this.mesh.setRotationFromQuaternion(r);
    });
    flipDownAnim.onUpdate(({ x, y, z, r }, elapsed) => {
      this.mesh.position.set(x, y, z);
      this.mesh.setRotationFromQuaternion(r);
    });
    flipUpAnim.start();
  }

  peek(onPeekComplete) {
    this.#isPeeking = true;
    this.#peekUp = new THREE.Vector3(0, 1, 0).add(this.mesh.position);
    this.#peekDown = this.mesh.position;
    this.#onPickComplete = onPeekComplete;
    const axis = new THREE.Vector3(0, 0, 1);
    const rotationUpQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, -Math.PI / 2);
    const rotationDownQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, +Math.PI / 2);
    this.#toPeekUpRotation = this.mesh.quaternion.clone().multiply(rotationUpQuaternion);
    this.#toPeekDownRotation = this.#toPeekUpRotation.clone().multiply(rotationDownQuaternion);
    //$define
    const peekUpAnim = new TWEEN.Tween({
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      r: this.mesh.quaternion,
    }).to({ x: this.#peekUp.x, y: this.#peekUp.y, z: this.#peekUp.z, r: this.#toPeekUpRotation }, 700);
    const peekDownAnim = new TWEEN.Tween({
      x: this.#peekUp.x,
      y: this.#peekUp.y,
      z: this.#peekUp.z,
      r: this.mesh.quaternion,
    })
      .to({ x: this.#peekDown.x, y: this.#peekDown.y, z: this.#peekDown.z, r: this.#toPeekDownRotation }, 400)
      .onComplete(() => onPeekComplete());
    //$chain
    peekUpAnim.chain(peekDownAnim);
    //$mapeo
    peekUpAnim.onUpdate(({ x, y, z, r }, elapsed) => {
      this.mesh.position.set(x, y, z);
      this.mesh.setRotationFromQuaternion(r);
    });
    peekDownAnim.onUpdate(({ x, y, z, r }, elapsed) => {
      this.mesh.position.set(x, y, z);
      this.mesh.setRotationFromQuaternion(r);
    });
    peekUpAnim.start();
  }
  turn(onComplete) {
    const axis = new THREE.Vector3(0, 1, 0);
    const turnQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
    const turnRotation = this.mesh.quaternion.clone().multiply(turnQuaternion);
    const turnAnim = new TWEEN.Tween({ rY: this.mesh.quaternion })
      .to({ rY: turnRotation }, 250)
      .onComplete(() => onComplete());
    turnAnim.onUpdate(({ rY }, elapsed) => {
      this.mesh.setRotationFromQuaternion(rY);
    });
    turnAnim.start();
  }
}
export default Card;
