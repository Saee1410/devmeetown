import { Box, Button, Typography, Container } from "@mui/material";
import { Link } from "react-router-dom";

import contestImg from "../assets/code2.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ContestPage = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, #101828, #263449)",
            }}
        >
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: { xs: 2, sm: 3, md: 4 },
                }}
            >
                <Container maxWidth="md" disableGutters>

                    {/* Contest Card */}
                    <Box
                        sx={{
                            width: "100%",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
                            backgroundColor: "#ffffff",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-5px)",
                            },
                        }}
                    >

                        {/* Contest Image */}
                        <Box
                            component="img"
                            src={contestImg}
                            alt="Coding Contest"
                            sx={{
                                width: "100%",
                                height: {
                                    xs: "220px",
                                    sm: "300px",
                                    md: "400px",
                                },
                                objectFit: "cover",
                                display: "block",
                            }}
                        />

                        {/* Title Section */}
                        <Box
                            sx={{
                                textAlign: "center",
                                px: 2,
                                pt: 4,
                                pb: 3,
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: "#172033",
                                    fontSize: {
                                        xs: "24px",
                                        sm: "30px",
                                        md: "36px",
                                    },
                                }}
                            >
                                Welcome to Developer's Meet
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#667085",
                                    mt: 1.5,
                                    fontSize: "15px",
                                }}
                            >
                                Create your own coding contest or join an
                                existing contest and compete with developers.
                            </Typography>
                        </Box>

                        {/* Buttons Section */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                },
                                gap: 2,
                                px: { xs: 2, sm: 4 },
                                pb: 4,
                            }}
                        >
                            {/* Create Contest */}
                            <Button
                                component={Link}
                                to="/contest"
                                variant="contained"
                                fullWidth
                                sx={{
                                    py: 1.8,
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    backgroundColor: "#ff9a00",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "#e88900",
                                        boxShadow: "0 5px 15px rgba(255,154,0,0.3)",
                                    },
                                }}
                            >
                                Create Contest
                            </Button>

                            {/* Join Contest */}
                            <Button
                                component={Link}
                                to="/contest/join"
                                variant="contained"
                                fullWidth
                                sx={{
                                    py: 1.8,
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    backgroundColor: "#1976d2",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "#125aa0",
                                        boxShadow: "0 5px 15px rgba(25,118,210,0.3)",
                                    },
                                }}
                            >
                                Join Contest
                            </Button>
                        </Box>

                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Footer />

        </Box>
    );
};

export default ContestPage;


