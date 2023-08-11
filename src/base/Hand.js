import * as THREE from "three";
import Bet from "./Bet";
import Deck from "./Deck";
import Card from "./Card";
import GameManager from "./GameManager";
class Hand {
  #position = new THREE.Vector3();
  #currentPos;
  #gm;
  /**
   * @param {Deck} deck
   */
  constructor(world, dealer, handPosition, deck, canSplit) {
    this.world = world;
    this.dealer = dealer;
    this.status = "PLAY";
    this.canSplit = canSplit;
    this.#position = handPosition;
    this.#currentPos = this.#position;
    //todo tal vez tenga que setear la posicion
    this.deck = deck;
    /**
     * @type {Card[]} cards
     */
    this.cards = [];
    this.bet = new Bet(this.world, this.#position);
    this.#gm = new GameManager();
  }
  advancePos() {
    this.#currentPos.add(new THREE.Vector3(-0.15, 0.01, 0));
  }
  set position(pos) {
    this.#position.copy(pos);
  }
  get position() {
    return this.#position;
  }
  async draw(flip, onDrawSuccess) {
    const card = await this.deck.getCard();
    card.move(flip, this.deck.position.clone(), this.#currentPos.clone(), onDrawSuccess);
    this.cards.push(card);
    this.#currentPos.add(new THREE.Vector3(-0.15, 0.01, 0));
    //?counter
    if (card.value <= 6) {
      this.#gm.updateUi({ count: this.#gm.ui.count + 1, bet: this.#gm.ui.count / 6 - 1 });
    } else if (card.value >= 10) {
      this.#gm.updateUi({ count: this.#gm.ui.count - 1, bet: this.#gm.ui.count / 6 - 1 });
    } else {
      this.#gm.updateUi({ count: this.#gm.ui.count + 0, bet: this.#gm.ui.count / 6 - 1 });
    }
  }
  get value() {
    return this.cards.reduce((total, card) => total + card.value, 0);
  }
  getAces() {
    return this.cards.reduce((total, card) => {
      if (card.char === "A") return total + 1;
      return total;
    }, 0);
  }
  getMaxValue() {
    let aces = this.getAces();
    const totalValue = this.cards.reduce((total, card) => total + card.value, 0);
    let maxValue = totalValue;
    while (aces) {
      if (maxValue > 21) {
        maxValue -= 10;
        aces--;
      } else break;
    }
    return maxValue;
  }
  isSplitable() {
    return this.cards[0].value === this.cards[1].value;
  }
}
export default Hand;
