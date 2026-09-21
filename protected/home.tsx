
import { findWinner, type Player } from "../src/Player.ts";
import { VictoryModal } from "../src/VictoryModal.tsx";

interface HomeProps {
    players?: Player[];
}

export function Home({ players = [] }: HomeProps) {
    const winner = findWinner(players);

    return (
        <>
            <h1>You are on the home page !</h1>
            <VictoryModal winner={winner} />
        </>
    )
}