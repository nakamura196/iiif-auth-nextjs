import { AuthSession } from '@/types/common';

class AuthStore {
  private sessions: Map<string, AuthSession> = new Map();
  
  createSession(userId: string): string {
    const accessToken = this.generateToken();
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour
    
    this.sessions.set(accessToken, {
      userId,
      accessToken,
      expiresAt
    });
    
    return accessToken;
  }
  
  validateToken(token: string): AuthSession | null {
    const session = this.sessions.get(token);
    
    if (!session) {
      return null;
    }
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    
    return session;
  }
  
  private generateToken(): string {
    return `token_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }
}

export const authStore = new AuthStore();