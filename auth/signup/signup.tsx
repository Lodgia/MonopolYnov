import { useState } from 'react';

export function Signup() {
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

            console.log("Inscription réussie :", data);
            
            const token = data.token;
            localStorage.setItem('token', token);
            
        } catch (error) {
            console.error("ERREUR FETCH :", error);
        }
    };

    return (
        <>
            <p className="flex justify-center text-3xl mt-5">S'enregistrer :</p>

            <form className="flex flex-col items-center mt-5" onSubmit={handleSubmit}>
                <label htmlFor="email">Email :</label>
                <input className="border-2 border-black" id="email" name="email" type="email" value={formData.email} onChange={handleChange}/>

                <label htmlFor="password">Mot de passe :</label>
                <input className="border-2" id="password" name="password" type="password" value={formData.password} onChange={handleChange}/>

                <button className='border-2 border-black p-1 mt-3' type="submit">Valider</button>
            </form>
        </>
    );
}
