import {
  Box,
  Typography,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Link } from "react-router-dom";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navLinkStyle = {
    textDecoration: "none",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "1rem",
    transition: "0.3s",
    "&:hover": {
      color: "#ff9a00",
    },
  };

  return (
    <Box
      component="nav"
      sx={{
        px: { xs: 2, md: "4rem" },
        py: "1.2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        backgroundColor: "#101828",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Logo / Brand */}
      <Box className="navHeader">
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "0.5px",
          }}
        >
          Dev<Typography
            component="span"
            sx={{
              color: "#ff9a00",
              fontSize: "inherit",
              fontWeight: 800,
            }}
          >
            Meet
          </Typography>
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 3 }}
        alignItems="center"
        flexWrap="wrap"
      >
        <Link to="/contestcode" style={navLinkStyle}>
          Contest
        </Link>

        <Link to="/register" style={navLinkStyle}>
          Register
        </Link>

        <Link to="/about" style={navLinkStyle}>
          About
        </Link>

        {/* Login Button */}
        <Button
          component={Link}
          to="/auth"
          variant="contained"
          sx={{
            px: "1.5rem",
            py: "0.65rem",
            borderRadius: "8px",
            backgroundColor: "#ff9a00",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#e88900",
              boxShadow: "0 4px 15px rgba(255,154,0,0.3)",
            },
          }}
        >
          Login
        </Button>
      </Stack>
    </Box>
  );
};

export default Navbar;
