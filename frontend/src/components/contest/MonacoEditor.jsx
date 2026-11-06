import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

import {
  Paper,
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  TextField,
} from "@mui/material";

import socket from "../../socket";

function MonacoEditor({ roomId, questionId }) {

  // ==============================
  // LANGUAGE
  // ==============================
  const [language, setLanguage] = useState("java");

  // ==============================
  // CODE
  // ==============================
  const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello DevMeet");
    }
}`);

  // ==============================
  // CUSTOM INPUT
  // ==============================
  const [input, setInput] = useState("");

  // ==============================
  // OUTPUT
  // ==============================
  const [output, setOutput] = useState(
    "Run your code to see the output..."
  );

  // ==============================
  // PENALTY
  // ==============================
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [isPenalty, setIsPenalty] = useState(false);

  // ==============================
  // RUNNING STATE
  // ==============================
  const [isRunning, setIsRunning] = useState(false);

  // ==============================
  // SUBMITTING STATE
  // ==============================
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==============================
  // SOCKET.IO
  // ==============================
  useEffect(() => {

    console.log("🔌 Socket status:", socket.connected);

    const handleConnect = () => {

      console.log("🟢 Socket connected:", socket.id);

      if (roomId) {

        socket.emit("joinContest", {
          contestCode: roomId,
        });

        console.log(
          "🟢 Contest room joined from Monaco:",
          roomId
        );
      }
    };

    const handleDisconnect = () => {
      console.log("🔴 Socket disconnected");
    };

    const handleConnectError = (error) => {

      console.error(
        "❌ Socket connection error:",
        error.message
      );

    };

    const handleCodeOutput = (data) => {

      console.log(
        "📥 Code output received:",
        data
      );

      setIsRunning(false);

      if (data.success) {

        setOutput(
          data.output ||
          "Code executed successfully."
        );

      } else {

        setOutput(
          data.error ||
          "Code execution failed."
        );

      }
    };

    socket.on("connect", handleConnect);

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "codeOutput",
      handleCodeOutput
    );

    // Already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "codeOutput",
        handleCodeOutput
      );

    };

  }, [roomId]);


  // ==============================
  // RUN CODE
  // ==============================
  const handleRun = async () => {

    // Do not run during penalty
    if (isPenalty) {
      return;
    }

    if (!code.trim()) {

      setOutput(
        "Please write some code first."
      );

      return;
    }

    if (!roomId) {

      setOutput(
        "Contest room is missing."
      );

      return;
    }

    if (!socket.connected) {

      setOutput(
        "Socket is not connected. Please wait..."
      );

      console.error(
        "❌ Socket is not connected"
      );

      return;
    }

    try {

      setIsRunning(true);

      setOutput(
        "⏳ Running your code..."
      );

      console.log(
        "🚀 Sending code for execution..."
      );

      console.log({
        language,
        roomId,
        input,
      });

      const response = await axios.post(
       // "http://localhost:8000/api/compile",
       "https://devmeet-backend-t592.onrender.com/api/compile",
        {
          code,
          language,
          roomId,
          input,
        }
      );

      console.log(
        "✅ Compile API response:",
        response.data
      );

    } catch (error) {

      console.error(
        "❌ Run Code Error:",
        error
      );

      setIsRunning(false);

      setOutput(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to run code."
      );

    }
  };


  // ==============================
  // PENALTY TIMER
  // ==============================
  useEffect(() => {

    if (!isPenalty) {
      return;
    }

    const timer = setInterval(() => {

      setPenaltyTime((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          setIsPenalty(false);

          return 0;
        }

        return prev - 1;

      });

    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [isPenalty]);


  // ==============================
  // SUBMIT CODE
  // ==============================
  const handleSubmit = async () => {

    // Do not submit during penalty
    if (isPenalty) {
      return;
    }

    if (!code.trim()) {

      setOutput(
        "Please write some code first."
      );

      return;
    }

    if (!roomId) {

      setOutput(
        "Contest room is missing."
      );

      return;
    }

    if (!questionId) {

      setOutput(
        "Question ID is missing."
      );

      return;
    }

    try {

      setIsSubmitting(true);

      setOutput(
        "⏳ Submitting your solution..."
      );

      const token =
        localStorage.getItem("token");

      if (!token) {

        setOutput(
          "Authentication token not found. Please login again."
        );

        return;
      }

      console.log(
        "🚀 Submitting code..."
      );

      const response = await axios.post(
        //"http://localhost:8000/api/v1/contest/submit",
        "https://devmeet-backend-t592.onrender.com/api/v1/contest/submit",
        {
          contestCode:
            roomId.trim().toUpperCase(),

          questionId,

          code,

          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "✅ FULL RESPONSE:",
        response.data
      );

      const result =
        response.data?.data;

      console.log(
        "📦 RESULT:",
        result
      );

      if (!result) {

        setOutput(
          "❌ Invalid response received from server."
        );

        return;
      }

      // =========================
      // ACCEPTED
      // =========================

      if (result.accepted === true) {

        // =========================
        // ALREADY SOLVED
        // =========================

        if (result.alreadySolved === true) {

          setOutput(
`✅ ALREADY SOLVED!

Score: ${result.score ?? 0}
Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
Wrong Attempts: ${result.wrongAttempts ?? 0}

No additional points awarded.`
          );

        }

        // =========================
        // NEWLY ACCEPTED
        // =========================

        else {

          setOutput(
`🎉 ACCEPTED!

${result.message ?? "All test cases passed."}

Points Earned: +${result.pointsEarned ?? 0}
Total Score: ${result.score ?? 0}
Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
Wrong Attempts: ${result.wrongAttempts ?? 0}`
          );

        }

      }

      // =========================
      // WRONG ANSWER
      // =========================

      else {

        setOutput(
`❌ WRONG ANSWER

Score: ${result.score ?? 0}
Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
Wrong Attempts: ${result.wrongAttempts ?? 0}

⚠️ 1 minute penalty applied.
Editor locked for 1 minute.`
        );

        // =========================
        // START PENALTY
        // =========================

        setIsPenalty(true);

        setPenaltyTime(60);

      }

    } catch (error) {

      console.error(
        "❌ Submit Code Error:",
        error
      );

      console.error(
        "❌ Server Response:",
        error.response?.data
      );

      setOutput(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to submit code."
      );

    } finally {

      setIsSubmitting(false);

    }

  };


  // ==============================
  // LANGUAGE CHANGE
  // ==============================
  const handleLanguageChange = (event) => {

    if (isPenalty) {
      return;
    }

    const newLanguage =
      event.target.value;

    setLanguage(newLanguage);

    if (newLanguage === "java") {

      setCode(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello DevMeet");
    }
}`);

    }

    if (newLanguage === "cpp") {

      setCode(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello DevMeet";
    return 0;
}`);

    }

    if (newLanguage === "c") {

      setCode(`#include <stdio.h>

int main() {
    printf("Hello DevMeet");
    return 0;
}`);

    }

    setOutput(
      "Run your code to see the output..."
    );

  };


  // ==============================
  // UI
  // ==============================
  return (

    <Paper
      elevation={5}
      sx={{
        height: "95vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >

      {/* =========================
          TOP BAR
      ========================= */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >

        <Typography
          variant="h6"
          fontWeight="bold"
        >
          Code Editor
        </Typography>


        <Box
          display="flex"
          gap={2}
          alignItems="center"
        >

          {/* LANGUAGE */}

          <Select
            value={language}
            onChange={
              handleLanguageChange
            }
            size="small"
            disabled={isPenalty}
            sx={{
              minWidth: 120,
            }}
          >

            <MenuItem value="java">
              Java
            </MenuItem>

            <MenuItem value="cpp">
              C++
            </MenuItem>

            <MenuItem value="c">
              C
            </MenuItem>

          </Select>


          {/* RUN */}

          <Button
            variant="outlined"
            onClick={handleRun}
            disabled={
              isRunning ||
              isSubmitting ||
              isPenalty
            }
          >

            {isRunning ? (

              <>

                <CircularProgress
                  size={18}
                  sx={{ mr: 1 }}
                />

                Running...

              </>

            ) : (

              "Run"

            )}

          </Button>


          {/* SUBMIT */}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              isRunning ||
              isSubmitting ||
              isPenalty
            }
          >

            {isSubmitting ? (

              <>

                <CircularProgress
                  size={18}
                  sx={{
                    mr: 1,
                    color: "white",
                  }}
                />

                Submitting...

              </>

            ) : (

              "Submit"

            )}

          </Button>

        </Box>

      </Box>


      {/* =========================
          MONACO EDITOR
      ========================= */}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >

        {/* =========================
            EDITOR
        ========================= */}

        <Box
          sx={{
            width: "100%",
            height: "100%",
            filter: isPenalty
              ? "blur(4px)"
              : "none",

            transition:
              "filter 0.2s ease",
          }}
        >

          <Editor
            height="100%"
            width="100%"
            theme="vs-dark"

            language={
              language === "cpp"
                ? "cpp"
                : language
            }

            value={code}

            onChange={(value) => {

              if (!isPenalty) {

                setCode(
                  value || ""
                );

              }

            }}

            options={{
              fontSize: 15,

              minimap: {
                enabled: false,
              },

              automaticLayout: true,

              padding: {
                top: 12,
              },

              scrollBeyondLastLine:
                false,

              wordWrap: "on",

              readOnly: isPenalty,
            }}
          />

        </Box>


        {/* =========================
            PENALTY POPUP
            CLEAR / NOT BLURRED
        ========================= */}

        {isPenalty && (

          <Box
            sx={{
              position: "absolute",

              top: "50%",
              left: "50%",

              transform:
                "translate(-50%, -50%)",

              zIndex: 9999,

              backgroundColor:
                "rgba(20, 20, 20, 0.98)",

              color: "white",

              padding:
                "24px 35px",

              borderRadius: 3,

              textAlign: "center",

              boxShadow: 6,

              minWidth: 280,

              border:
                "1px solid #555",
            }}
          >

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                mb: 1,
              }}
            >
              ⚠️ PENALTY
            </Typography>


            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Wrong submission!

              <br />

              Editor is temporarily locked.
            </Typography>


            <Typography
              variant="h4"
              fontWeight="bold"
            >
              {Math.floor(
                penaltyTime / 60
              )}
              :
              {String(
                penaltyTime % 60
              ).padStart(2, "0")}
            </Typography>

          </Box>

        )}

      </Box>


      {/* =========================
          CUSTOM INPUT
      ========================= */}

      <Box
        sx={{
          mt: 2,
          flexShrink: 0,
        }}
      >

        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{
            mb: 0.8,
          }}
        >
          CUSTOM INPUT
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={5}

          disabled={isPenalty}

          placeholder={`Example:
5
1 2 4 7 8`}

          value={input}

          onChange={(e) =>
            setInput(
              e.target.value
            )
          }

          size="small"

          sx={{
            "& .MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: 14,
            },
          }}
        />

      </Box>


      {/* =========================
          OUTPUT WINDOW
      ========================= */}

      <Paper
        elevation={2}
        sx={{
          mt: 2,
          p: 2,
          height: 150,
          overflowY: "auto",
          bgcolor: "#1e1e1e",
          color: "#00ff00",
          flexShrink: 0,
        }}
      >

        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{
            color: "#ffffff",
            fontWeight: "bold",
          }}
        >
          OUTPUT
        </Typography>

        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {output}
        </Typography>

      </Paper>

    </Paper>
  );
}

export default MonacoEditor;



// import { useEffect, useState } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";

// import {
//   Paper,
//   Box,
//   Button,
//   MenuItem,
//   Select,
//   Typography,
//   CircularProgress,
//   TextField,
// } from "@mui/material";

// import socket from "../../socket";

// function MonacoEditor({ roomId, questionId }) {

//   // ==============================
//   // LANGUAGE
//   // ==============================
//   const [language, setLanguage] = useState("java");

//   // ==============================
//   // CODE
//   // ==============================
//   const [code, setCode] = useState(`public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello DevMeet");
//     }
// }`);

//   // ==============================
//   // CUSTOM INPUT
//   // ==============================
//   const [input, setInput] = useState("");

//   // ==============================
//   // OUTPUT
//   // ==============================
//   const [output, setOutput] = useState(
//     "Run your code to see the output..."
//   );

//     const [penaltyTime, setPenaltyTime] = useState(0);
// const [isPenalty, setIsPenalty] = useState(false);


//   // ==============================
//   // RUNNING STATE
//   // ==============================
//   const [isRunning, setIsRunning] = useState(false);

//   // ==============================
//   // SUBMITTING STATE
//   // ==============================
//   const [isSubmitting, setIsSubmitting] = useState(false);


//   // ==============================
//   // SOCKET.IO
//   // ==============================
//   useEffect(() => {

//     console.log("🔌 Socket status:", socket.connected);

//     const handleConnect = () => {

//       console.log("🟢 Socket connected:", socket.id);

//       if (roomId) {

//         socket.emit("joinContest", {
//           contestCode: roomId,
//         });

//         console.log(
//           "🟢 Contest room joined from Monaco:",
//           roomId
//         );
//       }
//     };

//     const handleDisconnect = () => {
//       console.log("🔴 Socket disconnected");
//     };

//     const handleConnectError = (error) => {

//       console.error(
//         "❌ Socket connection error:",
//         error.message
//       );

//     };

//     const handleCodeOutput = (data) => {

//       console.log(
//         "📥 Code output received:",
//         data
//       );

//       setIsRunning(false);

//       if (data.success) {

//         setOutput(
//           data.output ||
//           "Code executed successfully."
//         );

//       } else {

//         setOutput(
//           data.error ||
//           "Code execution failed."
//         );

//       }
//     };

//     socket.on("connect", handleConnect);

//     socket.on(
//       "disconnect",
//       handleDisconnect
//     );

//     socket.on(
//       "connect_error",
//       handleConnectError
//     );

//     socket.on(
//       "codeOutput",
//       handleCodeOutput
//     );

//     // Already connected
//     if (socket.connected) {
//       handleConnect();
//     }

//     return () => {

//       socket.off(
//         "connect",
//         handleConnect
//       );

//       socket.off(
//         "disconnect",
//         handleDisconnect
//       );

//       socket.off(
//         "connect_error",
//         handleConnectError
//       );

//       socket.off(
//         "codeOutput",
//         handleCodeOutput
//       );

//     };

//   }, [roomId]);


//   // ==============================
//   // RUN CODE
//   // ==============================
//   const handleRun = async () => {

//     if (!code.trim()) {

//       setOutput(
//         "Please write some code first."
//       );

//       return;
//     }

//     if (!roomId) {

//       setOutput(
//         "Contest room is missing."
//       );

//       return;
//     }

//     if (!socket.connected) {

//       setOutput(
//         "Socket is not connected. Please wait..."
//       );

//       console.error(
//         "❌ Socket is not connected"
//       );

//       return;
//     }

//     try {

//       setIsRunning(true);

//       setOutput(
//         "⏳ Running your code..."
//       );

//       console.log(
//         "🚀 Sending code for execution..."
//       );

//       console.log({
//         language,
//         roomId,
//         input,
//       });

//       const response = await axios.post(
//         "http://localhost:8000/api/compile",
//         {
//           code,
//           language,
//           roomId,
//           input,
//         }
//       );

//       console.log(
//         "✅ Compile API response:",
//         response.data
//       );

//     } catch (error) {

//       console.error(
//         "❌ Run Code Error:",
//         error
//       );

//       setIsRunning(false);

//       setOutput(
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         "Failed to run code."
//       );

//     }
//   };

//   useEffect(() => {
//   if (!isPenalty) return;

//   const timer = setInterval(() => {
//     setPenaltyTime((prev) => {
//       if (prev <= 1) {
//         clearInterval(timer);
//         setIsPenalty(false);
//         return 0;
//       }

//       return prev - 1;
//     });
//   }, 1000);

//   return () => clearInterval(timer);
// }, [isPenalty]);

//   // ==============================
//   // SUBMIT CODE
//   // ==============================
// //   const handleSubmit = async () => {

// //     if (!code.trim()) {

// //       setOutput(
// //         "Please write some code first."
// //       );

// //       return;
// //     }

// //     if (!roomId) {

// //       setOutput(
// //         "Contest room is missing."
// //       );

// //       return;
// //     }

// //     if (!questionId) {

// //       setOutput(
// //         "Question ID is missing."
// //       );

// //       return;
// //     }

// //     try {

// //       setIsSubmitting(true);

// //       setOutput(
// //         "⏳ Submitting your solution..."
// //       );

// //       const token =
// //         localStorage.getItem("token");

// //       if (!token) {

// //         setOutput(
// //           "Authentication token not found. Please login again."
// //         );

// //         setIsSubmitting(false);

// //         return;
// //       }

// //       console.log(
// //         "🚀 Submitting code..."
// //       );

// //       console.log({
// //         contestCode: roomId,
// //         questionId,
// //         language,
// //       });

// //       const response = await axios.post(
// //         "http://localhost:8000/api/v1/contest/submit",
// //         {
// //           contestCode: roomId.trim().toUpperCase(),
// //           questionId,
// //           code,
// //           language,
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       console.log(
// //         "✅ Submit response:",
// //         response.data
// //       );

// //       const result =
// //         response.data.data;

// //       // ==============================
// //       // ACCEPTED
// //       // ==============================
// //       if (result.accepted) {

// //         if (result.alreadySolved) {

// //           setOutput(
// //             `✅ Already Solved!

// // Score: ${result.score}
// // Solved: ${result.solvedCount}/${result.totalQuestions}

// // No additional points awarded.`
// //           );

// //         } else {

// //           setOutput(
// //             `🎉 ACCEPTED!

// // ${result.message}

// // Points Earned: +${result.pointsEarned}
// // Total Score: ${result.score}
// // Solved: ${result.solvedCount}/${result.totalQuestions}
// // Wrong Attempts: ${result.wrongAttempts || 0}`
// //           );

// //         }

// //       }

// //       // ==============================
// //       // WRONG ANSWER
// //       // ==============================
// //       else {

// //         setOutput(
// //           `❌ WRONG ANSWER

// // Score: ${result.score}
// // Solved: ${result.solvedCount}/${result.totalQuestions}
// // Wrong Attempts: ${result.wrongAttempts}

// // Check your code and try again.`
// //         );

// //       }

// //     } catch (error) {

// //       console.error(
// //         "❌ Submit Code Error:",
// //         error
// //       );

// //       setOutput(
// //         error.response?.data?.message ||
// //         error.response?.data?.error ||
// //         "Failed to submit code."
// //       );

// //     } finally {

// //       setIsSubmitting(false);

// //     }
// //   };

// const handleSubmit = async () => {
//   if (!code.trim()) {
//     setOutput("Please write some code first.");
//     return;
//   }

//   if (!roomId) {
//     setOutput("Contest room is missing.");
//     return;
//   }

//   if (!questionId) {
//     setOutput("Question ID is missing.");
//     return;
//   }

//   try {
//     setIsSubmitting(true);
//     setOutput("⏳ Submitting your solution...");

//     const token = localStorage.getItem("token");

//     if (!token) {
//       setOutput(
//         "Authentication token not found. Please login again."
//       );
//       return;
//     }

//     console.log("🚀 Submitting code...");

//     const response = await axios.post(
//       "http://localhost:8000/api/v1/contest/submit",
//       {
//         contestCode: roomId.trim().toUpperCase(),
//         questionId,
//         code,
//         language,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log("✅ FULL RESPONSE:", response.data);

//     // Backend response:
//     // {
//     //   success: true,
//     //   data: {
//     //      accepted: true,
//     //      ...
//     //   }
//     // }

//     const result = response.data?.data;

//     console.log("📦 RESULT:", result);

//     if (!result) {
//       setOutput("❌ Invalid response received from server.");
//       return;
//     }

//     // =========================
//     // ACCEPTED
//     // =========================

//     if (result.accepted === true) {

//       if (result.alreadySolved === true) {

//         setOutput(
// `✅ ALREADY SOLVED!

// Score: ${result.score ?? 0}
// Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
// Wrong Attempts: ${result.wrongAttempts ?? 0}

// No additional points awarded.`
//         );

//       } else {

//         setOutput(
// `🎉 ACCEPTED!

// ${result.message ?? "All test cases passed."}

// Points Earned: +${result.pointsEarned ?? 0}
// Total Score: ${result.score ?? 0}
// Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
// Wrong Attempts: ${result.wrongAttempts ?? 0}`
//         );
//       }

//     }

//     // =========================
//     // WRONG ANSWER
//     // =========================

//     else {

//       setOutput(
// ` WRONG ANSWER

// Score: ${result.score ?? 0}
// Solved: ${result.solvedCount ?? 0}/${result.totalQuestions ?? 0}
// Wrong Attempts: ${result.wrongAttempts ?? 0}



// `
//       );

//       //Start 1 minute penalty
//       setIsPenalty(true);
//       setPenaltyTime(60);
//     }

//   } catch (error) {

//     console.error("❌ Submit Code Error:", error);

//     console.error(
//       "❌ Server Response:",
//       error.response?.data
//     );

//     setOutput(
//       error.response?.data?.error ||
//       error.response?.data?.message ||
//       "Failed to submit code."
//     );

//   } finally {
//     setIsSubmitting(false);
//   }
// };


//   // ==============================
//   // LANGUAGE CHANGE
//   // ==============================
//   const handleLanguageChange = (event) => {

//     const newLanguage =
//       event.target.value;

//     setLanguage(newLanguage);

//     if (newLanguage === "java") {

//       setCode(`public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello DevMeet");
//     }
// }`);

//     }

//     if (newLanguage === "cpp") {

//       setCode(`#include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello DevMeet";
//     return 0;
// }`);

//     }

//     if (newLanguage === "c") {

//       setCode(`#include <stdio.h>

// int main() {
//     printf("Hello DevMeet");
//     return 0;
// }`);

//     }

//     setOutput(
//       "Run your code to see the output..."
//     );

//   };


//   // ==============================
//   // UI
//   // ==============================
//   return (

//     <Paper
//       elevation={5}
//       sx={{
//         height: "95vh",
//         display: "flex",
//         flexDirection: "column",
//         p: 2,
//         borderRadius: 2,
//         overflow: "hidden",
//       }}
//     >

//       {/* =========================
//           TOP BAR
//       ========================= */}

//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//       >

//         <Typography
//           variant="h6"
//           fontWeight="bold"
//         >
//           Code Editor
//         </Typography>


//         <Box
//           display="flex"
//           gap={2}
//           alignItems="center"
//         >

//           {/* LANGUAGE */}

//           <Select
//             value={language}
//             onChange={
//               handleLanguageChange
//             }
//             size="small"
//             sx={{
//               minWidth: 120,
//             }}
//           >

//             <MenuItem value="java">
//               Java
//             </MenuItem>

//             <MenuItem value="cpp">
//               C++
//             </MenuItem>

//             <MenuItem value="c">
//               C
//             </MenuItem>

//           </Select>


//           {/* RUN */}

//           <Button
//             variant="outlined"
//             onClick={handleRun}
//             disabled={
//               isRunning ||
//               isSubmitting
//             }
//           >

//             {isRunning ? (

//               <>
//                 <CircularProgress
//                   size={18}
//                   sx={{ mr: 1 }}
//                 />

//                 Running...
//               </>

//             ) : (

//               "Run"

//             )}

//           </Button>


//           {/* SUBMIT */}

//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={
//               isRunning ||
//               isSubmitting
//             }
//           >

//             {isSubmitting ? (

//               <>
//                 <CircularProgress
//                   size={18}
//                   sx={{
//                     mr: 1,
//                     color: "white",
//                   }}
//                 />

//                 Submitting...
//               </>

//             ) : (

//               "Submit"

//             )}

//           </Button>

//         </Box>

//       </Box>


//       {/* =========================
//           MONACO EDITOR
//       ========================= */}

//       <Box
//         sx={{
//           flex: 1,
//           minHeight: 0,
//           overflow: "hidden",
//           position: "relative",
//     filter: isPenalty ? "blur(4px)" : "none",
//     transition: "filter 0.2s ease",
//         }}
//       >
//          <Box
//     sx={{
//       width: "100%",
//       height: "100%",
//       filter: isPenalty ? "blur(4px)" : "none",
//       transition: "filter 0.2s ease",
//     }}
//   ></Box>

//         <Editor
//           height="100%"
//           width="100%"
//           theme="vs-dark"

//           language={
//             language === "cpp"
//               ? "cpp"
//               : language
//           }

//           value={code}

//           onChange={(value) =>{
//             if(!isPenalty) {
//               setCode(value || "")
//           }
          
//         }}

//           options={{
//             fontSize: 15,

//             minimap: {
//               enabled: false,
//             },

//             automaticLayout: true,

//             padding: {
//               top: 12,
//             },

//             scrollBeyondLastLine: false,

//             wordWrap: "on",

//             readOnly: isPenalty, // Disable editing during penalty
//           }}
//         />

//         </Box>

//          {/* PENALTY POPUP - CLEAR */}
//   {isPenalty && (
//     <Box
//       sx={{
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         zIndex: 20,

//         backgroundColor: "rgba(20, 20, 20, 0.97)",
//         color: "white",

//         padding: "24px 35px",
//         borderRadius: 3,
//         textAlign: "center",
//         boxShadow: 6,

//         minWidth: 280,
//       }}
//     >
//       <Typography
//         variant="h6"
//         fontWeight="bold"
//         sx={{ mb: 1 }}
//       >
//         ⚠️ PENALTY
//       </Typography>

//       <Typography
//         variant="body2"
//         sx={{ mb: 2 }}
//       >
//         Wrong submission!
//         <br />
//         Editor is temporarily locked.
//       </Typography>

//       <Typography
//         variant="h4"
//         fontWeight="bold"
//       >
//         {Math.floor(penaltyTime / 60)}:
//         {String(penaltyTime % 60).padStart(2, "0")}
//       </Typography>
//     </Box>
//   )}


//       {/* =========================
//           CUSTOM INPUT
//       ========================= */}

//       <Box
//         sx={{
//           mt: 2,
//           flexShrink: 0,
//         }}
//       >

//         <Typography
//           variant="subtitle2"
//           fontWeight="bold"
//           sx={{
//             mb: 0.8,
//           }}
//         >
//           CUSTOM INPUT
//         </Typography>

//         <TextField
//           fullWidth
//           multiline
//           minRows={3}
//           maxRows={5}
//           placeholder={`Example:
// 5
// 1 2 4 7 8`}
//           value={input}
//           onChange={(e) =>
//             setInput(e.target.value)
//           }
//           size="small"
//           sx={{
//             "& .MuiInputBase-root": {
//               fontFamily: "monospace",
//               fontSize: 14,
//             },
//           }}
//         />

//       </Box>


//       {/* =========================
//           OUTPUT WINDOW
//       ========================= */}

//       <Paper
//         elevation={2}
//         sx={{
//           mt: 2,
//           p: 2,
//           height: 150,
//           overflowY: "auto",
//           bgcolor: "#1e1e1e",
//           color: "#00ff00",
//           flexShrink: 0,
//         }}
//       >

//         <Typography
//           variant="subtitle2"
//           gutterBottom
//           sx={{
//             color: "#ffffff",
//             fontWeight: "bold",
//           }}
//         >
//           OUTPUT
//         </Typography>

//         <Typography
//           variant="body2"
//           sx={{
//             whiteSpace: "pre-wrap",
//             fontFamily: "monospace",
//           }}
//         >
//           {output}
//         </Typography>

//       </Paper>

//     </Paper>
//   );
// }

// export default MonacoEditor;

