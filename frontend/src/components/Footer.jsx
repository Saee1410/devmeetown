
import React from "react";
import {
    Box,
    Typography,
    Stack,
    Link,
    Divider
} from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CodeIcon from "@mui/icons-material/Code";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#101828",
                color: "#ffffff",
                px: { xs: 3, md: "4rem" },
                pt: 5,
                pb: 2,
                width: "100%",
                mt: "auto",
                flexShrink: 0,
                boxSizing: "border-box",
            }}
        >

            {/* Footer Main Content */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 4,
                    mb: 4,
                }}
            >

                {/* Brand Section */}
                <Box sx={{ maxWidth: 350 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            color: "#ffffff",
                        }}
                    >
                        Dev
                        <span style={{ color: "#ff9a00" }}>
                            Meet
                        </span>
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "#aab4c3",
                            lineHeight: 1.8,
                        }}
                    >
                        A platform for developers to connect,
                        collaborate, participate in coding contests
                        and improve their programming skills together.
                    </Typography>
                </Box>

                {/* Quick Links */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        Quick Links
                    </Typography>

                    <Stack spacing={1}>
                        <Link href="/" underline="none" sx={linkStyle}>
                            Home
                        </Link>

                        <Link href="/home" underline="none" sx={linkStyle}>
                            Dashboard
                        </Link>

                        <Link href="/contestcode" underline="none" sx={linkStyle}>
                            Contests
                        </Link>

                        <Link href="/auth" underline="none" sx={linkStyle}>
                            Login / Register
                        </Link>
                    </Stack>
                </Box>

                {/* Connect Section */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        Connect With Us
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <Link
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={iconStyle}
                        >
                            <GitHubIcon />
                        </Link>

                        <Link
                            href="https://linkedin.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={iconStyle}
                        >
                            <LinkedInIcon />
                        </Link>

                        <Link
                            href="https://leetcode.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={iconStyle}
                        >
                            <CodeIcon />
                        </Link>
                    </Stack>
                </Box>

            </Box>

            <Divider
                sx={{
                    borderColor: "rgba(255,255,255,0.15)",
                    mb: 2,
                }}
            />

            {/* Copyright */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    textAlign: "center",
                    gap: 1,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ color: "#aab4c3" }}
                >
                    © 2026 DevMeet. All Rights Reserved.
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: "#ff9a00" }}
                >
                    | Connect. Code. Compete.
                </Typography>
            </Box>

        </Box>
    );
};

const linkStyle = {
    color: "#aab4c3",
    fontSize: "0.9rem",
    "&:hover": {
        color: "#ff9a00",
    },
};

const iconStyle = {
    color: "#ffffff",
    "&:hover": {
        color: "#ff9a00",
        transform: "translateY(-3px)",
    },
    transition: "0.3s",
};

export default Footer;
