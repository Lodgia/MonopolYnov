# MonopolYnov

MonopolYnov est notre projet fil rouge inspiré du Monopoly. Il comprend une interface React, des écrans de connexion et de salon, ainsi qu’un serveur Deno pour les comptes et les parties.

## Lancer le projet

Il faut Node.js et Deno installés.

À la racine du projet, installer les dépendances et lancer l’interface :

```sh
npm install
npm run dev
```

Pour utiliser la connexion et les salons, lancer aussi le serveur dans un autre terminal, toujours depuis la racine :

```sh
deno task dev
```

L’interface est servie par Vite, généralement à l’adresse `http://localhost:5173`. Le serveur écoute sur `http://localhost:8000`.

Quelques commandes utiles :

```sh
npm run build    # vérifier les types et construire l’interface
npm run lint     # lancer Oxlint
```

## Comment jouer

Le but est de rester le dernier joueur qui n’a pas fait faillite. Chaque joueur commence avec 1 500 €. À son tour, il lance deux dés et avance son pion dans le sens horaire.

- Une propriété libre peut être achetée à la banque. Si elle appartient à un autre joueur, le loyer indiqué doit lui être payé.
- Posséder toutes les propriétés d’une même couleur permet de doubler le loyer des terrains sans bâtiments et d’y construire des maisons. Les constructions doivent rester équilibrées entre les terrains du groupe. Quatre maisons peuvent être échangées contre un hôtel.
- Passer ou s’arrêter sur Départ rapporte 200 €. Les cases Chance, Caisse de communauté et taxes appliquent leur effet lorsqu’on tombe dessus. Le Parc gratuit ne rapporte rien.
- Un double donne un nouveau tour. Trois doubles consécutifs envoient en prison. On peut en sortir en faisant un double, en payant 50 € ou en utilisant une carte de sortie de prison.
- En cas de difficulté financière, les bâtiments peuvent être revendus à moitié prix et les terrains nus hypothéqués. Un joueur qui ne peut pas payer même après cela est éliminé. Le dernier joueur restant gagne.

## Architecture

- `src/` contient l’interface et le modèle du jeu : les pages React, le plateau (`Board.tsx`), les cases, les propriétés, les joueurs et les règles.
- `auth/` contient les écrans d’inscription et de connexion ainsi que la protection des pages réservées aux utilisateurs connectés.
- `protected/` contient l’espace de jeu et la gestion des salons côté interface.
- `api/` regroupe les appels HTTP utilisés par l’application. Ils ciblent actuellement le serveur local à `http://localhost:8000`.
- `server/` contient l’API Deno : authentification, gestion des parties, accès aux données et documentation OpenAPI. Le serveur stocke l’état d’une partie comme une chaîne fournie par le client ; il ne calcule pas les règles du Monopoly.

Les routes de l’interface sont définies dans `src/App.tsx`. Les détails des tâches Deno et de l’API sont également disponibles dans [`server/README.md`](server/README.md).
