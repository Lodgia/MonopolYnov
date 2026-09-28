import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listGameHistory, getMeUser, type Game, type UserMe } from "./Game.ts";
import { MonopolyButton } from "./Components/ui/MonopolyButton.tsx";

interface HistoryProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function History({ isOpen = true, onClose }: HistoryProps) {
    const navigate = useNavigate();
    const [history, setHistory] = useState<Game[]>([]);
    const [me, setMe] = useState<UserMe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate("/home");
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const [meRes, histRes] = await Promise.all([getMeUser(), listGameHistory()]);
            setMe(meRes);
            setHistory(histRes);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger l'historique des parties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    let totalWins = 0;
    history.forEach((g) => {
        try {
            if (g.endData) {
                const parsed = JSON.parse(g.endData);
                if (me && parsed.winnerId === me.id) totalWins++;
            } else if (g.state && g.state.startsWith("{")) {
                const parsed = JSON.parse(g.state);
                if (me && parsed.winnerId === me.id) totalWins++;
            }
        } catch {}
    });

    const winRate = history.length > 0 ? Math.round((totalWins / history.length) * 100) : 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none font-sans"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-4xl bg-white border-3 border-red-500 p-5 sm:p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-red-500 uppercase tracking-wide">
                            Historique des Parties
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <MonopolyButton variant="primary" size="sm" onClick={fetchHistory}>
                            🔄 Actualiser
                        </MonopolyButton>
                        <MonopolyButton variant="danger" size="sm" onClick={handleClose}>
                            ✕ Fermer
                        </MonopolyButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1 uppercase">
                            Statistiques Joueur
                        </span>

                        <div className="bg-white border-2 border-red-500 p-3 flex flex-col gap-2">
                            <div className="text-xs font-bold text-zinc-900 truncate">
                                👤 {me?.email?.split("@")[0] || "Joueur"}
                            </div>
                            <div className="text-[11px] text-zinc-600 truncate">
                                {me?.email || ""}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="bg-white border-2 border-red-500 p-2.5 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-800">Parties jouées</span>
                                <span className="text-xs font-bold text-blue-600">{history.length}</span>
                            </div>

                            <div className="bg-white border-2 border-red-500 p-2.5 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-800">Victoires</span>
                                <span className="text-xs font-bold text-emerald-600">🏆 {totalWins}</span>
                            </div>

                            <div className="bg-white border-2 border-red-500 p-2.5 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-800">Taux de victoire</span>
                                <span className="text-xs font-bold text-purple-600">{winRate} %</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5 text-xs max-h-[60vh] overflow-y-auto">
                        <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1 uppercase">
                            Parties terminées ({history.length})
                        </span>

                        {loading ? (
                            <div className="bg-white border-2 border-red-500 p-8 text-center font-bold text-zinc-700">
                                Chargement de l'historique...
                            </div>
                        ) : error ? (
                            <div className="bg-white border-2 border-red-500 p-4 text-center font-bold text-red-600">
                                {error}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="bg-white border-2 border-red-500 p-8 flex flex-col items-center justify-center gap-3 text-center">
                                <span className="text-3xl">🎲</span>
                                <span className="font-bold text-sm text-zinc-900">
                                    Aucune partie terminée pour le moment
                                </span>
                                <p className="text-xs text-zinc-600 max-w-sm">
                                    Lancez une partie multijoueur pour enregistrer vos résultats et accumuler des victoires !
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {history.map((g) => {
                                    let winnerName = "Inconnu";
                                    let isWin = false;
                                    try {
                                        if (g.endData) {
                                            const parsed = JSON.parse(g.endData);
                                            winnerName = parsed.winnerName || (parsed.winnerId ? `Joueur #${parsed.winnerId}` : "Inconnu");
                                            if (me && parsed.winnerId === me.id) isWin = true;
                                        } else if (g.state && g.state.startsWith("{")) {
                                            const parsed = JSON.parse(g.state);
                                            if (parsed.winnerId) {
                                                const winP = parsed.players?.find((p: { id: number; name: string }) => p.id === parsed.winnerId);
                                                winnerName = winP?.name ?? `Joueur #${parsed.winnerId}`;
                                                if (me && parsed.winnerId === me.id) isWin = true;
                                            }
                                        }
                                    } catch {}

                                    const formattedDate = g.endedAt
                                        ? new Date(g.endedAt).toLocaleDateString("fr-FR", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : "Terminée";

                                    return (
                                        <div
                                            key={g.id}
                                            className="bg-white border-2 border-red-500 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-500 text-xs">
                                                        Partie #{g.id}
                                                    </span>
                                                    <span
                                                        className={`border-2 ${
                                                            isWin ? "border-emerald-600" : "border-zinc-500"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block border-2 border-white text-[9px] font-bold p-0.5 px-1.5 ${
                                                                isWin
                                                                    ? "bg-emerald-600 text-white"
                                                                    : "bg-zinc-600 text-white"
                                                            }`}
                                                        >
                                                            {isWin ? "🏆 Victoire" : "Terminée"}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="text-zinc-900 text-xs">
                                                    Vainqueur : <strong className="text-red-600 font-bold">{winnerName}</strong>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-zinc-500 font-semibold">
                                                        Joueurs ({g.players.length}) :
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {g.players.map((p) => (
                                                            <span
                                                                key={p.id}
                                                                style={p.color?.startsWith("#") ? { backgroundColor: p.color } : undefined}
                                                                className={`w-3.5 h-3.5 rounded-full border border-zinc-800 ${
                                                                    !p.color?.startsWith("#") ? (p.color || "bg-blue-500") : ""
                                                                }`}
                                                                title={p.email}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
