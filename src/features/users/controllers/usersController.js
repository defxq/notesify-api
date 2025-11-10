import User from "../../../models/User.js";
import Note from "../../../models/Note.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";


// all-protected-routes

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password").lean();
        if (!users.length) return res.status(400).json({ message: "No users found" });
        res.status(200).json(users);
    } catch (err) {
        console.log("error in getAllUsers");
        next(err);
    }
};

const addNewUser = async (req, res) => {
    const { username, password, roles } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Please provide all the required fields" });
    const duplicate = await User.findOne({ username }).collation({ locale: "en", strength: 2 }).lean();
    if (duplicate) return res.status(409).json({ message: "Username already exists!" });
    const hashedPwd = await bcrypt.hash(password, 10);
    const userObj =  (!Array.isArray(roles) || !roles.length)
    ? { username, "password": hashedPwd }
    : { username, "password": hashedPwd, roles }
    // create new user
    const newUser = await User.create(userObj);
    if (!newUser) return res.status(400).json({ message: "Failed to create, something went wrong" });
    return res.status(201).json(newUser);
};

// patch
const updateUser = async (req, res) => {
    const { id, username, password, roles, active } = req.body;
    // id hex check
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "User not found" });
    // checking required fields
    if (!id || !username || !Array.isArray(roles) || !roles.length || !active) return res.status(400).json({ message: "Please provide all the required fields" });
    // finding user
    const foundUser = await User.findById(id);
    if (!foundUser) return res.status(400).json({ message: "User not found" });
    // check if the username has duplicate to update
    const duplicate = await User.findOne({ username }).collation({ locale: "en", strength: 2  }).lean();
    if (duplicate && duplicate?._id.toString() !== id) return res.status(409).json({ message: "Username already exists!" });
    // updating...
    foundUser.username = username;
    foundUser.roles = roles;
    foundUser.active = active;
    // optional - if there was password, then update that too
    if (password) {
        const hashedPwd = await bcrypt.hash(password, 10);
        foundUser.password = hashedPwd;
    }
    // saving the update and responding with updated messge
    const updatedUser = await foundUser.save();
    /* no need to send any status error here because if something went wrong, its not our fault and it'll automatically throw an error and be caught by the error handling function ;) */
    res.status(200).json({ message: `${updatedUser.username} updated!` });
};

const deleteUser = async (req, res) => {
    //get and checks the id
    const { id } = req.body;
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "User not found" });
    // checks for assigned notes
    const foundNote = await Note.findOne({ User: id }).lean();
    if (foundNote) return res.status(400).json({ message: "User has assigned notes" });
    // finds the user and deletes
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(400).json({ message: "User not found" });
    // response
    res.status(200).json({ message: `${deletedUser.username} deleted!` });
};

export {
    getAllUsers,
    addNewUser,
    updateUser,
    deleteUser
};

