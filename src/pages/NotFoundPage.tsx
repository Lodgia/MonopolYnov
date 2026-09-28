import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="h-screen w-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white select-none">
            <h1 className="font-extrabold text-6xl tracking-tight text-red-500 mb-2 font-mono">404</h1>
            <p className="text-xl font-bold uppercase tracking-wide text-zinc-300 mb-6">Page non trouvée</p>
            <div className="border-2 border-red-500">
                <Link to="/home" className="inline-block border-2 border-white text-sm font-bold p-2 px-5 bg-red-500 text-white hover:bg-red-600 transition">Retour à l'accueil</Link>
            </div>
        </div>
    );
}