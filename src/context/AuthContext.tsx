import { createContext, ReactNode, useContext, useState } from 'react';

type Role = 'MECANICO' | 'SUPERVISOR' | 'ADMIN' | null;

interface AuthContextType {
  userId: number | null;
  userRole: Role;
  login: (id: number, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<Role>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  const login = (id: number, role: Role) => {
    setUserId(id);
    setUserRole(role);
  };
  
  const logout = () => {
    setUserId(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}