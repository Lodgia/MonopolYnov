
import { useState } from "react";
import { findWinner, type Player } from "../src/Player.ts";
import Rules from "../src/Rules.tsx";
import { VictoryModal } from "../src/VictoryModal.tsx";
import ModalPlay from "../src/Components/modalPlay.tsx";

interface HomeProps {
    players?: Player[];
}

export function Home({ players = [] }: HomeProps) {
    const winner = findWinner(players);
    const [modalPlay, setModalPlay] = useState(false)

    return (
        <>
            <button onClick={() => setModalPlay(!modalPlay)}>Jouer</button>
            {modalPlay && <ModalPlay onClose={() => setModalPlay(!modalPlay)}/>}
            <VictoryModal winner={winner} />

            <Rules />
        </>
    )
}