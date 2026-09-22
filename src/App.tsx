import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/protected.tsx";
import {Login} from "../auth/login/login.tsx";
import {Signup} from "../auth/signup/signup.tsx";
import {Home} from "../protected/home.tsx";
import HomePage from "./HomePage.tsx"
import Error from "./Error.tsx";
import { Board } from "./Board.tsx";


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
