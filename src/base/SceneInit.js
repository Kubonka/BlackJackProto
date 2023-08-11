import * as THREE from "three";
import * as CANNON from "cannon-es";
//import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module";
import * as TWEEN from "@tweenjs/tween.js";
export default class SceneInit {
  constructor(canvasId) {
    this.physicsWorld = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.fov = 30;
    this.nearPlane = 0.1;
    this.farPlane = 1000;
    this.canvasId = canvasId;
    this.clock = undefined;
    this.stats = undefined;
    this.controls = undefined;
    this.spotLight = undefined;
    this.ambientLight = undefined;
    this.loader = undefined;
    this.#start();
  }

  #start() {
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    //this.camera.position.x = 90;
    this.camera.position.z = -10;
    //this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    //this.camera.position.z = 0;

    const canvas = document.getElementById(this.canvasId);

    //! RENDERER
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //! END RENDERER

    //! POST PROCESSING

    document.body.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();

    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.ambientLight.castShadow = true;
    this.scene.add(this.ambientLight);

    this.spotLight = new THREE.SpotLight(0xffffff, 0.6);
    this.spotLight.castShadow = true;
    this.spotLight.position.set(0, 100, 0);
    this.scene.add(this.spotLight);

    // this.loader = new THREE.TextureLoader();
    // this.loader.setPath("../../src/assets/textures/");
    //! controls

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.target = new THREE.Vector3(10, 10, 0);
    // this.controls.update();
    // this.controls = new FirstPersonControls(
    //   this.camera,
    //   this.renderer.domElement
    // );
    // this.controls.movementSpeed = 0.2;
    // this.controls.enabled = false; // !TOGGLE
    // const wrapper = new THREE.Object3D();
    // console.log(this.controls.object.position);
    window.addEventListener("resize", () => this.onWindowResize(), false);

    // NOTE: Load space background.
    // this.loader = new THREE.TextureLoader();
    // this.scene.background = this.loader.load('./pics/space.jpeg');

    // NOTE: Declare uniforms to pass into glsl shaders.
    // this.uniforms = {
    //   u_time: { type: 'f', value: 1.0 },
    //   colorB: { type: 'vec3', value: new THREE.Color(0xfff000) },
    //   colorA: { type: 'vec3', value: new THREE.Color(0xffffff) },
    // };
    //$ background Texture
    // this.loader = new THREE.CubeTextureLoader();
    // this.loader.setPath("../../src/assets/");
    // const texture = this.loader.load([
    //   "posx.jpg",
    //   "negx.jpg",
    //   "posy.jpg",
    //   "negy.jpg",
    //   "posz.jpg",
    //   "negz.jpg",
    // ]);
    // this.scene.background = texture;

    //$ axes helper
    const axesHelper = new THREE.AxesHelper(1000);
    //this.scene.add(axesHelper);
    this.#update();
  }

  #update() {
    this.render();
    this.stats.update();
    TWEEN.update();
    //this.controls.update();
    window.requestAnimationFrame(this.#update.bind(this));
  }
  // toggleOrbitControls() {
  //   console.log("this.camera.position", this.camera.position);
  //   this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  //   this.controls.target = new THREE.Vector3(105, 0, 0);
  //   this.controls.enabled = !this.controls.enabled;
  //   this.controls.update();
  // }
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
