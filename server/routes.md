Authentication :
 - Sign up (email, password, profile picture, no email validation)
 - Log-in (email and password)

Game management:
 - Create a new game (with a minimum number of players and a maximum number of players, creator is automatically included in the players list)
 - Invite players to a game that is not yet started (check if they exist)
 - start a game if the number of players meets the requirements (game creator only)
 - list ongoing games for a given user with status (started/pending start/ended) if the game has ended but the player has not seen it, it should stay in this list.
 - Mark ended game as seen

Game:
 - Get game status (pending start/who's turn it is/end status including custom game data) and game state (as a custom string stored in the database)
 - Set new game state (if it is the player's turn)

Game history
 - List finished games and get its ending status for the current player with its custom data.
