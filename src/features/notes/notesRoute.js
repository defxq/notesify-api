import express from "express";
const router = express.Router();
import { getAllNotes, addNewNote, updateNote, deleteNote } from "./controllers/notesController.js";
import verifyJWT from "../../middlewares/verifyJWT.js";

router.use(verifyJWT);
router.route("/")
    .get(getAllNotes)
    .post(addNewNote)
    .patch(updateNote)
    .delete(deleteNote);

export default router;