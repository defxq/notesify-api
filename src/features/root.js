import express from "express";
import path from "path";
const router = express.Router();

router.get(/^\/$|index(\.html)?$/, (req, res) => {
    res.status(200).sendFile(path.join(import.meta.dirname, "..", "views", "index.html"));
});


export default router;