import { User as FirebaseUser } from "@firebase/auth";

interface User extends FirebaseUser {
	role?: string;
};

interface AuthState {
  currentUser: User | null;
}


interface AuthAction {
  type: string;
  payload?: string | number | boolean | object | null;
}

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
      case "LOGIN": {
        return {
          currentUser: action.payload as User || null,
        };
      }
      case "LOGOUT": {
        return {
          currentUser: null,
        };
      }
      default:
        return state;
    }
  };
  
  export default AuthReducer;