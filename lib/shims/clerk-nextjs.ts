// Clerkのモック実装（DISABLE_CLERK=1時のみ使用）
// ビルド時のプリレンダリングエラーを回避

import React from 'react';

export const ClerkProvider = ({ children, ...props }: any) => children;
export const SignIn = () => null;
export const SignUp = () => null;
export const SignInButton = ({ children, ...props }: any) => React.createElement('button', { type: 'button' }, children || 'Sign in');
export const SignOutButton = ({ children, ...props }: any) => React.createElement('button', { type: 'button' }, children || 'Sign out');
export const UserButton = () => null;
export const SignedIn = ({ children }: any) => children;
export const SignedOut = ({ children }: any) => children;
export const useUser = () => ({ isSignedIn: false, user: null });
export const useAuth = () => ({ isSignedIn: false, userId: null });
export const auth = () => Promise.resolve({ userId: null, sessionClaims: { publicMetadata: { role: 'staff' } } });
export const currentUser = () => Promise.resolve(null);
export const clerkClient = {
  users: { getUser: () => Promise.resolve(null) },
  sessions: { getSession: () => Promise.resolve(null) }
};

// ミドルウェア用のダミー（警告消音）
export const authMiddleware = (..._args: any[]) => {
  return (_req: any, _evt?: any) => _req;
};


