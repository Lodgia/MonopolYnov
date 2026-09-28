import React, { useState } from "react";

interface DesProp {
  score : (n:number)=>void
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1; 
}

export function Des({score}:DesProp) { 
  const [resultat, setResultat] = useState({ de1: 0, de2: 0, total: 0 });

  const lancerLesDes = () => {
    const de1 = rollDice();
    const de2 = rollDice();

    setResultat({
      de1: de1,
      de2: de2,
      total: de1 + de2,
    });
  };

  return (
    <>
      <button onClick={()=>{lancerLesDes();score(resultat.total)}}>Lancer les dés</button>
      <div id="score" className="absolute object-center">
        {resultat && (
          `Score dé 1 : ${resultat.de1} /// Score dé 2 : ${resultat.de2} Score total : ${resultat.total}`
        )}
      </div>
    </>
  );
}
