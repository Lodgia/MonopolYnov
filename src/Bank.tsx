"use client"

import { useState } from "react";

const [userSold, setUserSold] = useState(0)

const userId = 2

type props = {
    soldBank: number;
}

export default function Bank({ soldBank }: props) {

    const [bankSold, setBankSold] = useState(0)

    const initBank = () => {
        setBankSold(soldBank)
    }

    const hasMoney = async (playerId: number, amount: number) => {
        return (userId - amount) > 0
        const req = await fetch("/bank/hasMoney", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: userId })
        })

        if (!req.ok) {
            const err = await req.json()
            alert(err.error())
            return
        }

        return await req.text()
    }

    const updatePlayerMoney = async (playerId: number, type: "+" | "-", amount: number) => {
        // type === "+" && hasMoney(-1, amount) ? setUserSold(userSold + amount) : alert("La banque n'a plus assez d'argent !");
        // type === "-" && hasMoney(userSold, amount) ? setUserSold(userSold - amount) : alert("Le joueur n'a pas assez d'argent !");

        const req = await fetch("/bank/updatePlayerAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: playerId, type: type, amount: amount })
        })

        if (!req.ok) {
            alert("Problème sur le fetch du updatePlayerMoney !")7
            return
        }

        alert("Update player effectué !")
    }

    const updateBankMoney = (type: "+" | "-", amount: number) => {
        type === "+" && hasMoney(userSold, amount) ? setBankSold(bankSold + amount) : alert("Le joueur n'a pas assez d'argent !");
        type === "-" && hasMoney(-1, amount) ? setBankSold(bankSold - amount) : alert("La banque n'a plus assez d'argent !");
    }
}