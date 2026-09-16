import { Link } from "react-router-dom";

export default function HomePage() {

    return (
        <>
            <Link to={"/login"}>SE CONNECTER</Link>
            <Link to={"/signup"}>S'ENREGISTRER</Link>
        </>
    )
}