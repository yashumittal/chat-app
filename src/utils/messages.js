const generateMessage = (text, username) => {
    return {
        username,
        text,
        createdAt: new Date()
    }
}


const generateLocationMessage = (url, username,
) => {
    return {
        username,
        url,
        createdAt: new Date()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}