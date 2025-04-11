import React, { useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";
import { AuthContext, INITIAL_STATE } from "./AuthContextInstance";

export const AuthContextProvider: React.FC<{ children: React.ReactNode }>  = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};