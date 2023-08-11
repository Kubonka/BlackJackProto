import SceneInit from "../base/SceneInit";
import * as THREE from "three";
class DebugTools {
  /**
   * @param {SceneInit|null} world
   */

  constructor(world) {
    if (!DebugTools.instance) {
      this.items = [];
      this.clock = new THREE.Clock();
      this.clock.start();
      this.clock.getElapsedTime;
      this.world = world;
      DebugTools.instance = this;
    }
    return DebugTools.instance;
  }

  #update() {
    window.requestAnimationFrame(this.#update.bind(this));
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (this.clock.elapsedTime - item.initialTime > item.duration) {
        this.#removeObject3D(item);
        this.items.splice(i, 1);
      }
    }
  }

  addMark(pos, duration) {
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const geometry = new THREE.SphereGeometry(0.1, 2, 2);
    const mark = new THREE.Mesh(geometry, material);
    mark.position.set(pos.x, pos.y, pos.z);
    this.world.scene.add(mark);
    this.items.push({
      obj3D: mark,
      initialTime: this.clock.elapsedTime,
      duration,
    });
  }
  drawLine(start, end, duration) {
    const material = new THREE.LineBasicMaterial({
      color: 0xff00ff,
    });
    const points = [];
    points.push(start);
    points.push(end);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.world.scene.add(line);
    this.items.push({
      obj3D: line,
      initialTime: this.clock.elapsedTime,
      duration,
    });
  }
  #removeObject3D(item) {
    item.obj3D.geometry.dispose();
    item.obj3D.material.dispose();
    this.world.scene.remove(item.obj3D);
    this.world.scene.updateMatrixWorld();
  }
}

export default DebugTools;
