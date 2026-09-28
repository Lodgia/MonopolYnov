import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoMdCloseCircleOutline,
    IoMdPersonAdd,
    IoMdPeople,
    IoMdSettings,
    IoMdCheckmark,
    IoMdCopy,
    IoMdInformationCircleOutline,
} from "react-icons/io";
import { IoReturnDownForward } from "react-icons/io5";
import { MdAssignmentReturn, MdPlayArrow, MdDeleteOutline, MdSmartToy } from "react-icons/md";
import { FaCrown, FaCoins, FaHourglassHalf, FaDice, FaMapMarkedAlt, FaRobot } from "react-icons/fa";
import { TfiReload } from "react-icons/tfi";
import {
    createGame,
    getGame,
    invitePlayer,
    joinGame,
    listMyGames,
    removePlayer,
    startGame,
    updateGame,
    type Game,
    type GameSettings,
} from "../Game";

type Props = {
    onClose: () => void;
};

export interface BotPlayer {
    id: number;
    name: string;
    difficulty: "easy" | "medium" | "hard";
    avatar: string;
}

const DEFAULT_SETTINGS: GameSettings & { theme?: string; bots?: BotPlayer[] } = {
    startingMoney: 1500,
    turnDuration: 60,
    doublePassGo: true,
    freeParkingPool: true,
    fastMode: false,
    theme: "classic",
    bots: [],
};

const BOT_NAMES = [
    { name: "Bot Alpha 🤖", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alpha" },
    { name: "Bot Ynov 🎓", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ynov" },
    { name: "Bot Tycoon 🎩", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Tycoon" },
];

export default function ModalPlay({ onClose }: Props) {
    const navigate = useNavigate();
    const [action, setAction] = useState<"choice" | "host" | "solo" | "join">("choice");
    const [joinCode, setJoinCode] = useState("");
    const [hostWindow, setHostWindow] = useState<"managePlayer" | "setting">("managePlayer");
    const [currentGame, setCurrentGame] = useState<Game | null>(null);
    const [myGames, setMyGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);

    const [soloBotCount, setSoloBotCount] = useState(2);
    const [soloDifficulty, setSoloDifficulty] = useState<"easy" | "medium" | "hard">("medium");

    const [addPlayerModal, setAddPlayerModal] = useState(false);
    const [mailAddPlayer, setMailAddPlayer] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    const [settings, setSettings] = useState<GameSettings & { theme?: string; bots?: BotPlayer[] }>(DEFAULT_SETTINGS);
    const [minPlayers, setMinPlayers] = useState(2);
    const [maxPlayers, setMaxPlayers] = useState(4);

    useEffect(() => {
        if (action === "choice") {
            listMyGames()
                .then((games) => setMyGames(games))
                .catch(() => setMyGames([]));
        }
    }, [action]);

    const parseGameSettings = (game: Game) => {
        try {
            if (game.state) {
                const parsed = JSON.parse(game.state);
                if (parsed && typeof parsed === "object" && parsed.settings) {
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
                    return;
                }
            }
        } catch {
            //
        }
        setSettings(DEFAULT_SETTINGS);
    };

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            const initialPayload = JSON.stringify({ settings });
            const game = await createGame({
                minPlayers,
                maxPlayers,
                state: initialPayload,
            });
            setCurrentGame(game);
            setMinPlayers(game.minPlayers);
            setMaxPlayers(game.maxPlayers);
            parseGameSettings(game);
            setAction("host");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur lors de la création de la partie";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleStartSoloGame = async () => {
        setLoading(true);
        try {
            const selectedBots: BotPlayer[] = Array.from({ length: soloBotCount }).map((_, i) => ({
                id: -(i + 1),
                name: BOT_NAMES[i % BOT_NAMES.length].name,
                difficulty: soloDifficulty,
                avatar: BOT_NAMES[i % BOT_NAMES.length].avatar,
            }));

            const soloSettings = {
                ...settings,
                bots: selectedBots,
            };

            const statePayload = JSON.stringify({
                settings: soloSettings,
                isSolo: true,
                bots: selectedBots,
            });

            const game = await createGame({
                minPlayers: 1,
                maxPlayers: soloBotCount + 1,
                state: statePayload,
            });

            await startGame(game.id, statePayload);
            onClose();
            navigate("/board");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur lors du lancement solo";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshGame = async () => {
        if (!currentGame) return;
        setRefreshing(true);
        try {
            const updated = await getGame(currentGame.id);
            setCurrentGame(updated);
            setMinPlayers(updated.minPlayers);
            setMaxPlayers(updated.maxPlayers);
            parseGameSettings(updated);
        } catch (error) {
            console.error("Erreur actualisation :", error);
        } finally {
            setTimeout(() => setRefreshing(false), 400);
        }
    };

    const handleJoinGame = async (targetId?: number) => {
        const idToJoin = targetId ?? parseInt(joinCode.trim(), 10);
        if (isNaN(idToJoin)) {
            alert("Veuillez renseigner un identifiant de partie valide (numérique)");
            return;
        }

        setLoading(true);
        try {
            const game = await joinGame(idToJoin);
            setCurrentGame(game);
            setMinPlayers(game.minPlayers);
            setMaxPlayers(game.maxPlayers);
            parseGameSettings(game);
            setAction("host");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de rejoindre cette partie";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleInvitePlayer = async () => {
        if (!currentGame) return;
        const email = mailAddPlayer.trim().toLowerCase();
        if (!email) {
            alert("Veuillez saisir une adresse email valide");
            return;
        }

        setInviteLoading(true);
        try {
            const updatedGame = await invitePlayer(currentGame.id, email);
            setCurrentGame(updatedGame);
            setMailAddPlayer("");
            setAddPlayerModal(false);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erreur lors de l'invitation";
            alert(msg);
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAddBotToLobby = async () => {
        if (!currentGame) return;
        const currentBots = settings.bots || [];
        if (currentPlayers.length + currentBots.length >= maxPlayers) {
            alert("Le salon a atteint sa capacité maximale");
            return;
        }

        const nextIndex = currentBots.length;
        const newBot: BotPlayer = {
            id: -(nextIndex + 1),
            name: BOT_NAMES[nextIndex % BOT_NAMES.length].name,
            difficulty: "medium",
            avatar: BOT_NAMES[nextIndex % BOT_NAMES.length].avatar,
        };

        const updatedBots = [...currentBots, newBot];
        const updatedSettings = { ...settings, bots: updatedBots };
        setSettings(updatedSettings);
        handleSaveSettings(minPlayers, maxPlayers, updatedSettings);
    };

    const handleRemoveBot = (botId: number) => {
        const currentBots = settings.bots || [];
        const updatedBots = currentBots.filter((b) => b.id !== botId);
        const updatedSettings = { ...settings, bots: updatedBots };
        setSettings(updatedSettings);
        handleSaveSettings(minPlayers, maxPlayers, updatedSettings);
    };

    const handleRemovePlayer = async (userId: number) => {
        if (!currentGame) return;
        if (!confirm("Voulez-vous retirer ce joueur de la partie ?")) return;

        try {
            const updated = await removePlayer(currentGame.id, userId);
            setCurrentGame(updated);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de retirer ce joueur";
            alert(msg);
        }
    };

    const handleSaveSettings = async (
        newMin: number,
        newMax: number,
        newSettings: GameSettings & { theme?: string; bots?: BotPlayer[] }
    ) => {
        if (!currentGame) return;
        try {
            const statePayload = JSON.stringify({ settings: newSettings, bots: newSettings.bots });
            const updated = await updateGame(currentGame.id, {
                minPlayers: newMin,
                maxPlayers: newMax,
                state: statePayload,
            });
            setCurrentGame(updated);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2000);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        }
    };

    const handleStartGame = async () => {
        if (!currentGame) return;
        try {
            const statePayload = JSON.stringify({ settings, board: settings.theme ?? "classic", bots: settings.bots });
            const started = await startGame(currentGame.id, statePayload);
            setCurrentGame(started);
            onClose();
            navigate("/board");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Impossible de démarrer la partie";
            alert(msg);
        }
    };

    const copyGameId = () => {
        if (!currentGame) return;
        navigator.clipboard.writeText(String(currentGame.id));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentPlayers = currentGame?.players || [];
    const activeBots = settings.bots || [];
    const totalParticipants = currentPlayers.length + activeBots.length;
    const canStart = currentGame && totalParticipants >= (currentGame.minPlayers ?? 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
            <div className="w-full max-w-2xl p-6 rounded-[24px] font-bold text-white bg-gray-800/95 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 transition-all duration-300">
                
                {action === "choice" && (
                    <div className="w-full flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                                    <FaDice className="text-orange-500 text-3xl animate-bounce" /> MONOPOLYNOV
                                </h2>
                                <p className="text-xs text-gray-400 font-normal mt-0.5">
                                    Choisissez votre mode de jeu pour démarrer l'aventure
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="cursor-pointer text-2xl text-gray-400 hover:text-white transition-colors"
                            >
                                <IoMdCloseCircleOutline />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3.5 mt-1">
                            <button
                                onClick={() => setAction("solo")}
                                className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-700/80 to-slate-800/90 hover:from-emerald-500/20 hover:to-slate-700 border-2 border-slate-600/80 hover:border-emerald-500 transition-all duration-300 rounded-[18px] cursor-pointer shadow-lg hover:shadow-emerald-500/10 text-center"
                            >
                                <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                                    <FaRobot className="text-2xl" />
                                </div>
                                <span className="text-base font-extrabold text-white">Mode Solo (IA)</span>
                                <span className="text-[11px] text-gray-400 font-normal mt-1 leading-tight">
                                    Défiez des bots avec difficulté réglable
                                </span>
                            </button>

                            <button
                                disabled={loading}
                                onClick={handleCreateGame}
                                className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-700/80 to-slate-800/90 hover:from-orange-500/20 hover:to-slate-700 border-2 border-slate-600/80 hover:border-orange-500 transition-all duration-300 rounded-[18px] cursor-pointer shadow-lg hover:shadow-orange-500/10 text-center"
                            >
                                <div className="p-3.5 bg-orange-500/20 text-orange-400 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                                    <FaCrown className="text-2xl" />
                                </div>
                                <span className="text-base font-extrabold text-white">Créer un Salon</span>
                                <span className="text-[11px] text-gray-400 font-normal mt-1 leading-tight">
                                    Hébergez vos amis avec règles personnalisées
                                </span>
                            </button>

                            <button
                                onClick={() => setAction("join")}
                                className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-700/80 to-slate-800/90 hover:from-blue-500/20 hover:to-slate-700 border-2 border-slate-600/80 hover:border-blue-500 transition-all duration-300 rounded-[18px] cursor-pointer shadow-lg hover:shadow-blue-500/10 text-center"
                            >
                                <div className="p-3.5 bg-blue-500/20 text-blue-400 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                                    <IoMdPeople className="text-2xl" />
                                </div>
                                <span className="text-base font-extrabold text-white">Rejoindre</span>
                                <span className="text-[11px] text-gray-400 font-normal mt-1 leading-tight">
                                    Entrez l'identifiant d'un salon ami
                                </span>
                            </button>
                        </div>

                        {myGames.length > 0 && (
                            <div className="mt-1 border-t border-slate-700/80 pt-3.5">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <IoMdInformationCircleOutline className="text-base text-orange-400" /> Vos parties actives ({myGames.length})
                                </h3>
                                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                                    {myGames.map((g) => (
                                        <div
                                            key={g.id}
                                            onClick={() => handleJoinGame(g.id)}
                                            className="flex items-center justify-between p-3 bg-slate-700/40 hover:bg-slate-700 border border-slate-600/60 rounded-[14px] cursor-pointer transition-all shadow-sm group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-orange-400 font-mono text-sm font-black">#{g.id}</span>
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${g.status === "started" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"}`}>
                                                    {g.status === "started" ? "En cours" : "En attente"}
                                                </span>
                                                <span className="text-xs text-gray-300">
                                                    {g.players.length}/{g.maxPlayers} joueurs
                                                </span>
                                            </div>
                                            <span className="text-xs text-orange-400 group-hover:translate-x-1 transition-transform font-bold">Rejoindre &rarr;</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {action === "solo" && (
                    <div className="w-full flex flex-col gap-5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAction("choice")}
                                    className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-[12px] cursor-pointer text-gray-300 hover:text-white transition"
                                >
                                    <MdAssignmentReturn className="text-xl" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <FaRobot className="text-emerald-400 text-2xl" /> Partie Solo contre l'IA
                                    </h2>
                                    <p className="text-xs text-gray-400 font-normal">Configurez vos adversaires et lancez le jeu immédiatement</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl cursor-pointer">
                                <IoMdCloseCircleOutline />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3.5 bg-slate-700/30 p-4 rounded-[18px] border border-slate-600/60">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-gray-300 font-bold">Nombre d'adversaires IA</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((count) => (
                                        <button
                                            key={`bot-count-${count}`}
                                            onClick={() => setSoloBotCount(count)}
                                            className={`py-2.5 rounded-[12px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                soloBotCount === count
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                                                    : "bg-slate-800 text-gray-300 border-slate-600 hover:bg-slate-700"
                                            }`}
                                        >
                                            {count} {count === 1 ? "Bot IA" : "Bots IA"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-gray-300 font-bold">Difficulté de l'IA</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "easy", label: "🟢 Débutant" },
                                        { id: "medium", label: "🟡 Standard" },
                                        { id: "hard", label: "🔴 Stratège" },
                                    ].map((diff) => (
                                        <button
                                            key={diff.id}
                                            onClick={() => setSoloDifficulty(diff.id as "easy" | "medium" | "hard")}
                                            className={`py-2.5 rounded-[12px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                soloDifficulty === diff.id
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                                                    : "bg-slate-800 text-gray-300 border-slate-600 hover:bg-slate-700"
                                            }`}
                                        >
                                            {diff.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-gray-300 font-bold">Capital de départ</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1000, 1500, 2000].map((amt) => (
                                        <button
                                            key={`solo-amt-${amt}`}
                                            onClick={() => setSettings({ ...settings, startingMoney: amt })}
                                            className={`py-2 rounded-[12px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                settings.startingMoney === amt
                                                    ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                                                    : "bg-slate-800 text-gray-300 border-slate-600 hover:bg-slate-700"
                                            }`}
                                        >
                                            {amt} M€
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            onClick={handleStartSoloGame}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-[14px] cursor-pointer transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            <MdPlayArrow className="text-2xl" />
                            <span>{loading ? "Lancement en cours..." : "Lancer la partie Solo"}</span>
                        </button>
                    </div>
                )}

                {action === "host" && (
                    <div className="w-full flex flex-col gap-4 animate-fadeIn">
                        <div className="flex items-center justify-between bg-slate-700/30 p-3.5 rounded-[18px] border border-slate-600/60">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAction("choice")}
                                    className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-[12px] cursor-pointer text-gray-300 hover:text-white transition shadow-sm"
                                    title="Retour"
                                >
                                    <MdAssignmentReturn className="text-xl" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                                            Salon #{currentGame?.id}
                                        </h2>
                                        <button
                                            onClick={copyGameId}
                                            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition cursor-pointer border border-orange-500/40 font-mono font-bold"
                                            title="Copier l'identifiant"
                                        >
                                            {copied ? <IoMdCheckmark className="text-green-400" /> : <IoMdCopy />}
                                            <span>{copied ? "Copié !" : "Code : #" + currentGame?.id}</span>
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-400 font-normal">
                                        Statut : <span className="text-emerald-400 font-semibold">{currentGame?.status === "pending" ? "🟢 En attente des joueurs" : "🔴 Démarrée"}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefreshGame}
                                    className="p-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-[12px] cursor-pointer transition shadow-sm"
                                    title="Actualiser le salon"
                                >
                                    <TfiReload className={`${refreshing ? "animate-spin text-orange-400" : ""}`} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white rounded-[12px] cursor-pointer transition shadow-sm"
                                >
                                    <IoMdCloseCircleOutline className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Onglets navigation */}
                        <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-[16px] border border-slate-700/60 text-sm">
                            <button
                                onClick={() => setHostWindow("managePlayer")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] transition-all cursor-pointer font-extrabold ${
                                    hostWindow === "managePlayer"
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <IoMdPeople className="text-lg" /> Salle d'attente ({totalParticipants}/{maxPlayers})
                            </button>
                            <button
                                onClick={() => setHostWindow("setting")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] transition-all cursor-pointer font-extrabold ${
                                    hostWindow === "setting"
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <IoMdSettings className="text-lg" /> Règles & Paramètres
                            </button>
                        </div>

                        {/* CONTENU ONGLET 1 : GESTION JOUEURS & BOTS */}
                        {hostWindow === "managePlayer" && (
                            <div className="flex flex-col gap-4 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                                    {/* Joueurs réels */}
                                    {currentPlayers.map((player) => {
                                        const isPlayerCreator = player.id === currentGame?.creatorId;
                                        return (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3.5 bg-slate-700/70 border border-slate-600/80 rounded-[16px] shadow-sm hover:border-slate-500 transition-all"
                                            >
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <img
                                                        src={player.profilePicture || "defaultUser.png"}
                                                        alt={player.email}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/50 bg-slate-800 shrink-0"
                                                    />
                                                    <div className="flex flex-col truncate">
                                                        <span className="text-xs font-black text-white truncate" title={player.email}>
                                                            {player.email.split("@")[0]}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 truncate">
                                                            {player.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    {isPlayerCreator ? (
                                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs flex items-center gap-1 font-bold" title="Hôte de la partie">
                                                            <FaCrown /> Hôte
                                                        </span>
                                                    ) : (
                                                        currentGame?.status === "pending" && (
                                                            <button
                                                                onClick={() => handleRemovePlayer(player.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                                                title="Retirer le joueur"
                                                            >
                                                                <MdDeleteOutline className="text-lg" />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Bots IA dans le salon */}
                                    {activeBots.map((bot) => (
                                        <div
                                            key={`bot-${bot.id}`}
                                            className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-[16px] shadow-sm"
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <img
                                                    src={bot.avatar}
                                                    alt={bot.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/60 bg-slate-800 shrink-0"
                                                />
                                                <div className="flex flex-col truncate">
                                                    <span className="text-xs font-black text-emerald-300 truncate">
                                                        {bot.name}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-500 font-semibold">
                                                        IA Autonome
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveBot(bot.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                                title="Retirer le bot"
                                            >
                                                <MdDeleteOutline className="text-lg" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Emplacements vides */}
                                    {Array.from({ length: Math.max(0, maxPlayers - totalParticipants) }).map((_, i) => (
                                        <button
                                            key={`empty-${i}`}
                                            onClick={() => setAddPlayerModal(true)}
                                            className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-600/70 hover:border-orange-500/80 hover:bg-orange-500/5 text-gray-400 hover:text-orange-400 rounded-[16px] transition-all cursor-pointer group"
                                        >
                                            <IoMdPersonAdd className="text-lg group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold">+ Inviter un ami</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Actions bas de page */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 mt-1">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAddPlayerModal(true)}
                                            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-[12px] text-xs font-bold cursor-pointer transition border border-slate-600 shadow-sm"
                                        >
                                            <IoMdPersonAdd className="text-base text-orange-400" /> Inviter par email
                                        </button>

                                        <button
                                            onClick={handleAddBotToLobby}
                                            disabled={totalParticipants >= maxPlayers}
                                            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 disabled:opacity-50 text-emerald-300 rounded-[12px] text-xs font-bold cursor-pointer transition border border-emerald-600/50 shadow-sm"
                                        >
                                            <MdSmartToy className="text-base" /> + Ajouter une IA
                                        </button>
                                    </div>

                                    {currentGame?.status === "pending" && (
                                        <button
                                            onClick={handleStartGame}
                                            disabled={!canStart}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-sm font-black transition-all duration-300 ${
                                                canStart
                                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 cursor-pointer animate-pulse"
                                                    : "bg-slate-700 text-gray-400 border border-slate-600 cursor-not-allowed"
                                            }`}
                                        >
                                            <MdPlayArrow className="text-2xl" />
                                            <span>
                                                {canStart
                                                    ? "Démarrer la partie"
                                                    : `Attente (${totalParticipants}/${minPlayers} min)`}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CONTENU ONGLET 2 : PARAMÈTRES AMÉLIORÉS */}
                        {hostWindow === "setting" && (
                            <div className="flex flex-col gap-3 animate-fadeIn max-h-72 overflow-y-auto pr-1">
                                {settingsSaved && (
                                    <div className="p-2.5 bg-green-500/20 border border-green-500/40 text-green-400 text-xs rounded-[12px] flex items-center gap-2 font-bold animate-fadeIn">
                                        <IoMdCheckmark className="text-base" /> Paramètres synchronisés sur le salon !
                                    </div>
                                )}

                                {/* Minimum & Maximum de joueurs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white">Min. requis</span>
                                            <span className="text-xs font-black text-orange-400 font-mono">{minPlayers}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[2, 3, 4].map((count) => (
                                                <button
                                                    key={`min-${count}`}
                                                    onClick={() => {
                                                        const newMin = count;
                                                        const newMax = Math.max(newMin, maxPlayers);
                                                        setMinPlayers(newMin);
                                                        setMaxPlayers(newMax);
                                                        handleSaveSettings(newMin, newMax, settings);
                                                    }}
                                                    className={`py-1.5 rounded-[10px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                        minPlayers === count
                                                            ? "bg-orange-500 text-white border-orange-400 shadow-md"
                                                            : "bg-slate-800/80 text-gray-300 border-slate-600 hover:bg-slate-700"
                                                    }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white">Capacité Max.</span>
                                            <span className="text-xs font-black text-orange-400 font-mono">{maxPlayers}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[2, 4, 6, 8].map((count) => (
                                                <button
                                                    key={`max-${count}`}
                                                    onClick={() => {
                                                        const newMax = count;
                                                        const newMin = Math.min(newMax, minPlayers);
                                                        setMaxPlayers(newMax);
                                                        setMinPlayers(newMin);
                                                        handleSaveSettings(newMin, newMax, settings);
                                                    }}
                                                    className={`py-1.5 rounded-[10px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                        maxPlayers === count
                                                            ? "bg-orange-500 text-white border-orange-400 shadow-md"
                                                            : "bg-slate-800/80 text-gray-300 border-slate-600 hover:bg-slate-700"
                                                    }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Capital de départ */}
                                <div className="p-3.5 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaCoins className="text-amber-400 text-sm" />
                                            <span className="text-xs text-white font-bold">Capital de départ</span>
                                        </div>
                                        <span className="text-xs font-black text-orange-400 font-mono">
                                            {settings.startingMoney} M€
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { amount: 1000, label: "1 000 M€ (Rapide)" },
                                            { amount: 1500, label: "1 500 M€ (Standard)" },
                                            { amount: 2000, label: "2 000 M€ (Tycoon)" },
                                        ].map((item) => (
                                            <button
                                                key={item.amount}
                                                onClick={() => {
                                                    const updated = { ...settings, startingMoney: item.amount };
                                                    setSettings(updated);
                                                    handleSaveSettings(minPlayers, maxPlayers, updated);
                                                }}
                                                className={`py-2 px-1 rounded-[10px] text-xs font-extrabold cursor-pointer transition-all border text-center ${
                                                    settings.startingMoney === item.amount
                                                        ? "bg-orange-500 text-white border-orange-400 shadow-md"
                                                        : "bg-slate-800/80 text-gray-300 border-slate-600 hover:bg-slate-700"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chrono par tour */}
                                <div className="p-3.5 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaHourglassHalf className="text-blue-400 text-sm" />
                                            <span className="text-xs text-white font-bold">Temps limite par tour</span>
                                        </div>
                                        <span className="text-xs font-black text-orange-400 font-mono">
                                            {settings.turnDuration === 0 ? "Illimité" : `${settings.turnDuration} secondes`}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[
                                            { dur: 30, label: "⏱️ 30s" },
                                            { dur: 60, label: "⏱️ 60s" },
                                            { dur: 90, label: "⏱️ 90s" },
                                            { dur: 0, label: "♾️ Infini" },
                                        ].map((item) => (
                                            <button
                                                key={item.dur}
                                                onClick={() => {
                                                    const updated = { ...settings, turnDuration: item.dur };
                                                    setSettings(updated);
                                                    handleSaveSettings(minPlayers, maxPlayers, updated);
                                                }}
                                                className={`py-1.5 rounded-[10px] text-xs font-extrabold cursor-pointer transition-all border text-center ${
                                                    settings.turnDuration === item.dur
                                                        ? "bg-orange-500 text-white border-orange-400 shadow-md"
                                                        : "bg-slate-800/80 text-gray-300 border-slate-600 hover:bg-slate-700"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Thème du plateau */}
                                <div className="p-3.5 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkedAlt className="text-purple-400 text-sm" />
                                            <span className="text-xs text-white font-bold">Thème du plateau</span>
                                        </div>
                                        <span className="text-xs font-black text-orange-400">
                                            {settings.theme === "ynov" ? "Campus Ynov" : settings.theme === "cyberpunk" ? "Cyberpunk" : "Classique"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "classic", label: "🏙️ Classique" },
                                            { id: "ynov", label: "🎓 Campus Ynov" },
                                            { id: "cyberpunk", label: "🚀 Cyberpunk" },
                                        ].map((themeItem) => (
                                            <button
                                                key={themeItem.id}
                                                onClick={() => {
                                                    const updated = { ...settings, theme: themeItem.id };
                                                    setSettings(updated);
                                                    handleSaveSettings(minPlayers, maxPlayers, updated);
                                                }}
                                                className={`py-2 rounded-[10px] text-xs font-extrabold cursor-pointer transition-all border ${
                                                    (settings.theme ?? "classic") === themeItem.id
                                                        ? "bg-orange-500 text-white border-orange-400 shadow-md"
                                                        : "bg-slate-800/80 text-gray-300 border-slate-600 hover:bg-slate-700"
                                                }`}
                                            >
                                                {themeItem.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Règles maison toggles */}
                                <div className="p-3.5 bg-slate-700/40 rounded-[16px] border border-slate-600/60 flex flex-col gap-3">
                                    <span className="text-xs font-black text-white block">Règles maison</span>
                                    
                                    <div
                                        onClick={() => {
                                            const updated = { ...settings, doublePassGo: !settings.doublePassGo };
                                            setSettings(updated);
                                            handleSaveSettings(minPlayers, maxPlayers, updated);
                                        }}
                                        className="flex items-center justify-between cursor-pointer group select-none"
                                    >
                                        <span className="text-xs text-gray-300 group-hover:text-white transition">
                                            🏁 Salaire doublé sur la case Départ (400 M€)
                                        </span>
                                        <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${settings.doublePassGo ? "bg-orange-500 justify-end shadow-md shadow-orange-500/20" : "bg-slate-800 justify-start border border-slate-600"}`}>
                                            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => {
                                            const updated = { ...settings, freeParkingPool: !settings.freeParkingPool };
                                            setSettings(updated);
                                            handleSaveSettings(minPlayers, maxPlayers, updated);
                                        }}
                                        className="flex items-center justify-between cursor-pointer group select-none"
                                    >
                                        <span className="text-xs text-gray-300 group-hover:text-white transition">
                                            🅿️ Cagnotte du Parc Gratuit (Taxes & Amendes)
                                        </span>
                                        <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${settings.freeParkingPool ? "bg-orange-500 justify-end shadow-md shadow-orange-500/20" : "bg-slate-800 justify-start border border-slate-600"}`}>
                                            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => {
                                            const updated = { ...settings, fastMode: !settings.fastMode };
                                            setSettings(updated);
                                            handleSaveSettings(minPlayers, maxPlayers, updated);
                                        }}
                                        className="flex items-center justify-between cursor-pointer group select-none"
                                    >
                                        <span className="text-xs text-gray-300 group-hover:text-white transition">
                                            ⚡ Mode Rapide (Propriétés de départ offertes)
                                        </span>
                                        <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${settings.fastMode ? "bg-orange-500 justify-end shadow-md shadow-orange-500/20" : "bg-slate-800 justify-start border border-slate-600"}`}>
                                            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. REJOINDRE UN SALON */}
                {action === "join" && (
                    <div className="w-full flex flex-col gap-5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAction("choice")}
                                    className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-[12px] cursor-pointer text-gray-300 hover:text-white transition"
                                >
                                    <MdAssignmentReturn className="text-xl" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-black text-white">Rejoindre un salon</h2>
                                    <p className="text-xs text-gray-400 font-normal">Entrez le code ou l'ID du salon partagé par votre ami</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl cursor-pointer">
                                <IoMdCloseCircleOutline />
                            </button>
                        </div>

                        <div className="p-6 bg-slate-700/40 rounded-[20px] border border-slate-600/80 flex flex-col gap-4 shadow-sm">
                            <label className="text-xs font-black text-gray-300">Numéro ou Identifiant du salon</label>
                            <div className="flex items-center gap-2">
                                <input
                                    className="flex-1 bg-slate-800 border-2 border-slate-600 focus:border-orange-500 outline-none rounded-[14px] px-4 py-3.5 text-lg font-mono text-white tracking-widest placeholder:text-gray-500 placeholder:text-sm placeholder:tracking-normal transition shadow-inner"
                                    required
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="Ex: 3"
                                    type="number"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleJoinGame();
                                    }}
                                />
                                <button
                                    disabled={loading || !joinCode.trim()}
                                    onClick={() => handleJoinGame()}
                                    className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-gray-500 text-white font-black rounded-[14px] cursor-pointer transition shadow-lg flex items-center gap-2"
                                >
                                    <IoReturnDownForward className="text-xl" />
                                    <span>Rejoindre</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALE D'INVITATION JOUEUR */}
            {addPlayerModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn p-4">
                    <div className="w-full max-w-md p-6 rounded-[22px] font-bold text-white bg-gray-800 border border-slate-700 shadow-2xl flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <IoMdPersonAdd className="text-orange-400 text-xl" /> Inviter un joueur
                            </h3>
                            <button
                                onClick={() => setAddPlayerModal(false)}
                                className="text-gray-400 hover:text-white text-2xl cursor-pointer"
                            >
                                <IoMdCloseCircleOutline />
                            </button>
                        </div>

                        <p className="text-xs text-gray-300 font-normal">
                            Saisissez l'adresse email du compte avec lequel votre ami est inscrit pour l'ajouter au salon.
                        </p>

                        <div className="flex flex-col gap-2">
                            <input
                                autoFocus
                                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-orange-500 outline-none rounded-[14px] px-4 py-3 text-sm text-white placeholder:text-gray-500 transition shadow-inner"
                                required
                                value={mailAddPlayer}
                                onChange={(e) => setMailAddPlayer(e.target.value)}
                                placeholder="ami@ynov.com"
                                type="email"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleInvitePlayer();
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700">
                            <button
                                onClick={() => setAddPlayerModal(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-[10px] text-xs cursor-pointer transition font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                disabled={inviteLoading || !mailAddPlayer.trim()}
                                onClick={handleInvitePlayer}
                                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded-[10px] text-xs font-bold cursor-pointer transition flex items-center gap-2 shadow-md"
                            >
                                {inviteLoading ? "Invitation..." : "Ajouter au salon"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}