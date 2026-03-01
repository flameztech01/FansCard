import jwt from "jsonwebtoken";

const generateAdminToken = (res, adminId) => {
  // ⏳ Token expires in 1 day
  const token = jwt.sign(
    { adminId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // ✅ 1 day
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("admin_jwt", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // ✅ 1 day in milliseconds
    path: "/",
  });

  return token;
};

export default generateAdminToken;