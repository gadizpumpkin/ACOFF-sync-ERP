const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ada" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    // FIX PENTING
    req.user = {
      ...decoded,
      role: decoded.role.toUpperCase()
    };

    next();
  });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }

  console.log("DECODED TOKEN:", decoded); // 🔥 DEBUG DISINI

  req.user = decoded;
  next();
});
};
