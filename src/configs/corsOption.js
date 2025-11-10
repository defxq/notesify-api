import allowedOrigins from "./allowedOrigins.js";

const corsOption = {
    origin: (origin, callback) => {
        console.log("CORS origin received:", origin);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Error: Blocked by cors"));
        }
    },
    credentials: true
};

export default corsOption;