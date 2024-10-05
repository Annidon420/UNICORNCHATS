const socket = io();
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username');
const setUsernameBtn = document.getElementById('set-username-btn');
const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userNotifications = document.getElementById('user-notifications');
const fileInput = document.getElementById('file-input');
const sendFileBtn = document.getElementById('send-file-btn');

// Set username and show chat
setUsernameBtn.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit('set username', username);
        usernameForm.style.display = 'none'; // Hide the username form
        chat.style.display = 'block'; // Show the chat
    }
});

// Send message
form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Send file
sendFileBtn.addEventListener('click', function() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            socket.emit('media message', event.target.result); // Send file data
            fileInput.value = ''; // Clear input
        };
        reader.readAsDataURL(file); // Convert to base64
    }
});

// Receive messages
socket.on('chat message', function({ user, message, color }) {
    const item = document.createElement('li');
    item.textContent = `${user}: ${message}`;
    item.style.color = color; // Set message color
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

// Receive media messages
socket.on('media message', function({ user, media, color }) {
    const item = document.createElement('li');
    const mediaElement = document.createElement(media.startsWith('data:image') ? 'img' : 'video');
    
    mediaElement.src = media; // Set source to media
    mediaElement.controls = true; // Allow controls for video
    mediaElement.style.maxWidth = '300px'; // Limit width
    mediaElement.style.color = color; // Set message color
    item.textContent = `${user}: `;
    item.appendChild(mediaElement);
    
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

// Notify when a user connects
socket.on('user connected', function(username) {
    const notification = document.createElement('li');
    notification.textContent = `${username} has joined the chat`;
    userNotifications.appendChild(notification);
});

// Notify when a user disconnects
socket.on('user disconnected', function(username) {
    const notification = document.createElement('li');
    notification.textContent = `${username} has left the chat`;
    userNotifications.appendChild(notification);
});
