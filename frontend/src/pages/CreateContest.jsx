import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
} from "@mui/material";

import { createContest } from "../services/contestService";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CreateContest() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        duration: 30,
        visibility: "private",
    });

    const [contestCode, setContestCode] = useState("");
    const [loading, setLoading] = useState(false);

    // ======================================
    // HANDLE INPUT CHANGE
    // ======================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    // ======================================
    // CREATE CONTEST
    // ======================================

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);

        const res = await createContest(form);

        console.log("✅ Contest Created:", res.data);

        const contestCode = res.data?.data?.contestCode;

        if (!contestCode) {
            throw new Error("Contest code not received.");
        }

        console.log("🎲 Contest Code:", contestCode);

        // Creator → Contest Room
        navigate(`/contest/${contestCode}`);

    } catch (error) {

        console.error("❌ Create Contest Error:", error);

        alert(
            error.response?.data?.message ||
            error.message ||
            "Something went wrong"
        );

    } finally {
        setLoading(false);
    }
};


    return (
        <>
            <Navbar />
        <Container
            maxWidth="sm"
            sx={{
                mt: 6,
            }}
        >

            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    borderRadius: 3,
                }}
            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    align="center"
                >
                    Create Contest
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    mb={3}
                >
                    Create a new coding contest for your friends.
                </Typography>

                {contestCode && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                        }}
                    >
                        Contest Created Successfully 🎉

                        <br />

                        <strong>
                            Contest Code:
                        </strong>{" "}

                        {contestCode}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    {/* TITLE */}

                    <TextField
                        fullWidth
                        label="Contest Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />

                    {/* DESCRIPTION */}

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        margin="normal"
                    />

                    {/* DURATION */}

                    <TextField
                        fullWidth
                        type="number"
                        label="Duration (Minutes)"
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        margin="normal"
                        inputProps={{
                            min: 5,
                        }}
                        required
                    />

                    {/* VISIBILITY */}

                    <TextField
                        select
                        fullWidth
                        label="Visibility"
                        name="visibility"
                        value={form.visibility}
                        onChange={handleChange}
                        margin="normal"
                    >

                        <MenuItem value="private">
                            Private
                        </MenuItem>

                        <MenuItem value="public">
                            Public
                        </MenuItem>

                    </TextField>

                    {/* CREATE BUTTON */}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            backgroundColor: "#1976d2",
                            "&:hover": {
                                backgroundColor: "#1565c0",
                            },
                        }}
                    >

                        {loading
                            ? "Creating Contest..."
                            : "Create Contest"}

                    </Button>

                </Box>

            </Paper>

        </Container>
        <Footer />
        </>
    );
}

export default CreateContest;


