import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const reponse = await fetch("http://localhost:8000/auth/signup", {
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

            const token = data.token;
            localStorage.setItem("token", token);
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                if (data.user.color) {
                    localStorage.setItem("user_color", data.user.color);
                }
            }
            navigate("/home");
        } catch (error) {
            console.error("ERREUR FETCH :", error);
        }
    };

    return (
        <div className="h-screen w-screen bg-blue-400 flex flex-col items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="w-80 shadow-2xl">
                <div className="flex flex-col items-center border-3 border-black w-full bg-red-700">
                    <p className="font-bold text-center text-3xl my-8 text-white">S'ENREGISTRER</p>
                </div>
                <div className="flex flex-col items-center border-3 border-t-0 border-black py-10 px-6 w-full bg-blue-100">
                    <label htmlFor="email" className="font-bold text-sm text-zinc-900 self-start">Email</label>
                    <input
                        className="border-2 border-black p-2 my-2 w-full bg-white text-zinc-900"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password" className="font-bold text-sm text-zinc-900 self-start mt-2">Mot de passe</label>
                    <input
                        className="border-2 border-black p-2 my-2 w-full bg-white text-zinc-900"
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        className="border-2 border-black bg-red-700 hover:bg-red-800 text-white font-bold p-2 mt-4 w-full cursor-pointer transition"
                        type="submit"
                    >
                        Valider
                    </button>

                    <Link className="mt-5 text-sm font-semibold underline text-blue-900 hover:text-blue-950" to="/login">
                        SE CONNECTER
                    </Link>
                </div>
            </form>
        </div>
    );
}

export const Signup = SignupPage;
export default SignupPage;
