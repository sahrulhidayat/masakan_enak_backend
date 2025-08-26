const data = {
    users: require("../data/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
}

const getAllUsers = (req, res) => {
    res.json(data.users);
}

const createUser = (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
    }

    // Check if user already exists
    const existingUser = data.users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const newUser = { username, email };
    data.setUsers([...data.users, newUser]);
    res.status(201).json(newUser);
}

const updateUser = (req, res) => {
    const { username } = req.params;
    const { email } = req.body;

    const user = data.users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (email) user.email = email;

    data.setUsers(data.users.map((u) => (u.username === username ? user : u)));
    res.json(user);
}

const deleteUser = (req, res) => {
    const { username } = req.params;

    const user = data.users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    data.setUsers(data.users.filter((u) => u.username !== username));
    res.json({ message: "User deleted" });
}

const getUserByUsername = (req, res) => {
    const { username } = req.params;

    const user = data.users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserByUsername,
};