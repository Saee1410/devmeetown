import {
    Paper,
    Typography,
    Divider,
    Box,
    List,
    ListItem,
    Avatar,
} from "@mui/material";

function Leaderboard({ participants = [] }) {

    const sortedParticipants = [...participants].sort(
        (a, b) => b.score - a.score
    );

    return (
        <Paper
            elevation={4}
            sx={{
                mt: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: "#ffffff",
            }}
        >

            {/* HEADER */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                }}
            >

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                        color: "#1f2937",
                    }}
                >
                    🏆 Leaderboard
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#6b7280",
                    }}
                >
                    {participants.length}/5 Players
                </Typography>

            </Box>

            <Divider />

            {/* NO PARTICIPANTS */}
            {sortedParticipants.length === 0 ? (

                <Box
                    sx={{
                        py: 4,
                        textAlign: "center",
                    }}
                >

                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                        }}
                    >
                        No participants yet
                    </Typography>

                </Box>

            ) : (

                <List disablePadding>

                    {sortedParticipants.map(
                        (participant, index) => {

                            // ✅ REAL USER DATA
                            const user =
                                participant.user;

                            const userName =
                                user?.name ||
                                "Unknown User";

                            const solved =
                                participant
                                    .solvedQuestions
                                    ?.length || 0;

                            const score =
                                participant.score || 0;

                            return (

                                <ListItem
                                    key={
                                        participant._id ||
                                        index
                                    }
                                    sx={{
                                        px: 1,
                                        py: 1.2,

                                        borderBottom:
                                            index !==
                                            sortedParticipants.length - 1
                                                ? "1px solid #eeeeee"
                                                : "none",
                                    }}
                                >

                                    {/* RANK */}
                                    <Typography
                                        sx={{
                                            width: 35,
                                            fontWeight: "bold",
                                            color: "#6b7280",
                                        }}
                                    >
                                        {index + 1}
                                    </Typography>


                                    {/* AVATAR */}
                                    <Avatar
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            mr: 1.5,
                                            bgcolor: "#2563eb",
                                            fontSize: 16,
                                        }}
                                    >
                                        {userName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Avatar>


                                    {/* USER INFO */}
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                        }}
                                    >

                                        <Typography
                                            variant="body1"
                                            fontWeight="600"
                                            sx={{
                                                color: "#111827",
                                            }}
                                        >
                                            {userName}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#6b7280",
                                            }}
                                        >
                                            {solved}{" "}
                                            {solved === 1
                                                ? "Problem"
                                                : "Problems"}{" "}
                                            Solved
                                        </Typography>

                                    </Box>


                                    {/* SCORE */}
                                    <Box
                                        sx={{
                                            textAlign: "right",
                                        }}
                                    >

                                        <Typography
                                            fontWeight="bold"
                                            sx={{
                                                color: "#2563eb",
                                            }}
                                        >
                                            {score}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#6b7280",
                                            }}
                                        >
                                            Points
                                        </Typography>

                                    </Box>

                                </ListItem>
                            );
                        }
                    )}

                </List>
            )}

        </Paper>
    );
}

export default Leaderboard;


// import {
//   Paper,
//   Typography,
//   Divider,
//   Box,
//   List,
//   ListItem,
//   Avatar,
// } from "@mui/material";

// function Leaderboard({ participants = [] }) {
//   // Highest score first
//   const sortedParticipants = [...participants].sort(
//     (a, b) => b.score - a.score
//   );

//   return (
//     <Paper
//       elevation={4}
//       sx={{
//         mt: 2,
//         p: 2.5,
//         borderRadius: 2,
//         bgcolor: "#ffffff",
//       }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 1.5,
//         }}
//       >
//         <Typography
//           variant="h6"
//           fontWeight="bold"
//           sx={{ color: "#1f2937" }}
//         >
//           🏆 Leaderboard
//         </Typography>

//         <Typography
//           variant="body2"
//           sx={{ color: "#6b7280" }}
//         >
//           {participants.length}/5 Players
//         </Typography>
//       </Box>

//       <Divider />

//       {/* Empty State */}
//       {sortedParticipants.length === 0 ? (
//         <Box
//           sx={{
//             py: 4,
//             textAlign: "center",
//           }}
//         >
//           <Typography
//             variant="body2"
//             sx={{ color: "#6b7280" }}
//           >
//             No participants yet
//           </Typography>
//         </Box>
//       ) : (
//         <List disablePadding>
//           {sortedParticipants.map((user, index) => (
//             <ListItem
//               key={user.userId || user._id || index}
//               sx={{
//                 px: 1,
//                 py: 1.2,
//                 borderBottom:
//                   index !== sortedParticipants.length - 1
//                     ? "1px solid #eeeeee"
//                     : "none",
//               }}
//             >
//               {/* Rank */}
//               <Typography
//                 sx={{
//                   width: 35,
//                   fontWeight: "bold",
//                   color:
//                     index === 0
//                       ? "#d4af37"
//                       : index === 1
//                       ? "#9ca3af"
//                       : index === 2
//                       ? "#cd7f32"
//                       : "#6b7280",
//                 }}
//               >
//                 {index + 1}
//               </Typography>

//               {/* Avatar */}
//               <Avatar
//                 sx={{
//                   width: 38,
//                   height: 38,
//                   mr: 1.5,
//                   bgcolor: "#2563eb",
//                   fontSize: 16,
//                 }}
//               >
//                 {user.name?.charAt(0)?.toUpperCase() || "U"}
//               </Avatar>

//               {/* Name */}
//               <Box sx={{ flexGrow: 1 }}>
//                 <Typography
//                   variant="body1"
//                   fontWeight="600"
//                   sx={{ color: "#111827" }}
//                 >
//                   {user.name || "Unknown User"}
//                 </Typography>

//                 <Typography
//                   variant="caption"
//                   sx={{ color: "#6b7280" }}
//                 >
//                   {user.solved || 0} Problems Solved
//                 </Typography>
//               </Box>

//               {/* Score */}
//               <Box sx={{ textAlign: "right" }}>
//                 <Typography
//                   fontWeight="bold"
//                   sx={{ color: "#2563eb" }}
//                 >
//                   {user.score || 0}
//                 </Typography>

//                 <Typography
//                   variant="caption"
//                   sx={{ color: "#6b7280" }}
//                 >
//                   Points
//                 </Typography>
//               </Box>
//             </ListItem>
//           ))}
//         </List>
//       )}
//     </Paper>
//   );
// }

// export default Leaderboard;