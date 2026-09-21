import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protected";
import {Login} from "../auth/login/login";
import {Signup} from "../auth/signup/signup";
import {Home} from "../protected/home";
import HomePage from "./HomePage"
import { Propriety } from "./Propriety.ts";
import { Player } from "./Player.ts";
import Error from "./Error.tsx";

const p = new Propriety("Rue de la paix",500,[250,50,75,95,200,1500],250,"brown")
const pl = new Player(-1,"",1,3000)

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                </Route>

                <Route path="*" element={<Error />} />
            </Routes>
        </BrowserRouter>
    );
}
