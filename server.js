const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../public')));

const users = {}; // Store usernames

io.on('connection', (socket) => {
    console.log('New user connected');

    // When a user sets their name
    socket.on('set username', (username) => {
        if (!users[socket.id]) {
            users[socket.id] = { username: username, color: getRandomColor() }; // Set username with color
            io.emit('user connected', username); // Notify all users of new connection
        }
    });

    // When a user sends a message
    socket.on('chat message', (msg) => {
        const user = users[socket.id];
        if (user) {
            io.emit('chat message', { user: user.username, message: msg, color: user.color });
        }
    });

    // When a user sends an image or video
    socket.on('media message', (media) => {
        const user = users[socket.id];
        if (user) {
            io.emit('media message', { user: user.username, media: media, color: user.color });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const user = users[socket.id];
        if (user) {
            io.emit('user disconnected', user.username); // Notify all users of disconnection
            delete users[socket.id]; // Remove user on disconnect
        }
    });
});

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
