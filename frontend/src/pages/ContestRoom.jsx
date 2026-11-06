import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    Grid,
    Container,
    CircularProgress,
    Typography,
    Box,
    Button,
} from "@mui/material";

import axios from "axios";

import QuestionPanel from "../components/contest/QuestionPael.jsx";
import MonacoEditor from "../components/contest/MonacoEditor.jsx";
import socket from "../socket";

// ======================================
// SHUFFLE QUESTIONS
// ======================================

function shuffleQuestions(questions) {
    const shuffled = [...questions];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i],
        ];
    }

    return shuffled;
}

// ======================================
// CONTEST ROOM
// ======================================

function ContestRoom() {

    const { contestCode } = useParams();

    // ======================================
    // STATES
    // ======================================

    const [contest, setContest] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

    const [participants, setParticipants] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [startingContest, setStartingContest] =
        useState(false);

    // ======================================
    // FETCH CONTEST
    // ======================================

    useEffect(() => {

        if (!contestCode) {
            return;
        }

        const fetchContest = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                console.log(
                    "🔍 Fetching contest:",
                    contestCode
                );

                const response = await axios.get(
                    `http://localhost:8000/api/v1/contest/${contestCode}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                console.log(
                    "✅ Contest data:",
                    response.data
                );

                const contestData =
                    response.data.data;

                if (!contestData) {
                    throw new Error(
                        "Contest data not found."
                    );
                }

                setContest(contestData);

                // ==================================
                // SHUFFLE QUESTIONS
                // ==================================

                const shuffledQuestions =
                    shuffleQuestions(
                        contestData.questions || []
                    );

                console.log(
                    "🎲 Random Questions:",
                    shuffledQuestions
                );

                setQuestions(
                    shuffledQuestions
                );

            } catch (err) {

                console.error(
                    "❌ Failed to fetch contest:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load contest."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchContest();

    }, [contestCode]);

    // ======================================
    // START CONTEST
    // ======================================

    // ======================================
// START CONTEST
// ======================================

const handleStartContest = async () => {

    try {

        setStartingContest(true);

        const token =
            localStorage.getItem("token");

        const response = await axios.post(
            "http://localhost:8000/api/v1/contest/start/${contestCode}",
            {
                contestCode: contestCode,
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
            }
        );

        console.log(
            "🔥 START RESPONSE:",
            response.data
        );

        const startedContest =
            response.data?.data;

        console.log(
            "🔥 STARTED CONTEST:",
            startedContest
        );

        console.log(
            "🔥 STATUS:",
            startedContest?.status
        );

        console.log(
            "🔥 START TIME:",
            startedContest?.startTime
        );

        console.log(
            "🔥 END TIME:",
            startedContest?.endTime
        );

        console.log(
            "🔥 DURATION:",
            startedContest?.duration
        );

        // ==================================
        // UPDATE CONTEST
        // ==================================

        setContest((prev) => {

            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                status: "running",
                startTime:
                    startedContest?.startTime,
                endTime:
                    startedContest?.endTime,
                duration:
                    startedContest?.duration ||
                    prev.duration ||
                    30,
            };

        });

        // ==================================
        // SOCKET EVENT
        // ==================================

        socket.emit(
            "contestStarted",
            {
                contestCode:
                    contestCode,

                startTime:
                    startedContest?.startTime,

                endTime:
                    startedContest?.endTime,

                duration:
                    startedContest?.duration ||
                    contest?.duration ||
                    30,
            }
        );

    } catch (error) {

        console.error(
            "❌ Start Contest Error:",
            error
        );

        console.error(
            "❌ Server Response:",
            error.response?.data
        );

        alert(
            error.response?.data?.message ||
            "Failed to start contest."
        );

    } finally {

        setStartingContest(false);

    }
};


    // const handleStartContest = async () => {

    //     try {

    //         setStartingContest(true);

    //         const token =
    //             localStorage.getItem("token");

    //         console.log(
    //             "================================"
    //         );

    //         console.log(
    //             "🚀 STARTING CONTEST"
    //         );

    //         console.log(
    //             "Contest Code:",
    //             contestCode
    //         );

    //         console.log(
    //             "================================"
    //         );

    //         const response = await axios.post(
    //             `http://localhost:8000/api/v1/contest/start/${contestCode}`,
    //             {
    //                 contestCode: contestCode,
    //             },
    //             {
    //                 headers: {
    //                     Authorization:
    //                         `Bearer ${token}`,
    //                     "Content-Type":
    //                         "application/json",
    //                 },
    //             }
    //         );

    //         console.log(
    //             "✅ Contest Started:",
    //             response.data
    //         );

    //         const startedContest =
    //             response.data.data;

    //         // ==================================
    //         // UPDATE CONTEST STATUS
    //         // ==================================

    //         setContest((prev) => {

    //             if (!prev) {
    //                 return prev;
    //             }

    //             return {
    //                 ...prev,
    //                 status: "running",
    //                 startTime:
    //                     startedContest?.startTime,
    //                 endTime:
    //                     startedContest?.endTime,
    //             };

    //         });

    //         // ==================================
    //         // SOCKET EVENT
    //         // ==================================

    //         socket.emit(
    //             "contestStarted",
    //             {
    //                 contestCode,
    //             }
    //         );

    //         alert(
    //             "Contest Started Successfully! 🚀"
    //         );

    //     } catch (err) {

    //         console.error(
    //             "❌ Start Contest Error:",
    //             err
    //         );

    //         console.error(
    //             "❌ Server Response:",
    //             err.response?.data
    //         );

    //         alert(
    //             err.response?.data?.message ||
    //             "Failed to start contest."
    //         );

    //     } finally {

    //         setStartingContest(false);

    //     }
    // };

    // ======================================
    // FETCH LEADERBOARD
    // ======================================

    useEffect(() => {

        if (!contestCode) {
            return;
        }

        const fetchLeaderboard = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                console.log(
                    "🏆 Leaderboard:",
                    response.data
                );

                setParticipants(
                    response.data.data || []
                );

            } catch (err) {

                console.error(
                    "❌ Failed to fetch leaderboard:",
                    err
                );

            }
        };

        // ==================================
        // INITIAL LEADERBOARD
        // ==================================

        fetchLeaderboard();

        // ==================================
        // LEADERBOARD UPDATE
        // ==================================

        const handleLeaderboardUpdate =
            () => {

                console.log(
                    "🔄 Leaderboard update received!"
                );

                fetchLeaderboard();

            };

        socket.on(
            "leaderboardUpdated",
            handleLeaderboardUpdate
        );

        // ==================================
        // CONTEST STARTED
        // ==================================

        const handleContestStarted =
            (data) => {

                console.log(
                    "🚀 Contest started from socket:",
                    data
                );

                // जर specific contest code आला असेल
                // तर current contest चाच update कर

                if (
                    data?.contestCode &&
                    data.contestCode !== contestCode
                ) {
                    return;
                }

                setContest((prev) => {

                    if (!prev) {
                        return prev;
                    }

                    return {
                        ...prev,
                        status: "running",
                    };

                });

            };

        socket.on(
            "contestStarted",
            handleContestStarted
        );

        // ==================================
        // CLEANUP SOCKET
        // ==================================

        return () => {

            socket.off(
                "leaderboardUpdated",
                handleLeaderboardUpdate
            );

            socket.off(
                "contestStarted",
                handleContestStarted
            );

        };

    }, [contestCode]);

    // ======================================
    // LOADING SCREEN
    // ======================================

    if (loading) {

        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <CircularProgress />

                <Typography
                    sx={{
                        ml: 2,
                    }}
                >
                    Loading contest...
                </Typography>

            </Box>
        );
    }

    // ======================================
    // ERROR SCREEN
    // ======================================

    if (error || !contest) {

        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                }}
            >

                <Typography
                    color="error"
                    variant="h6"
                >
                    {error ||
                        "Contest not found."}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Contest Code: {contestCode}
                </Typography>

            </Box>
        );
    }

    // ======================================
    // CURRENT QUESTION
    // ======================================

    const currentQuestion =
        questions[currentQuestionIndex];

    // ======================================
    // MAIN UI
    // ======================================

    return (
        <Container
            maxWidth={false}
            sx={{
                height: "100vh",
                py: 2,
                bgcolor: "#f5f5f5",
            }}
        >

            {/* ==================================
                CONTEST HEADER
            ================================== */}

            <Box
                sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >

                {/* ==================================
                    CONTEST INFORMATION
                ================================== */}

                <Box>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        {contest.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Contest Code:{" "}

                        <strong>
                            {contestCode}
                        </strong>
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Status:{" "}

                        <strong>
                            {contest.status}
                        </strong>
                    </Typography>

                </Box>

                {/* ==================================
                    START CONTEST BUTTON
                ================================== */}

                {contest.status === "waiting" && (

                    <Button
                        variant="contained"
                        color="success"
                        onClick={
                            handleStartContest
                        }
                        disabled={
                            startingContest
                        }
                    >

                        {startingContest
                            ? "Starting..."
                            : "Start Contest"}

                    </Button>

                )}

            </Box>

            {/* ==================================
                MAIN CONTEST AREA
            ================================== */}

            <Grid
                container
                spacing={2}
                sx={{
                    height:
                        "calc(100% - 90px)",
                }}
            >

                {/* ==================================
                    LEFT SIDE - QUESTIONS
                ================================== */}

                

                <Grid
                    item
                    xs={12}
                    md={7}
                    sx={{
                        width: "920px",
                    }}
                   
                >

                    <QuestionPanel
                        question={
                            currentQuestion
                        }

                        contest={contest}

                        currentQuestionIndex={
                            currentQuestionIndex
                        }

                        totalQuestions={
                            questions.length
                        }

                        participants={
                            participants
                        }

                        // ==================================
                        // NEXT QUESTION
                        // ==================================

                        onNext={() => {

                            if (
                                currentQuestionIndex <
                                questions.length - 1
                            ) {

                                setCurrentQuestionIndex(
                                    currentQuestionIndex + 1
                                );

                            }

                        }}

                        // ==================================
                        // PREVIOUS QUESTION
                        // ==================================

                        onPrevious={() => {

                            if (
                                currentQuestionIndex >
                                0
                            ) {

                                setCurrentQuestionIndex(
                                    currentQuestionIndex - 1
                                );

                            }

                        }}
                    />

                </Grid>

                {/* ==================================
                    RIGHT SIDE - CODE EDITOR
                ================================== */}

                <Grid
                    item
                    xs={12}
                    md={10}
                    sx={{
                        width: "950px"
                    }}
                     
                >

                    <MonacoEditor
                        roomId={contestCode}
                        questionId={
                            currentQuestion?._id
                        }
                    />

                </Grid>

            </Grid>

        </Container>
    );
}

export default ContestRoom;








// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

// import {
//     Grid,
//     Container,
//     CircularProgress,
//     Typography,
//     Box,
//     Button,
// } from "@mui/material";

// import axios from "axios";

// import QuestionPanel from "../components/contest/QuestionPael.jsx";
// import MonacoEditor from "../components/contest/MonacoEditor.jsx";
// import socket from "../socket";

// // ======================================
// // SHUFFLE QUESTIONS
// // ======================================

// function shuffleQuestions(questions) {
//     const shuffled = [...questions];

//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));

//         [shuffled[i], shuffled[j]] = [
//             shuffled[j],
//             shuffled[i],
//         ];
//     }

//     return shuffled;
// }

// // ======================================
// // CONTEST ROOM
// // ======================================

// function ContestRoom() {
    

//     const { contestCode } = useParams();

//     const [contest, setContest] = useState(null);
//     const [questions, setQuestions] = useState([]);
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [participants, setParticipants] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [startingContest, setStartingContest] = useState(false);

//     // ======================================
//     // FETCH CONTEST
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;

//         const fetchContest = async () => {

//             try {

//                 const token = localStorage.getItem("token");

//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 console.log("✅ Contest data:", response.data);

//                 const contestData = response.data.data;

//                 setContest(contestData);

//                 // ==================================
//                 // RANDOM QUESTION ORDER
//                 // ==================================

//                 const shuffledQuestions = shuffleQuestions(
//                     contestData.questions || []
//                 );

//                 console.log(
//                     "🎲 Questions for this student:",
//                     shuffledQuestions
//                 );

//                 setQuestions(shuffledQuestions);

//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch contest:",
//                     err
//                 );

//                 setError(
//                     err.response?.data?.message ||
//                     "Failed to load contest."
//                 );

//             } finally {

//                 setLoading(false);

//             }

//         };

//         fetchContest();

//     }, [contestCode]);

//     // ======================================
//     // START CONTEST
//     // ======================================

//     const handleStartContest = async () => {

//         try {

//             setStartingContest(true);

//             const token = localStorage.getItem("token");

//             console.log(
//                 "🚀 Starting Contest:",
//                 contestCode
//             );

//             const response = await axios.post(
//                 `http://localhost:8000/api/v1/contest/start/${contestCode}`,
//                 {
//                     contestCode: contestCode,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             console.log(
//                 "✅ Contest Started:",
//                 response.data
//             );

//             // ==================================
//             // UPDATE LOCAL STATUS
//             // ==================================

//             setContest((prev) => ({
//                 ...prev,
//                 status: "running",
//                 startTime: response.data.data?.startTime,
//                 endTime: response.data.data?.endTime,
//             }));

//             // ==================================
//             // INFORM SOCKET ROOM
//             // ==================================

//             socket.emit("contestStarted", {
//                 contestCode,
//             });

//             alert("Contest Started Successfully! 🚀");

//         } catch (error) {

//             console.error(
//                 "❌ Start Contest Error:",
//                 error.response?.data || error
//             );

//             alert(
//                 error.response?.data?.message ||
//                 "Failed to start contest."
//             );

//         } finally {

//             setStartingContest(false);

//         }

//     };

//     // ======================================
//     // FETCH + LIVE LEADERBOARD
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;

//         const fetchLeaderboard = async () => {

//             try {

//                 const token = localStorage.getItem("token");

//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 console.log(
//                     "🏆 Leaderboard:",
//                     response.data
//                 );

//                 setParticipants(
//                     response.data.data || []
//                 );

//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch leaderboard:",
//                     err
//                 );

//             }

//         };

//         // First load
//         fetchLeaderboard();

//         // ==================================
//         // LIVE LEADERBOARD UPDATE
//         // ==================================

//         const handleLeaderboardUpdate = () => {

//             console.log(
//                 "🔄 Leaderboard update received!"
//             );

//             fetchLeaderboard();

//         };

//         socket.on(
//             "leaderboardUpdated",
//             handleLeaderboardUpdate
//         );

//         // ==================================
//         // CONTEST STARTED
//         // ==================================

//         const handleContestStarted = () => {

//             console.log(
//                 "🚀 Contest started from socket"
//             );

//             setContest((prev) => {

//                 if (!prev) return prev;

//                 return {
//                     ...prev,
//                     status: "running",
//                 };

//             });

//         };

//         socket.on(
//             "contestStarted",
//             handleContestStarted
//         );

//         // ==================================
//         // CLEANUP
//         // ==================================

//         return () => {

//             socket.off(
//                 "leaderboardUpdated",
//                 handleLeaderboardUpdate
//             );

//             socket.off(
//                 "contestStarted",
//                 handleContestStarted
//             );

//         };

//     }, [contestCode]);

//     // ======================================
//     // LOADING
//     // ======================================

//     if (loading) {

//         return (
//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <CircularProgress />

//                 <Typography sx={{ ml: 2 }}>
//                     Loading contest...
//                 </Typography>

//             </Box>
//         );

//     }

//     // ======================================
//     // ERROR
//     // ======================================

//     if (error || !contest) {

//         return (
//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <Typography
//                     color="error"
//                     variant="h6"
//                 >
//                     {error || "Contest not found."}
//                 </Typography>

//             </Box>
//         );

//     }

//     // ======================================
//     // CURRENT QUESTION
//     // ======================================

//     const currentQuestion =
//         questions[currentQuestionIndex];

//     // ======================================
//     // UI
//     // ======================================

//     return (

//         <Container
//             maxWidth={false}
//             sx={{
//                 height: "100vh",
//                 py: 2,
//                 bgcolor: "#f5f5f5",
//             }}
//         >

//             {/* ==================================
//                 CONTEST STATUS
//             ================================== */}

//             <Box
//                 sx={{
//                     mb: 2,
//                     p: 2,
//                     bgcolor: "white",
//                     borderRadius: 2,
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                 }}
//             >

//                 <Box>

//                     <Typography variant="h6">
//                         {contest.title}
//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         color="text.secondary"
//                     >
//                         Contest Code:{" "}
//                         <strong>{contestCode}</strong>
//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         sx={{ mt: 0.5 }}
//                     >
//                         Status:{" "}
//                         <strong>{contest.status}</strong>
//                     </Typography>

//                 </Box>

//                 {/* ==================================
//                     START BUTTON
//                 ================================== */}

//                 {contest.status === "waiting" && (

//                     <Button
//                         variant="contained"
//                         color="success"
//                         onClick={handleStartContest}
//                         disabled={startingContest}
//                     >

//                         {startingContest
//                             ? "Starting..."
//                             : "Start Contest"}

//                     </Button>

//                 )}

//             </Box>

//             {/* ==================================
//                 MAIN CONTEST AREA
//             ================================== */}

//             <Grid
//                 container
//                 spacing={2}
//                 sx={{
//                     height: "calc(100% - 90px)",
//                 }}
//             >

//                 {/* =========================
//                     LEFT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={5}>

//                     <QuestionPanel
//                         question={currentQuestion}
//                         currentQuestionIndex={
//                             currentQuestionIndex
//                         }
//                         totalQuestions={
//                             questions.length
//                         }
//                         participants={
//                             participants
//                         }

//                         onNext={() => {

//                             if (
//                                 currentQuestionIndex <
//                                 questions.length - 1
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex + 1
//                                 );

//                             }

//                         }}

//                         onPrevious={() => {

//                             if (
//                                 currentQuestionIndex > 0
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex - 1
//                                 );

//                             }

//                         }}
//                     />

//                 </Grid>

//                 {/* =========================
//                     RIGHT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={7}>

//                     <MonacoEditor
//                         roomId={contestCode}
//                         questionId={
//                             currentQuestion?._id
//                         }
//                     />

//                 </Grid>

//             </Grid>

//         </Container>

//     );
// }

// export default ContestRoom;


// import { useEffect, useState } from "react";

// import { useParams } from "react-router-dom";

// import {
//     Grid,
//     Container,
//     CircularProgress,
//     Typography,
//     Box,
//     Button,
// } from "@mui/material";

// import axios from "axios";

// import QuestionPanel from "../components/contest/QuestionPael.jsx";

// import MonacoEditor from "../components/contest/MonacoEditor.jsx";

// import socket from "../socket";


// // ======================================
// // SHUFFLE QUESTIONS
// // ======================================

// function shuffleQuestions(questions) {

//     const shuffled = [...questions];

//     for (let i = shuffled.length - 1; i > 0; i--) {

//         const j = Math.floor(
//             Math.random() * (i + 1)
//         );

//         [shuffled[i], shuffled[j]] = [
//             shuffled[j],
//             shuffled[i],
//         ];
//     }

//     return shuffled;
// }


// // ======================================
// // CONTEST ROOM
// // ======================================

// function ContestRoom() {

//     const { contestCode } = useParams();

//     const [contest, setContest] = useState(null);

//     const [questions, setQuestions] = useState([]);

//     const [currentQuestionIndex, setCurrentQuestionIndex] =
//         useState(0);

//     const [participants, setParticipants] =
//         useState([]);

//     const [loading, setLoading] =
//         useState(true);

//     const [error, setError] =
//         useState("");

//     const [startingContest, setStartingContest] =
//         useState(false);


//     // ======================================
//     // FETCH CONTEST
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;

//         const fetchContest = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");

//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 console.log(
//                     "✅ Contest data:",
//                     response.data
//                 );

//                 const contestData =
//                     response.data.data;

//                 setContest(contestData);


//                 // ==================================
//                 // RANDOM QUESTION ORDER
//                 // ==================================

//                 const shuffledQuestions =
//                     shuffleQuestions(
//                         contestData.questions || []
//                     );

//                 console.log(
//                     "🎲 Questions for this student:",
//                     shuffledQuestions
//                 );

//                 setQuestions(
//                     shuffledQuestions
//                 );

//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch contest:",
//                     err
//                 );

//                 setError(
//                     err.response?.data?.message ||
//                     "Failed to load contest."
//                 );

//             } finally {

//                 setLoading(false);

//             }

//         };

//         fetchContest();

//     }, [contestCode]);


//     // ======================================
//     // START CONTEST
//     // ======================================

//     const handleStartContest = async () => {

//         try {

//             setStartingContest(true);

//             const token =
//                 localStorage.getItem("token");

//             console.log(
//                 "🚀 Starting Contest:",
//                 contestCode
//             );


//             const response = await axios.post(

//                 `http://localhost:8000/api/v1/contest/start/${contestCode}`,

//                 {
//                     contestCode: contestCode
//                 },

//                 {
//                     headers: {
//                         Authorization:
//                             `Bearer ${token}`,

//                         "Content-Type":
//                             "application/json",
//                     },
//                 }

//             );


//             console.log(
//                 "✅ Contest Started:",
//                 response.data
//             );


//             // ==================================
//             // UPDATE LOCAL CONTEST STATUS
//             // ==================================

//             setContest((prev) => ({

//                 ...prev,

//                 status: "running",

//                 startTime:
//                     response.data.data?.startTime,

//                 endTime:
//                     response.data.data?.endTime,

//             }));


//             // ==================================
//             // INFORM SOCKET ROOM
//             // ==================================

//             socket.emit(
//                 "contestStarted",
//                 {
//                     contestCode,
//                 }
//             );


//             alert(
//                 "Contest Started Successfully! 🚀"
//             );


//         } catch (error) {

//             console.error(
//                 "❌ Start Contest Error:",
//                 error.response?.data || error
//             );

//             alert(
//                 error.response?.data?.message ||
//                 "Failed to start contest."
//             );


//         } finally {

//             setStartingContest(false);

//         }

//     };


//     // ======================================
//     // FETCH + LIVE LEADERBOARD
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;


//         const fetchLeaderboard = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");


//                 const response = await axios.get(

//                     `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,

//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }

//                 );


//                 console.log(
//                     "🏆 Leaderboard:",
//                     response.data
//                 );


//                 setParticipants(
//                     response.data.data || []
//                 );


//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch leaderboard:",
//                     err
//                 );

//             }

//         };


//         // ==================================
//         // FIRST LOAD
//         // ==================================

//         fetchLeaderboard();


//         // ==================================
//         // LIVE LEADERBOARD UPDATE
//         // ==================================

//         const handleLeaderboardUpdate = () => {

//             console.log(
//                 "🔄 Leaderboard update received!"
//             );

//             fetchLeaderboard();

//         };


//         socket.on(
//             "leaderboardUpdated",
//             handleLeaderboardUpdate
//         );


//         // ==================================
//         // CONTEST STARTED BY CREATOR
//         // ==================================

//         const handleContestStarted = () => {

//             console.log(
//                 "🚀 Contest started from socket"
//             );


//             setContest((prev) => ({

//                 ...prev,

//                 status: "running",

//             }));

//         };


//         socket.on(
//             "contestStarted",
//             handleContestStarted
//         );


//         // ==================================
//         // CLEANUP
//         // ==================================

//         return () => {

//             socket.off(
//                 "leaderboardUpdated",
//                 handleLeaderboardUpdate
//             );

//             socket.off(
//                 "contestStarted",
//                 handleContestStarted
//             );

//         };

//     }, [contestCode]);


//     // ======================================
//     // LOADING
//     // ======================================

//     if (loading) {

//         return (

//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <CircularProgress />

//                 <Typography sx={{ ml: 2 }}>
//                     Loading contest...
//                 </Typography>

//             </Box>

//         );

//     }


//     // ======================================
//     // ERROR
//     // ======================================

//     if (error || !contest) {

//         return (

//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <Typography
//                     color="error"
//                     variant="h6"
//                 >

//                     {error ||
//                         "Contest not found."}

//                 </Typography>

//             </Box>

//         );

//     }


//     // ======================================
//     // CURRENT QUESTION
//     // ======================================

//     const currentQuestion =
//         questions[currentQuestionIndex];


//     // ======================================
//     // UI
//     // ======================================

//     return (

//         <Container
//             maxWidth={false}
//             sx={{
//                 height: "100vh",
//                 py: 2,
//                 bgcolor: "#f5f5f5",
//             }}
//         >

//             {/* ==================================
//                 CONTEST STATUS
//             ================================== */}

//             <Box
//                 sx={{
//                     mb: 2,
//                     p: 2,
//                     bgcolor: "white",
//                     borderRadius: 2,
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                 }}
//             >

//                 <Box>

//                     <Typography variant="h6">
//                         {contest.title}
//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         color="text.secondary"
//                     >

//                         Contest Code:{" "}

//                         <strong>
//                             {contestCode}
//                         </strong>

//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         sx={{ mt: 0.5 }}
//                     >

//                         Status:{" "}

//                         <strong>
//                             {contest.status}
//                         </strong>

//                     </Typography>

//                 </Box>


//                 {/* ==================================
//                     START BUTTON
//                 ================================== */}

//                 {contest.status === "waiting" && (

//                     <Button
//                         variant="contained"
//                         color="success"
//                         onClick={handleStartContest}
//                         disabled={startingContest}
//                     >

//                         {startingContest
//                             ? "Starting..."
//                             : "Start Contest"}

//                     </Button>

//                 )}

//             </Box>


//             {/* ==================================
//                 MAIN CONTEST AREA
//             ================================== */}

//             <Grid
//                 container
//                 spacing={2}
//                 sx={{
//                     height: "calc(100% - 90px)",
//                 }}
//             >

//                 {/* =========================
//                     LEFT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={5}>

//                     <QuestionPanel

//                         question={
//                             currentQuestion
//                         }

//                         currentQuestionIndex={
//                             currentQuestionIndex
//                         }

//                         totalQuestions={
//                             questions.length
//                         }

//                         participants={
//                             participants
//                         }


//                         // NEXT QUESTION

//                         onNext={() => {

//                             if (
//                                 currentQuestionIndex <
//                                 questions.length - 1
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex + 1
//                                 );

//                             }

//                         }}


//                         // PREVIOUS QUESTION

//                         onPrevious={() => {

//                             if (
//                                 currentQuestionIndex > 0
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex - 1
//                                 );

//                             }

//                         }}

//                     />

//                 </Grid>


//                 {/* =========================
//                     RIGHT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={7}>

//                     <MonacoEditor

//                         roomId={
//                             contestCode
//                         }

//                         questionId={
//                             currentQuestion?._id
//                         }

//                     />

//                 </Grid>

//             </Grid>

//         </Container>

//     );

// }


// export default ContestRoom;












// import { useEffect, useState } from "react";

// import { useParams } from "react-router-dom";

// import {
//     Grid,
//     Container,
//     CircularProgress,
//     Typography,
//     Box,
//     Button,
// } from "@mui/material";

// import axios from "axios";

// import QuestionPanel from "../components/contest/QuestionPael.jsx";

// import MonacoEditor from "../components/contest/MonacoEditor.jsx";

// import socket from "../socket";

// // ======================================
// // SHUFFLE QUESTIONS
// // ======================================

// function shuffleQuestions(questions) {

//     const shuffled = [...questions];

//     for (let i = shuffled.length - 1; i > 0; i--) {

//         const j = Math.floor(
//             Math.random() * (i + 1)
//         );

//         [shuffled[i], shuffled[j]] = [
//             shuffled[j],
//             shuffled[i],
//         ];
//     }

//     return shuffled;
// }

// // ======================================
// // CONTEST ROOM
// // ======================================

// function ContestRoom() {

//     const { contestCode } = useParams();

//     const [contest, setContest] = useState(null);

//     const [questions, setQuestions] = useState([]);

//     const [currentQuestionIndex, setCurrentQuestionIndex] =
//         useState(0);

//     const [participants, setParticipants] =
//         useState([]);

//     const [loading, setLoading] =
//         useState(true);

//     const [error, setError] =
//         useState("");

//     const [startingContest, setStartingContest] =
//         useState(false);


//     // ======================================
//     // FETCH CONTEST
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;

//         const fetchContest = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");

//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 console.log(
//                     "✅ Contest data:",
//                     response.data
//                 );

//                 const contestData =
//                     response.data.data;

//                 setContest(contestData);


//                 // ==================================
//                 // RANDOM QUESTION ORDER
//                 // ==================================

//                 const shuffledQuestions =
//                     shuffleQuestions(
//                         contestData.questions || []
//                     );

//                 console.log(
//                     "🎲 Questions for this student:",
//                     shuffledQuestions
//                 );

//                 setQuestions(
//                     shuffledQuestions
//                 );

//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch contest:",
//                     err
//                 );

//                 setError(
//                     err.response?.data?.message ||
//                     "Failed to load contest."
//                 );

//             } finally {

//                 setLoading(false);

//             }

//         };

//         fetchContest();

//     }, [contestCode]);


//     // ======================================
//     // START CONTEST
//     // ======================================

//     const handleStartContest = async () => {
//     try {
//         setStartingContest(true);

//         const token = localStorage.getItem("token");

//         const response = await axios.post(
//             `http://localhost:8000/api/v1/contest/start/${contestCode}`,
//             {
//                 contestCode: contestCode
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         console.log(
//             "🟢 CONTEST STARTED:",
//             response.data
//         );

//         setContest((prev) => ({
//             ...prev,
//             status: "running",
//             startTime: response.data.data?.startTime,
//             endTime: response.data.data?.endTime,
//         }));

//     } catch (error) {

//         console.error(
//             "❌ START CONTEST ERROR:",
//             error.response?.data || error
//         );

//         alert(
//             error.response?.data?.message ||
//             "Failed to start contest"
//         );

//     } finally {
//         setStartingContest(false);
//     }
// };

//     // const handleStartContest = async () => {

//     //     try {

//     //         setStartingContest(true);

//     //         const token =
//     //             localStorage.getItem("token");

//     //         console.log(
//     //             "🚀 Starting Contest:",
//     //             contestCode
//     //         );

//     //         const response = await axios.post(

//     //             `http://localhost:8000/api/v1/contest/start/${contestCode}`,

//     //             {},

//     //             {
//     //                 headers: {
//     //                     Authorization:
//     //                         `Bearer ${token}`,
//     //                 },
//     //             }

//     //         );

//     //         console.log(
//     //             "✅ Contest Started:",
//     //             response.data
//     //         );


//     //         // ==================================
//     //         // UPDATE LOCAL CONTEST STATUS
//     //         // ==================================

//     //         setContest((prev) => ({

//     //             ...prev,

//     //             status: "running",

//     //             startTime:
//     //                 response.data.data?.startTime,

//     //             endTime:
//     //                 response.data.data?.endTime,

//     //         }));


//     //         // ==================================
//     //         // INFORM SOCKET ROOM
//     //         // ==================================

//     //         socket.emit(
//     //             "contestStarted",
//     //             {
//     //                 contestCode,
//     //             }
//     //         );


//     //         alert(
//     //             "Contest Started Successfully! 🚀"
//     //         );

//     //     } catch (error) {

//     //         console.error(
//     //             "❌ Start Contest Error:",
//     //             error
//     //         );

//     //         alert(
//     //             error.response?.data?.message ||
//     //             "Failed to start contest."
//     //         );

//     //     } finally {

//     //         setStartingContest(false);

//     //     }

//     // };


//     // // ======================================
//     // // JOIN SOCKET ROOM
//     // // ======================================

//     // useEffect(() => {

//     //     if (!contestCode) return;

//     //     const joinRoom = () => {

//     //         socket.emit(
//     //             "joinContest",
//     //             {
//     //                 contestCode,
//     //             }
//     //         );

//     //         console.log(
//     //             "🟢 Joined contest:",
//     //             contestCode
//     //         );

//     //     };


//     //     if (socket.connected) {

//     //         joinRoom();

//     //     } else {

//     //         socket.once(
//     //             "connect",
//     //             joinRoom
//     //         );

//     //     }


//     //     return () => {

//     //         socket.off(
//     //             "connect",
//     //             joinRoom
//     //         );

//     //     };

//     // }, [contestCode]);


//     // ======================================
//     // FETCH + LIVE LEADERBOARD
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;

//         const fetchLeaderboard = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");

//                 const response = await axios.get(

//                     `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,

//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }

//                 );

//                 console.log(
//                     "🏆 Leaderboard:",
//                     response.data
//                 );

//                 setParticipants(
//                     response.data.data || []
//                 );

//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch leaderboard:",
//                     err
//                 );

//             }

//         };


//         // ==================================
//         // FIRST LOAD
//         // ==================================

//         fetchLeaderboard();


//         // ==================================
//         // LIVE LEADERBOARD UPDATE
//         // ==================================

//         const handleLeaderboardUpdate = () => {

//             console.log(
//                 "🔄 Leaderboard update received!"
//             );

//             fetchLeaderboard();

//         };


//         socket.on(
//             "leaderboardUpdated",
//             handleLeaderboardUpdate
//         );


//         // ==================================
//         // CONTEST STARTED BY CREATOR
//         // ==================================

//         const handleContestStarted = () => {

//             console.log(
//                 "🚀 Contest started from socket"
//             );

//             setContest((prev) => ({

//                 ...prev,

//                 status: "running",

//             }));

//         };


//         socket.on(
//             "contestStarted",
//             handleContestStarted
//         );


//         // ==================================
//         // CLEANUP
//         // ==================================

//         return () => {

//             socket.off(
//                 "leaderboardUpdated",
//                 handleLeaderboardUpdate
//             );

//             socket.off(
//                 "contestStarted",
//                 handleContestStarted
//             );

//         };

//     }, [contestCode]);


//     // ======================================
//     // LOADING
//     // ======================================

//     if (loading) {

//         return (

//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <CircularProgress />

//                 <Typography sx={{ ml: 2 }}>
//                     Loading contest...
//                 </Typography>

//             </Box>

//         );

//     }


//     // ======================================
//     // ERROR
//     // ======================================

//     if (error || !contest) {

//         return (

//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <Typography
//                     color="error"
//                     variant="h6"
//                 >

//                     {error ||
//                         "Contest not found."}

//                 </Typography>

//             </Box>

//         );

//     }


//     // ======================================
//     // CURRENT QUESTION
//     // ======================================

//     const currentQuestion =
//         questions[currentQuestionIndex];


//     // ======================================
//     // UI
//     // ======================================

//     return (

//         <Container
//             maxWidth={false}
//             sx={{
//                 height: "100vh",
//                 py: 2,
//                 bgcolor: "#f5f5f5",
//             }}
//         >

//             {/* ==================================
//                 CONTEST STATUS
//             ================================== */}

//             <Box
//                 sx={{
//                     mb: 2,
//                     p: 2,
//                     bgcolor: "white",
//                     borderRadius: 2,
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                 }}
//             >

//                 <Box>

//                     <Typography variant="h6">
//                         {contest.title}
//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         color="text.secondary"
//                     >

//                         Contest Code:{" "}
//                         <strong>
//                             {contestCode}
//                         </strong>

//                     </Typography>

//                     <Typography
//                         variant="body2"
//                         sx={{ mt: 0.5 }}
//                     >

//                         Status:{" "}

//                         <strong>
//                             {contest.status}
//                         </strong>

//                     </Typography>

//                 </Box>


//                 {/* ==================================
//                     START BUTTON
//                 ================================== */}

//                 {contest.status === "waiting" && (

//                     <Button
//                         variant="contained"
//                         color="success"
//                         onClick={handleStartContest}
//                         disabled={startingContest}
//                     >

//                         {startingContest
//                             ? "Starting..."
//                             : "Start Contest"}

//                     </Button>

//                 )}

//             </Box>


//             {/* ==================================
//                 MAIN CONTEST AREA
//             ================================== */}

//             <Grid
//                 container
//                 spacing={2}
//                 sx={{
//                     height: "calc(100% - 90px)",
//                 }}
//             >

//                 {/* =========================
//                     LEFT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={5}>

//                     <QuestionPanel

//                         question={
//                             currentQuestion
//                         }

//                         currentQuestionIndex={
//                             currentQuestionIndex
//                         }

//                         totalQuestions={
//                             questions.length
//                         }

//                         participants={
//                             participants
//                         }


//                         // NEXT QUESTION

//                         onNext={() => {

//                             if (
//                                 currentQuestionIndex <
//                                 questions.length - 1
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex + 1
//                                 );

//                             }

//                         }}


//                         // PREVIOUS QUESTION

//                         onPrevious={() => {

//                             if (
//                                 currentQuestionIndex > 0
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex - 1
//                                 );

//                             }

//                         }}

//                     />

//                 </Grid>


//                 {/* =========================
//                     RIGHT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={7}>

//                     <MonacoEditor

//                         roomId={
//                             contestCode
//                         }

//                         questionId={
//                             currentQuestion?._id
//                         }

//                     />

//                 </Grid>

//             </Grid>

//         </Container>

//     );

// }

// export default ContestRoom;


// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import {
//     Grid,
//     Container,
//     CircularProgress,
//     Typography,
//     Box,
// } from "@mui/material";

// import axios from "axios";

// import QuestionPanel from "../components/contest/QuestionPael.jsx";
// import MonacoEditor from "../components/contest/MonacoEditor.jsx";

// import socket from "../socket";


// // ======================================
// // SHUFFLE QUESTIONS
// // ======================================

// function shuffleQuestions(questions) {

//     const shuffled = [...questions];

//     for (let i = shuffled.length - 1; i > 0; i--) {

//         const j = Math.floor(
//             Math.random() * (i + 1)
//         );

//         [shuffled[i], shuffled[j]] = [
//             shuffled[j],
//             shuffled[i],
//         ];
//     }

//     return shuffled;
// }


// // ======================================
// // CONTEST ROOM
// // ======================================

// function ContestRoom() {

//     const { contestCode } = useParams();

//     const [contest, setContest] = useState(null);

//     const [questions, setQuestions] = useState([]);

//     const [currentQuestionIndex, setCurrentQuestionIndex] =
//         useState(0);

//     const [participants, setParticipants] =
//         useState([]);

//     const [loading, setLoading] =
//         useState(true);

//     const [error, setError] =
//         useState("");


//     // ======================================
//     // FETCH CONTEST
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;


//         const fetchContest = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");


//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }
//                 );


//                 console.log(
//                     "✅ Contest data:",
//                     response.data
//                 );


//                 const contestData =
//                     response.data.data;


//                 setContest(contestData);


//                 // ==================================
//                 // RANDOM QUESTION ORDER
//                 // ==================================

//                 const shuffledQuestions =
//                     shuffleQuestions(
//                         contestData.questions || []
//                     );


//                 console.log(
//                     "🎲 Questions for this student:",
//                     shuffledQuestions
//                 );


//                 setQuestions(
//                     shuffledQuestions
//                 );


//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch contest:",
//                     err
//                 );


//                 setError(
//                     err.response?.data?.message ||
//                     "Failed to load contest."
//                 );


//             } finally {

//                 setLoading(false);

//             }

//         };


//         fetchContest();

//     }, [contestCode]);


//     // ======================================
//     // JOIN SOCKET ROOM
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;


//         const joinRoom = () => {

//             socket.emit(
//                 "joinContest",
//                 {
//                     contestCode,
//                 }
//             );


//             console.log(
//                 "🟢 Joined contest:",
//                 contestCode
//             );

//         };


//         if (socket.connected) {

//             joinRoom();

//         } else {

//             socket.once(
//                 "connect",
//                 joinRoom
//             );

//         }


//         return () => {

//             socket.off(
//                 "connect",
//                 joinRoom
//             );

//         };

//     }, [contestCode]);


//     // ======================================
//     // FETCH + LIVE LEADERBOARD
//     // ======================================

//     useEffect(() => {

//         if (!contestCode) return;


//         const fetchLeaderboard = async () => {

//             try {

//                 const token =
//                     localStorage.getItem("token");


//                 const response = await axios.get(
//                     `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
//                     {
//                         headers: {
//                             Authorization:
//                                 `Bearer ${token}`,
//                         },
//                     }
//                 );


//                 console.log(
//                     "🏆 Leaderboard:",
//                     response.data
//                 );


//                 setParticipants(
//                     response.data.data || []
//                 );


//             } catch (err) {

//                 console.error(
//                     "❌ Failed to fetch leaderboard:",
//                     err
//                 );

//             }

//         };


//         // ==================================
//         // FIRST LOAD
//         // ==================================

//         fetchLeaderboard();


//         // ==================================
//         // LIVE LEADERBOARD UPDATE
//         // ==================================

//         const handleLeaderboardUpdate = () => {

//             console.log(
//                 "🔄 Leaderboard update received!"
//             );


//             fetchLeaderboard();

//         };


//         socket.on(
//             "leaderboardUpdated",
//             handleLeaderboardUpdate
//         );


//         // ==================================
//         // CLEANUP
//         // ==================================

//         return () => {

//             socket.off(
//                 "leaderboardUpdated",
//                 handleLeaderboardUpdate
//             );

//         };

//     }, [contestCode]);


//     // ======================================
//     // LOADING
//     // ======================================

//     if (loading) {

//         return (
//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <CircularProgress />

//                 <Typography sx={{ ml: 2 }}>
//                     Loading contest...
//                 </Typography>

//             </Box>
//         );

//     }


//     // ======================================
//     // ERROR
//     // ======================================

//     if (error || !contest) {

//         return (
//             <Box
//                 sx={{
//                     height: "100vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >

//                 <Typography
//                     color="error"
//                     variant="h6"
//                 >
//                     {error || "Contest not found."}
//                 </Typography>

//             </Box>
//         );

//     }


//     // ======================================
//     // CURRENT QUESTION
//     // ======================================

//     const currentQuestion =
//         questions[currentQuestionIndex];


//     // ======================================
//     // UI
//     // ======================================

//     return (

//         <Container
//             maxWidth={false}
//             sx={{
//                 height: "100vh",
//                 py: 2,
//                 bgcolor: "#f5f5f5",
//             }}
//         >

//             <Grid
//                 container
//                 spacing={2}
//                 sx={{
//                     height: "100%",
//                 }}
//             >

//                 {/* =========================
//                     LEFT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={5}>

//                     <QuestionPanel
//                         question={currentQuestion}

//                         currentQuestionIndex={
//                             currentQuestionIndex
//                         }

//                         totalQuestions={
//                             questions.length
//                         }

//                         participants={
//                             participants
//                         }


//                         // NEXT QUESTION
//                         onNext={() => {

//                             if (
//                                 currentQuestionIndex <
//                                 questions.length - 1
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex + 1
//                                 );

//                             }

//                         }}


//                         // PREVIOUS QUESTION
//                         onPrevious={() => {

//                             if (
//                                 currentQuestionIndex > 0
//                             ) {

//                                 setCurrentQuestionIndex(
//                                     currentQuestionIndex - 1
//                                 );

//                             }

//                         }}

//                     />

//                 </Grid>


//                 {/* =========================
//                     RIGHT SIDE
//                 ========================= */}

//                 <Grid item xs={12} md={7}>

//                     <MonacoEditor
//                         roomId={contestCode}

//                         questionId={
//                             currentQuestion?._id
//                         }
//                     />

//                 </Grid>

//             </Grid>

//         </Container>

//     );
// }


// export default ContestRoom;


// // import { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import {
// //     Grid,
// //     Container,
// //     CircularProgress,
// //     Typography,
// //     Box,
// // } from "@mui/material";
// // import axios from "axios";

// // import QuestionPanel from "../components/contest/QuestionPael.jsx";
// // import MonacoEditor from "../components/contest/MonacoEditor.jsx";

// // import socket from "../socket";

// // function shuffleQuestions(questions) {
// //     const shuffled = [...questions];

// //     for (let i = shuffled.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));

// //         [shuffled[i], shuffled[j]] = [
// //             shuffled[j],
// //             shuffled[i],
// //         ];
// //     }

// //     return shuffled;
// // }

// // function ContestRoom() {

// //     const { contestCode } = useParams();

// //     const [contest, setContest] = useState(null);
// //     const [questions, setQuestions] = useState([]);
// //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

// //     // ✅ Leaderboard participants
// //     const [participants, setParticipants] = useState([]);

// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState("");


// //     // ================================
// //     // FETCH CONTEST
// //     // ================================

// //     // ================================
// // // FETCH + LIVE LEADERBOARD
// // // ================================
// // useEffect(() => {

// //     if (!contestCode) return;

// //     const fetchLeaderboard = async () => {

// //         try {

// //             const token = localStorage.getItem("token");

// //             const response = await axios.get(
// //                 `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
// //                 {
// //                     headers: {
// //                         Authorization: `Bearer ${token}`,
// //                     },
// //                 }
// //             );

// //             console.log(
// //                 "🏆 Leaderboard:",
// //                 response.data
// //             );

// //             setParticipants(
// //                 response.data.data || []
// //             );

// //         } catch (err) {

// //             console.error(
// //                 "❌ Failed to fetch leaderboard:",
// //                 err
// //             );

// //         }

// //     };

// //     // First load
// //     fetchLeaderboard();

// //     // ================================
// //     // LIVE LEADERBOARD UPDATE
// //     // ================================
// //     const handleLeaderboardUpdate = () => {

// //         console.log(
// //             "🔄 Leaderboard update received!"
// //         );

// //         fetchLeaderboard();
// //     };

// //     socket.on(
// //         "leaderboardUpdated",
// //         handleLeaderboardUpdate
// //     );

// //     return () => {

// //         socket.off(
// //             "leaderboardUpdated",
// //             handleLeaderboardUpdate
// //         );

// //     };

// // }, [contestCode]);



// //     // useEffect(() => {

// //     //     if (!contestCode) return;

// //     //     const fetchContest = async () => {

// //     //         try {

// //     //             const token = localStorage.getItem("token");

// //     //             const response = await axios.get(
// //     //                 `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
// //     //                 {
// //     //                     headers: {
// //     //                         Authorization: `Bearer ${token}`,
// //     //                     },
// //     //                 }
// //     //             );

// //     //             console.log(
// //     //                 "✅ Contest data:",
// //     //                 response.data
// //     //             );

// //     //             const contestData = response.data.data;

// //     //             setContest(contestData);

// //     //             // Random order for THIS student
// //     //             const shuffledQuestions = shuffleQuestions(
// //     //                 contestData.questions || []
// //     //             );

// //     //             console.log(
// //     //                 "🎲 Questions for this student:",
// //     //                 shuffledQuestions
// //     //             );

// //     //             setQuestions(shuffledQuestions);

// //     //         } catch (err) {

// //     //             console.error(
// //     //                 "❌ Failed to fetch contest:",
// //     //                 err
// //     //             );

// //     //             setError(
// //     //                 err.response?.data?.message ||
// //     //                 "Failed to load contest."
// //     //             );

// //     //         } finally {

// //     //             setLoading(false);

// //     //         }
// //     //     };

// //     //     fetchContest();

// //     // }, [contestCode]);


// //     // // ================================
// //     // // JOIN SOCKET ROOM
// //     // // ================================
// //     // useEffect(() => {

// //     //     if (!contestCode) return;

// //     //     const joinRoom = () => {

// //     //         socket.emit("joinContest", {
// //     //             contestCode,
// //     //         });

// //     //         console.log(
// //     //             "🟢 Joined contest:",
// //     //             contestCode
// //     //         );

// //     //     };

// //     //     if (socket.connected) {

// //     //         joinRoom();

// //     //     } else {

// //     //         socket.once("connect", joinRoom);

// //     //     }

// //     //     return () => {

// //     //         socket.off("connect", joinRoom);

// //     //     };

// //     // }, [contestCode]);


// //     // ================================
// //     // FETCH LEADERBOARD
// //     // ================================
// //     useEffect(() => {

// //         if (!contestCode) return;

// //         const fetchLeaderboard = async () => {

// //             try {

// //                 const token = localStorage.getItem("token");

// //                 const response = await axios.get(
// //                     `http://localhost:8000/api/v1/contest/leaderboard/${contestCode}`,
// //                     {
// //                         headers: {
// //                             Authorization: `Bearer ${token}`,
// //                         },
// //                     }
// //                 );

// //                 console.log(
// //                     "🏆 Leaderboard:",
// //                     response.data
// //                 );

// //                 setParticipants(
// //                     response.data.data || []
// //                 );

// //             } catch (err) {

// //                 console.error(
// //                     "❌ Failed to fetch leaderboard:",
// //                     err
// //                 );

// //             }

// //         };

// //         fetchLeaderboard();

// //     }, [contestCode]);


// //     // ================================
// //     // LOADING
// //     // ================================
// //     if (loading) {

// //         return (
// //             <Box
// //                 sx={{
// //                     height: "100vh",
// //                     display: "flex",
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                 }}
// //             >

// //                 <CircularProgress />

// //                 <Typography sx={{ ml: 2 }}>
// //                     Loading contest...
// //                 </Typography>

// //             </Box>
// //         );

// //     }


// //     // ================================
// //     // ERROR
// //     // ================================
// //     if (error || !contest) {

// //         return (
// //             <Box
// //                 sx={{
// //                     height: "100vh",
// //                     display: "flex",
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                 }}
// //             >

// //                 <Typography
// //                     color="error"
// //                     variant="h6"
// //                 >
// //                     {error || "Contest not found."}
// //                 </Typography>

// //             </Box>
// //         );

// //     }


// //     // ================================
// //     // CURRENT QUESTION
// //     // ================================
// //     const currentQuestion =
// //         questions[currentQuestionIndex];


// //     return (
// //         <Container
// //             maxWidth={false}
// //             sx={{
// //                 height: "100vh",
// //                 py: 2,
// //                 bgcolor: "#f5f5f5",
// //             }}
// //         >

// //             <Grid
// //                 container
// //                 spacing={2}
// //                 sx={{ height: "100%" }}
// //             >

// //                 {/* =========================
// //                     LEFT SIDE
// //                 ========================= */}

// //                 <Grid item xs={12} md={5}>

// //                     <QuestionPanel
// //                         question={currentQuestion}
// //                         currentQuestionIndex={
// //                             currentQuestionIndex
// //                         }
// //                         totalQuestions={
// //                             questions.length
// //                         }
// //                         participants={participants}

// //                         onNext={() => {

// //                             if (
// //                                 currentQuestionIndex <
// //                                 questions.length - 1
// //                             ) {

// //                                 setCurrentQuestionIndex(
// //                                     currentQuestionIndex + 1
// //                                 );

// //                             }

// //                         }}

// //                         onPrevious={() => {

// //                             if (
// //                                 currentQuestionIndex > 0
// //                             ) {

// //                                 setCurrentQuestionIndex(
// //                                     currentQuestionIndex - 1
// //                                 );

// //                             }

// //                         }}
// //                     />

// //                 </Grid>


// //                 {/* =========================
// //                     RIGHT SIDE
// //                 ========================= */}

// //                 <Grid item xs={12} md={7}>

// //                     <MonacoEditor
// //                         roomId={contestCode}
// //                         questionId={currentQuestion?._id}
// //                     />

// //                 </Grid>

// //             </Grid>

// //         </Container>
// //     );
// // }

// // export default ContestRoom;


// // import { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import { Grid, Container, CircularProgress, Typography, Box } from "@mui/material";
// // import axios from "axios";

// // import QuestionPanel from "../components/contest/QuestionPael.jsx";
// // import MonacoEditor from "../components/contest/MonacoEditor.jsx";

// // import socket from "../socket";

// // function shuffleQuestions(questions) {
// //     const shuffled = [...questions];

// //     for (let i = shuffled.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));

// //         [shuffled[i], shuffled[j]] = [
// //             shuffled[j],
// //             shuffled[i],
// //         ];
// //     }

// //     return shuffled;
// // }

// // function ContestRoom() {

// //     const { contestCode } = useParams();

// //     const [contest, setContest] = useState(null);
// //     const [questions, setQuestions] = useState([]);
// //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState("");

// //     // ================================
// //     // FETCH CONTEST
// //     // ================================
// //     useEffect(() => {

// //         if (!contestCode) return;

// //         const fetchContest = async () => {

// //             try {

// //                 const token = localStorage.getItem("token");

// //                 const response = await axios.get(
// //                     `http://localhost:8000/api/v1/contest/${contestCode}`,
// //                     {
// //                         headers: {
// //                             Authorization: `Bearer ${token}`,
// //                         },
// //                     }
// //                 );

// //                 console.log(
// //                     "✅ Contest data:",
// //                     response.data
// //                 );

// //                 const contestData = response.data.data;

// //                 setContest(contestData);

// //                 // Random order for THIS student
// //                 const shuffledQuestions = shuffleQuestions(
// //                     contestData.questions || []
// //                 );

// //                 console.log(
// //                     "🎲 Questions for this student:",
// //                     shuffledQuestions
// //                 );

// //                 setQuestions(shuffledQuestions);

// //             } catch (err) {

// //                 console.error(
// //                     "❌ Failed to fetch contest:",
// //                     err
// //                 );

// //                 setError(
// //                     err.response?.data?.message ||
// //                     "Failed to load contest."
// //                 );

// //             } finally {

// //                 setLoading(false);

// //             }
// //         };

// //         fetchContest();

// //     }, [contestCode]);


// //     // ================================
// //     // JOIN SOCKET ROOM
// //     // ================================
// //     useEffect(() => {

// //         if (!contestCode) return;

// //         const joinRoom = () => {

// //             socket.emit("joinContest", {
// //                 contestCode,
// //             });

// //             console.log(
// //                 "🟢 Joined contest:",
// //                 contestCode
// //             );

// //         };

// //         if (socket.connected) {

// //             joinRoom();

// //         } else {

// //             socket.once("connect", joinRoom);

// //         }

// //         return () => {

// //             socket.off("connect", joinRoom);

// //         };

// //     }, [contestCode]);


// //     // ================================
// //     // LOADING
// //     // ================================
// //     if (loading) {

// //         return (
// //             <Box
// //                 sx={{
// //                     height: "100vh",
// //                     display: "flex",
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                 }}
// //             >

// //                 <CircularProgress />

// //                 <Typography sx={{ ml: 2 }}>
// //                     Loading contest...
// //                 </Typography>

// //             </Box>
// //         );

// //     }


// //     // ================================
// //     // ERROR
// //     // ================================
// //     if (error || !contest) {

// //         return (
// //             <Box
// //                 sx={{
// //                     height: "100vh",
// //                     display: "flex",
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                 }}
// //             >

// //                 <Typography
// //                     color="error"
// //                     variant="h6"
// //                 >
// //                     {error || "Contest not found."}
// //                 </Typography>

// //             </Box>
// //         );

// //     }


// //     // ================================
// //     // CURRENT QUESTION
// //     // ================================
// //     const currentQuestion =
// //         questions[currentQuestionIndex];


// //     return (
// //         <Container
// //             maxWidth={false}
// //             sx={{
// //                 height: "100vh",
// //                 py: 2,
// //                 bgcolor: "#f5f5f5",
// //             }}
// //         >

// //             <Grid
// //                 container
// //                 spacing={2}
// //                 sx={{ height: "100%" }}
// //             >

// //                 {/* =========================
// //                     LEFT SIDE
// //                 ========================= */}

// //                 <Grid item xs={12} md={5}>

// //                  <QuestionPanel
// //     question={currentQuestion}
// //     currentQuestionIndex={currentQuestionIndex}
// //     totalQuestions={questions.length}
// //     participants={participants}

// //     onNext={() => {

// //         if (
// //             currentQuestionIndex <
// //             questions.length - 1
// //         ) {
// //             setCurrentQuestionIndex(
// //                 currentQuestionIndex + 1
// //             );
// //         }

// //     }}

// //     onPrevious={() => {

// //         if (currentQuestionIndex > 0) {
// //             setCurrentQuestionIndex(
// //                 currentQuestionIndex - 1
// //             );
// //         }

// //     }}
// // />
// //                 </Grid>


// //                 {/* =========================
// //                     RIGHT SIDE
// //                 ========================= */}

// //                 <Grid item xs={12} md={7}>

// //                     <MonacoEditor
// //                         roomId={contestCode}
// //                         questionId={currentQuestion?._id}
// //                     />

// //                 </Grid>

// //             </Grid>

// //         </Container>
// //     );
// // }

// // export default ContestRoom;