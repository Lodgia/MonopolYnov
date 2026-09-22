"use client"

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protected.tsx";
import { Login } from "../auth/login/login.tsx";
import { Signup } from "../auth/signup/signup.tsx";
import { Home } from "../protected/home.tsx";
import HomePage from "./HomePage.tsx"
import Error from "./Error.tsx";
import { Board } from "./Board.tsx";
import { useEffect, useState } from "react";
import DisplayCard from "./Components/Cards/DisplayCard.tsx";
import RandomCard from "./Components/Cards/RandomCard.ts";


export default function App() {
    const [dataCard, setDataCard] = useState<{ isHit: boolean, label: string, type: "communityCards" | "luckyCards" }>({ isHit: false, label: "", type: "communityCards" })

    useEffect(() => {
        if (!dataCard.isHit) return;
        setTimeout(() => {
            setDataCard({ ...dataCard, isHit: false, label: "" })
        }, 5000);
    }, [dataCard.isHit])

    const hitCard = (type: "communityCards" | "luckyCards") => {
        setDataCard({ ...dataCard, isHit: true, type: type, label: RandomCard(dataCard.type) })
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/board" element={<Board />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                </Route>

                <Route path="*" element={<Error />} />

                {/* Tirer carte chance / communautaire */}
                
                {/* <button onClick={() => hitCard("luckyCards")}>Tirer une carte chance</button>
                <button onClick={() => hitCard("communityCards")}>Tirer une carte communautaire</button> */}
                {dataCard.isHit && <DisplayCard cardLabel={dataCard.label} cardType={dataCard.type} />}
            </Routes>
        </BrowserRouter>
    );
}
