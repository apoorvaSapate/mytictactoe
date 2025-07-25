LENGTH = 3


def get_computer_move(board, player):
    """
    Determines the best move for the computer ('O' in this example).
    This function implements a simple strategy where the computer will
    choose the first available cell if it is playing as 'O'.

    Args:
        board (list): A 3x3 Tic-Tac-Toe board.
                      Each element can be 'X', 'O', or an empty string "".
        player (str): The player for whom the move is being made, expected to be 'O'.
    
    Returns:
        tuple: (row, col) index for the computer's move, or None if no valid move.
               Returns None if no valid move is available.
    """
    if player == 'O':
        for i in range(LENGTH):
            for j in range(LENGTH):
                if board[i][j] == "":
                    return (i, j)
    return None


def get_game_state(board):
    """
    Checks the current state of the Tic-Tac-Toe game.

    Args:
        board (list): A 3x3 Tic-Tac-Toe board.
                      Each element can be 'X', 'O', or an empty string "".

    Returns:
        str: Returns the state of the game:
             - "X_wins" if player 'X' has won,
             - "O_wins" if player 'O' has won,   
             - "draw" if the game is a draw,
             - "ongoing" if the game is still in progress.
    """
    # Check rows and columns
    for i in range(LENGTH):
        if board[i][0] == board[i][1] == board[i][2] != "":
            return f"{board[i][0]}_wins"
        if board[0][i] == board[1][i] == board[2][i] != "":
            return f"{board[0][i]}_wins"

    # Check diagonals
    if board[0][0] == board[1][1] == board[2][2] != "":
        return f"{board[0][0]}_wins"
    if board[0][2] == board[1][1] == board[2][0] != "":
        return f"{board[0][2]}_wins"

    # Check for draw
    for row in board:
        if "" in row:
            return "ongoing"
    return "draw"


def is_valid_player(player):
    """
    Checks if the given player is valid ('X' or 'O').
    """
    return player in ["X", "O"]


def is_valid_board(board):
    """
    Validates that the board is a 3x3 grid with only 'X', 'O', or '' entries.
    """
    if not isinstance(board, list) or len(board) != LENGTH:
        return False
    
    for row in board:
        if not isinstance(row, list) or len(row) != LENGTH:
            return False
        for cell in row:
            if cell not in ["X", "O", ""]:
                return False
    return True
