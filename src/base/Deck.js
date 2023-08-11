import * as THREE from "three";
import Card from "./Card";
class Deck {
  #shuffleThreshold = 15; //! set
  #position;
  #index = 0;
  #loadedCards = [];
  constructor(world, deckPosition) {
    this.world = world;
    this.#position = deckPosition;
    this.cards = [];
    this.#start();
  }
  get position() {
    return this.#position;
  }
  async #start() {
    await this.#generateInitialCards();
  }
  needsShuffle() {
    return this.#index > this.cards.length - this.#shuffleThreshold;
  }
  async getCard() {
    const card = this.#loadedCards.pop();
    this.#loadCard();
    return card;
  }
  returnCards(cards) {
    //todo hacer el dispose del array de cards que llegan
    cards.forEach((card) => card.removeMesh());
  }
  async #generateInitialCards() {
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
    ];
    const decksCount = 6;
    for (let i = 0; i < decksCount; i++) {
      paths.forEach(async (path) => {
        const card = new Card(this.world, path);
        //await card.createMesh(path);
        this.cards.push(card);
      });
    }
    this.shuffle(() => {});
  }
  async #initialLoad(onComplete) {
    for (let i = 0; i < 4; i++) {
      await this.#loadCard();
    }
    onComplete();
  }
  async #loadCard() {
    const card = this.cards[this.#index];
    await card.createMesh();
    this.#index++;
    this.#loadedCards.unshift(card);
  }
  shuffle(onComplete) {
    //todo shuflear this.cards
    //preparar el queue
    this.returnCards(this.#loadedCards);
    for (let count = 0; count < this.cards.length * 20; count++) {
      let i = Math.floor(Math.random() * this.cards.length);
      let j = Math.floor(Math.random() * this.cards.length);
      const aux = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = aux;
    }
    console.log("shuffle Done !");
    this.#index = 0;
    this.#loadedCards = [];
    this.#initialLoad(onComplete);
  }
}
export default Deck;
