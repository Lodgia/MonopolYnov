import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { apiFetch } from "../../api/client.ts";

type props = {
    onClose: () => void;
}

const user_colors = [
    { id: "lime", bg: "#84cc16" },
    { id: "sand", bg: "#d97706" },
    { id: "orange", bg: "#f97316" },
    { id: "red", bg: "#ef4444" },
    { id: "sky", bg: "#0ea5e9" },
    { id: "cyan", bg: "#06b6d4" },
    { id: "teal", bg: "#14b8a6" },
    { id: "mint", bg: "#10b981" },
    { id: "tan", bg: "#a16207" },
    { id: "mascot-eyes", bg: "#ec4899" },
    { id: "pink", bg: "#f43f5e" },
    { id: "purple", bg: "#8b5cf6" },
];

export default function Settings({ onClose }: props) {
    const savedColor = localStorage.getItem("user_color");
    const initialColor = user_colors.find((c) => c.bg === savedColor || c.id === savedColor) || user_colors[0];
    const [userColor, setUserColor] = useState(initialColor);
    const [password, setPasswword] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [saving, setSaving] = useState(false);

    const handleSelectColor = async (pawn: typeof user_colors[0]) => {
        setUserColor(pawn);
        localStorage.setItem("user_color", pawn.bg);
        try {
            await apiFetch("/auth/change-color", {
                method: "POST",
                body: JSON.stringify({ color: pawn.bg }),
            });
        } catch {}
    };

    const handleSave = async () => {
        if (!password.currentPassword && !password.newPassword && !password.confirmNewPassword) {
            alert("Préférences sauvegardées !");
            onClose();
            return;
        }
        if (!password.currentPassword) {
            alert("Veuillez saisir votre mot de passe actuel");
            return;
        }
        if (!password.newPassword) {
            alert("Veuillez saisir un nouveau mot de passe");
            return;
        }
        if (password.newPassword.length < 4) {
            alert("Le nouveau mot de passe doit comporter au moins 4 caractères");
            return;
        }
        if (password.newPassword !== password.confirmNewPassword) {
            alert("La confirmation du mot de passe ne correspond pas");
            return;
        }
        setSaving(true);
        try {
            await apiFetch("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                }),
            });
            alert("Mot de passe modifié avec succès !");
            setPasswword({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            onClose();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur lors de la modification";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className=" w-2/7 m-auto p-5 rounded-[15px] font-bold text-white fixed inset-0 bg-gray-800 h-fit flex flex-col gap-7">
                <div className="flex items-center justify-between text-[20px]">
                    <h2>Paramètres</h2>
                    <button className="cursor-pointer" onClick={onClose}><IoCloseCircle /></button>
                </div>
                <hr />
                <div className="flex flex-col items-center justify-center gap-4">
                    <h2>Choisissez la couleur de votre joueur.</h2>
                    <div className="flex items-center justify-center gap-3 w-2/3 flex-wrap">
                        {user_colors.map((pawn) => {
                            const isSelected = userColor.id === pawn.id;
                            return (
                                <button key={pawn.id} onClick={() => handleSelectColor(pawn)} style={{ backgroundColor: pawn.bg }} className={`w-11 h-11 rounded-full cursor-pointer transition-transform flex items-center justify-center relative ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-800 scale-105" : "hover:opacity-90"}`}></button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    <h2>Modifier votre mot de passe.</h2>
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-3 justify-center w-full">
                            <input className="text-[12px] bg-gray-700/60 rounded-[5px] w-1/2 flex items-center justify-center p-2 outline-none" value={password.currentPassword} onChange={e => setPasswword({ ...password, currentPassword: e.target.value })} type="password" placeholder="Votre mot de passe actuel" />
                            <input className="text-[12px] bg-gray-700/60 rounded-[5px] w-1/2 flex items-center justify-center p-2 outline-none" value={password.newPassword} onChange={e => setPasswword({ ...password, newPassword: e.target.value })} type="password" placeholder="Nouveau mot de passe" />
                            <input className="text-[12px] bg-gray-700/60 rounded-[5px] w-1/2 flex items-center justify-center p-2 outline-none" value={password.confirmNewPassword} onChange={e => setPasswword({ ...password, confirmNewPassword: e.target.value })} type="password" placeholder="Confirmation du nouveau mot de passe" />
                        </div>
                        <button disabled={saving} onClick={handleSave} className="w-full h-11 bg-indigo-600 rounded-[5px] flex items-center justify-center gap-3 cursor-pointer hover:bg-indigo-500 transition duration-500 font-medium text-white">{saving ? "Sauvegarde..." : "Sauvegarder"} <FaArrowRightLong /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}