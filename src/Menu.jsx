import { useState } from "react";
import GameState from "./helperClasses/GameState";

function Menu({ changeState, toggleMenu, show }) {
  const [menu, setMenu] = useState({ main: true, map: false, genetic: false });

  function handleBackMenu() {
    if (menu.main) {
      // setMenu({ ...menu, main: false });
      toggleMenu();
    } else {
      setMenu({ main: true, map: false, genetic: false });
    }
  }
  function handleChangeSection(e) {
    switch (e.target.id) {
      case "map":
        setMenu({ main: false, map: true, genetic: false });
        break;
      case "genetic":
        setMenu({ main: false, map: false, genetic: true });
        break;
      default:
        break;
    }
  }

  return (
    show && (
      <div className="w-[400px] h-[500px] border-2 border-green-700 bg-green-900 flex flex-col absolute items-center justify-center rounded-lg gap-2">
        {menu.main && (
          <div className="w-full flex-col flex justify-center items-center gap-2">
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={handleChangeSection}
              id="map"
            >
              MAP
            </div>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={handleChangeSection}
              id="genetic"
            >
              GENETIC
            </div>
          </div>
        )}
        {menu.map && (
          <div className="w-full flex-col flex justify-center items-center gap-2">
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.CreateMap);
              }}
            >
              <p> CREATE MAP </p>
            </div>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.GenerateMesh);
              }}
            >
              <p> GENERATE MESH </p>
            </div>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.SaveMap);
              }}
            >
              <p> SAVE MAP </p>
            </div>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.LoadMap);
              }}
            >
              <p> LOAD MAP </p>
            </div>
          </div>
        )}
        {menu.genetic && (
          <>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.NewSimulation);
              }}
            >
              <p> NEW SIMULATION </p>
            </div>
            <div
              className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
              onClick={() => {
                changeState(GameState.BestSolution);
              }}
            >
              <p> RUN BEST SOLUTION </p>
            </div>
          </>
        )}
        <div
          className=" flex flex-col  w-[80%] h-14 bg-slate-500 text-white font-bold text-lg items-center justify-center cursor-pointer hover:bg-green-400 rounded-lg"
          onClick={() => handleBackMenu()}
        >
          <p> BACK </p>
        </div>
      </div>
    )
  );
}

export default Menu;
