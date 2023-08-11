import React from "react";

function Stats({ stats }) {
  console.log("STATS", stats);
  return (
    <div className="flex flex-col w-[20%] bg-slate-500 rounded-2xl border-3 border-slate-800 m-4 p-4">
      <p className="text-xl">Generation : {stats.generation}</p>
      <p className="text-xl">
        Total Fitness : {stats.totFitness ? stats.totFitness.toFixed(3) : null}
      </p>
      <p className="text-xl">
        Avg Fitness :{stats.totFitness ? stats.avgFitness.toFixed(3) : null}
      </p>
    </div>
  );
}

export default Stats;
