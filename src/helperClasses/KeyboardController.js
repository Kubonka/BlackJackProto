class KeyboardController {
  #mappedKeys = undefined; //? array de obj = {key: "c",action : "()=>{}"}
  constructor() {
    this.#mappedKeys = [];
    this.#start();
  }
  #start() {
    document.addEventListener("keydown", (e) => this.#handleKeyPress(e));
  }
  #handleKeyPress(e) {
    const foundMapedKey = this.#mappedKeys.find(
      (mapKey) => mapKey.key === e.key
    );
    if (foundMapedKey) foundMapedKey.action();
  }
  bindKey(key, action) {
    this.#mappedKeys.push({ key, action });
  }
}

export default KeyboardController;
