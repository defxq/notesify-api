import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthoized" });

    const accessToken = authHeader.split(" ")[1];

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(401).json({ message: "Unauthorized" });
            // this aint forbidden bruh, this has gotta be expired token, so put it 401
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo. roles;
            next();
        },
    );
};


export default verifyJWT;