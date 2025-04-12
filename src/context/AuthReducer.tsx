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
        // Validate payload has expected User properties before casting
        const isValidUser = action.payload && 
          typeof (action.payload as any).email === 'string';
        return {
          currentUser: isValidUser ? (action.payload as User) : null,
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