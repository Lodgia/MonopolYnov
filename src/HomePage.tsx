import { Link } from "react-router-dom";

export default function HomePage() {

    return (
        <>
            <div className="flex justify-center mt-20">
                <img src="logo.png"></img>
            </div>
            <div className="flex justify-center gap-20 mt-10">
                <div className="border-2 border-red-500"><Link to={"/login"} className="inline-block border-2 border-white text-[25px] font-bold p-2 bg-red-500 text-white">SE CONNECTER</Link></div>
                <div className="border-2 border-red-500"><Link to={"/signup"} className="inline-block border-2 border-white text-[25px] font-bold p-2 bg-red-500 text-white">S'ENREGISTRER</Link></div>
            </div>
        </>
    )
}