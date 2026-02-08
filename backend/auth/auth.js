const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if the token exists
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token is required' });
  }
  
  // Split the header to get the token part
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }
  
  // Verify the token
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Set the user in the request object
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};