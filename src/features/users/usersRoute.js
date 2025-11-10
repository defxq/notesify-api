import express from "express";
const router = express.Router();
import { getAllUsers, addNewUser, updateUser, deleteUser } from "./controllers/usersController.js";
import verifyJWT from "../../middlewares/verifyJWT.js";

router.use(verifyJWT);
router.route("/")
    .get(getAllUsers)
    .post(addNewUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;