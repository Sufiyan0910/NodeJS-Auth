const isAdminUser = (req, res, next) => {
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access Denied! Admin Rihgts Required",
    });
  }
  next();
};

module.exports = isAdminUser;
