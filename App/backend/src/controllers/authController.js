import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { analyzeLog } from '../services/aiService.js';

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // ---------------------------
    // 1. FIND USER
    // ---------------------------
    const result = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    console.log("➡️ Calling AI engine...");

    let aiResult = {
      risk_score: 0,
      risk_level: "UNKNOWN"
    };

    // ---------------------------
    // 2. INVALID LOGIN
    // ---------------------------
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {

      await query(
        'INSERT INTO logs (source, level, message) VALUES ($1, $2, $3)',
        ['AUTH', 'warning', `Failed login attempt for ${email}`]
      );

      try {
        aiResult = await analyzeLog(
          `failed login attempt for ${email}`,
          "auth"
        );

        console.log("⬅️ AI response:", aiResult);

      } catch (err) {
        console.error("AI engine error:", err.message);
        aiResult = { risk_score: 50, risk_level: "MEDIUM" };
      }

      // optional: store AI event
      await query(
        `INSERT INTO ai_events (user_email, risk_score, risk_level, action)
         VALUES ($1, $2, $3, $4)`,
        [email, aiResult.risk_score, aiResult.risk_level, 'FAILED_LOGIN']
      );

      // BLOCK RULE
      if (aiResult.risk_score >= 80) {
        return res.status(403).json({
          message: "Blocked by AI Security Engine",
          risk: aiResult
        });
      }

      return res.status(401).json({
        message: 'Invalid credentials',
        risk: aiResult
      });
    }

    // ---------------------------
    // 3. VALID LOGIN
    // ---------------------------
    try {
      aiResult = await analyzeLog(
        `successful login for ${email}`,
        "auth"
      );

      console.log("⬅️ AI response:", aiResult);

    } catch (err) {
      console.error("AI engine error:", err.message);
      aiResult = { risk_score: 10, risk_level: "LOW" };
    }

    // ---------------------------
    // 4. BLOCK HIGH RISK LOGIN
    // ---------------------------
    if (aiResult.risk_score >= 80) {
      return res.status(403).json({
        message: "Blocked by AI Security Engine",
        risk: aiResult
      });
    }

    // ---------------------------
    // 5. GENERATE TOKEN
    // ---------------------------
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // ---------------------------
    // 6. AUDIT LOG
    // ---------------------------
    await query(
      'INSERT INTO audit_events (user_email, action, ip_address) VALUES ($1, $2, $3)',
      [user.email, 'User logged in', req.ip]
    );

    // ---------------------------
    // 7. STORE AI EVENT
    // ---------------------------
    await query(
      `INSERT INTO ai_events (user_email, risk_score, risk_level, action)
       VALUES ($1, $2, $3, $4)`,
      [email, aiResult.risk_score, aiResult.risk_level, 'SUCCESS_LOGIN']
    );

    // ---------------------------
    // 8. RESPONSE
    // ---------------------------
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      risk: aiResult
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

export function me(req, res) {
  return res.json({ user: req.user });
}
