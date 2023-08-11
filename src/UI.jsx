import React, { useEffect, useRef, useState } from "react";
import GameManager from "./base/GameManager";
import classnames from "classnames";

function UI() {
  const [data, setData] = useState({
    player1: 0,
    player2: 0,
    player3: 0,
    dealer: 0,
    msg: "",
    balance: "",
    count: 0,
    bet: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const gmInstance = useRef();
  useEffect(() => {
    setTimeout(() => {
      gmInstance.current = new GameManager();
      gmInstance.current.onUiUpdate = (boardData) => onUiUpdate(boardData);
      setTimeout(() => {
        setLoaded(true), 1000;
      });
    }, 3000);
  }, []);
  function onUiUpdate(boardData) {
    setData({ ...boardData });
  }
  return (
    <div className="absolute w-full h-[70%] flex flex-col items-center gap-1">
      {!loaded && <div className="absolute w-full h-full bg-white"></div>}
      <div className="w-full flex flex-row justify-between">
        <div className="text-5xl text-slate-900 font-bold h-12 mt-12">{`BALANCE : $ ${data.balance}`}</div>
        <div className="absolute ml-[70%]">
          {/* <div className="text-5xl text-slate-900 font-bold h-12 mt-12 mr-12">{`COUNT : ${data.count}`} </div>
          <div className="text-5xl text-slate-900 font-bold h-12 mt-12 mr-12">{`BET : ${data.bet.toFixed(2)}`}</div> */}
        </div>
      </div>
      <div className="text-4xl text-slate-900 font-bold h-12 ">{data.dealer ? `${data.dealer}` : ""}</div>
      <div className="text-5xl text-red-900 font-bold h-12 mt-40">{data.msg ? `${data.msg}` : ""}</div>
      <div className="flex flex-row items-center justify-center w-full h-12 gap-56">
        <div className="text-4xl text-slate-900 font-bold h-12">{data.player1 ? `${data.player1}` : ""}</div>
        <div className="text-4xl text-slate-900 font-bold h-12">{data.player2 ? `${data.player2}` : ""}</div>
        <div className="text-4xl text-slate-900 font-bold h-12">{data.player3 ? `${data.player3}` : ""}</div>
      </div>
    </div>
  );
}

export default UI;
