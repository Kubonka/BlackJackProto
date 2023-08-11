import SceneInit from "./SceneInit";
import DebugTools from "../helperClasses/DebugTools";
import GameState from "../helperClasses/GameState";
import KeyboardController from "../helperClasses/KeyboardController";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Card from "./Card";
import Room from "./Room";
import Hand from "./Hand";
import Button from "./Button";
import Bet from "./Bet";
import ChipsBank from "./ChipsBank";
import Deck from "./Deck";
import AudioManager from "./AudioManager";

class GameManager {
  #dealQueue = [];
  #tempIndex = 0;
  #menu = false;
  #balance = 0;
  #lastBet = 1;
  /**
   * @type {Button[]} #betPanel
   * @private
   */
  #betPanel;
  /**
   * @type {Button[]} #handPanel
   * @private
   */
  #handPanel;
  /**
   * @type {Button[]} #insuPanel
   * @private
   */
  #insuPanel;
  /**
   * @type {Button[]} #buttons
   * @private
   */
  #buttons;
  #targetMeshes;
  static #instance = null;
  constructor() {
    if (GameManager.#instance) {
      return GameManager.#instance;
    }
    this.ui = { dealer: 0, player1: 0, player2: 0, player3: 0, balance: 0, msg: "", count: 0, bet: 0 };
    this.world = new SceneInit("threeJsCanvas");
    this.audioManager = new AudioManager(this.world);
    this.debugTools = new DebugTools(this.world);
    this.kbController = new KeyboardController();
    this.state = null;
    this.clock = new THREE.Clock();
    /**
     * @type {Hand[]} playerHands
     */
    this.playerHands = [];
    /**
     * @type {Hand} dealerHand
     */
    this.dealerHand = null;
    /**
     * @type {Hand[]} completedHands
     */
    this.completeHands = [];
    /**
     * @type {Hand} currentHand
     */
    this.currentHand;
    this.onUiUpdate = null;
    this.room = null;
    this.#start();
    GameManager.#instance = this;
  }
  async #start() {
    this.kbController.bindKey("z", () => this.population[0].testImpulse());
    this.kbController.bindKey("x", () => this.population[0].testRotation(+1));
    this.kbController.bindKey("c", () => this.population[0].testRotation(-1));
    this.kbController.bindKey("q", () =>
      this.world.camera.position.set(
        this.world.camera.position.x,
        this.world.camera.position.y - 10,
        this.world.camera.position.z
      )
    );
    this.kbController.bindKey("e", () =>
      this.world.camera.position.set(
        this.world.camera.position.x,
        this.world.camera.position.y + 10,
        this.world.camera.position.z
      )
    );
    this.kbController.bindKey("w", () =>
      this.world.camera.position.set(
        this.world.camera.position.x,
        this.world.camera.position.y,
        this.world.camera.position.z + 10
      )
    );
    this.kbController.bindKey("a", () =>
      this.world.camera.position.set(
        this.world.camera.position.x + 10,
        this.world.camera.position.y,
        this.world.camera.position.z
      )
    );
    this.kbController.bindKey("s", () =>
      this.world.camera.position.set(
        this.world.camera.position.x,
        this.world.camera.position.y,
        this.world.camera.position.z - 10
      )
    );
    this.kbController.bindKey("d", () => {
      this.world.camera.position.set(
        this.world.camera.position.x - 10,
        this.world.camera.position.y,
        this.world.camera.position.z
      );
    });
    this.kbController.bindKey("f", () => {
      this.world.controls.enabled = !this.world.controls.enabled;
    });

    document.addEventListener("mousedown", (e) => this.#handleMouseDown(e));
    console.log("Loading Assets...");
    await this.#laodAllAssets();
    console.log("this.world.assets", this.world.assets);
    this.deck = new Deck(this.world, new THREE.Vector3(-3, 0.2, 3));
    console.log("Done !");
    console.log("this.onUiUpdate", this.onUiUpdate);
    this.#update();
  }
  async #update() {
    window.requestAnimationFrame(this.#update.bind(this));
    switch (this.state) {
      case GameState.Initialize: {
        this.room = new Room(this.world);
        //asignar los paneles
        //todo asignar los handlers a los botones
        this.chipsbank = new ChipsBank(this.world); //! <- atento aca heavy performance
        this.state = GameState.Loading;
        setTimeout(() => {
          this.#setBalance(100);
          this.#betPanel = this.room.betPanel;
          this.#handPanel = this.room.handPanel;
          this.#insuPanel = this.room.insuPanel;
          this.#setHandlersOnButtons();
          this.#targetMeshes = this.#setTargetMeshes();
          this.#buttons = [...this.#betPanel, ...this.#handPanel, ...this.#insuPanel];
          this.state = GameState.NewHand;
        }, 3000);
        break;
      }
      case GameState.NewHand: {
        //se limpia el array de playerHands y de dealerHand
        console.log("BALANCE = ", this.#balance);
        this.completeHands = [];
        this.playerHands = [];
        this.dealerHand = null;
        //se crea una new hand para el player en playerHands
        this.playerHands.push(new Hand(this.world, false, new THREE.Vector3(0, 0.05, -0.5), this.deck, true));
        this.currentHand = this.playerHands[0];
        //se crea una new  hand para el dealer en dealerHand
        this.dealerHand = new Hand(this.world, true, new THREE.Vector3(0, 0.05, 1), this.deck, false);
        //paso a la fase de bets
        this.#setActivePanel("bet");
        this.#toggleShowDealBtn(false);
        this.updateUi({ msg: "PLACE YOUR BET" });
        this.state = GameState.BetPhase;
        break;
      }
      case GameState.BetPhase: {
        //escucho clicks sobre el boton DEAL, REBET, CLEAR BET , o BUTTON CHIPS
        //cuando hace click en DEAL hace el draw inicial para player y dealer
        //luego hace "DRAW EVAL" <- Funcion de evaluacion de mano del dealer (por si tiene BJ),
        //luego el player (por si tiene BJ) SI -> todo NO-> evalua y activa los botonoes correspondientes en caso de x2 o split
        //todas estas funcioens de eval son metodos de la clase hand del player y del dealer
        //paso a la fase de PlayerTurn
        break;
      }
      case GameState.InitialDraw: {
        // if (!this.#dealQueue.length) {
        //   GameState.InitialCheck;
        //   this.#initialCheck();
        // }
        break;
      }
      case GameState.InitialCheck: {
        break;
      }
      case GameState.InsuranceTurn: {
        console.log("INSURANCE ?");
        break;
      }
      case GameState.DealerPeek: {
        //todo MANEJAR EL PEEK Y PASAR A PLAYER TURN
        console.log("DEALER PEEK");
        break;
      }
      case GameState.PlayerTurn: {
        //escucho clicks sobre el nuevo panel puede ser split , x2 , hit o stand -> el loop se reinicia y se evalua la hand
        //en el caso de ser stand pasa a la fase de dealer
        //todo hasta aca llegue
        break;
      }
      case GameState.DealerTurn: {
        console.log("DEALER TURN");
        //el dealer resuelve su hand ->
        break;
      }
      case GameState.Payments: {
        // hace los pagos -> pasa a la fase de NewHand
        break;
      }
      case GameState.Loading:
        break;
      default:
        break;
    }
  }

  #setActivePanel(panel) {
    console.log("ENTRA");
    switch (panel) {
      case "bet": {
        this.#betPanel.forEach((btn) => {
          if (
            btn.name === "Button_clear" ||
            btn.name === "Button_deal" ||
            (this.#lastBet === 0 && btn.name === "Button_rebet")
          ) {
            btn.active = false;
          } else {
            btn.active = true;
          }
        });
        this.#handPanel.forEach((btn) => (btn.active = false));
        this.#insuPanel.forEach((btn) => (btn.active = false));
        break;
      }
      case "hand": {
        this.#betPanel.forEach((btn) => (btn.active = false));
        this.#handPanel.forEach((btn) => (btn.active = true));
        this.#insuPanel.forEach((btn) => (btn.active = false));
        break;
      }
      case "insu": {
        this.#betPanel.forEach((btn) => (btn.active = false));
        this.#handPanel.forEach((btn) => (btn.active = false));
        this.#insuPanel.forEach((btn) => (btn.active = true));
        break;
      }
      default: {
        this.#betPanel.forEach((btn) => (btn.active = false));
        this.#handPanel.forEach((btn) => (btn.active = false));
        this.#insuPanel.forEach((btn) => (btn.active = false));
        break;
      }
    }
  }
  #handleMouseDown(event) {
    const raycaster = new THREE.Raycaster();
    const point = new THREE.Vector2();
    point.x = (event.clientX / window.innerWidth) * 2 - 1;
    point.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(point, this.world.camera);
    const intersects = raycaster.intersectObjects(this.#targetMeshes);
    if (intersects.length) {
      console.log(intersects, this.#buttons);
      const btn = this.#buttons.find((btn) => btn.name === intersects[0].object.name);
      btn.click();
    }
    return null;
  }
  #setTargetMeshes() {
    const a = this.#betPanel.map((btn) => btn.mesh);
    const b = this.#handPanel.map((btn) => btn.mesh);
    const c = this.#insuPanel.map((btn) => btn.mesh);
    return [...a, ...b, ...c];
  }
  #setHandlersOnButtons() {
    //todo completar functiones
    this.#betPanel.forEach((btn) => {
      if (btn.name !== "Button_rebet" && btn.name !== "Button_deal" && btn.name !== "Button_clear") {
        btn.onClick = () => this.#handleChipBtn(btn.name);
      } else if (btn.name === "Button_rebet") {
        btn.onClick = () => this.#handleRebetBtn();
      } else if (btn.name === "Button_deal") {
        btn.onClick = () => this.#handleDealBtn();
      } else if (btn.name === "Button_clear") {
        btn.onClick = () => this.#handleClearBtn();
      }
    });
    this.#handPanel.forEach((btn) => {
      if (btn.name === "Button_split") {
        btn.onClick = () => this.#handleSplitBtn();
      } else if (btn.name === "Button_double") {
        btn.onClick = () => this.#handleDoubleBtn();
      } else if (btn.name === "Button_hit") {
        btn.onClick = () => this.#handleHitBtn();
      } else if (btn.name === "Button_stand") {
        btn.onClick = () => this.#handleStandBtn();
      }
    });
    this.#insuPanel.forEach((btn) => {
      if (btn.name === "Button_no") {
        btn.onClick = () => this.#handleInsuNoBtn();
      } else if (btn.name === "Button_yes") {
        btn.onClick = () => this.#handleInsuYesBtn();
      }
    });
  }
  #handleInsuYesBtn() {
    const value = Math.floor(this.currentHand.bet.base.value / 2);
    if (this.#balance - value >= 0) {
      this.currentHand.bet.setInsu(value);
      this.#setBalance(-value);
      this.audioManager.play("chip", 0);
    }
    this.#setActivePanel("none");
    this.updateUi({ msg: "" });
    this.#dealerPeek();
  }
  #handleInsuNoBtn() {
    this.#setActivePanel("none");
    this.updateUi({ msg: "" });
    this.#dealerPeek();
  }
  #handleSplitBtn() {
    if (this.#balance - this.currentHand.bet.base.value >= 0) {
      this.#setActivePanel("none");
      this.updateUi({ player2: "" });
      const betValue = this.currentHand.bet.base.value;
      const card1 = this.currentHand.cards[0];
      const card2 = this.currentHand.cards[1];
      this.currentHand.bet.restoreChips(this.currentHand.bet.base.chips);
      this.playerHands = [];
      //$ HAND 1
      const hand1 = new Hand(this.world, false, new THREE.Vector3(1, 0.05, -0.5), this.deck, false);
      this.playerHands.push(hand1);
      hand1.bet.addAmount(betValue);
      hand1.cards.push(card1);
      hand1.advancePos();
      card1.move(false, card1.mesh.position, new THREE.Vector3(1, 0.05, -0.5), () => {});
      //$ HAND 2
      const hand2 = new Hand(this.world, false, new THREE.Vector3(-1, 0.05, -0.5), this.deck, false);
      this.playerHands.push(hand2);
      hand2.bet.addAmount(betValue);
      this.audioManager.play("chip", 0);
      this.#setBalance(-betValue);
      hand2.cards.push(card2);
      hand2.advancePos();
      card2.move(false, card2.mesh.position, new THREE.Vector3(-1, 0.05, -0.5), () => {});
      this.audioManager.play("draw", 0);
      hand1.draw(true, () => {
        this.audioManager.play("draw", 0);
        hand2.draw(true, () => {
          this.currentHand = this.playerHands[0];
          this.#evaluatePlayerHand();
        });
      });
    }
  }
  #handleDoubleBtn() {
    if (this.state !== GameState.Animating) {
      const value = this.currentHand.bet.base.value;
      if (this.#balance - value >= 0) {
        this.state = GameState.Animating;
        this.#setActivePanel("none");
        this.currentHand.bet.setDouble();
        this.audioManager.play("chip", 0);
        this.#setBalance(-value);
        this.audioManager.play("draw", 0);
        this.currentHand.draw(true, () => {
          this.currentHand.cards[this.currentHand.cards.length - 1].turn(() => {
            this.#evaluatePlayerHand();
            this.#nextHand();
          });
        });
      }
      //this.#setActivePanel("hand");
    }
  }
  #handleHitBtn() {
    if (this.state !== GameState.Animating) {
      this.state = GameState.Animating;
      this.audioManager.play("draw", 0);
      this.currentHand.draw(true, () => {
        this.#evaluatePlayerHand();
      });
    }
  }
  #handleStandBtn() {
    console.log("STAND");
    if (this.state !== GameState.Animating) this.#nextHand();
  }
  #handleChipBtn(name) {
    const value = parseInt(name);
    if (this.#balance - value >= 0) {
      if (this.currentHand.bet.base.value === 0) this.#toggleShowDealBtn(true);
      this.currentHand.bet.addAmount(value);
      this.#setBalance(-value);
      this.audioManager.play("chip", 0);
      //this.#balance -= value;
    }
  }
  #handleRebetBtn() {
    const value = this.#lastBet;
    if (this.#balance - value >= 0) {
      if (this.currentHand.bet.base.value === 0) this.#toggleShowDealBtn(true);
      this.currentHand.bet.setRebet(value);
      this.audioManager.play("chip", 0);
      this.#setBalance(-value);
      //this.#balance -= value;
    }
  }
  #handleClearBtn() {
    this.#setBalance(this.currentHand.bet.base.value);
    //this.#balance += this.currentHand.bet.base.value;
    this.currentHand.bet.setClear();
    this.#toggleShowDealBtn(false);
  }
  #toggleShowDealBtn(status) {
    const clearBtn = this.#betPanel.find((btn) => btn.name === "Button_clear");
    const dealBtn = this.#betPanel.find((btn) => btn.name === "Button_deal");
    clearBtn.active = status;
    dealBtn.active = status;
  }
  #toggleHandPanelBtn(buttons) {
    //split double hit stand
    this.#handPanel.forEach((btn, i) => {
      btn.active = buttons[i];
    });
  }
  #handleDealBtn() {
    //todo manejar el cambio de estado a comenzar a jugar la hand
    //todo cambiar los paneles
    //?fase 1 Deal
    this.updateUi({ msg: "" });
    this.#dealQueue.push(() => {
      this.audioManager.play("draw", 0);
      this.currentHand.draw(true, () => this.#onDrawSuccess());
    });
    this.#dealQueue.push(() => {
      this.audioManager.play("draw", 0);
      this.dealerHand.draw(true, () => this.#onDrawSuccess());
    });
    this.#dealQueue.push(() => {
      this.audioManager.play("draw", 0);
      this.currentHand.draw(true, () => this.#onDrawSuccess());
    });
    this.#dealQueue.push(() => {
      this.audioManager.play("slide", 0);
      this.dealerHand.draw(false, () => {
        this.#onDrawSuccess();
        this.#initialCheck();
      });
    });
    this.state = GameState.InitialDraw;
    const cardDraw = this.#dealQueue.shift();
    cardDraw();
    this.#setActivePanel("none");
  }
  #initialCheck() {
    //?fase 2 DEALER InitialCheck
    if (this.dealerHand.cards[0].char === "A") {
      this.updateUi({ msg: "INSURANCE ?" });
      this.#setActivePanel("insu");
      this.state = GameState.InsuranceTurn;
      return;
    }
    if (this.dealerHand.cards[0].value === 10) {
      this.#dealerPeek();
      return;
    }
    this.#evaluatePlayerHand();
  }
  // #evaluatePlayerHand() {
  //   this.state = GameState.PlayerTurn;
  //   this.#setActivePanel("hand");
  //   if (this.currentHand.position.x > 0) {
  //     this.updateUi({ player1: this.currentHand.getMaxValue() });
  //   } else if (this.currentHand.canSplit) {
  //     this.updateUi({ player2: this.currentHand.getMaxValue() });
  //   } else {
  //     this.updateUi({ player3: this.currentHand.getMaxValue() });
  //   }
  //   if (this.currentHand.getMaxValue() === 21 && this.currentHand.cards.length === 2) {
  //     //?Natural BJ
  //     this.currentHand.status = "BJ";
  //     this.#nextHand();
  //   } else {
  //     if (this.currentHand.value < 21) {
  //       //?can HIT
  //       this.#toggleHandPanelBtn([false, false, true, true]);
  //     } else if (this.currentHand.value > 21) {
  //       if (!this.currentHand.getAces()) {
  //         //?state dealer turn (BUST)
  //         this.currentHand.status = "BUST";
  //         this.#nextHand();
  //         return;
  //       }
  //       if (this.currentHand.getAces() && this.currentHand.value - this.currentHand.getAces() * 10 < 21) {
  //         //?can HIT
  //         this.#toggleHandPanelBtn([false, false, true, true]);
  //       } else {
  //         //!PUSH ARREGLAR
  //         //?state dealer turn (BUST)
  //         this.currentHand.status = "BUST";
  //         this.#nextHand();
  //       }
  //     }
  //     if (this.currentHand.cards.length === 2) {
  //       //?can DOUBLE
  //       this.#toggleHandPanelBtn([false, true, true, true]);
  //     }
  //     if (this.currentHand.canSplit && this.currentHand.isSplitable() && this.currentHand.cards.length === 2) {
  //       //?can SPLIT
  //       this.#toggleHandPanelBtn([true, true, true, true]);
  //     }
  //   }
  // }
  #evaluatePlayerHand() {
    this.state = GameState.PlayerTurn;
    this.#setActivePanel("hand");
    if (this.currentHand.position.x > 0) {
      this.updateUi({ player1: this.currentHand.getMaxValue() });
    } else if (this.currentHand.canSplit) {
      this.updateUi({ player2: this.currentHand.getMaxValue() });
    } else {
      this.updateUi({ player3: this.currentHand.getMaxValue() });
    }
    if (this.currentHand.getMaxValue() === 21 && this.currentHand.cards.length === 2) {
      //?Natural BJ
      this.currentHand.status = "BJ";
      this.#nextHand();
      return;
    } else if (this.currentHand.getMaxValue() < 21) {
      //?can HIT
      this.#toggleHandPanelBtn([false, false, true, true]);
    } else if (this.currentHand.getMaxValue() > 21) {
      //?state dealer turn (BUST)
      this.currentHand.status = "BUST";
      this.#nextHand();
      return;
    } else {
      //21
      this.#nextHand();
      return;
    }
    if (this.currentHand.cards.length === 2) {
      //?can DOUBLE
      this.#toggleHandPanelBtn([false, true, true, true]);
    }
    if (this.currentHand.canSplit && this.currentHand.isSplitable() && this.currentHand.cards.length === 2) {
      //?can SPLIT
      this.#toggleHandPanelBtn([true, true, true, true]);
    }
  }

  async #laodAllAssets() {
    const paths = [
      "10_of_clubs",
      "10_of_diamonds",
      "10_of_hearts",
      "10_of_spades",
      "2_of_clubs",
      "2_of_diamonds",
      "2_of_hearts",
      "2_of_spades",
      "3_of_clubs",
      "3_of_diamonds",
      "3_of_hearts",
      "3_of_spades",
      "4_of_clubs",
      "4_of_diamonds",
      "4_of_hearts",
      "4_of_spades",
      "5_of_clubs",
      "5_of_diamonds",
      "5_of_hearts",
      "5_of_spades",
      "6_of_clubs",
      "6_of_diamonds",
      "6_of_hearts",
      "6_of_spades",
      "7_of_clubs",
      "7_of_diamonds",
      "7_of_hearts",
      "7_of_spades",
      "8_of_clubs",
      "8_of_diamonds",
      "8_of_hearts",
      "8_of_spades",
      "9_of_clubs",
      "9_of_diamonds",
      "9_of_hearts",
      "9_of_spades",
      "ace_of_clubs",
      "ace_of_diamonds",
      "ace_of_hearts",
      "ace_of_spades",
      "Button_clear",
      "Button_deal",
      "Button_double",
      "Button_hit",
      "Button_no",
      "Button_rebet",
      "Button_split",
      "Button_stand",
      "Button_yes",
      "1",
      "10",
      "100",
      "25",
      "5",
      "50",
      "500",
      "jack_of_clubs",
      "jack_of_diamonds",
      "jack_of_hearts",
      "jack_of_spades",
      "king_of_clubs",
      "king_of_diamonds",
      "king_of_hearts",
      "king_of_spades",
      "queen_of_clubs",
      "queen_of_diamonds",
      "queen_of_hearts",
      "queen_of_spades",
      "table",
    ];
    try {
      const loadAssetPromises = paths.map((path) => this.#loadAsset(path));
      const loadedAssets = await Promise.all(loadAssetPromises);
      const assets = new Map();
      paths.forEach((path, index) => {
        const mesh = loadedAssets[index];
        assets.set(path, mesh);
      });

      this.world.assets = assets;
      console.log(this.world.assets);
    } catch (error) {
      console.error("Error cargando asset", error);
    }
  }
  // async #loadAsset(name) {
  //   const gltfLoader = new GLTFLoader();
  //   return new Promise((resolve, reject) => {
  //     gltfLoader.load(
  //       `./src/assets/gltf/${name}.gltf`,
  //       (gltf) => {
  //         const mesh = gltf.scene.children[0];
  //         mesh.name = name;
  //         resolve(mesh);
  //       },
  //       undefined,
  //       reject
  //     );
  //   });
  // }
  async #loadAsset(name) {
    const gltfLoader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        `./static/gltf/${name}.gltf`,
        (gltf) => {
          const mesh = gltf.scene.children[0];
          mesh.name = name;
          resolve(mesh);
        },
        undefined,
        reject
      );
    });
  }
  #onDrawSuccess() {
    if (this.#dealQueue.length) {
      const cardDraw = this.#dealQueue.shift();
      cardDraw();
    }
  }
  #dealerPeek() {
    this.state = GameState.Animating;
    this.dealerHand.cards[1].peek(() => {
      if (this.dealerHand.value === 21) {
        this.dealerHand.cards[1].flip(() => {
          this.#setActivePanel("none");
          if (this.currentHand.value === 21) {
            if (this.currentHand.cards.length === 2) {
              //?Natural BJ
              this.currentHand.status = "BJ";
            }
          }
          this.completeHands.push(this.playerHands.shift());
          this.#payments();
        });
      } else {
        this.#evaluatePlayerHand();
      }
    });
  }
  #nextHand() {
    this.#setActivePanel("none");
    //this.state = GameState.NextHand;
    this.completeHands.push(this.playerHands.shift());
    if (!this.playerHands.length) {
      //TODO ir a la function dealerTurnEvaluation
      this.state = GameState.Animating;
      console.log("FLIP");
      this.audioManager.play("flip", 0);
      this.dealerHand.cards[1].flip(() => {
        //!ACA ANDO
        this.#lastCheck();
      });
    } else {
      this.currentHand = this.playerHands[0];
      this.#evaluatePlayerHand();
    }
  }
  #evaluateDealerHand() {
    this.state = GameState.DealerTurn;
    this.updateUi({ dealer: this.dealerHand.getMaxValue() });
    if (this.dealerHand.getMaxValue() === 21 && this.dealerHand.cards.length === 2) {
      this.dealerHand.status = "BJ";
      this.#payments();
    } else if (this.dealerHand.getMaxValue() < 17) {
      this.state = GameState.Animating;
      this.audioManager.play("draw", 0);
      this.dealerHand.draw(true, () => {
        this.#evaluateDealerHand();
      });
    } else if (this.dealerHand.getMaxValue() > 21) {
      this.dealerHand.status = "BUST";
      this.#payments();
    } else {
      //21
      this.#payments();
    }
  }
  #lastCheck() {
    //?si el player tiene BUST o BJ ir a payments
    //?sino ir a evaluar delaer
    const playableHandsFound = this.completeHands.filter((hand) => hand.status !== "BUST" && hand.status !== "BJ");
    if (playableHandsFound.length) {
      console.log(playableHandsFound);
      this.#evaluateDealerHand();
    } else {
      this.#payments();
    }
  }
  // #payments() {
  //   this.state = GameState.Payments;
  //   const dealerValue = this.dealerHand.getMaxValue();
  //   this.completeHands.forEach((hand) => {
  //     let currentPayment = 0;
  //     let total = 0;
  //     if (this.dealerHand.status === "BJ") {
  //       if (hand.bet.insu.value > 0) {
  //         //?INSU PAY
  //         currentPayment += hand.bet.insu.value;
  //         hand.bet.insu.status = "WIN";
  //         total += hand.bet.insu.value;
  //       }
  //       if (hand.status === "BJ") {
  //         //?PUSH
  //         currentPayment += hand.bet.base.value;
  //         hand.bet.base.status = "PUSH";
  //       } else {
  //         //?REMOVE
  //         hand.bet.base.status = "LOSE";
  //       }
  //     } else {
  //       hand.bet.insu.status = "LOSE";
  //       if (hand.status === "BJ") {
  //         //?PAY 3:2
  //         console.log("PLAYER BJ");
  //         currentPayment += Math.floor((3 / 2) * hand.bet.base.value);
  //         hand.bet.base.status = "WIN";
  //         total += hand.bet.base.value;
  //       } else if (this.dealerHand.status === "BUST") {
  //         //?PAY normal
  //         console.log("DEALER BUST");
  //         currentPayment += hand.bet.base.value + hand.bet.double.value;
  //         hand.bet.base.status = "WIN";
  //         hand.bet.double.status = "WIN";
  //         total += hand.bet.base.value + hand.bet.double.value;
  //       } else if (this.dealerHand.getMaxValue() > hand.getMaxValue()) {
  //         //?REMOVE
  //         hand.bet.base.status = "LOSE";
  //         hand.bet.double.status = "LOSE";
  //         console.log("DEALER > PLAYER");
  //       } else if (this.dealerHand.getMaxValue() < hand.getMaxValue()) {
  //         if (hand.status === "BUST") {
  //           //?REMOVE
  //           hand.bet.base.status = "LOSE";
  //           hand.bet.double.status = "LOSE";
  //           console.log("PLAYER BUST");
  //         } else {
  //           //?PAY
  //           console.log("DEALER < PLAYER");
  //           currentPayment += hand.bet.base.value + hand.bet.double.value;
  //           hand.bet.base.status = "WIN";
  //           hand.bet.double.status = "WIN";
  //           total += hand.bet.base.value + hand.bet.double.value;
  //         }
  //       } else {
  //         //?PUSH
  //         console.log("PUSH");
  //         hand.bet.base.status = "PUSH";
  //         hand.bet.double.status = "PUSH";
  //         total += hand.bet.base.value + hand.bet.double.value;
  //         //currentPayment += hand.bet.base.value + hand.bet.double.value;
  //       }
  //     }
  //     console.log(currentPayment);

  //     // if (hand.bet.base.value > 0) total += hand.bet.base.value;
  //     // if (hand.bet.double.value > 0) total += hand.bet.double.value;
  //     // if (hand.bet.insu.value > 0) total += hand.bet.insu.value;
  //     // console.log("total", total);
  //     if (currentPayment > 0) hand.bet.setPayment(currentPayment);
  //     this.audioManager.play("chip", 0);
  //     this.#setBalance(currentPayment + total);
  //     //this.#balance += currentPayment + total;
  //   });
  //   setTimeout(() => {
  //     this.#animatePayment();
  //   }, 1000);
  //   setTimeout(() => {
  //     this.#setUpNewHand();
  //   }, 4000);
  // }
  #payments() {
    this.state = GameState.Payments;
    const dealerValue = this.dealerHand.getMaxValue();
    this.completeHands.forEach((hand) => {
      let currentPayment = 0;
      let total = 0;
      if (this.dealerHand.status === "BJ") {
        if (hand.bet.insu.value > 0) {
          //?INSU PAY
          currentPayment += hand.bet.insu.value;
          hand.bet.insu.status = "WIN";
          total += hand.bet.insu.value;
        }
        if (hand.status === "BJ") {
          //?PUSH
          currentPayment += hand.bet.base.value;
          hand.bet.base.status = "PUSH";
        } else {
          //?REMOVE
          hand.bet.base.status = "LOSE";
        }
      } else {
        hand.bet.insu.status = "LOSE";
        if (hand.status === "BJ") {
          //?PAY 3:2
          console.log("PLAYER BJ");
          currentPayment += Math.floor((3 / 2) * hand.bet.base.value);
          hand.bet.base.status = "WIN";
          total += hand.bet.base.value;
        } else if (hand.status === "BUST") {
          //?REMOVE
          hand.bet.base.status = "LOSE";
          hand.bet.double.status = "LOSE";
          console.log("PLAYER BUST");
        } else if (this.dealerHand.status === "BUST") {
          //?PAY normal
          console.log("DEALER BUST");
          currentPayment += hand.bet.base.value + hand.bet.double.value;
          hand.bet.base.status = "WIN";
          hand.bet.double.status = "WIN";
          total += hand.bet.base.value + hand.bet.double.value;
        } else if (hand.getMaxValue() > this.dealerHand.getMaxValue()) {
          //?PAY normal
          console.log("PLAYER > DEALER");
          currentPayment += hand.bet.base.value + hand.bet.double.value;
          hand.bet.base.status = "WIN";
          hand.bet.double.status = "WIN";
          total += hand.bet.base.value + hand.bet.double.value;
        } else if (hand.getMaxValue() < this.dealerHand.getMaxValue()) {
          //?REMOVE
          console.log("DEALER > PLAYER");
          hand.bet.base.status = "LOSE";
          hand.bet.double.status = "LOSE";
        } else {
          //?PUSH
          console.log("PUSH");
          hand.bet.base.status = "PUSH";
          hand.bet.double.status = "PUSH";
          total += hand.bet.base.value + hand.bet.double.value;
        }
      }
      console.log(currentPayment);

      // if (hand.bet.base.value > 0) total += hand.bet.base.value;
      // if (hand.bet.double.value > 0) total += hand.bet.double.value;
      // if (hand.bet.insu.value > 0) total += hand.bet.insu.value;
      // console.log("total", total);
      if (currentPayment > 0) hand.bet.setPayment(currentPayment);
      this.audioManager.play("chip", 0);
      this.#setBalance(currentPayment + total);
      //this.#balance += currentPayment + total;
    });
    setTimeout(() => {
      this.#animatePayment();
    }, 1000);
    setTimeout(() => {
      this.#setUpNewHand();
    }, 4000);
  }
  #animatePayment() {
    //!setting
    const playerPos = new THREE.Vector3(0, 0, -5);
    const dealerPos = new THREE.Vector3(0, 0, 5);
    const duration = 1000;
    const sections = ["base", "double", "insu", "payment"];
    this.completeHands.forEach((hand) => {
      sections.forEach((section) => {
        if (hand.bet[section].chips.length) {
          hand.bet[section].chips.forEach((chip) => {
            if (hand.bet[section].status === "LOSE") {
              const to = dealerPos.clone().set(dealerPos.x, chip.mesh.position.y, dealerPos.z);
              chip.move(to, duration);
            } else {
              //WIN or PUSH
              const to = playerPos.clone().set(playerPos.x, chip.mesh.position.y, playerPos.z);
              chip.move(to, duration);
            }
          });
        }
      });
    });
  }
  #setUpNewHand() {
    this.#lastBet = this.completeHands[0].bet.base.value;
    this.completeHands.forEach((hand) => {
      //restaurar las chips
      hand.bet.restoreChips();
      //restaurar las cartas
      this.deck.returnCards(hand.cards);
    });
    this.deck.returnCards(this.dealerHand.cards);
    if (this.deck.needsShuffle()) {
      console.log("SHUFFLING");
      this.updateUi({ player1: 0, player2: 0, player3: 0, dealer: 0, msg: "SHUFFLING DECKS", count: 0, bet: 0 });
      this.audioManager.play("shuffle", 0);
      this.deck.shuffle(() => {
        setTimeout(() => {
          this.updateUi({ player1: 0, player2: 0, player3: 0, dealer: 0, msg: "", count: 0, bet: 0 });
          this.state = GameState.NewHand;
        }, 2000);
      });
    } else {
      this.updateUi({ player1: 0, player2: 0, player3: 0, dealer: 0, msg: "" });
      this.state = GameState.NewHand;
    }
  }
  #setBalance(newValue) {
    this.#balance += newValue;
    this.updateUi({ balance: this.#balance });
  }
  updateUi(data) {
    this.ui = { ...this.ui, ...data };
    this.onUiUpdate(this.ui);
  }
}
export default GameManager;
