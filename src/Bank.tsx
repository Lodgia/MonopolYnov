"use client"

import { useState } from "react";

const [userSold, setUserSold] = useState(0)

const userId = 2

type props = {
    soldBank: number;
}

export default function Bank({ soldBank } : props ) {

    const [bankSold, setBankSold] = useState(0)

    const initBank = () => {
        setBankSold(soldBank)
    }

    const hasMoney = ( playerId: number, amount : number ) => {
        return ( userId - amount ) > 0
    }

    const updatePlayerMoney = ( playerId: number, type: "+" | "-", amount: number ) => {
        type === "+" && hasMoney(-1, amount) ? setUserSold(userSold + amount) : alert("La banque n'a plus assez d'argent !");
        type === "-" && hasMoney(userSold, amount) ? setUserSold(userSold - amount) : alert("Le joueur n'a pas assez d'argent !");
    }

    const updateBankMoney = ( type: "+" | "-", amount: number ) => {
        type === "+" && hasMoney(userSold, amount) ? setBankSold(bankSold + amount) : alert("Le joueur n'a pas assez d'argent !");
        type === "-" && hasMoney(-1, amount) ? setBankSold(bankSold - amount) : alert("La banque n'a plus assez d'argent !");
    }
}