import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
//import bgImage from "../assets/logo5.png";
import {
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();

                console.log(history);

                if (Array.isArray(history)) {
                    setMeetings(history);
                } else {
                    console.log("History is not array", history);
                    setMeetings([]);
                }
            } catch (err) {
                console.log(err);

                setSnackbarMessage("Unable to fetch history");

                setOpenSnackbar(true);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString();
    };

    return (

      



        <div>


   
//             <Box
//             <img className="bg-image" src={bgImage} alt="Background" 
//     sx={{
//         minHeight: "50vh",
//         backgroundImage: `url(${bgImage})`,
//         width: "50%",
//         backgroundSize: "600px",
//         backgroundPosition: "left center",
//         backgroundRepeat: "no-repeat",
    
//         // minHeight: "100vh",
//         // p: 4
//     }}
//   
// 
//  /> 

/>

            <IconButton onClick={() => navigate("/home")}>
                <HomeIcon />
            </IconButton>

            {meetings.map((meeting) => (
                <Card
                    key={meeting._id}
                    sx={{ marginBottom: 2 }}
                >
                    <CardContent>

                        <Typography variant="h6">
                            Code : {meeting.meetingCode}
                        </Typography>

                        <Typography>
                            Date : {formatDate(meeting.date)}
                        </Typography>

                    </CardContent>
                </Card>
            ))}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert severity="error">
                    {snackbarMessage}
                </Alert>
            </Snackbar>


        </div>
   
    );
}

