import * as THREE from "three";
import Chip from "./Chip";
import Button from "./Button";
import GameManager from "./GameManager";
import AudioManager from "./AudioManager";
class Room {
  #state = "idle";
  constructor(world) {
    this.world = world;
    this.audioManager = new AudioManager(this.world);
    this.betPanel = [];
    this.handPanel = [];
    this.insuPanel = [];
    this.#start();
  }
  #start() {
    this.#createTable();
    //todo crear botones -> hit stand double split - yes no
    //todo crear betButtons -> 1 5 10 25 50 100 500 - rebet clearbet deal
    //todo crear room lights
    this.#createButtons();
    this.#loadSounds();
    this.world.camera.position.set(0, 6, -4.5);
    this.world.camera.lookAt(new THREE.Vector3(0, 0, -0.4));
  }
  async #loadSounds() {
    const chipSoundPath = `./src/assets/sounds/chipSound.mp3`;
    await this.audioManager.load(chipSoundPath, "chip", false, 0.5);
    const drawSoundPath = `./src/assets/sounds/drawSound.mp3`;
    await this.audioManager.load(drawSoundPath, "draw", false, 0.7);
    const flipSoundPath = `./src/assets/sounds/flipSound.mp3`;
    await this.audioManager.load(flipSoundPath, "flip", false, 0.7);
    const shuffleSoundPath = `./src/assets/sounds/shuffleSound.mp3`;
    await this.audioManager.load(shuffleSoundPath, "shuffle", false, 0.5);
    const slideSoundPath = `./src/assets/sounds/slideSound.mp3`;
    await this.audioManager.load(slideSoundPath, "slide", false, 0.7);
  }
  async #createButtons() {
    //!Setting
    const offsetChip = 0.47;
    //$crear chip buttons
    const chip1 = await this.#createChip("1");
    this.betPanel.push(this.#createButton(chip1.mesh, new THREE.Vector3(offsetChip * 6, 0, -2)));
    const chip5 = await this.#createChip("5");
    this.betPanel.push(this.#createButton(chip5.mesh, new THREE.Vector3(offsetChip * 5, 0, -2)));
    const chip10 = await this.#createChip("10");
    this.betPanel.push(this.#createButton(chip10.mesh, new THREE.Vector3(offsetChip * 4, 0, -2)));
    const chip25 = await this.#createChip("25");
    this.betPanel.push(this.#createButton(chip25.mesh, new THREE.Vector3(offsetChip * 3, 0, -2)));
    const chip50 = await this.#createChip("50");
    this.betPanel.push(this.#createButton(chip50.mesh, new THREE.Vector3(offsetChip * 2, 0, -2)));
    const chip100 = await this.#createChip("100");
    this.betPanel.push(this.#createButton(chip100.mesh, new THREE.Vector3(offsetChip * 1, 0, -2)));
    const chip500 = await this.#createChip("500");
    this.betPanel.push(this.#createButton(chip500.mesh, new THREE.Vector3(offsetChip * 0, 0, -2)));
    //$ crear betButtons
    const btnClearMesh = await this.#createOtherButtonsMesh("Button_clear");
    this.betPanel.push(this.#createButton(btnClearMesh, new THREE.Vector3(offsetChip * -2, 0, -2)));
    const btnRebetMesh = await this.#createOtherButtonsMesh("Button_rebet");
    this.betPanel.push(this.#createButton(btnRebetMesh, new THREE.Vector3(offsetChip * -3.5, 0, -2)));
    const btnDealMesh = await this.#createOtherButtonsMesh("Button_deal");
    this.betPanel.push(this.#createButton(btnDealMesh, new THREE.Vector3(offsetChip * -5, 0, -2)));
    // //$ crear handButtons
    const btnSplitMesh = await this.#createOtherButtonsMesh("Button_split");
    this.handPanel.push(this.#createButton(btnSplitMesh, new THREE.Vector3(offsetChip * 3, 0, -2)));
    const btnDoubleMesh = await this.#createOtherButtonsMesh("Button_double");
    this.handPanel.push(this.#createButton(btnDoubleMesh, new THREE.Vector3(offsetChip * 1.5, 0, -2)));
    const btnHitMesh = await this.#createOtherButtonsMesh("Button_hit");
    this.handPanel.push(this.#createButton(btnHitMesh, new THREE.Vector3(offsetChip * 0, 0, -2)));
    const btnStandMesh = await this.#createOtherButtonsMesh("Button_stand");
    this.handPanel.push(this.#createButton(btnStandMesh, new THREE.Vector3(offsetChip * -1.5, 0, -2)));
    // //$ insurance Buttons
    const btnNoMesh = await this.#createOtherButtonsMesh("Button_no");
    this.insuPanel.push(this.#createButton(btnNoMesh, new THREE.Vector3(offsetChip * 1, 0, -2)));
    const btnYesMesh = await this.#createOtherButtonsMesh("Button_yes");
    this.insuPanel.push(this.#createButton(btnYesMesh, new THREE.Vector3(offsetChip * -0.5, 0, -2)));

    //$ agregar al world
  }
  #createButton(mesh, pos) {
    //mesh.position.copy(pos);
    const btn = new Button(this.world, mesh);
    btn.position = pos;
    return btn;
  }
  async #createChip(chipCode) {
    const chip = new Chip(this.world);
    await chip.createMesh(chipCode);

    chip.mesh.scale.set(11, 13, 11);
    return chip;
  }
  async #createOtherButtonsMesh(code) {
    const loadedMesh = this.world.assets.get(code);
    const geo = loadedMesh.geometry;
    const mat = loadedMesh.material;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = code;
    mesh.scale.set(6, 6, 6);
    mesh.rotateY(Math.PI / 2 + 0.73);
    this.world.scene.add(mesh);
    return mesh;
  }

  #createTable() {
    const loadedMesh = this.world.assets.get("table");
    const geo = loadedMesh.geometry;
    const mat = loadedMesh.material;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "table";
    mesh.scale.set(48, 1, 48);
    mesh.position.set(0, 0, -1);
    //mesh.rotateY(Math.PI / 2 + 0.73);
    this.world.scene.add(mesh);
    //$ settings
    // const tableWidth = 25;
    // const tableHeight = 1;
    // const tableDepth = 20;
    // const geo = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth, 4, 4, 4);
    // const mat = new THREE.MeshPhongMaterial({ color: 0x053005 });
    // const tableMesh = new THREE.Mesh(geo, mat);
    // tableMesh.position.set(0, -tableHeight / 2, 0);
    // this.world.scene.add(tableMesh);
  }
}
export default Room;
