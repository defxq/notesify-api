import express from "express";
const app = express();
import "dotenv/config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import corsOption from "./configs/corsOption.js";
import root from "./features/root.js";
import errHandler from "./middlewares/errHandler.js";
import notesRoute from "./features/notes/notesRoute.js";
import usersRoute from "./features/users/usersRoute.js";
import authRoute from "./features/auth/authRoute.js";
app.use(morgan('dev'));

app.use(cookieParser());
// Temporary request logger to help debug cookie behavior in production.
// Logs origin and cookies for each incoming request. Remove after debugging.
app.use((req, res, next) => {
    try {
        console.log('== incoming request ==');
        console.log('method:', req.method, 'path:', req.path);
        console.log('origin:', req.headers.origin);
        console.log('cookies:', req.cookies);
    } catch (err) {
        console.log('logger error', err);
    }
    next();
});
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(root);

app.use("/auth", authRoute);
app.use("/notes", notesRoute);
app.use("/users", usersRoute);

app.use(/.*/, (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(import.meta.dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ message: "404 not found" });
    } else {
        res.type('txt').send("404 not found");
    }
});


app.use(errHandler);
export default app;