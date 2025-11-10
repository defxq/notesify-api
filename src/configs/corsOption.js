import allowedOrigins from "./allowedOrigins.js";

const corsOption = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !cors) {
            callback(null, true);
        } else {
            callback(new Error("Error: Blocked by cors"));
        }
    },
    credentials: true
};

export default corsOption;