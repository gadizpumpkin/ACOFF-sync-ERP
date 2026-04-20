exports.allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role.toUpperCase();

    if (!roles.map(r => r.toUpperCase()).includes(userRole)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    next();
  };
};