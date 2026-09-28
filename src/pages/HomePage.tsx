import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <div className="min-h-screen w-full bg-blue-400 flex flex-col items-center justify-center p-4">
            <div className="flex justify-center mb-10">
                <img src="/logo.png" alt="MonopolYnov" className="max-w-md w-full drop-shadow-xl" />
            </div>
            <div className="flex flex-wrap justify-center gap-6">
                <div className="border-2 border-red-500">
                    <Link
                        to="/login"
                        className="inline-block border-2 border-white text-xl font-bold p-3 px-6 bg-red-500 text-white hover:bg-red-600 transition tracking-wide"
                    >
                        SE CONNECTER
                    </Link>
                </div>
                <div className="border-2 border-red-500">
                    <Link
                        to="/signup"
                        className="inline-block border-2 border-white text-xl font-bold p-3 px-6 bg-red-500 text-white hover:bg-red-600 transition tracking-wide"
                    >
                        S'ENREGISTRER
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
