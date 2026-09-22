import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import ProtectedRoute from "../auth/protected.tsx";
import {Login} from "../auth/login/login.tsx";
import {Signup} from "../auth/signup/signup.tsx";
import {Home} from "../protected/home.tsx";
import HomePage from "./HomePage.tsx"
import { Propriety } from "./Propriety.ts";
import { Player } from "./Player.ts";
=======
import ProtectedRoute from "../auth/protected";
import {Login} from "../auth/login/login";
import {Signup} from "../auth/signup/signup";
import {Home} from "../protected/home";
import HomePage from "./HomePage"
import {Board} from "./Board.tsx"
>>>>>>> 8ac6c9a9573de894ca9b7a6e7a4b4329f9abd6db
import Error from "./Error.tsx";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/board" element={<Board/>}/>

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} />
                </Route>

                <Route path="*" element={<Error />} />
            </Routes>
        </BrowserRouter>
    );
}
