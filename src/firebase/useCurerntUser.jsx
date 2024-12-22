import { createContext, useContext, useEffect, useState } from "react";
import { getUserDoc, onAuthStateChangedListener } from "./firebase_config";

export const UserContext = createContext({});

export function authWatch() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onAuthStateChangedListener(async (user) => {
            setLoading(true)
            if (user) {
                const userDoc = await getUserDoc(user.uid);
                setUser(userDoc);
            }
            setLoading(false)
        })
    }, []);

    return [user, loading];
}

export default function UserProvider({ children }) {
    const [user, loading] = authWatch();
    return <UserContext.Provider
        value={[user, loading]}>
        {children}
    </UserContext.Provider>
}

export const useCurrentUser = () => useContext(UserContext);