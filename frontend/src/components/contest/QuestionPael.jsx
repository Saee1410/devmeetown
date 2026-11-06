import {
    Paper,
    Typography,
    Divider,
    Box,
    Chip,
    Button,
} from "@mui/material";

import Timer from "./Timer";
import Leaderboard from "../contest/Leaderboard.jsx";

function QuestionPanel({
    question,
    contest,
    currentQuestionIndex,
    totalQuestions,
    onNext,
    onPrevious,
    participants,
}) {

    // Question load होईपर्यंत
    if (!question) {
        return (
            <Paper
                elevation={5}
                sx={{
                    height: "95vh",
                    p: 3,
                }}
            >
                <Typography>
                    Loading question...
                </Typography>
            </Paper>
        );
    }

    // Points based on difficulty
    const pointsMap = {
        Easy: 100,
        Medium: 200,
        Hard: 300,
    };

    const points =
        pointsMap[question.difficulty] || 100;

    // First example
    const example = question.examples?.[0];

    return (
        <Paper
            elevation={5}
            sx={{
                height: "95vh",
                p: 3,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
            }}
        >

            {/* =========================
                HEADER
            ========================= */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                >
                    {question.title}
                </Typography>

                <Timer
    isRunning={contest?.status === "running"}
    startTime={contest?.startTime}
    duration={contest?.duration || 30}
/>

            </Box>


            {/* =========================
                QUESTION NUMBER
            ========================= */}

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
            >
                Question {currentQuestionIndex + 1} / {totalQuestions}
            </Typography>


            {/* =========================
                DIFFICULTY + POINTS
            ========================= */}

            <Box mt={1}>

                <Chip
                    label={question.difficulty}
                    color="success"
                    sx={{ mr: 2 }}
                />

                <Chip
                    label={`${points} Points`}
                    color="primary"
                />

            </Box>


            <Divider sx={{ my: 3 }} />


            {/* =========================
                DESCRIPTION
            ========================= */}

            <Typography
                variant="body1"
                sx={{
                    lineHeight: 1.7,
                }}
            >
                {question.description}
            </Typography>


            {/* =========================
                EXAMPLE
            ========================= */}

            {example && (
                <Box mt={3}>

                    <Typography
                        fontWeight="bold"
                        variant="h6"
                    >
                        Example
                    </Typography>

                    <Typography mt={2}>
                        <b>Input:</b>
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                        }}
                    >
                        {example.input}
                    </Typography>


                    <Typography mt={2}>
                        <b>Output:</b>
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                        }}
                    >
                        {example.output}
                    </Typography>


                    {example.explanation && (
                        <>
                            <Typography mt={2}>
                                <b>Explanation:</b>
                            </Typography>

                            <Typography
                                sx={{ mt: 0.5 }}
                            >
                                {example.explanation}
                            </Typography>
                        </>
                    )}

                </Box>
            )}


            {/* =========================
                CONSTRAINTS
            ========================= */}

            {question.constraints && (
                <Box mt={3}>

                    <Typography
                        fontWeight="bold"
                        variant="h6"
                    >
                        Constraints
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {question.constraints}
                    </Typography>

                </Box>
            )}


            {/* =========================
                PUSH CONTENT DOWN
            ========================= */}

            <Box sx={{ flexGrow: 1 }} />


            <Divider sx={{ my: 2 }} />


            {/* =========================
                NEXT / PREVIOUS
            ========================= */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                }}
            >

                <Button
                    variant="outlined"
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>


                <Button
                    variant="contained"
                    onClick={onNext}
                    disabled={
                        currentQuestionIndex ===
                        totalQuestions - 1
                    }
                >
                    Next
                </Button>

            </Box>


            {/* =========================
                LEADERBOARD
            ========================= */}

            <Leaderboard participants={participants} />

        </Paper>
    );
}

export default QuestionPanel;