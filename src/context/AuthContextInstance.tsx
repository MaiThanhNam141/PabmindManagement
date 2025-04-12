import { createContext } from "react";
import { User as FirebaseUser } from "@firebase/auth";

interface User extends FirebaseUser {
	role?: string;
};

interface AuthContextType {
  currentUser: User | null;
  dispatch: React.Dispatch<{ type: string; payload?: string | number | boolean | object | null; }>;
}

const storedUser = localStorage.getItem("user");
export const INITIAL_STATE: AuthContextType = {
  currentUser: storedUser && storedUser !== "{}" ? JSON.parse(storedUser) : null,
  dispatch: () => null,
};

export const AuthContext = createContext<AuthContextType>(INITIAL_STATE);