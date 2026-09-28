import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, getGame, invitePlayer, joinGame, listOpenGames, removePlayer, startGame, updateGame, type Game, type GameSettings } from "../types/Game.ts";
import { RulesModal } from "../components/modals/RulesModal.tsx";
import { VictoryModal } from "../components/modals/VictoryModal.tsx";
import { SettingsModal } from "../components/modals/SettingsModal.tsx";
import { HistoryModal } from "../components/modals/HistoryModal.tsx";
import { monopolyBoard } from "../data/allCases.ts";
import { getUniquePawnColors, type SyncedPlayer, type SyncedGameState, type PropertyState } from "../context/GameContext.tsx";
import { apiFetch } from "../api/client.ts";
import { MonopolyButton } from "../components/ui/MonopolyButton.tsx";
import { findWinner, type Player } from "../types/Player.ts";

const DEFAULT_SETTINGS: GameSettings & { boardMap?: string; doubleRentFullSet?: boolean; vacationCash?: boolean; auction?: boolean; rentInPrison?: boolean; mortgageEnabled?: boolean; evenBuildEnabled?: boolean; } = {
    startingMoney: 1500,
    turnDuration: 60,
    doublePassGo: true,
    freeParkingPool: true,
    fastMode: false,
    isPrivate: false,
    allowBots: false,
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

export default function LobbyPage({ players = [] }: HomeProps) {
    const navigate = useNavigate();
    const winner = findWinner(players);

    const [showHostModal, setShowHostModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [settingOpen, setSettingsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const [currentGame, setCurrentGame] = useState<Game | null>(null);
    const [openGames, setOpenGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [maxPlayers, setMaxPlayers] = useState(4);

    const [joinInputId, setJoinInputId] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    const [userColor, setUserColor] = useState(localStorage.getItem("user_color") || "#84cc16");

    const [currentUserId, setCurrentUserId] = useState<number | null>(() => { const u = localStorage.getItem("user"); return u ? JSON.parse(u).id : null; });

    useEffect(() => {
        apiFetch<{ id: number; email: string; color?: string }>("/auth/me").then((me) => { me.id && setCurrentUserId(me.id); me.color && setUserColor(me.color) && localStorage.setItem("user_color", me.color); localStorage.setItem("user", JSON.stringify(me)) }).catch(() => {});
    }, []);

    const fetchGames = async () => {
        setRefreshing(true);
        try {
            setOpenGames(await listOpenGames());
        } catch {
            setOpenGames([]);
        } finally {
            setTimeout(() => setRefreshing(false), 300);
        }
    };

    useEffect(() => {
        fetchGames();
        return () => clearInterval( setInterval(fetchGames, 2500));
    }, []);

    useEffect(() => {
        if (!currentGame) return;
        const interval = setInterval(async () => {
            try {
                const updated = await getGame(currentGame.id);
                if (currentUserId && !updated.players.some((p) => p.id === currentUserId)) {
                    setShowHostModal(false);
                    setCurrentGame(null);
                    alert("Vous avez été expulsé du salon.");
                    fetchGames();
                    return;
                }
                setCurrentGame(updated);
                setMaxPlayers(updated.maxPlayers);
                if (updated.status === "started") {
                    setShowHostModal(false);
                    navigate(`/game/${updated.id}`);
                }
            } catch {
                setShowHostModal(false);
                setCurrentGame(null);
                alert("Vous avez été expulsé du salon.");
                fetchGames();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentGame?.id, currentUserId, navigate]);

    const handleOpenHostModal = async () => {
        setLoading(true);
        try {
            const statePayload = JSON.stringify({ settings, color: userColor });
            const game = await createGame({ minPlayers: 2, maxPlayers, state: statePayload });
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
            alert(error instanceof Error ? error.message : "Impossible de rejoindre ce salon");
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
            updated.status === "started" && setShowHostModal(false) && navigate(`/game/${updated.id}`);
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
            const uniqueColors = getUniquePawnColors(currentGame.players.length);
            const gamePlayers: SyncedPlayer[] = currentGame.players.map((p, idx) => ({ id: p.id, name: p.email.split("@")[0], c: 0, money: 1500, color: uniqueColors[idx] || p.color || "#ef4444", inJail: false, jailTurns: 0, isBot: false }));

            const initialProperties: Record<number, PropertyState> = {};
            monopolyBoard.forEach((sq) => {
                if (sq.type === "property" || sq.type === "station" || sq.type === "utility") {
                    initialProperties[sq.id] = { ownerId: -1, level: 0 };
                }
            });

            const initialGameState: SyncedGameState = { version: 1, players: gamePlayers, properties: initialProperties, currentTurnPlayerId: gamePlayers[0].id, hasRolled: false, diceRoll: null, doubleCount: 0, lastActionMessage: `La partie commence ! C'est au tour de ${gamePlayers[0].name}.`, activeCard: null, winnerId: null };
            const statePayload = JSON.stringify(initialGameState);
            await startGame(currentGame.id, statePayload, gamePlayers[0].id);
            setShowHostModal(false);
            navigate(`/game/${currentGame.id}`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de démarrer la partie";
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
                const statePayload = JSON.stringify({ settings: updated, color: userColor });
                const updatedGame = await updateGame(currentGame.id, { maxPlayers, state: statePayload });
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
                <img src="/logo.png" className="h-40" alt="Logo" />
                <div className="flex items-center gap-3">
                    <MonopolyButton variant="primary" onClick={() => setHistoryOpen(true)}>Historique</MonopolyButton>
                    <MonopolyButton variant="primary" onClick={() => setRulesOpen(true)}>Règles</MonopolyButton>
                    <MonopolyButton variant="primary" onClick={() => setSettingsOpen(true)}>Paramètres</MonopolyButton>
                    <MonopolyButton variant="danger" onClick={handleLogout}>Déconnexion</MonopolyButton>
                </div>
            </header>

            <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button disabled={loading} onClick={handleOpenHostModal} className="w-full border-2 border-white text-[15px] font-bold p-3 bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md transition-all active:scale-95">{loading ? "Création..." : "Créer une partie"}</button>
                    <button onClick={() => setShowJoinModal(true)} className="w-full border-2 border-white text-[15px] font-bold p-3 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md transition-all active:scale-95">Rejoindre une partie</button>
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
                                    <MonopolyButton size="sm" variant="primary" onClick={() => handleJoinGame(game.id)}>Rejoindre</MonopolyButton>
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
                                                    <span className="text-xs text-white truncate" title={player.email}>{player.email.split("@")[0]}</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {isCreator ? (
                                                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Hôte</span>
                                                    ) : (
                                                        isHost && <button onClick={() => handleKickPlayer(player.id)} className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5" title="Retirer">Expulser</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {Array.from({ length: Math.max(0, maxPlayers - currentPlayers.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="p-2 border border-dashed border-red-500 text-red-500 text-xs rounded text-center">Emplacement libre</div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@ynov.com" className="flex-1 bg-blue-500 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white outline-none" onKeyDown={e =>  e.key === "Enter" && handleSendInvite()}/>
                                    <button onClick={handleSendInvite} className="text-xs px-2.5 py-1 bg-blue-500 duration-300 hover:bg-white text-black rounded font-medium cursor-pointer">Inviter</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 bg-blue-300 border-3 border-red-500 p-3.5 text-xs">
                                <span className="font-semibold text-red-500 border-b border-zinc-750 pb-1">Nombre de slots</span>

                                <div className="flex items-center justify-between bg-white border-2 border-red-500 p-2.5">
                                    <span className="text-zinc-900 font-bold">Slots max</span>
                                    <select value={maxPlayers} onChange={(e) => { const val = Number(e.target.value); setMaxPlayers(val); updateSettingsField("maxPlayers", val); }} className="bg-red-500 text-white font-bold border border-black rounded-none px-3 py-1 text-xs outline-none cursor-pointer">
                                        <option value={2}>2 joueurs</option>
                                        <option value={3}>3 joueurs</option>
                                        <option value={4}>4 joueurs</option>
                                        <option value={6}>6 joueurs</option>
                                        <option value={8}>8 joueurs</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                            <span className="text-xs text-zinc-400">{currentPlayers.length < 2 ? "Minimum 2 joueurs requis pour lancer" : "Prêt à démarrer"}</span>
                            <div className="flex items-center gap-2">
                                <MonopolyButton variant="primary" onClick={() => setShowHostModal(false)}>Fermer</MonopolyButton>
                                {isHost ? (
                                    <MonopolyButton variant="success" disabled={loading || !canStart} onClick={handleStartCurrentGame}>{loading ? "Lancement..." : "Démarrer la partie"}</MonopolyButton>
                                ) : (
                                    <span className="text-xs text-amber-500 font-bold px-2 py-1">En attente de l'hôte pour lancer la partie...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none">
                    <div className="w-full max-w-sm bg-white border-3 border-red-500 p-5 flex flex-col gap-4 shadow-2xl font-sans">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                            <h3 className="font-bold text-sm text-red-500 uppercase">Rejoindre un salon</h3>
                            <div className="border-2 border-red-500">
                                <button onClick={() => setShowJoinModal(false)} className="inline-block border-2 border-white text-xs font-bold p-1 px-1.5 bg-red-500 text-white cursor-pointer">✕</button>
                            </div>
                        </div>

                        <div className="bg-blue-300 border-3 border-red-500 p-3.5 flex flex-col gap-2.5">
                            <label className="text-xs font-semibold text-red-500">ID ou Numéro du salon</label>
                            <div className="flex items-center gap-2">
                                <input autoFocus value={joinInputId} onChange={(e) => setJoinInputId(e.target.value)} placeholder="Ex: 4" type="number" className="flex-1 bg-white border-2 border-red-500 p-2 text-xs text-zinc-900 font-bold outline-none" onKeyDown={(e) => e.key === "Enter" && joinInputId.trim() && handleJoinGame(Number(joinInputId))}/>
                                <MonopolyButton variant="primary" disabled={loading || !joinInputId.trim()} onClick={() => handleJoinGame(Number(joinInputId))}>Entrer</MonopolyButton>
                            </div>
                        </div>

                        <div className="bg-blue-300 border-3 border-red-500 p-3.5 flex flex-col gap-2">
                            <span className="text-xs font-semibold text-red-500 border-b border-zinc-750 pb-1">Salons ouverts :</span>
                            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                                {openGames.length === 0 ? (
                                    <p className="text-xs text-zinc-600 py-1 bg-white border border-red-400 p-2 text-center font-semibold">Aucun salon public disponible</p>
                                ) : (
                                    openGames.map((g) => (
                                        <div key={g.id} onClick={() => handleJoinGame(g.id)} className="flex items-center justify-between p-2 bg-white border-2 border-red-500 hover:bg-blue-50 cursor-pointer text-xs">
                                            <span className="font-bold text-zinc-900">Salon #{g.id}</span>
                                            <span className="text-blue-600 font-bold hover:underline">Rejoindre →</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <VictoryModal winner={winner} />
            <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
            <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
            {settingOpen && ( <SettingsModal onClose={() => { setSettingsOpen(false); const c = localStorage.getItem("user_color"); c && setUserColor(c); }} />)}
        </div>
    );
}