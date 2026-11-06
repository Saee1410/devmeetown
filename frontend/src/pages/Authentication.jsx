
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Typography,
    Box,
    Snackbar,
    Alert
} from '@mui/material';

import bgImg from "../assets/bg2.jpg";
import LockIcon from '@mui/icons-material/Lock';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Authentication = () => {
    const navigate = useNavigate();
    const { registerUser, loginUser } = useAuth();

    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const [isSignUp, setIsSignUp] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isSignUp) {

                console.log('sending register request to backend...');

                const data = await registerUser(
                    formData.name,
                    formData.email,
                    formData.password
                );

                setToast({
                    open: true,
                    message: 'Account successfully created! Please login now.',
                    severity: 'success'
                });

                setIsSignUp(false);

            } else {

                console.log('sending login request to backend...');

                await loginUser(formData.email, formData.password);

                setToast({
                    open: true,
                    message: 'Login successful!',
                    severity: 'success'
                });

                navigate('/home');
            }

        } catch (error) {
            console.error("Auth Error:", error);

            setToast({
                open: true,
                message: error.response?.data?.message ||
                    "An error occurred during authentication. Please try again.",
                severity: 'error'
            });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                backgroundImage: `url(${bgImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                flexDirection: 'column',
            }}
        >

            {/* Navbar */}
            <Navbar />

            {/* Authentication Content */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                }}
            >

                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        marginBottom: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: {
                            xs: '2rem',
                            sm: '3rem',
                            md: '4rem'
                        },
                    }}
                >
                    <LockIcon sx={{
                        fontSize: 'inherit',
                        color: '#22d3ee'
                    }} />

                    Dev<span style={{ color: '#22d3ee' }}>Meet</span>
                </Typography>

                <Card
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: 400,
                        width: '100%',
                        margin: '50px auto',
                        padding: 2,
                        boxShadow: 3
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h5"
                            component="div"
                            align="center"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                        >
                            {isSignUp ? "Sign Up" : "Login"}
                        </Typography>

                        {isSignUp && (
                            <TextField
                                label="Full Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        )}

                        <TextField
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />

                        <TextField
                            label="Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            margin="normal"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />

                    </CardContent>

                    <CardActions sx={{
                        flexDirection: 'column',
                        gap: 2
                    }}>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            {isSignUp ? "Sign Up" : "Login"}
                        </Button>

                        <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                        >
                            {isSignUp
                                ? "Already have an account?"
                                : "Don't have an account?"
                            }

                            <span
                                onClick={() => setIsSignUp(!isSignUp)}
                                style={{
                                    color: '#1976d2',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'none'
                                }}
                            >
                                {isSignUp ? " Login" : " Sign Up"}
                            </span>
                        </Typography>

                    </CardActions>

                </Card>

                {/* Snackbar */}
                <Snackbar
                    open={toast.open}
                    autoHideDuration={4000}
                    onClose={handleCloseToast}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                >
                    <Alert
                        onClose={handleCloseToast}
                        severity={toast.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>

            </Box>

            {/* Footer */}
            <Footer />

        </Box>
    );
};

export default Authentication;




// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import  { Card, CardContent, CardActions, Button, TextField, Typography, Box, Snackbar, Alert} from '@mui/material'
// import bgImg from "../assets/bg2.jpg";
// import LockIcon from '@mui/icons-material/Lock';



// export const Authentication = () => {
//     const navigate = useNavigate();
//     const { registerUser, loginUser } = useAuth();

//     const [toast, setToast] = useState({ 
//         open: false, 
//         message: '', 
//         severity: 'success' });

//         const handleCloseToast = () => {
//             setToast({ ...toast, open: false });
//         }  ;

//     const [isSignUp, setIsSignUp] = useState(false);

//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
        
//     });

//     const handleInputChange = (e) => {
//         const {name, value} = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             if (isSignUp) {

//                 console.log('sending register request to backend...');

//                 const data = await registerUser(formData.name, formData.email, formData.password);

//                setToast({
//                     open: true,
//                     message: 'Account successfully created! Please login now.',
//                     severity: 'success'
//                });
//                 setIsSignUp(false);

//             } else {

//                 console.log('sending login request to backend...');
//                 await loginUser(formData.email, formData.password);

//                 setToast({
//                     open: true,
//                     message: 'Login successful!',
//                     severity: 'success'
//                 });

//                 navigate('/home');

//             }
//         } catch (error) {
//             console.error("Auth Error:", error);

//             setToast({
//                 open: true,
//                 message: error.response?.data?.message || "An error occurred during authentication. Please try again.",
//                 severity: 'error'
//             });

//         }
//     }
        

//   return (
//     <Box
//         sx={{
//             minHeight: '100vh',
//             width: '100vw',
//             backgroundImage: `url(${bgImg})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: 2,

//          }}
//          >

//             <Typography
//                variant="h3"
//                component="h1"
//                sx={{
//                 fontWeight: 'bold',
//                 color: '#ffffff',
//                 textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
//                 marginBottom: 3,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 1,
//                 fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
//                }}
//                >
//                 <LockIcon sx={{ fontSize: 'inherit', color: '#22d3ee' }} />

//                 Dev<span style={{ color: '#22d3ee' }}>Meet</span>
//                </Typography>

//     <Card
//      component="form"
//      onSubmit={handleSubmit}
//      sx={{ maxWidth: 400, width: '100%', margin: '50px auto', padding: 2, boxShadow: 3}}>
        
//         <CardContent>

//             <Typography variant="h5" component="div" align="center" gutterBottom sx={{ fontWeight: 600 }}>
//                 {isSignUp ? "Sign Up" : "Login"}
//             </Typography>
        
//         {isSignUp && (
//             <TextField
//                 label="Full Name"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//             />

//             )}

//             <TextField
//                 label="Email Address"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//             />

//             <TextField
//                 label="Password"
//                 variant="outlined"
//                 type="password"
//                 fullWidth
//                 margin="normal"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//             />
//         </CardContent>

//         <CardActions  sx={{ flexDirection: 'column', gap: 2}}>
//             <Button type="submit" variant="contained" color="primary" fullWidth>
//                 {isSignUp ? "Sign Up" : "Login"}
//             </Button>

//             <Typography variant="body2" color="textSecondary" align="center">
//                 {isSignUp ? "Already have an account?" : "Don't have an account?"}
//                 <span 
//                  onClick={() => setIsSignUp(!isSignUp)}
//                  style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
//                  >
//                     {isSignUp ? " Login" : " Sign Up"}
//                  </span>
//             </Typography>
//         </CardActions>
//     </Card>

//     <Snackbar 
//         open={toast.open} 
//         autoHideDuration={4000} 
//         onClose={handleCloseToast}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//     >
//         <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
//             {toast.message}
//         </Alert>
//     </Snackbar>

// </Box>
//   );
// }


// export default Authentication;