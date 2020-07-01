const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

app.use(express.json())


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {

    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        // Send welcome message to newly connected client
        socket.emit('message', generateMessage('Welcome!', 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`, 'Admin'))

        io.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })

    // Receive the message from client and emit to all other connected.
    socket.on('sendMessage', ({message}, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData', { 
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        const url = `https://www.google.com/maps/?q${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(url, user.username))
        callback(true)
    })

})



server.listen(port, () => {
    console.log(`Server is started at ${port}`)
})