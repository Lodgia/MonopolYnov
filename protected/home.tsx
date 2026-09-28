import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createGame,
    getGame,
    invitePlayer,
    joinGame,
    listOpenGames,
    removePlayer,
    startGame,
    updateGame,
    type Game,
    type GameSettings,
} from "../src/Game.ts";
import Rules from "../src/Rules.tsx";
import { VictoryModal } from "../src/VictoryModal.tsx";
import { findWinner, type Player } from "../src/Player.ts";
import Settings from "../src/Components/Settings.tsx";

export interface BotPlayer {
    id: number;
    name: string;
    difficulty: "easy" | "medium" | "hard";
    color: string;
}

const PAWN_COLORS = [
    { id: "lime", bg: "#84cc16", name: "Vert clair" },
    { id: "sand", bg: "#d97706", name: "Ocre" },
    { id: "orange", bg: "#f97316", name: "Orange" },
    { id: "red", bg: "#ef4444", name: "Rouge" },
    { id: "sky", bg: "#0ea5e9", name: "Bleu ciel" },
    { id: "cyan", bg: "#06b6d4", name: "Cyan" },
    { id: "teal", bg: "#14b8a6", name: "Sarcelle" },
    { id: "mint", bg: "#10b981", name: "Menthe" },
    { id: "tan", bg: "#a16207", name: "Marron" },
    { id: "mascot-eyes", bg: "#ec4899", name: "Rose" },
    { id: "pink", bg: "#f43f5e", name: "Framboise" },
    { id: "purple", bg: "#8b5cf6", name: "Violet" },
];

const DEFAULT_SETTINGS: GameSettings & {
    boardMap?: string;
    doubleRentFullSet?: boolean;
    vacationCash?: boolean;
    caution?: boolean;
    rentInPrison?: boolean;
    mortgageEnabled?: boolean;
    evenBuildEnabled?: boolean;
} = {
    startingMoney: 1500,
    turnDuration: 60,
    doublePassGo: true,
    freeParkingPool: true,
    fastMode: false,
    isPrivate: false,
    allowBots: true,
    boardTheme: "Classique",
    boardMap: "Classique",
    doubleRentFullSet: true,
    vacationCash: true,
    caution: false,
    rentInPrison: false,
    mortgageEnabled: true,
    evenBuildEnabled: true,
};

interface HomeProps {
    players?: Player[];
}

export function Home({ players = [] }: HomeProps) {
    const navigate = useNavigate();
    const winner = findWinner(players);

    // État du pion
    const [selectedPawn, setSelectedPawn] = useState(PAWN_COLORS[9]);

    // État des modales
    const [showHostModal, setShowHostModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // État du jeu
    const [currentGame, setCurrentGame] = useState<Game | null>(null);
    const [openGames, setOpenGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Paramètres modifiables dans la modale
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [maxPlayers, setMaxPlayers] = useState(4);
    const bots: BotPlayer[] = [];

    // Champs de saisie
    const [joinInputId, setJoinInputId] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    // Charger les salons ouverts
    const fetchGames = async () => {
        setRefreshing(true);
        try {
            const list = await listOpenGames();
            setOpenGames(list);
        } catch {
            setOpenGames([]);
        } finally {
            setTimeout(() => setRefreshing(false), 300);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    // 1. Créer une partie et ouvrir la modale de salon
    const handleOpenHostModal = async () => {
        setLoading(true);
        try {
            const statePayload = JSON.stringify({
                settings,
                bots,
                pawn: selectedPawn.id,
            });
            const game = await createGame({
                minPlayers: 2,
                maxPlayers,
                state: statePayload,
            });
            setCurrentGame(game);
            setMaxPlayers(game.maxPlayers);
            setShowHostModal(true);
            fetchGames();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur création";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // 2. Rejoindre un salon et ouvrir la modale de salon
    const handleJoinGame = async (gameId: number) => {
        setLoading(true);
        try {
            const game = await joinGame(gameId);
            setCurrentGame(game);
            setMaxPlayers(game.maxPlayers);
            setShowJoinModal(false);
            setShowHostModal(true);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de rejoindre ce salon";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // 3. Partie Solo immédiate
    const handleSoloGame = async () => {
        setLoading(true);
        try {
            const soloBots: BotPlayer[] = [
                { id: -1, name: "Bot 1", difficulty: "medium", color: "#0ea5e9" },
                { id: -2, name: "Bot 2", difficulty: "medium", color: "#f97316" },
                { id: -3, name: "Bot 3", difficulty: "hard", color: "#84cc16" },
            ];

            const statePayload = JSON.stringify({
                settings,
                isSolo: true,
                bots: soloBots,
                pawn: selectedPawn.id,
            });

            const game = await createGame({
                minPlayers: 1,
                maxPlayers: 4,
                state: statePayload,
            });

            await startGame(game.id, statePayload);
            navigate("/board");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur solo";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // Actualiser le salon actif
    const handleRefreshCurrentGame = async () => {
        if (!currentGame) return;
        setRefreshing(true);
        try {
            const updated = await getGame(currentGame.id);
            setCurrentGame(updated);
            setMaxPlayers(updated.maxPlayers);
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setRefreshing(false), 300);
        }
    };

    // Démarrer la partie depuis la modale
    const handleStartCurrentGame = async () => {
        if (!currentGame) return;
        setLoading(true);
        try {
            const statePayload = JSON.stringify({
                settings,
                bots,
                pawn: selectedPawn.id,
            });
            await startGame(currentGame.id, statePayload);
            setShowHostModal(false);
            navigate("/board");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de démarrer";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // Mise à jour des options en direct
    const updateSettingsField = async (field: string, value: unknown) => {
        const updated = { ...settings, [field]: value };
        setSettings(updated);

        if (currentGame) {
            try {
                const statePayload = JSON.stringify({ settings: updated, bots });
                const updatedGame = await updateGame(currentGame.id, {
                    maxPlayers,
                    state: statePayload,
                });
                setCurrentGame(updatedGame);
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Inviter un joueur
    const handleSendInvite = async () => {
        if (!currentGame) return;
        const email = inviteEmail.trim().toLowerCase();
        if (!email) return;

        try {
            const updated = await invitePlayer(currentGame.id, email);
            setCurrentGame(updated);
            setInviteEmail("");
            alert(`Joueur ${email} ajouté au salon !`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erreur invitation";
            alert(msg);
        }
    };

    // Retirer un joueur
    const handleKickPlayer = async (userId: number) => {
        if (!currentGame) return;
        try {
            const updated = await removePlayer(currentGame.id, userId);
            setCurrentGame(updated);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erreur expulsion";
            alert(msg);
        }
    };

    const copyShareUrl = () => {
        if (!currentGame) return;
        const url = `${window.location.origin}/room/${currentGame.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const currentPlayers = currentGame?.players || [];
    const isHost = currentGame ? currentGame.creatorId === currentPlayers[0]?.id : true;
    const canStart = currentGame && currentPlayers.length >= (currentGame.minPlayers ?? 2);

    return (
        <div className="min-h-screen w-full bg-blue-900 text-zinc-100 font-sans flex flex-col antialiased select-none">
            <header className="w-full px-6 border-b-3 border-red-500 bg-white flex items-center justify-between">
                <img src="/logo.png" className="h-40"></img>
                <div className="flex items-center gap-3">
                    <div className="border-2 border-blue-500"><button onClick={() => setRulesOpen(true)} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">Règles</button></div>
                    <div className="border-2 border-blue-500"><button onClick={() => setSettingsOpen(true)} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">Paramètres</button></div>
                    <div className="border-2 border-red-500"><button onClick={handleLogout} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-red-500 text-white">Déconnexion</button></div>
                </div>
            </header>

            <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
                
                <div className="w-full bg-white border-3 border-red-500 p-5 flex flex-col items-center gap-4 shadow-sm">
                    <div className="text-center">
                        <h2 className="text-sm font-semibold text-red-500">
                            Sélectionnez votre pion
                        </h2>
                        <p className="text-xs text-red-300 mt-0.5">
                            Choisissez la couleur de votre pion sur le plateau
                        </p>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button disabled={loading} onClick={handleOpenHostModal} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">{loading ? "Création..." : "Créer une partie"}</button>
                    <button disabled={loading} onClick={handleSoloGame} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">Mode Solo (vs IA)</button>
                    <button onClick={() => setShowJoinModal(true)} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">Rejoindre une partie</button>
                </div>

                <div className="w-full bg-white border-3 border-red-500 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                        <span className="text-xs font-semibold text-red-500"> Salons en attente ({openGames.length}) </span>
                        <button onClick={fetchGames} className="text-xs text-red-500 hover:text-blue-500 duration-400 cursor-pointer">{refreshing ? "Actualisation..." : "Actualiser"}</button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {openGames.length === 0 ? (
                            <p className="text-xs text-zinc-500 py-3 text-center">Aucun salon public en attente pour le moment</p>
                        ) : (
                            openGames.map((game) => (
                                <div key={game.id} className="flex items-center justify-between p-2.5 bg-white border-2 border-red-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="text-xs font-mono font-bold text-red-500">Salon #{game.id}</span>
                                        <span className="text-[11px] text-zinc-400">
                                            ({game.players.length}/{game.maxPlayers} joueurs)
                                        </span>
                                    </div>
                                    <div className="border-2 border-blue-500"><button onClick={() => handleJoinGame(game.id)} className="inline-block border-2 border-white text-[10px] font-bold p-2 bg-blue-500 text-white">Rejoindre</button></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {showHostModal && currentGame && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl bg-zinc-800 border border-zinc-700 rounded-xl p-5 sm:p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-white">Salon #{currentGame.id}</h3>
                                        <button
                                            onClick={copyShareUrl}
                                            className="text-xs px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded cursor-pointer"
                                        >
                                            {copied ? "Copié !" : "Copier lien"}
                                        </button>
                                    </div>
                                    <span className="text-xs text-emerald-400">
                                        {currentGame.status === "pending" ? "🟢 En attente de joueurs" : "🔴 Partie lancée"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefreshCurrentGame}
                                    className="text-xs px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded cursor-pointer"
                                    title="Actualiser les joueurs"
                                >
                                    {refreshing ? "..." : "Actualiser"}
                                </button>
                                <button
                                    onClick={() => setShowHostModal(false)}
                                    className="text-zinc-400 hover:text-white text-base px-2 py-0.5 rounded cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Corps : 2 Colonnes (Joueurs & Paramètres) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            
                            {/* Colonne 1 : Joueurs connectés */}
                            <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-700 rounded-lg p-3.5">
                                <span className="text-xs font-semibold text-zinc-300 border-b border-zinc-750 pb-1">
                                    Joueurs connectés ({currentPlayers.length}/{maxPlayers})
                                </span>

                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                    {currentPlayers.map((player) => {
                                        const isCreator = player.id === currentGame.creatorId;
                                        return (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-2 bg-zinc-800 border border-zinc-700 rounded"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div
                                                        style={{ backgroundColor: selectedPawn.bg }}
                                                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                                                    />
                                                    <span className="text-xs text-zinc-200 truncate" title={player.email}>
                                                        {player.email.split("@")[0]}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {isCreator ? (
                                                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                                            Hôte
                                                        </span>
                                                    ) : (
                                                        isHost && (
                                                            <button
                                                                onClick={() => handleKickPlayer(player.id)}
                                                                className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5"
                                                                title="Retirer"
                                                            >
                                                                Expulser
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Slots vides */}
                                    {Array.from({ length: Math.max(0, maxPlayers - currentPlayers.length) }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="p-2 border border-dashed border-zinc-700 text-zinc-500 text-xs rounded text-center"
                                        >
                                            Emplacement libre
                                        </div>
                                    ))}
                                </div>

                                {/* Formulaire inviter par email */}
                                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                                    <input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="email@ynov.com"
                                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-purple-500"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSendInvite();
                                        }}
                                    />
                                    <button
                                        onClick={handleSendInvite}
                                        className="text-xs px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium cursor-pointer"
                                    >
                                        Inviter
                                    </button>
                                </div>
                            </div>

                            {/* Colonne 2 : Paramètres et Règles en direct */}
                            <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-700 rounded-lg p-3.5 text-xs">
                                <span className="font-semibold text-zinc-300 border-b border-zinc-750 pb-1">
                                    Options du salon
                                </span>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Joueurs max</span>
                                    <select
                                        value={maxPlayers}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setMaxPlayers(val);
                                            updateSettingsField("maxPlayers", val);
                                        }}
                                        className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-0.5 text-xs outline-none cursor-pointer"
                                    >
                                        <option value={2}>2 joueurs</option>
                                        <option value={3}>3 joueurs</option>
                                        <option value={4}>4 joueurs</option>
                                        <option value={6}>6 joueurs</option>
                                        <option value={8}>8 joueurs</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Salon privé</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.isPrivate}
                                        onChange={(e) => updateSettingsField("isPrivate", e.target.checked)}
                                        className="accent-purple-600 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Autoriser les bots</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.allowBots}
                                        onChange={(e) => updateSettingsField("allowBots", e.target.checked)}
                                        className="accent-purple-600 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Loyer x2 sur groupe</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.doubleRentFullSet}
                                        onChange={(e) => updateSettingsField("doubleRentFullSet", e.target.checked)}
                                        className="accent-purple-600 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Cagnotte Parc Gratuit</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.vacationCash}
                                        onChange={(e) => updateSettingsField("vacationCash", e.target.checked)}
                                        className="accent-purple-600 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Vente aux enchères</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.caution}
                                        onChange={(e) => updateSettingsField("caution", e.target.checked)}
                                        className="accent-purple-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pied de Modale : Bouton Lancement */}
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                            <span className="text-xs text-zinc-400">
                                {currentPlayers.length < 2 ? "Minimum 2 joueurs requis pour lancer" : "Prêt à démarrer"}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowHostModal(false)}
                                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded text-xs cursor-pointer"
                                >
                                    Fermer
                                </button>
                                <button
                                    disabled={loading || !canStart}
                                    onClick={handleStartCurrentGame}
                                    className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                                        canStart
                                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                                            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                    }`}
                                >
                                    {loading ? "Lancement..." : "Démarrer la partie"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* 4. MODALE REJOINDRE UNE PARTIE                              */}
            {/* ============================================================ */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                            <h3 className="font-semibold text-sm text-white">Rejoindre un salon</h3>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="text-zinc-400 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-300">Numéro ou ID du salon</label>
                            <div className="flex items-center gap-1.5">
                                <input
                                    autoFocus
                                    value={joinInputId}
                                    onChange={(e) => setJoinInputId(e.target.value)}
                                    placeholder="Ex: 4"
                                    type="number"
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500 font-mono"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && joinInputId.trim()) {
                                            handleJoinGame(Number(joinInputId));
                                        }
                                    }}
                                />
                                <button
                                    disabled={loading || !joinInputId.trim()}
                                    onClick={() => handleJoinGame(Number(joinInputId))}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white text-xs font-semibold rounded cursor-pointer"
                                >
                                    Entrer
                                </button>
                            </div>
                        </div>

                        {/* Liste des salons en attente */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-700">
                            <span className="text-xs text-zinc-400 font-medium">Ou sélectionnez un salon ouvert :</span>
                            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                                {openGames.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-1">Aucun salon public disponible</p>
                                ) : (
                                    openGames.map((g) => (
                                        <div
                                            key={g.id}
                                            onClick={() => handleJoinGame(g.id)}
                                            className="flex items-center justify-between p-1.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded cursor-pointer text-xs"
                                        >
                                            <span className="font-mono text-zinc-200">Salon #{g.id}</span>
                                            <span className="text-purple-400 hover:underline">Rejoindre</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Règles & Victoire */}
            <VictoryModal winner={winner} />
            <Rules isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
            {settingsOpen && <Settings onClose={() => setSettingsOpen(false)}/>}
        </div>
    );
}