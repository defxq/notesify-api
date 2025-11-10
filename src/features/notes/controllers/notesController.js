import User from "../../../models/User.js";
import Note from "../../../models/Note.js";
import mongoose from "mongoose";

// all-protected-routes

const getAllNotes = async (req, res) => {
    const allNotes = await Note.find().lean();
    if (!allNotes.length) return res.status(400).json({ message: "No notes found" });

    // const notesWithUser = await Promise.all(notes.map(async (note) => {
    //     const user = await User.findById(note.user).lean().exec()
    //     return { ...note, username: user.username }
    // }))
    const notesWithUser = [...allNotes];
    for (const note of notesWithUser) {
        const { username } = await User.findById(note.user).lean();
        note.username = username;
    }

    res.status(200).json(notesWithUser);
};

const addNewNote = async (req, res) => {
    // get and destructer the data sent
    const { user, title, text } = req.body;
    // check if provided all required fields
    if (!user || !title || !text) return res.status(400).json({ message: "Please provide all the required fields" });
    // check if note title duplicate
    const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean();
    if (duplicate) return res.status(409).json({ message: "Duplicate note title" });
    // check valid user
    if (!mongoose.isObjectIdOrHexString(user)) return res.status(400).json({ message: "User not found" });
    const author = await User.findById(user).lean();
    if (!author) return res.status(400).json({ message: "User not found" });
    // create new note
    const newNote = await Note.create({ user, title, text });
    if (!newNote) return res.status(400).json({ message: "Failed to create, something went wrong" });
    // return new note
    return res.status(201).json(newNote);
};

const updateNote = async (req, res) => {
    const { id, user, title, text, completed } = req.body;
    if (!id || !user || !title || !text || typeof completed !== "boolean") return res.status(400).json({ message: "Please provide all the required fields" });
    const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean();
    if (duplicate && duplicate._id.toString() !== id) return res.status(409).json({ message: "Duplicate note title" });
    if (!mongoose.isObjectIdOrHexString(user)) return res.status(400).json({ message: "User not found" });
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "Note not found" });
    const author = await User.findById(user).lean();
    if (!author) return res.status(400).json({ message: "User not found" });

    const foundNote = await Note.findById(id);
    if (!foundNote) return res.status(400).json({ message: "Note not found" });

    foundNote.user = user;
    foundNote.title = title;
    foundNote.text = text;
    foundNote.completed = completed;

    const updatedNote = await foundNote.save();
    // no need to send any status error here because if something went wrong, its not our fault and
    // it'll automatically throw an error and be caught by the error handling function ;)
    res.status(200).json({ message: `${updatedNote.title} updated!` });
};

const deleteNote = async (req, res) => {
    //get and checks the id
    const { id } = req.body;
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "Note not found" });
    // finds the note and deletes
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) return res.status(400).json({ message: "Note not found" });
    // response
    res.status(200).json({ message: `${deletedNote.notename} deleted!` });
};

export {
    getAllNotes,
    addNewNote,
    updateNote,
    deleteNote
};

