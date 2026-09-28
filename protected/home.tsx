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
import { apiFetch } from "../api/client.ts";

export interface BotPlayer {
    id: number;
    name: string;
    difficulty: "easy" | "medium" | "hard";
    color: string;
}

const DEFAULT_SETTINGS: GameSettings & {
    boardMap?: string;
    doubleRentFullSet?: boolean;
    vacationCash?: boolean;
    auction?: boolean;
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
    auction: false,
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

    const [showHostModal, setShowHostModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [settingOpen, setSettingsOpen] = useState(false);

    const [currentGame, setCurrentGame] = useState<Game | null>(null);
    const [openGames, setOpenGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [maxPlayers, setMaxPlayers] = useState(4);
    const bots: BotPlayer[] = [];

    const [joinInputId, setJoinInputId] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    const [userColor, setUserColor] = useState(localStorage.getItem("user_color") || "#84cc16");
    const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).id : null;
    });

    useEffect(() => {
        apiFetch<{ id: number; email: string; color?: string }>("/auth/me")
            .then((me) => {
                if (me.id) setCurrentUserId(me.id);
                if (me.color) {
                    setUserColor(me.color);
                    localStorage.setItem("user_color", me.color);
                }
                localStorage.setItem("user", JSON.stringify(me));
            })
            .catch(() => {});
    }, []);

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
        const interval = setInterval(fetchGames, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!currentGame) return;
        const interval = setInterval(async () => {
            try {
                const updated = await getGame(currentGame.id);
                setCurrentGame(updated);
                setMaxPlayers(updated.maxPlayers);
                if (updated.status === "started") {
                    setShowHostModal(false);
                    navigate(`/game/${updated.id}`);
                }
            } catch {}
        }, 1000);
        return () => clearInterval(interval);
    }, [currentGame?.id, navigate]);

    const handleOpenHostModal = async () => {
        setLoading(true);
        try {
            const statePayload = JSON.stringify({ settings, bots, color: userColor });
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

    const handleJoinGame = async (gameId: number) => {
        setLoading(true);
        try {
            const game = await joinGame(gameId);
            setCurrentGame(game);
            setMaxPlayers(game.maxPlayers);
            setShowJoinModal(false);
            if (game.status === "started") {
                navigate(`/game/${game.id}`);
            } else {
                setShowHostModal(true);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de rejoindre ce salon";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshCurrentGame = async () => {
        if (!currentGame) return;
        setRefreshing(true);
        try {
            const updated = await getGame(currentGame.id);
            setCurrentGame(updated);
            setMaxPlayers(updated.maxPlayers);
            if (updated.status === "started") {
                setShowHostModal(false);
                navigate(`/game/${updated.id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setRefreshing(false), 300);
        }
    };

    const handleStartCurrentGame = async () => {
        if (!currentGame) return;
        setLoading(true);
        try {
            const statePayload = JSON.stringify({ settings, bots, color: userColor });
            await startGame(currentGame.id, statePayload);
            setShowHostModal(false);
            navigate(`/game/${currentGame.id}`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de démarrer";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const updateSettingsField = async (field: string, value: unknown) => {
        const updated = { ...settings, [field]: value };
        setSettings(updated);

        if (currentGame) {
            try {
                const statePayload = JSON.stringify({ settings: updated, bots, color: userColor });
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
        const url = `${window.location.origin}/game/${currentGame.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_color");
        navigate("/login");
    };

    const currentPlayers = currentGame?.players || [];
    const isHost = currentGame && currentUserId ? currentGame.creatorId === currentUserId : true;
    const canStart = currentGame && isHost && currentPlayers.length >= (currentGame.minPlayers ?? 2);

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
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button disabled={loading} onClick={handleOpenHostModal} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">{loading ? "Création..." : "Créer une partie"}</button>
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
                                        <span className="text-[11px] text-zinc-400">({game.players.length}/{game.maxPlayers} joueurs)</span>
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
                    <div className="w-full max-w-2xl bg-white border-3 border-red-500 p-5 sm:p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-red-500">Salon #{currentGame.id}</h3>
                                        <button onClick={copyShareUrl} className="text-xs px-2 py-0.5 bg-blue-500 text-zinc-300 cursor-pointer">{copied ? "Copié !" : "Copier lien"}</button>
                                    </div>
                                    <span className="text-xs text-emerald-400">{currentGame.status === "pending" ? "🟢 En attente de joueurs" : "🔴 Partie lancée"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={handleRefreshCurrentGame} className="text-xs px-2.5 py-1 bg-blue-500 text-zinc-300 cursor-pointer" title="Actualiser les joueurs">{refreshing ? "..." : "Actualiser"}</button>
                                <button onClick={() => setShowHostModal(false)} className="text-zinc-400 hover:text-white text-base px-2 py-0.5 rounded cursor-pointer">✕</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5">
                                <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">Joueurs connectés ({currentPlayers.length}/{maxPlayers})</span>

                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                    {currentPlayers.map((player) => {
                                        const isCreator = player.id === currentGame.creatorId;
                                        return (
                                            <div key={player.id} className="flex items-center justify-between p-2 bg-blue-500 border border-zinc-700 rounded">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div style={{ backgroundColor: player.color || userColor }} className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full" />
                                                    <span className="text-xs text-white truncate" title={player.email}>
                                                        {player.email.split("@")[0]}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {isCreator ? (
                                                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Hôte</span>
                                                    ) : (
                                                        isHost && (
                                                            <button onClick={() => handleKickPlayer(player.id)} className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5" title="Retirer">Expulser</button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {Array.from({ length: Math.max(0, maxPlayers - currentPlayers.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="p-2 border border-dashed border-red-500 text-red-500 text-xs rounded text-center">
                                            Emplacement libre
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@ynov.com" className="flex-1 bg-blue-500 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-purple-500" onKeyDown={(e) => {if (e.key === "Enter") handleSendInvite();}} />
                                    <button onClick={handleSendInvite} className="text-xs px-2.5 py-1 bg-blue-500 duration-300 hover:bg-white text-black rounded font-medium cursor-pointer">
                                        Inviter
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5 text-xs">
                                <span className="font-semibold text-red-500 border-b border-zinc-750 pb-1">
                                    Options du salon
                                </span>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Joueurs max</span>
                                    <select value={maxPlayers} onChange={(e) => { const val = Number(e.target.value); setMaxPlayers(val); updateSettingsField("maxPlayers", val);}} className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-0.5 text-xs outline-none cursor-pointer">
                                        <option value={2}>2 joueurs</option>
                                        <option value={3}>3 joueurs</option>
                                        <option value={4}>4 joueurs</option>
                                        <option value={6}>6 joueurs</option>
                                        <option value={8}>8 joueurs</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Salon privé</span>
                                    <input type="checkbox" checked={settings.isPrivate} onChange={(e) => updateSettingsField("isPrivate", e.target.checked)} className="accent-blue-500 cursor-pointer"/>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Autoriser les bots</span>
                                    <input type="checkbox" checked={settings.allowBots} onChange={(e) => updateSettingsField("allowBots", e.target.checked)} className="accent-blue-500 cursor-pointer"/>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Loyer x2 sur groupe</span>
                                    <input type="checkbox" checked={settings.doubleRentFullSet} onChange={(e) => updateSettingsField("doubleRentFullSet", e.target.checked)} className="accent-blue-500 cursor-pointer"/>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Cagnotte Parc Gratuit</span>
                                    <input type="checkbox" checked={settings.vacationCash} onChange={(e) => updateSettingsField("vacationCash", e.target.checked)} className="accent-blue-500 cursor-pointer"/>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-black">Vente aux enchères</span>
                                    <input type="checkbox" checked={settings.auction} onChange={(e) => updateSettingsField("auction", e.target.checked)} className="accent-blue-500 cursor-pointer"/>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                            <span className="text-xs text-zinc-400">
                                {currentPlayers.length < 2 ? "Minimum 2 joueurs requis pour lancer" : "Prêt à démarrer"}
                            </span>

                            <div className="flex items-center gap-2">
                                <div className="border-2 border-blue-500"><button onClick={() => setShowHostModal(false)} className="inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white">Fermer</button></div>
                                {isHost ? (
                                    <div className="border-2 border-blue-500"><button disabled={loading || !canStart} onClick={handleStartCurrentGame} className={`inline-block border-2 border-white text-[15px] font-bold p-2 bg-blue-500 text-white ${ canStart ? "bg-purple-600 hover:bg-purple-500 text-white shadow-sm" : "bg-blue-500 text-white cursor-not-allowed"}`}>{loading ? "Lancement..." : "Démarrer la partie"}</button></div>
                                ) : (
                                    <span className="text-xs text-amber-500 font-bold px-2 py-1">En attente de l'hôte pour lancer la partie...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                            <h3 className="font-semibold text-sm text-white">Rejoindre un salon</h3>
                            <button onClick={() => setShowJoinModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-300">Numéro ou ID du salon</label>
                            <div className="flex items-center gap-1.5">
                                <input autoFocus value={joinInputId} onChange={(e) => setJoinInputId(e.target.value)} placeholder="Ex: 4" type="number" className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500 font-mono" onKeyDown={(e) => { if (e.key === "Enter" && joinInputId.trim()) { handleJoinGame(Number(joinInputId));}}}/>
                                <button disabled={loading || !joinInputId.trim()} onClick={() => handleJoinGame(Number(joinInputId))} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white text-xs font-semibold rounded cursor-pointer">
                                    Entrer
                                </button>
                            </div>
                        </div>

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

            <VictoryModal winner={winner} />
            <Rules isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
            {settingOpen && (
                <Settings
                    onClose={() => {
                        setSettingsOpen(false);
                        const c = localStorage.getItem("user_color");
                        if (c) setUserColor(c);
                    }}
                />
            )}
        </div>
    );
}