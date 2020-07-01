const users = []
const addUser = ({ id, username, room }) => {

    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and Room must be provided'
        }
    }


    // Check for existing user

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username already in use.'
        }
    }

    // Store user

    const user = { id, username, room }
    users.push(user)
    return { user }

}

const removeUser = (id) => {

    // Check if user exists
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = function (id) {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room.trim().toLowerCase())
}


module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}

// addUser({ id: '1', username: 'yashu', room: 'test' })
// addUser({ id: '2', username: 'madhur', room: 'test' })
// addUser({ id: '3', username: 'adad', room: 'da' })

// removeUser('2')
// console.log(getUser('1'))
// console.log(getUsersInRoom('test'))



