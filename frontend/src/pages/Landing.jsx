
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import homeImg from "../assets/home.jpg";
import bgImg from "../assets/bg2.jpg";

export const Landing = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          px: { xs: 2, md: "4rem" },
          py: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box className="navHeader">
          <Typography
            variant="h5"
            sx={{ fontSize: "2rem", fontWeight: 700 }}
          >
            Developer's Meet
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 3 }}
          alignItems="center"
        >
          <Link to="/contestcode" style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": { color: "#ff9a00" },
              }}
            >
              Contest
            </Typography>
          </Link>

          <Link to="/register" style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": { color: "#ff9a00" },
              }}
            >
              Register
            </Typography>
          </Link>

          <Button
            component={Link}
            to="/auth"
            variant="contained"
            sx={{
              px: "1.5rem",
              py: "0.7rem",
              borderRadius: "8px",
              backgroundColor: "#ff9a00",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#e88900",
              },
            }}
          >
            Login
          </Button>
        </Stack>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, md: "6rem" },
          py: { xs: 4, md: 3 },
          gap: "4rem",
          flexDirection: { xs: "column", md: "row" },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        {/* Left Content */}
        <Box sx={{ flex: 1, maxWidth: "650px" }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            <Box component="span" sx={{ color: "#ff9a00" }}>
              Behind
            </Box>{" "}
            every successful developer was once a student waiting for their
            chance.
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              color: "#d6d6d6",
              mb: 4,
            }}
          >
            Transforming potential into profession.
          </Typography>

          <Box>
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              sx={{
                px: "2rem",
                py: "1rem",
                borderRadius: "10px",
                backgroundColor: "#ff9a00",
                color: "white",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                transition: "0.3s ease",
                "&:hover": {
                  backgroundColor: "#e88900",
                  transform: "translateY(-3px)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>

        {/* Right Image */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            component="img"
            src={homeImg}
            alt="Developer"
            sx={{
              width: "100%",
              maxWidth: "650px",
              height: "auto",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;



// import "./landing.css";
// import { Link } from "react-router-dom";
// import homeImg from "../assets/home.jpg";

// export const Landing = () => {
 

//   return (
//     <div className="landingPageContainer">
//       <nav>
//         <div className="navHeader">
//           <h2>Developer's Meet</h2>
//         </div>

//         <div className="navlist">
          
//           <Link to="/contest">
//             <p>Contest</p>
//           </Link>
//           <p>Register</p>
//           <Link to="/auth">
//             <button>Login</button>
//           </Link>
//         </div>
//       </nav>

//       <div className="landingMainContainer">
//         <div className="Text">
//           <h1>
//             <span>Behind</span> every successful developer was once a student
//             waiting for their chance.
//           </h1>

//           <p>Transforming potential into profession.</p>

//           <div className="btn">
//             <Link to="/auth">
//               <button>Get Started</button>
//             </Link>
//           </div>
//         </div>

//         <div className="img">
//           <img src={homeImg} alt="Developer" />
//         </div>
//       </div>
//     </div>
//   );
// };




