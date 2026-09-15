import { Navigate } from "react-router-dom";
import {Home} from "../protected/home";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkToken() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/check-session", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setAuthenticated(true);
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        }

        checkToken();
    }, []);

    if (loading) {
        return <p>Vérification...</p>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Home />;
}
