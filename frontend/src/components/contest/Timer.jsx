import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

function Timer({ isRunning, duration = 30, startTime }) {

    const [timeLeft, setTimeLeft] =
        useState(duration * 60);

    useEffect(() => {

        // Contest start झालेला नसेल
        if (!isRunning || !startTime) {
            setTimeLeft(duration * 60);
            return;
        }

        const durationInSeconds =
            duration * 60;

        const updateTimer = () => {

            const start =
                new Date(startTime).getTime();

            const now = Date.now();

            const elapsedSeconds =
                Math.floor(
                    (now - start) / 1000
                );

            const remaining =
                Math.max(
                    durationInSeconds - elapsedSeconds,
                    0
                );

            setTimeLeft(remaining);
        };

        // Immediately calculate
        updateTimer();

        const timer =
            setInterval(updateTimer, 1000);

        return () =>
            clearInterval(timer);

    }, [isRunning, startTime, duration]);

    const minutes =
        String(
            Math.floor(timeLeft / 60)
        ).padStart(2, "0");

    const seconds =
        String(
            timeLeft % 60
        ).padStart(2, "0");

    return (
        <Typography
            variant="h5"
            fontWeight="bold"
            color={
                timeLeft <= 300
                    ? "error"
                    : "primary"
            }
        >
            ⏱ {minutes}:{seconds}
        </Typography>
    );
}

export default Timer;


// import { useEffect, useState } from "react";
// import { Typography } from "@mui/material";

// function Timer() {
//   const [timeLeft, setTimeLeft] = useState(30 * 60);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           return 0;
//         }

//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
//   const seconds = String(timeLeft % 60).padStart(2, "0");

//   return (
//     <Typography
//       variant="h5"
//       fontWeight="bold"
//       color={timeLeft <= 300 ? "error" : "primary"}
//     >
//       ⏱ {minutes}:{seconds}
//     </Typography>
//   );
// }

// export default Timer;











// import { useEffect, useState } from "react";
// import { Paper, Typography } from "@mui/material";

// function Timer() {
//     const [timeLeft, setTimeLeft] = useState(30 * 60);

//     useEffect(() => {
//         const timer = setInterval(() => {
//             setTimeLeft((prev) => {
//                 if (prev <= 1){
//                     clearInterval(timer);
//                     return 0;
//                 }

//                 return prev - 1;
//             });
//     }, 1000);
    
//     return () => clearInterval(timer);
// }, []);

// const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
//   const seconds = String(timeLeft % 60).padStart(2, "0");

//   return (
//     <Paper 
//       elevation={3}
//       sx={{
//         mb: 2,
//         p: 2,
//         textAlign: "center",
//       }}
//       >
//           <Typography
//         variant="h5"
//         fontWeight="bold"
//         color={timeLeft <= 300 ? "error" : "primary"}
//       >
//         ⏱ {minutes}:{seconds}
//       </Typography>
//       </Paper>
//   );
// }

// export default Timer;