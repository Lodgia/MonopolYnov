import { useState } from "react";
import { useNavigate } from "react-router-dom";



export function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
            email: '',
            password: '',
        });
    
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        };
    
        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
    
            try {
                console.log("Envoi de la requête...");
    
                const reponse = await fetch("http://localhost:8000/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });
    
                const texte = await reponse.text();
    
                if (!reponse.ok) {
                    throw new Error(`Erreur HTTP ${reponse.status} : ${texte}`);
                }
    
                const data = JSON.parse(texte);
    
                console.log("Connexion réussie :", data);
                
                localStorage.setItem('token', data.token);
                navigate("/home")
                
            } catch (error) {
                console.error("ERREUR FETCH :", error);
            }
        };

    return (
        <>
           <h1 className="flex justify-center">Se Connecter :</h1>
           <form
                className="flex flex-col items-center"
                onSubmit={handleSubmit}
            >
                <label htmlFor="email">Email :</label>

                <input
                    className="border-2 border-black"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <label htmlFor="password">Mot de passe :</label>

                <input
                    className="border-2"
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">
                    Valider
                </button>
            </form>
        </>
    )
}