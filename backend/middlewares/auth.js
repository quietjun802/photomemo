// middleware/auth.js
const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  try {
    let token;

    // 1️⃣ Authorization 헤더 우선
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.split(" ")[1].trim();
    }

    // 2️⃣ 헤더에 없으면 쿠키에서 찾기
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3️⃣ 토큰이 아예 없으면 401
    if (!token) {
      return res.status(401).json({ message: "토큰이 없습니다." });
    }

    // 4️⃣ 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // 5️⃣ 다음 단계로
    next();
  } catch (err) {
    console.error("❌ JWT 인증 실패:", err.message);

    // 403이 아니라 401로 반환하는 게 프론트에서 재로그인 처리하기 더 좋음
    return res.status(401).json({
      message: "유효하지 않은 또는 만료된 토큰입니다.",
    });
  }
};
