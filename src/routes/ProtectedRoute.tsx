import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export function ProtectedRoute() {
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
                const response = await fetch("http://localhost:8000/auth/check-session", {
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

    return <Outlet />;
}

export default ProtectedRoute;
