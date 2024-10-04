const jwt = require("jsonwebtoken"); //import library jsonwebtoken

// Middleware to verify JWT token before accessing protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // take value of authorization header from HTTP request
  const token = authHeader && authHeader.split(" ")[1]; //detached token out of string bearer

  if (!token) return res.sendStatus(401).json({ message: "Invalid token"});

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user; // if token is valid, save info user in req.user
    next();
  });

  // If token is valid, call the next middleware in the stack
  // If token is invalid, send a 401 Forbidden response
}

module.exports = { authenticateToken };
