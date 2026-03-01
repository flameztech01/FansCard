import jwt from "jsonwebtoken";

const generateAdminToken = (res, adminId) => {
  const token = jwt.sign(
    { adminId }, 
    process.env.JWT_SECRET, 
    { expiresIn: "1d" } 
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("admin_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development" || true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // ✅ 1 day in ms
  });

  return token;
};

export default generateAdminToken;