import { useState } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { joinContest } from "../services/contestService";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function JoinContest() {
    const [contestCode, setContestCode] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleJoin = async () => {
        const code = contestCode.trim().toUpperCase();

        if (!code) {
            alert("Please enter contest code.");
            return;
        }

        try {
            setLoading(true);

            console.log("📤 Joining contest:", code);

            const res = await joinContest({
                contestCode: code,
            });

            console.log("✅ Join Contest Response:", res);

            // Backend successful
            const joinedContestCode =
                res.data?.data?.contestCode || code;

            alert("Contest Joined Successfully! 🎉");

            console.log(
                "🚀 Navigating to:",
                `/contest/${joinedContestCode}`
            );

            navigate(`/contest/${joinedContestCode}`);

        } catch (error) {
            console.error("❌ Join Contest Error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to join contest"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
        
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Paper
                elevation={5}
                sx={{
                    p: 4,
                    borderRadius: 3,
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight="bold"
                >
                    Join Contest
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Enter the contest code shared by the contest creator.
                </Typography>

                <TextField
                    fullWidth
                    label="Contest Code"
                    value={contestCode}
                    onChange={(e) =>
                        setContestCode(
                            e.target.value.toUpperCase()
                        )
                    }
                    sx={{ mt: 3 }}
                    placeholder="Example: ABC123"
                    slotProps={{
                        htmlInput: {
                            maxLength: 6,
                        },
                    }}
                />

                <Box mt={3}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleJoin}
                        disabled={loading}
                    >
                        {loading
                            ? "Joining..."
                            : "Join Contest"}
                    </Button>
                </Box>
            </Paper>
        </Container>

        <Footer />
        </>
    );
}

export default JoinContest;


// import { useState } from "react";
// import {
//     Container,
//     Paper,
//     Typography,
//     TextField,
//     Button,
//     Box,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// import { joinContest } from "../services/contestService";

// function JoinContest() {

//     const [contestCode, setContestCode] = useState("");
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();


//     const handleJoin = async () => {

//         // Empty code check
//         if (!contestCode.trim()) {
//             alert("Please enter contest code.");
//             return;
//         }

//         try {

//             setLoading(true);

//             const res = await joinContest({
//                 contestCode: contestCode.trim().toUpperCase(),
//             });

//             console.log(
//                 "✅ Join Contest Response:",
//                 res
//             );

//             alert("Contest Joined Successfully! 🎉");

//             navigate(
//                 `/contest/room/${contestCode.trim().toUpperCase()}`
//             );

//         } catch (error) {

//             console.error(
//                 "❌ Join Contest Error:",
//                 error
//             );

//             alert(
//                 error.response?.data?.message ||
//                 "Unable to join contest"
//             );

//         } finally {

//             setLoading(false);

//         }
//     };


//     return (
//         <Container
//             maxWidth="sm"
//             sx={{ mt: 6 }}
//         >

//             <Paper
//                 elevation={5}
//                 sx={{
//                     p: 4,
//                     borderRadius: 3,
//                 }}
//             >

//                 <Typography
//                     variant="h4"
//                     gutterBottom
//                     fontWeight="bold"
//                 >
//                     Join Contest
//                 </Typography>


//                 <Typography
//                     variant="body1"
//                     color="text.secondary"
//                 >
//                     Enter the contest code shared by the
//                     contest creator.
//                 </Typography>


//                 <TextField
//                     fullWidth
//                     label="Contest Code"
//                     value={contestCode}
//                     onChange={(e) =>
//                         setContestCode(
//                             e.target.value.toUpperCase()
//                         )
//                     }
//                     sx={{ mt: 3 }}
//                     placeholder="Example: ABC123"
//                     inputProps={{
//                         maxLength: 6,
//                     }}
//                 />


//                 <Box mt={3}>

//                     <Button
//                         fullWidth
//                         variant="contained"
//                         size="large"
//                         onClick={handleJoin}
//                         disabled={loading}
//                     >
//                         {loading
//                             ? "Joining..."
//                             : "Join Contest"}
//                     </Button>

//                 </Box>

//             </Paper>

//         </Container>
//     );
// }

// export default JoinContest;


// import { useState } from "react";
// import {
//   Container,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   Box,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { joinContest } from "../services/contestService";

// function JoinContest() {
//   const [contestCode, setContestCode] = useState("");
//   const navigate = useNavigate();

//   const handleJoin = async () => {
//     try {
//       const res = await joinContest({ contestCode });

//       alert("Contest Joined Successfully!");

//       navigate(`/contest/room/${contestCode}`);
//     } catch (error) {
//       alert(error.response?.data?.message || "Unable to join contest");
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 6 }}>
//       <Paper elevation={5} sx={{ p: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Join Contest
//         </Typography>

//         <TextField
//           fullWidth
//           label="Contest Code"
//           value={contestCode}
//           onChange={(e) => setContestCode(e.target.value.toUpperCase())}
//           sx={{ mt: 3 }}
//         />

//         <Box mt={3}>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={handleJoin}
//           >
//             Join Contest
//           </Button>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }

// export default JoinContest;