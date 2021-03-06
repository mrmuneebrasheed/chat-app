const users = [];

// AddUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the Data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data

    if (!username || !room) {
        return { error: "Username and Room are required!" };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    // Validating username
    if (existingUser) {
        return { error: "This username already exist" };
    }

    // Store User
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
