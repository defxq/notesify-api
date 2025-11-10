import app from "./app.js";
import connectDB from "./db/dbConn.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Listening to PORT: ${PORT}`));
    } catch (err) {
        console.log(err);
    }
};

startServer();