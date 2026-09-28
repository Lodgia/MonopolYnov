import { useState } from "react";
import { apiFetch } from "../../api/client.ts";

type props = {
    onClose: () => void;
};

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none">
            <div className="w-full max-w-2xl bg-white border-3 border-red-500 p-5 sm:p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-red-500 uppercase">
                            Paramètres du Joueur
                        </h3>
                    </div>

                    <div className="border-2 border-red-500">
                        <button
                            onClick={onClose}
                            className="inline-block border-2 border-white text-xs font-bold p-1 bg-red-500 text-white cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Grille 2 Colonnes DA Projet (Bleu 300 / Blanc / Bordures Rouges) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Colonne Gauche : Sélection du pion */}
                    <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">
                            Couleur de votre pion
                        </span>

                        <div className="grid grid-cols-4 gap-2.5 p-2 bg-white border-2 border-red-500">
                            {user_colors.map((pawn) => {
                                const isSelected = userColor.id === pawn.id;
                                return (
                                    <button
                                        key={pawn.id}
                                        onClick={() => handleSelectColor(pawn)}
                                        style={{ backgroundColor: pawn.bg }}
                                        className={`w-9 h-9 rounded-full cursor-pointer transition-transform flex items-center justify-center relative shadow ${
                                            isSelected
                                                ? "ring-2 ring-red-500 ring-offset-2 ring-offset-white scale-110"
                                                : "hover:scale-105 border border-zinc-400"
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Colonne Droite : Mot de passe */}
                    <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5 text-xs">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">
                            Modifier votre mot de passe
                        </span>

                        <div className="flex flex-col gap-2">
                            <input
                                className="bg-white border-2 border-red-500 p-2 text-xs text-zinc-900 font-bold outline-none"
                                value={password.currentPassword}
                                onChange={(e) => setPasswword({ ...password, currentPassword: e.target.value })}
                                type="password"
                                placeholder="Mot de passe actuel"
                            />
                            <input
                                className="bg-white border-2 border-red-500 p-2 text-xs text-zinc-900 font-bold outline-none"
                                value={password.newPassword}
                                onChange={(e) => setPasswword({ ...password, newPassword: e.target.value })}
                                type="password"
                                placeholder="Nouveau mot de passe"
                            />
                            <input
                                className="bg-white border-2 border-red-500 p-2 text-xs text-zinc-900 font-bold outline-none"
                                value={password.confirmNewPassword}
                                onChange={(e) => setPasswword({ ...password, confirmNewPassword: e.target.value })}
                                type="password"
                                placeholder="Confirmation"
                            />

                            <div className="border-2 border-blue-500 w-full mt-2">
                                <button
                                    disabled={saving}
                                    onClick={handleSave}
                                    className="inline-block border-2 border-white text-xs font-bold p-2 bg-blue-500 text-white w-full cursor-pointer hover:bg-blue-600 transition"
                                >
                                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}