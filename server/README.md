
# Serveur de jeu au tour par tour générique

Un petit backend Deno + SQLite pour le projet fil rouge React. 
Il est générique par conception : le serveur ne sait pas quel jeu est
joué. Il ne suit que *qui sont les joueurs*, *à qui c'est le tour*, et le
statut *en attente / commencé / terminé*. Les données de jeu à proprement
parler (`state` et `endData`) sont une chaîne de caractères libre,
typiquement du JSON sérialisé par le front-end, que le serveur stocke et
renvoie telle quelle, sans jamais la parser ni la valider. (C'est donc 
facile de tricher, mais c'est acceptable pour l'exercice.)

Ce serveur est prévu pour tourner en local. La politique CORS est grande ouverte
(`Access-Control-Allow-Origin: *`, toutes méthodes/en-têtes) et les mots de
passe sont hashés avec du SHA-256 avec salt plutôt que bcrypt/argon2 : ne
réutilisez pas ça tel quel pour qune mise en ligne publique.

## Lancer le serveur

Nécessite Deno >= 2.9 (pour le support natif de `node:sqlite`).

```sh
deno task dev    # tourne avec --watch, redémarre à chaque changement de fichier
# ou
deno task start
```

Le serveur écoute sur le port `8000` par défaut 
(à écraser avec la variable d'environnement `PORT`).
Il crée un fichier SQLite `game.db` à côté des sources au premier lancement
(chemin à écraser avec `GAME_DB_PATH`).

## Documentation de l'API

L'API complète est documentée sous forme de spec OpenAPI 3.0 dans
[`openapi.yaml`](./openapi.yaml). Une fois le serveur lancé, on peut la
parcourir en Swagger interactif sur **http://localhost:8000/docs** (la
spec brute est aussi servie sur `/openapi.yaml`.

## Authentification

Toutes les routes sauf `/auth/signup` et `/auth/login` nécessitent un
en-tête `Authorization: Bearer <token>`. `signup` et `login` renvoient
toutes les deux un token utilisable immédiatement (l'inscription connecte
automatiquement, il n'y a pas d'étape de vérification d'email).

## Choix de conception à connaître

- **Les invitations et le lancement sont réservés au créateur.**
- **L'ordre des tours est entièrement piloté par le front-end.** Le serveur
  ne connaît pas les règles d'un jeu donné, donc il ne peut pas calculer de
  qui c'est le tour ensuite. Chaque appel à `PUT /games/:id/state` qui ne
  termine pas la partie doit fournir `currentTurnUserId` pour désigner le
  joueur suivant. Le lancement d'une partie peut de même fournir
  `currentTurnUserId` pour désigner qui commence (par défaut, le créateur).
- **Les parties "terminées mais non vues" restent dans `/games/mine`.**
  Une fois qu'un joueur appelle `POST /games/:id/seen`, cette partie
  disparaît de `/games/mine` pour lui (mais reste visible pour toujours
  dans `/games/history`).
- **`endData` est une seule valeur par partie, pas par joueur.** Si un jeu a
  besoin de résultats différents par joueur (par ex. "tu as gagné" /
  "tu as perdu"), encodez ça dans la chaîne `endData` (par ex. un objet JSON
  indexé par id utilisateur): le serveur la traite comme un blob opaque
  dans tous les cas.

## Routes

Tous les corps de requête/réponse sont en JSON. Toutes les réponses
incluent des en-têtes CORS permissifs, et les erreurs reviennent sous la
forme `{ "error": "message" }` avec le code HTTP correspondant.

### Auth

#### `POST /auth/signup`
```jsonc
// corps
{ "email": "a@b.com", "password": "hunter2", "profilePicture": "data:image/png;base64,..." }
// -> 201
{ "token": "...", "user": { "id": 1, "email": "a@b.com", "profilePicture": "..." } }
```
`profilePicture` est optionnel et non validé : une URL, un data URI en
base64, ce que le front-end veut afficher plus tard.

#### `POST /auth/login`
```jsonc
{ "email": "a@b.com", "password": "hunter2" }
// -> 200
{ "token": "...", "user": { "id": 1, "email": "a@b.com", "profilePicture": "..." } }
```

### Gestion des parties

#### `POST /games`
Crée une partie ; le créateur est automatiquement ajouté comme joueur.
```jsonc
{ "minPlayers": 2, "maxPlayers": 4 }
// -> 201 <Game>
```

#### `POST /games/:id/invite`
Réservé au créateur, et seulement tant que la partie est `pending`.
```jsonc
{ "email": "player2@b.com" }
// -> 200 <Game>
```
404 si aucun utilisateur n'a cet email, 409 s'il est déjà joueur, 400 si la
partie est pleine ou déjà commencée.

#### `POST /games/:id/start`
Réservé au créateur. Nécessite que le nombre de joueurs soit déjà compris
dans `[minPlayers, maxPlayers]`.
```jsonc
// le corps est optionnel
{ "state": "{...état initial...}", "currentTurnUserId": 1 }
// -> 200 <Game>
```
`currentTurnUserId` vaut le créateur par défaut si omis.

#### `GET /games/mine`
Les parties auxquelles l'utilisateur courant participe : parties `pending`,
`started`, ou `ended` qu'il n'a pas encore marquées comme vues.
```jsonc
// -> 200
[ <Game>, ... ]
```

#### `POST /games/:id/seen`
Marque une partie terminée comme vue par l'utilisateur courant (la retire
de `/games/mine`). 400 si la partie n'est pas terminée.
```jsonc
// -> 204 No Content
```

### Jouer une partie

#### `GET /games/:id`
Statut complet d'une partie, avec sa chaîne `state` courante. Seuls les
joueurs de la partie peuvent la récupérer.
```jsonc
// -> 200 <Game>
```

#### `PUT /games/:id/state`
Seul le joueur dont c'est le tour peut appeler cette route, et seulement
tant que la partie est `started`.
```jsonc
// continuer la partie — doit désigner le joueur suivant
{ "state": "{...nouvel état...}", "currentTurnUserId": 2 }

// terminer la partie
{ "state": "{...état final...}", "ended": true, "endData": "{...résultats...}" }

// -> 200 <Game>
```

### Historique des parties

#### `GET /games/history`
Toutes les parties terminées auxquelles l'utilisateur courant a participé
(vues ou non), les plus récemment terminées en premier.
```jsonc
// -> 200
[ <Game>, ... ]
```

### La forme `<Game>`

Renvoyée par chacune des routes de jeu ci-dessus :
```jsonc
{
  "id": 1,
  "creatorId": 1,
  "minPlayers": 2,
  "maxPlayers": 4,
  "status": "pending" | "started" | "ended",
  "players": [ { "id": 1, "email": "a@b.com", "profilePicture": "..." }, ... ],
  "currentTurnUserId": 2,
  "isYourTurn": true,
  "state": "...chaîne opaque définie par le front-end...",
  "endData": null,
  "createdAt": "2026-09-14 12:00:00",
  "startedAt": null,
  "endedAt": null
}
```
