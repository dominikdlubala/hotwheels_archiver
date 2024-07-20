import { createContext, useContext, useMemo, ReactNode, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useLocalStorage } from './useLocalStorage'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseSetup'; 
import type { FirebaseUser } from '../types/types';  


interface AuthContextType {
    // uid: string | null;
    user: FirebaseUser | null; 
    login: (user: FirebaseUser) => void; 
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); 

export const AuthProvider = ({ children }: {children: ReactNode}) => {

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if(user) {
                setUser(user as FirebaseUser); 
                navigate('/home') 
            } else {
                logout(); 
            }
        }) 
    }, []); 


    const [user, setUser] = useLocalStorage<FirebaseUser | null>('user', null); 

    const navigate = useNavigate(); 

    const login = async (user: FirebaseUser) => {
        setUser(user); 
        navigate('/home'); 
    }

    const logout = () => {
        signOut(auth)
            .then(() => {
                setUser(null); 
                navigate('/', { replace: true }); 
            })
            .catch(error => console.log(error))
    }

    const value = useMemo(
        () => ({
          user,
          login,
          logout,
        }),
        [user]
      );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext); 
    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; 
}