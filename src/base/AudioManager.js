import * as THREE from "three";
import ChipsBank from "./ChipsBank";
class AudioManager {
  static #instance = null;
  #listener;
  #audioLoader;
  /**
   * @type {THREE.Audio[]} #audios
   * @private
   */
  #audios = {};
  constructor(world) {
    if (AudioManager.#instance) return AudioManager.#instance;
    this.world = world;
    this.#listener = new THREE.AudioListener();
    this.world.camera.add(this.#listener);
    this.#audioLoader = new THREE.AudioLoader();
    AudioManager.#instance = this;
  }
  async load(path, name, loop, volume) {
    return new Promise((resolve, reject) => {
      this.#audioLoader.load(
        path,
        (buffer) => {
          const audio = new THREE.Audio(this.#listener);
          audio.setBuffer(buffer);
          audio.setLoop(loop);
          audio.setVolume(volume);
          this.#audios[name] = audio;
          resolve();
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  play(audioName, delay) {
    if (this.#audios[audioName]) {
      this.#audios[audioName].play(delay);
    }
  }
}
export default AudioManager;
