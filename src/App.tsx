import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protected";
import {Login} from "../auth/login/login";
import {Signup} from "../auth/signup/signup";
import {Home} from "../protected/home";
import HomePage from "./HomePage"
import { Case } from "./Case.tsx";
import {Player} from "./Player.ts";
import { Propriety } from "./Propriety.ts";

const player = new Player(-1,"",-1,5000)
const prop = new Propriety("rue de la paix",0,[500,100,150,200,15000],200,"blue")

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/case" element={<Case player={player} propriety={prop}/>}/>

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
