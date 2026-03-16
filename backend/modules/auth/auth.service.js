import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export function createAuthService(userRepository) {
  const {
    JWT_SECRET,
    JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN,
  } = process.env;

  function generateAccessToken(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  function generateRefreshToken(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  return {
    async register({ email, nome, senha }) {
      const existing = await userRepository.findByEmail(email);
      if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      const user = await userRepository.create({ email, nome, senhaHash });

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      await userRepository.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async login({ email, senha }) {
      const user = await userRepository.findByEmail(email);
      if (!user) throw new Error("INVALID_CREDENTIALS");

      const match = await bcrypt.compare(senha, user.senhaHash);
      if (!match) throw new Error("INVALID_CREDENTIALS");

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      await userRepository.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async refresh(token) {
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        throw new Error("INVALID_REFRESH_TOKEN");
      }

      const user = await userRepository.findById(payload.sub);
      if (!user || user.refreshToken !== token) {
        throw new Error("INVALID_REFRESH_TOKEN");
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      await userRepository.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    },

    async logout(userId) {
      await userRepository.updateRefreshToken(userId, null);
    },
  };
}
