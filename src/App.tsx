"use client"

import { useEffect, useState } from "react";
import DisplayCard from "./Components/Cards/DisplayCard";
import RandomCard from "./Components/Cards/RandomCard";

export default function App() {
    const [dataCard, setDataCard] = useState<{ isHit: boolean, label: string, type: "communityCards" | "luckyCards"  }>({ isHit: false, label: "", type: "communityCards" })    

    useEffect(() => {
        if ( !dataCard.isHit ) return;
        setTimeout(() => {
            setDataCard({...dataCard, isHit: false, label: ""})
        }, 5000);
    }, [dataCard.isHit])

    const hitCard = ( type: "communityCards" | "luckyCards" ) => {
        setDataCard({...dataCard, isHit: true, label: RandomCard(type)})
    }

    return (
        <div>
            <button onClick={() => hitCard("luckyCards")}>Tirer une carte chance</button>
            <button onClick={() => hitCard("communityCards")}>Tirer une carte communautaire</button>
            {dataCard.isHit && <DisplayCard cardLabel={dataCard.label} cardType={dataCard.type} />}
        </div>
    );
}