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
            <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mt-50">
                <div className="flex flex-col items-center border-2 border-black w-80 bg-blue-700">
                    <p className="text-center text-3xl my-10">S'ENREGISTRER</p>
                </div>
                <div className="flex flex-col items-center border-2 border-black py-20 w-80 bg-blue-100">
                    <label htmlFor="email">Email</label>
                    <input className="border-2 border-black p-1 m-2" id="email" name="email" type="email" value={formData.email} onChange={handleChange}/>

                    <label htmlFor="password">Mot de passe</label>
                    <input className="border-2 p-1 m-2" id="password" name="password" type="password" value={formData.password} onChange={handleChange}/>

                    <button className='border-2 border-black p-2 mt-3' type="submit">Valider</button>
                </div>
            </div>
            </form>
        </>
    );
}
