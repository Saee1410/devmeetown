import {AppBar, Toolbar, Typography, Button, Grid, Card, CardContent, Container} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";

import {useNavigate} from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>

            <AppBar position="static">
                <Toolbar>
                    <Typography variant='h5' sx={{ flexGrow: 1 }}>
                       DeevMeet
                    </Typography>

                  <Button
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 5}}>
                <Typography variant="h4" align="center" gutterBottom>
                    Welcome {user?.name}!
                </Typography>

                <Typography align="center" color="text.secondary">
                    Start or join a coding Contest
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                cursor: "pointer",
                                transition: "transform 0.3s",
                                "&:hover": {

                                transform: "scale(1.05)",
                            },
                        }}
                        onClick={() => navigate("/create-contest")}
                        >
                            <CardContent sx={{ textAlign: "center", py: 6}}>
                                <AddCircleIcon sx={{ fontSize: 70}} color="primary" />

                                <Typography variant="h5" sx={{ mt: 2}}>
                                    Create Contest
                                </Typography>

                                <Typography color="text.secondary">
                                    Create a new coding contest.
                                </Typography>
                            </CardContent>
                        </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card 
                        sx={{
                            cursor: "pointer",
                            transition: "transform 0.3s",
                            "&:hover": {
                                transform: "scale(1.05)",
                            },
                        }}
                        onClick={() => navigate("/join-contest")}
                        >
                            <CardContent sx={{ textAlign: "center", py: 6}}>
                                <GroupIcon sx={{ fontSize: 70}} color="primary" />

                                <Typography variant="h5" sx={{ mt: 2}}>
                                    Join Contest
                                </Typography>

                                <Typography color="text.secondary">
                                    Join an existing coding contest.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

        </>
    )
}

export default Dashboard;