const GameState = Object.freeze({
  Initialize: Symbol("Initialize"),
  NewGame: Symbol("NewGame"),
  NewHand: Symbol("NewHand"),
  PlayingHand: Symbol("PlayingHand"),
  BetPhase: Symbol("BetPhase"),
  InitialDraw: Symbol("InitialDraw"),
  InitialCheck: Symbol("InitialCheck"),
  DealerPeek: Symbol("DealerPeek"),
  InsuranceTurn: Symbol("InsuranceTurn"),
  PlayerTurn: Symbol("PlayerTurn"),
  NextHand: Symbol("NextHand"),
  DealerTurn: Symbol("DealerTurn"),
  Loading: Symbol("Loading"),
  Animating: Symbol("Animating"),
});
export default GameState;
