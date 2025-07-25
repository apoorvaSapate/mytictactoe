# Node.js Tic-Tac-Toe Backend Server

This Node.js server acts as the backend for a Tic-Tac-Toe game, handling user authentication, managing game sessions, tracking player statistics, and is designed to interact with a separate, stateless Python game engine API.

## Overview

The server provides a robust API for users to register, log in, start and play Tic-Tac-Toe games against a computer opponent, and view their game statistics. It uses JWT for secure session management and MongoDB for persistent data storage.

## Features

* **User Authentication:**
    * User registration with email and password.
    * User login with email and password.
    * Secure password hashing using `bcryptjs`.
    * Session management using JSON Web Tokens (JWT).
* **Game Session Management:**
    * Start new Tic-Tac-Toe game sessions.
    * Users can choose to go first or let the computer go first.
    * Tracks the current board state, player turns, and game status (`ongoing`, `user_win`, `computer_win`, `draw`).
    * Coordinates game moves (simulated internally, but designed for external Python API).
* **Statistics Tracking:**
    * Tracks wins, losses, and draws for each registered user.
    * Statistics are persisted in a MongoDB database.
* **Database Integration:**
    * Uses MongoDB with Mongoose for storing user data and game sessions.
* **Environment Variables:**
    * Sensitive information like JWT secret and MongoDB URI are managed via environment variables.
* **CORS Enabled:**
    * Configured to allow cross-origin requests, facilitating frontend integration.

## Setup and Running

### Prerequisites

* Node.js (LTS version recommended)
* npm (Node Package Manager)
* MongoDB instance (local or cloud-hosted)

### Installation

1.  **Clone the repository (or create your project directory):**
    ```bash
    mkdir tic-tac-toe-backend
    cd tic-tac-toe-backend
    ```
2.  **Create `server.js`:**
    Place the Node.js server code (provided in the previous Canvas) into a file named `server.js` in your project directory.
3.  **Initialize Node.js project:**
    ```bash
    npm init -y
    ```
4.  **Install dependencies:**
    ```bash
    npm install express body-parser jsonwebtoken bcryptjs cors mongoose dotenv jwt-decode
    ```

### Environment Variables (`.env` file)

Create a file named `.env` in the root of your project directory and add the following environment variables:

```
PORT=
JWT_SECRET=
MONGODB_URI= ```