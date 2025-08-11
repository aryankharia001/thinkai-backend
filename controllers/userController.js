const User = require('../models/UserModel')
const user = require('../routes/UserRoutes')

// ADMIN - get users
async function getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password"); // exclude password field
      res.status(200).json({ data: users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
}


// ADMIN - delete user by id
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting user" });
    }
}

// ADMIN - update user role
async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body; // ✅ fixed destructuring

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true } // ✅ return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User role updated successfully",
            user: updatedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user role" });
    }
}

module.exports = {
    getAllUsers,
    deleteUser,
    updateUserRole
}