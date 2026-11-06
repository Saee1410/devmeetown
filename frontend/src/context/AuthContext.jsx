import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const BACKEND_URL = "http://localhost:8000/api/v1/users";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setUser({ loggedIn: true });
        }

        setLoading(false);
    }, []);

    const registerUser = async (name, email, password) => {
        const response = await axios.post(
            `${BACKEND_URL}/register`,
            {
                name,
                email,
                password,
            }
        );

        return response.data;
    };

    const loginUser = async (email, password) => {
        const response = await axios.post(
            `${BACKEND_URL}/login`,
            {
                email,
                password,
            }
        );

        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            setUser({ loggedIn: true });
        }

        return response.data;
    };

    const logoutUser = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const addToUserHistory = async (meeting_code) => {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            `${BACKEND_URL}/add_to_activity`,
            {
                token,
                meeting_code,
            }
        );

        return response.data;
    };

    const getHistoryOfUser = async () => {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            `${BACKEND_URL}/get_all_activity`,
            {
                params: {
                    token,
                },
            }
        );

        return response.data;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                registerUser,
                loginUser,
                logoutUser,
                addToUserHistory,
                getHistoryOfUser,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

















// import { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// export const AuthContext = createContext();
// const BACKEND_URL = "http://localhost:8000/api/v1/users";

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             setUser({ loggedIn: true });
//         }
//         setLoading(false);
//     }, []);

//     const registerUser = async (name, email, password) => {
//         // बॅकएंडवरून येणारा पूर्ण रिस्पॉन्स रिटर्न केला आहे
//         const response = await axios.post(`${BACKEND_URL}/register`, { name, email, password });
//         return response.data;
//     };

//     const loginUser = async (email, password) => {
//         const response = await axios.post(`${BACKEND_URL}/login`, { email, password });

//         if (response.data && response.data.token) {
//             localStorage.setItem('token', response.data.token);
//             setUser({ loggedIn: true });
//         }
//         return response.data;
//     };

//     const logoutUser = () => {
//         localStorage.removeItem('token');
//         setUser(null);
//     };


//     const addToUserHistory = async (meetingCode) => {
//         const token = localStorage.getItem("token");

//         const response = await axios.post(
//             `${"/add_to_activity"}/addToHistory`,
//             {
//                 token,
//                 meeting_code: meetingCode
//             }
//         );

//         return response.data;
//     };
    
    
//     const getHistoryOfUser = async () => {
//         const token = localStorage.getItem("token");

//         const response = await axios.get(
//             `${"/get_all_activity"}/getUserHistory`,
//             {
//                 params: {
//                     token
//                 }
//             }
//         );
//         return response.data;
//     }



//     return (
//         <AuthContext.Provider value={{ user, loading, registerUser, loginUser, logoutUser, addToUserHistory, getHistoryOfUser }}>
//             {!loading && children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);