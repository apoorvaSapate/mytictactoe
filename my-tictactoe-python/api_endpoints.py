# app.py
from flask import Flask, request, jsonify
from tic_tac_toe_engine import get_computer_move, get_game_state, is_valid_player, is_valid_board
from flask_cors import CORS # Import CORS for handling cross-origin requests

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


@app.route('/move', methods=['POST'])
def make_move():
    """
    Endpoint for making a Tic-Tac-Toe move.
    The 'player' indicates whose turn it is to make a move.
    If the player is 'O', it will also calculate the computer's move.
    If the player is 'X', it will assume the human player has made a move.
    Returns the updated board, the computer's move (if applicable), and the game state.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    board = data.get('board')
    player = data.get('player')

    if not is_valid_board(board):
        return jsonify({"error": "Invalid board state."}), 400

    if not is_valid_player(player):
        return jsonify({"error": "Invalid player. Player must be 'X' or 'O'."}), 400

    game_state_before_move = get_game_state(board)
    if game_state_before_move != "ongoing":
        return jsonify({
            "error": "Game is already over.",
            "board": board,
            "game_state": game_state_before_move,
            "computer_move_position": None
        }), 400

    # If the player is 'O', we will calculate the computer's move.
    # If the player is 'X', we assume the human player has made a move.
    # The computer will only make a move if it's its turn (i.e., player is 'O').
    # If the player is 'X', we will not make a computer move here.

    computer_move_position = None
    if player == 'O': # Assuming computer is 'O'
        computer_move_position = get_computer_move(board, player)
        if computer_move_position is not None:
            row, col = computer_move_position

            if board[row][col] != "":
                return jsonify({"error": "Invalid computer move: position already taken."}), 400
            # Place the computer's move on the board
            board[row][col] = player

    # Check game state 'after' the potential computer move
    final_game_state = get_game_state(board)

    response = {
        "board": board,
        "game_state": final_game_state,
        "computer_move_position": computer_move_position
    }
    return jsonify(response), 200


@app.route('/state', methods=['POST'])
def check_state():
    """
    Endpoint for checking the current game state.
    Expects a JSON payload with 'board' (list).
    Returns the game state (win, draw, or ongoing).
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    board = data.get('board')

    if not is_valid_board(board):
        return jsonify({"error": "Invalid board state."}), 400

    game_state = get_game_state(board)
    return jsonify({"board": board, "game_state": game_state}), 200


@app.route('/reset', methods=['POST'])
def reset_game():
    """
    Endpoint for resetting the game.
    Returns an empty board and the game state as 'ongoing'.
    """
    empty_board = [["", "", ""], ["", "", ""], ["", "", ""]]
    return jsonify({"board": empty_board, "game_state": "ongoing"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000) # Run on port 8000, debug=True for development
