import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { SignupPage } from "./pages/SignupPage.tsx";
import { LobbyPage } from "./pages/LobbyPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { Board } from "./components/board/Board.tsx";
import { HistoryModal } from "./components/modals/HistoryModal.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";

export default function App() {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/board" element={<Board />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<LobbyPage />} />
                    <Route path="/history" element={<HistoryModal />} />
                    <Route path="/game/:id" element={<Board />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </ToastProvider>
    );
}
