import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import App from './App';
=======
import App from './App.tsx'
import { BrowserRouter } from 'react-router';
>>>>>>> main

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);