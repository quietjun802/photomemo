const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/User")


function makeToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }

    )
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "이메일/비밀번호 필요" })
        }

        const exists = await User.findOne({
            email: email.toLowerCase()
        })
        if (exists) {

            return res.status(400).json({ message: "이미 가입된 이메일" })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const validRoles = ["user", "admin"]
        const safeRole = validRoles.includes(role) ? role : "user"

        const user = await User.create({
            email,
            displayName,
            passwordHash,
            role: safeRole
        })

        res.status(201).json({ user: user.toSafeJSON() })

    } catch (error) {
        return res.status(500).json({
            message: "회원가입 실패",
            error: error.message
        })

    }
})

router.post("/login", async (req, res) => {
    try {
        const { email = "", password = "" } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        const invalidMsg = { message: "이메일 또는 비밀번호가 올바르지 않습니다." };

        if (!user) return res.status(400).json(invalidMsg);

        // 이미 계정이 비활성화 상태면 로그인 차단
        if (!user.isActive) {
            return res.status(403).json({ message: "계정이 잠겼습니다. 관리자에게 문의하세요." });
        }

        const ok = await user.comparePassword(password);

        if (!ok) {
            // 실패 시도 +1
            user.loginAttempts += 1;

            // 5회 이상 → 계정 잠금
            if (user.loginAttempts >= 5) {
                user.isActive = false;
            }

            await user.save();
            return res.status(400).json(invalidMsg);
        }

        // 로그인 성공 → 시도 횟수 초기화
        user.loginAttempts = 0;
        user.isLoggined = true;
        user.lastLoginAt = new Date();
        await user.save();

        const token = makeToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            user: user.toSafeJSON(),
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "로그인 실패",
            error: error.message
        });
    }
});



router.get("/me",async (req,res)=>{
    try {
        const h = req.headers.authorization || ""

        const token = h.startsWith("Bearer")? h.slice(7):null

        if(!token) return res.status(401).json({message:"인증 필요"})

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(payload.id)

        if(!user) return res.status(404).json({message:"사용자 없음"})

        res.status(200).json(user.toSafeJSON())
    } catch (error) {
        res.status(401).json({message:"토큰 무효",error:error.message})
        
    }
})

module.exports = router