import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protected";
import {Login} from "../auth/login/login";
import {Signup} from "../auth/signup/signup";
import {Home} from "../protected/home";
import HomePage from "./HomePage"
import {Board} from "./Board.tsx"


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
            </Routes>
        </BrowserRouter>
    );
}
