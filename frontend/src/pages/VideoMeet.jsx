import { useEffect, useRef, useState, useCallback } from 'react';
import io from "socket.io-client";

import {
    Badge,
    IconButton,
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Avatar
} from '@mui/material';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

import styles from "../styles/videoComponent.module.css";
import server from '../environment';
import MyCodeEditor from './MyCodeEditor';

const server_url = server;

const peerConfigConnections = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

export default function VideoMeetComponent() {

    // Refs
    const socketRef = useRef(null);
    const socketIdRef = useRef(null);
    const localVideoref = useRef(null);
    const connectionsRef = useRef({});
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);

    // Media states
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);

    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    // Chat states
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [activeTab, setActiveTab] = useState("chat");

    // Other states
    const [code, setCode] = useState("// Start coding here...");
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);
    const [showModal, setModal] = useState(false);

    // Keep latest videos in ref
    const videoRef = useRef([]);

    // -------------------------------
    // CLEANUP PEER
    // -------------------------------

    const cleanupPeer = useCallback((id) => {

        const peer = connectionsRef.current[id];

        if (peer) {
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.close();

            delete connectionsRef.current[id];
        }

        setVideos(prev => {
            const updated = prev.filter(
                item => item.socketId !== id
            );

            videoRef.current = updated;
            return updated;
        });

    }, []);

    // -------------------------------
    // ADD REMOTE VIDEO
    // -------------------------------

    const addVideoStream = useCallback((id, stream) => {

        setVideos(prev => {

            const existing = prev.find(
                item => item.socketId === id
            );

            let updated;

            if (existing) {

                updated = prev.map(item =>
                    item.socketId === id
                        ? { ...item, stream }
                        : item
                );

            } else {

                updated = [
                    ...prev,
                    {
                        socketId: id,
                        stream
                    }
                ];

            }

            videoRef.current = updated;

            return updated;
        });

    }, []);

    // -------------------------------
    // SEND WEBRTC SIGNAL
    // -------------------------------

    const sendSignal = useCallback(async (id, data) => {

        const socket = socketRef.current;

        if (!socket?.connected) return;

        socket.emit(
            'signal',
            id,
            JSON.stringify(data)
        );

    }, []);

    // -------------------------------
    // CREATE PEER CONNECTION
    // -------------------------------

    const createPeerConnection = useCallback((id) => {

        if (connectionsRef.current[id]) {
            return connectionsRef.current[id];
        }

        const peer = new RTCPeerConnection(
            peerConfigConnections
        );

        connectionsRef.current[id] = peer;

        const stream = localStreamRef.current;

        if (stream) {

            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });

        }

        peer.onicecandidate = (event) => {

            if (event.candidate) {

                sendSignal(id, {
                    ice: event.candidate
                });

            }

        };

        peer.ontrack = (event) => {

            const remoteStream = event.streams?.[0];

            if (remoteStream) {
                addVideoStream(id, remoteStream);
            }

        };

        peer.onconnectionstatechange = () => {

            if (
                peer.connectionState === "failed" ||
                peer.connectionState === "closed"
            ) {
                cleanupPeer(id);
            }

        };

        return peer;

    }, [addVideoStream, cleanupPeer, sendSignal]);

    // -------------------------------
    // CREATE OFFER
    // -------------------------------

    const createOffer = useCallback(async (id) => {

        try {

            const peer = createPeerConnection(id);

            const offer = await peer.createOffer();

            await peer.setLocalDescription(offer);

            await sendSignal(id, {
                sdp: peer.localDescription
            });

        } catch (error) {

            console.error("Offer Error:", error);

        }

    }, [createPeerConnection, sendSignal]);

    // -------------------------------
    // RECEIVE WEBRTC SIGNAL
    // -------------------------------

    const gotMessageFromServer = useCallback(async (fromId, messageData) => {

        try {

            if (fromId === socketIdRef.current) return;

            const signal =
                typeof messageData === "string"
                    ? JSON.parse(messageData)
                    : messageData;

            const peer = createPeerConnection(fromId);

            if (signal.sdp) {

                const description =
                    new RTCSessionDescription(signal.sdp);

                await peer.setRemoteDescription(description);

                if (description.type === "offer") {

                    const answer = await peer.createAnswer();

                    await peer.setLocalDescription(answer);

                    await sendSignal(fromId, {
                        sdp: peer.localDescription
                    });

                }

            }

            if (signal.ice) {

                const candidate =
                    new RTCIceCandidate(signal.ice);

                if (peer.remoteDescription) {
                    await peer.addIceCandidate(candidate);
                }

            }

        } catch (error) {

            console.error("Signal Error:", error);

        }

    }, [createPeerConnection, sendSignal]);

    // -------------------------------
    // GET PERMISSIONS
    // -------------------------------

    const getPermissions = async () => {

        if (!navigator.mediaDevices?.getUserMedia) {

            setVideoAvailable(false);
            setAudioAvailable(false);

            return;
        }

        let cameraAvailable = false;
        let microphoneAvailable = false;

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

            cameraAvailable =
                stream.getVideoTracks().length > 0;

            microphoneAvailable =
                stream.getAudioTracks().length > 0;

            stream.getTracks().forEach(track => track.stop());

        } catch (error) {

            console.error("Permission Error:", error);

        }

        setVideoAvailable(cameraAvailable);
        setAudioAvailable(microphoneAvailable);

        setVideo(cameraAvailable);
        setAudio(microphoneAvailable);

        setScreenAvailable(
            !!navigator.mediaDevices.getDisplayMedia
        );

    };

    // -------------------------------
    // COMPONENT CLEANUP
    // -------------------------------

    useEffect(() => {

        getPermissions();

        return () => {

            Object.values(connectionsRef.current).forEach(peer => {
                peer.close();
            });

            connectionsRef.current = {};

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(
                    track => track.stop()
                );
            }

            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(
                    track => track.stop()
                );
            }

            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

        };

    }, []);

    // -------------------------------
    // SOCKET CONNECTION
    // -------------------------------

    const connectToSocketServer = () => {

        if (socketRef.current) return;

        const socket = io(server_url, {
            transports: ["websocket", "polling"],
            reconnection: true
        });

        socketRef.current = socket;

        socket.on("connect", () => {

            console.log("Socket Connected:", socket.id);

            socketIdRef.current = socket.id;

            // Join meeting room
            socket.emit(
                "join-call",
                window.location.href
            );

        });

        // User joined
        socket.on("user-joined", async (id, clients) => {

            console.log("User Joined:", id, clients);

            if (!Array.isArray(clients)) return;

            for (const clientId of clients) {

                if (clientId === socket.id) continue;

                createPeerConnection(clientId);

                if (socket.id === id) {
                    await createOffer(clientId);
                }

            }

        });

        // WebRTC signaling
        socket.on("signal", gotMessageFromServer);

        // User left
        socket.on("user-left", (id) => {

            cleanupPeer(id);

        });

        // -------------------------------
        // CHAT RECEIVE
        // -------------------------------

        socket.on("chat-message", (data) => {

            console.log("Received Chat:", data);

            if (!data) return;

            setMessages(prev => [
                ...prev,
                {
                    sender: data.sender || "User",
                    data: data.message || ""
                }
            ]);

            if (data.senderId !== socket.id) {

                setNewMessages(prev => prev + 1);

            }

        });

        // Code update
        socket.on("code-update", (updatedCode) => {

            setCode(updatedCode);

        });

        socket.on("connect_error", (error) => {

            console.error("Socket Error:", error);

        });

        socket.on("disconnect", (reason) => {

            console.log("Socket Disconnected:", reason);

        });

    };

    // -------------------------------
    // GET USER MEDIA
    // -------------------------------

    const getMedia = async () => {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable && video,
                    audio: audioAvailable && audio
                });

            localStreamRef.current = stream;

            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }

            connectToSocketServer();

        } catch (error) {

            console.error("Camera Error:", error);

            alert(
                "Please allow camera and microphone permissions."
            );

        }

    };

    // -------------------------------
    // VIDEO ON / OFF
    // -------------------------------

    const handleVideo = () => {

        if (screen) return;

        const nextValue = !video;

        setVideo(nextValue);

        localStreamRef.current
            ?.getVideoTracks()
            .forEach(track => {
                track.enabled = nextValue;
            });

    };

    // -------------------------------
    // AUDIO ON / OFF
    // -------------------------------

    const handleAudio = () => {

        const nextValue = !audio;

        setAudio(nextValue);

        localStreamRef.current
            ?.getAudioTracks()
            .forEach(track => {
                track.enabled = nextValue;
            });

    };

    // -------------------------------
    // SCREEN SHARING
    // -------------------------------

    const getDisplayMedia = async () => {

        try {

            if (!navigator.mediaDevices.getDisplayMedia) return;

            const stream =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });

            screenStreamRef.current = stream;

            const screenTrack = stream.getVideoTracks()[0];

            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }

            for (const [id, peer] of Object.entries(connectionsRef.current)) {

                const sender = peer.getSenders().find(
                    item => item.track?.kind === "video"
                );

                if (sender) {
                    await sender.replaceTrack(screenTrack);
                }

            }

            screenTrack.onended = () => {

                setScreen(false);

                stopScreenSharing();

            };

        } catch (error) {

            console.error("Screen Sharing Error:", error);

            setScreen(false);

        }

    };

    const stopScreenSharing = async () => {

        if (screenStreamRef.current) {

            screenStreamRef.current.getTracks().forEach(
                track => track.stop()
            );

            screenStreamRef.current = null;

        }

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable && video,
                    audio: audioAvailable && audio
                });

            localStreamRef.current = stream;

            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }

            for (const peer of Object.values(connectionsRef.current)) {

                const sender = peer.getSenders().find(
                    item => item.track?.kind === "video"
                );

                const videoTrack = stream.getVideoTracks()[0];

                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack);
                }

            }

        } catch (error) {

            console.error("Stop Screen Share Error:", error);

        }

    };

    const handleScreen = () => {

        if (!screen) {

            setScreen(true);

            getDisplayMedia();

        } else {

            setScreen(false);

            stopScreenSharing();

        }

    };

    // -------------------------------
    // END CALL
    // -------------------------------

    const handleEndCall = () => {

        Object.values(connectionsRef.current).forEach(peer => {
            peer.close();
        });

        connectionsRef.current = {};

        if (localStreamRef.current) {

            localStreamRef.current.getTracks().forEach(
                track => track.stop()
            );

            localStreamRef.current = null;

        }

        if (screenStreamRef.current) {

            screenStreamRef.current.getTracks().forEach(
                track => track.stop()
            );

            screenStreamRef.current = null;

        }

        if (socketRef.current) {

            socketRef.current.disconnect();

            socketRef.current = null;

        }

        window.location.href = "/";

    };

    // -------------------------------
    // CHAT SEND MESSAGE
    // -------------------------------

    const handleMessage = (e) => {

        setMessage(e.target.value);

    };

    const sendMessage = () => {

        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        const socket = socketRef.current;

        if (!socket?.connected) {

            alert("Socket is not connected!");

            return;

        }

        // Send structured message object
        socket.emit("chat-message", {
            message: trimmedMessage,
            sender: username,
            roomId: window.location.href
        });

        setMessage("");

    };

    // -------------------------------
    // CODE EDITOR
    // -------------------------------

    const handleCodeChange = (value) => {

        const updatedCode = value ?? "";

        setCode(updatedCode);

        if (socketRef.current?.connected) {

            socketRef.current.emit(
                "code-update",
                updatedCode
            );

        }

    };

    // -------------------------------
    // JOIN MEETING
    // -------------------------------

    const connect = () => {

        if (!username.trim()) {

            alert("Please enter your username.");

            return;

        }

        setAskForUsername(false);

        getMedia();

    };

    // -------------------------------
    // CHAT OPEN / CLOSE
    // -------------------------------

    const openChat = () => {

        setModal(true);

        setNewMessages(0);

    };

    const closeChat = () => {

        setModal(false);

    };

    const toggleChat = () => {

        setModal(prev => !prev);

        setNewMessages(0);

    };

    // -------------------------------
    // UI
    // -------------------------------

    return (

        <Box sx={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#121212',
            overflow: 'hidden'
        }}>

            {askForUsername ? (

                // MEETING LOBBY

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#121212',
                    padding: 2
                }}>

                    <Paper elevation={6} sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        backgroundColor: '#1e1e1e',
                        color: '#fff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>

                        <Typography variant="h5">
                            Enter Meeting Lobby
                        </Typography>

                        <Box sx={{
                            width: '100%',
                            height: '220px',
                            backgroundColor: '#000',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>

                            <video
                                ref={localVideoref}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)'
                                }}
                            />

                        </Box>

                        <TextField
                            fullWidth
                            label="Your Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") connect();
                            }}
                            sx={{
                                backgroundColor: "#2d2d2d",
                                input: { color: '#fff' },
                                label: { color: '#aaa' }
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={connect}
                        >
                            Join Now
                        </Button>

                    </Paper>

                </Box>

            ) : (

                // MEETING SCREEN

                <div className={styles.meetVideoContainer}>

                    {/* CHAT PANEL */}

                    {showModal && (

                        <div className={styles.chatRoom}>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#1e1e1e',
                                padding: '10px 16px',
                                borderBottom: '1px solid #333'
                            }}>

                                <Box sx={{ display: 'flex', gap: '8px' }}>

                                    <Button
                                        variant={activeTab === 'chat' ? 'contained' : 'outlined'}
                                        onClick={() => setActiveTab('chat')}
                                        size="small"
                                    >
                                        Chat
                                    </Button>

                                    <Button
                                        variant={activeTab === 'code' ? 'contained' : 'outlined'}
                                        onClick={() => setActiveTab('code')}
                                        size="small"
                                        startIcon={<CodeIcon />}
                                    >
                                        Code Editor
                                    </Button>

                                </Box>

                                <IconButton
                                    onClick={closeChat}
                                    sx={{ color: '#aaa' }}
                                >
                                    <CloseIcon />
                                </IconButton>

                            </Box>

                            {activeTab === 'chat' ? (

                                <div className={styles.chatContainer}>

                                    <Typography
                                        variant="h6"
                                        sx={{ color: '#fff', mb: 2 }}
                                    >
                                        Meeting Chat
                                    </Typography>

                                    <div className={styles.chattingDisplay}>

                                        {messages.length > 0 ? (

                                            messages.map((item, index) => (

                                                <Box
                                                    key={index}
                                                    sx={{
                                                        marginBottom: "16px",
                                                        backgroundColor: '#2a2a2a',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px'
                                                    }}
                                                >

                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mb: 0.5
                                                    }}>

                                                        <Avatar sx={{
                                                            width: 24,
                                                            height: 24,
                                                            fontSize: '0.75rem',
                                                            bgcolor: '#1976d2'
                                                        }}>
                                                            {item.sender?.charAt(0).toUpperCase()}
                                                        </Avatar>

                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: '#90caf9'
                                                            }}
                                                        >
                                                            {item.sender}
                                                        </Typography>

                                                    </Box>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#e0e0e0',
                                                            wordBreak: 'break-word',
                                                            pl: 4
                                                        }}
                                                    >
                                                        {item.data}
                                                    </Typography>

                                                </Box>

                                            ))

                                        ) : (

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#777',
                                                    textAlign: 'center',
                                                    mt: 4
                                                }}
                                            >
                                                No Messages Yet
                                            </Typography>

                                        )}

                                    </div>

                                    {/* CHAT INPUT */}

                                    <div className={styles.chattingArea}>

                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={message}
                                            onChange={handleMessage}
                                            placeholder="Type a message..."
                                            onKeyDown={e => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            sx={{
                                                backgroundColor: "#2d2d2d",
                                                borderRadius: "8px",
                                                input: {
                                                    color: "#fff",
                                                    WebkitTextFillColor: "#fff"
                                                }
                                            }}
                                        />

                                        <Button
                                            variant="contained"
                                            onClick={sendMessage}
                                            endIcon={<SendIcon />}
                                        >
                                            Send
                                        </Button>

                                    </div>

                                </div>

                            ) : (

                                // CODE EDITOR

                                <div style={{
                                    flex: 1,
                                    height: 'calc(100% - 50px)',
                                    background: '#1e1e1e',
                                    color: '#fff',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>

                                    <MyCodeEditor
                                        code={code}
                                        onChange={handleCodeChange}
                                        socket={socketRef.current}
                                        roomId={window.location.href}
                                    />

                                </div>

                            )}

                        </div>

                    )}

                    {/* BOTTOM BUTTONS */}

                    <div className={styles.buttonContainers}>

                        <IconButton
                            onClick={handleVideo}
                            sx={{
                                backgroundColor: video
                                    ? 'rgba(255,255,255,0.1)'
                                    : '#d32f2f',
                                color: "white"
                            }}
                        >
                            {video
                                ? <VideocamIcon />
                                : <VideocamOffIcon />
                            }
                        </IconButton>

                        <IconButton
                            onClick={handleEndCall}
                            sx={{
                                backgroundColor: '#d32f2f',
                                color: "white",
                                padding: '12px'
                            }}
                        >
                            <CallEndIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleAudio}
                            sx={{
                                backgroundColor: audio
                                    ? 'rgba(255,255,255,0.1)'
                                    : '#d32f2f',
                                color: "white"
                            }}
                        >
                            {audio
                                ? <MicIcon />
                                : <MicOffIcon />
                            }
                        </IconButton>

                        {screenAvailable && (

                            <IconButton
                                onClick={handleScreen}
                                sx={{
                                    backgroundColor: screen
                                        ? '#1976d2'
                                        : 'rgba(255,255,255,0.1)',
                                    color: "white"
                                }}
                            >
                                {screen
                                    ? <StopScreenShareIcon />
                                    : <ScreenShareIcon />
                                }
                            </IconButton>

                        )}

                        <Badge
                            badgeContent={newMessages}
                            max={999}
                            color="secondary"
                        >

                            <IconButton
                                onClick={toggleChat}
                                sx={{
                                    backgroundColor: showModal
                                        ? '#1976d2'
                                        : 'rgba(255,255,255,0.1)',
                                    color: "white"
                                }}
                            >
                                <ChatIcon />
                            </IconButton>

                        </Badge>

                    </div>

                    {/* LOCAL VIDEO */}

                    <video
                        className={styles.meetUserVideo}
                        ref={localVideoref}
                        autoPlay
                        muted
                        playsInline
                    />

                    {/* REMOTE VIDEOS */}

                    <div className={styles.conferenceView}>

                        {videos.map(item => (

                            <div key={item.socketId}>

                                <video
                                    data-socket={item.socketId}
                                    ref={ref => {
                                        if (ref && item.stream) {
                                            ref.srcObject = item.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                />

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </Box>

    );

}


// import { useEffect, useRef, useState, useCallback } from 'react';
// import io from "socket.io-client";

// import {
//     Badge,
//     IconButton,
//     TextField,
//     Button
// } from '@mui/material';

// import VideocamIcon from '@mui/icons-material/Videocam';
// import VideocamOffIcon from '@mui/icons-material/VideocamOff';
// import CallEndIcon from '@mui/icons-material/CallEnd';
// import MicIcon from '@mui/icons-material/Mic';
// import MicOffIcon from '@mui/icons-material/MicOff';
// import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
// import ChatIcon from '@mui/icons-material/Chat';
// import CodeIcon from '@mui/icons-material/Code';

// import styles from "../styles/videoComponent.module.css";
// import server from '../environment';
// import MyCodeEditor from './MyCodeEditor';

// const server_url = server;

// const peerConfigConnections = {
//     iceServers: [
//         {
//             urls: "stun:stun.l.google.com:19302"
//         }
//     ]
// };

// export default function VideoMeetComponent() {

//     const socketRef = useRef(null);
//     const socketIdRef = useRef(null);
//     const localVideoref = useRef(null);
//     const videoRef = useRef([]);
//     const connectionsRef = useRef({});
//     const localStreamRef = useRef(null);
//     const screenStreamRef = useRef(null);

//     const [videoAvailable, setVideoAvailable] = useState(true);
//     const [audioAvailable, setAudioAvailable] = useState(true);

//     const [video, setVideo] = useState(true);
//     const [audio, setAudio] = useState(true);
//     const [screen, setScreen] = useState(false);

//     const [screenAvailable, setScreenAvailable] = useState(false);

//     const [messages, setMessages] = useState([]);
//     const [message, setMessage] = useState("");
//     const [activeTab, setActiveTab] = useState("chat");
//     const [code, setCode] = useState("// Start coding here...");

//     const [newMessages, setNewMessages] = useState(0);
//     const [askForUsername, setAskForUsername] = useState(true);
//     const [username, setUsername] = useState("");

//     const [videos, setVideos] = useState([]);
//     const [showModal, setModal] = useState(false);

//     const cleanupPeer = useCallback((id) => {
//         const peer = connectionsRef.current[id];

//         if (peer) {
//             peer.ontrack = null;
//             peer.onicecandidate = null;
//             peer.close();
//             delete connectionsRef.current[id];
//         }

//         setVideos(prev => {
//             const updated = prev.filter(item => item.socketId !== id);
//             videoRef.current = updated;
//             return updated;
//         });
//     }, []);

//     const addVideoStream = useCallback((id, stream) => {
//         setVideos(prev => {
//             const existing = prev.find(item => item.socketId === id);

//             let updated;

//             if (existing) {
//                 updated = prev.map(item =>
//                     item.socketId === id
//                         ? { ...item, stream }
//                         : item
//                 );
//             } else {
//                 updated = [
//                     ...prev,
//                     {
//                         socketId: id,
//                         stream
//                     }
//                 ];
//             }

//             videoRef.current = updated;
//             return updated;
//         });
//     }, []);

//     const sendSignal = useCallback(async (id, data) => {
//         const socket = socketRef.current;

//         if (!socket?.connected) return;

//         socket.emit('signal', id, JSON.stringify(data));
//     }, []);

//     const createPeerConnection = useCallback((id) => {

//         if (connectionsRef.current[id]) {
//             return connectionsRef.current[id];
//         }

//         const peer = new RTCPeerConnection(peerConfigConnections);

//         connectionsRef.current[id] = peer;

//         const stream = localStreamRef.current;

//         if (stream) {
//             stream.getTracks().forEach(track => {
//                 peer.addTrack(track, stream);
//             });
//         }

//         peer.onicecandidate = (event) => {
//             if (event.candidate) {
//                 sendSignal(id, {
//                     ice: event.candidate
//                 });
//             }
//         };

//         peer.ontrack = (event) => {
//             const remoteStream = event.streams?.[0];

//             if (remoteStream) {
//                 addVideoStream(id, remoteStream);
//             }
//         };

//         peer.onconnectionstatechange = () => {
//             if (
//                 peer.connectionState === "failed" ||
//                 peer.connectionState === "closed"
//             ) {
//                 cleanupPeer(id);
//             }
//         };

//         return peer;

//     }, [addVideoStream, cleanupPeer, sendSignal]);

//     const createOffer = useCallback(async (id) => {

//         try {
//             const peer = createPeerConnection(id);

//             const offer = await peer.createOffer();

//             await peer.setLocalDescription(offer);

//             await sendSignal(id, {
//                 sdp: peer.localDescription
//             });

//         } catch (error) {
//             console.error("Offer Error:", error);
//         }

//     }, [createPeerConnection, sendSignal]);

//     const gotMessageFromServer = useCallback(async (fromId, messageData) => {

//         try {
//             if (fromId === socketIdRef.current) return;

//             const signal = typeof messageData === "string"
//                 ? JSON.parse(messageData)
//                 : messageData;

//             const peer = createPeerConnection(fromId);

//             if (signal.sdp) {

//                 const description = new RTCSessionDescription(signal.sdp);

//                 await peer.setRemoteDescription(description);

//                 if (description.type === "offer") {

//                     const answer = await peer.createAnswer();

//                     await peer.setLocalDescription(answer);

//                     await sendSignal(fromId, {
//                         sdp: peer.localDescription
//                     });

//                 }
//             }

//             if (signal.ice) {

//                 const candidate = new RTCIceCandidate(signal.ice);

//                 if (peer.remoteDescription) {
//                     await peer.addIceCandidate(candidate);
//                 }

//             }

//         } catch (error) {
//             console.error("Signal Error:", error);
//         }

//     }, [createPeerConnection, sendSignal]);

//     const getPermissions = async () => {

//         if (!navigator.mediaDevices?.getUserMedia) {
//             console.error("Camera/Microphone API not supported");
//             setVideoAvailable(false);
//             setAudioAvailable(false);
//             return;
//         }

//         let cameraAvailable = false;
//         let microphoneAvailable = false;

//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });

//             cameraAvailable = stream.getVideoTracks().length > 0;
//             microphoneAvailable = stream.getAudioTracks().length > 0;

//             stream.getTracks().forEach(track => track.stop());

//         } catch (error) {
//             console.error("Media Permission:", error);
//         }

//         setVideoAvailable(cameraAvailable);
//         setAudioAvailable(microphoneAvailable);

//         setVideo(cameraAvailable);
//         setAudio(microphoneAvailable);

//         setScreenAvailable(
//             !!navigator.mediaDevices.getDisplayMedia
//         );
//     };

//     useEffect(() => {
//         getPermissions();

//         return () => {
//             Object.values(connectionsRef.current).forEach(peer => {
//                 peer.close();
//             });

//             connectionsRef.current = {};

//             if (localStreamRef.current) {
//                 localStreamRef.current.getTracks().forEach(track => track.stop());
//             }

//             if (screenStreamRef.current) {
//                 screenStreamRef.current.getTracks().forEach(track => track.stop());
//             }

//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }
//         };
//     }, []);

//     const getUserMedia = async () => {

//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: videoAvailable && video,
//                 audio: audioAvailable && audio
//             });

//             if (localStreamRef.current) {
//                 localStreamRef.current.getTracks().forEach(track => track.stop());
//             }

//             localStreamRef.current = stream;

//             if (localVideoref.current) {
//                 localVideoref.current.srcObject = stream;
//             }

//             Object.entries(connectionsRef.current).forEach(([id, peer]) => {

//                 stream.getTracks().forEach(track => {
//                     const sender = peer.getSenders().find(
//                         item => item.track?.kind === track.kind
//                     );

//                     if (sender) {
//                         sender.replaceTrack(track);
//                     } else {
//                         peer.addTrack(track, stream);
//                     }
//                 });

//                 createOffer(id);
//             });

//         } catch (error) {
//             console.error("Get User Media Error:", error);
//         }
//     };

//     const getDisplayMedia = async () => {

//         try {
//             if (!navigator.mediaDevices.getDisplayMedia) return;

//             const stream = await navigator.mediaDevices.getDisplayMedia({
//                 video: true,
//                 audio: false
//             });

//             screenStreamRef.current = stream;

//             const screenTrack = stream.getVideoTracks()[0];

//             if (localVideoref.current) {
//                 localVideoref.current.srcObject = stream;
//             }

//             Object.entries(connectionsRef.current).forEach(async ([id, peer]) => {

//                 const sender = peer.getSenders().find(
//                     item => item.track?.kind === "video"
//                 );

//                 if (sender) {
//                     await sender.replaceTrack(screenTrack);
//                 } else {
//                     peer.addTrack(screenTrack, stream);
//                 }

//                 createOffer(id);
//             });

//             screenTrack.onended = () => {
//                 setScreen(false);
//                 stopScreenSharing();
//             };

//         } catch (error) {
//             console.error("Screen Sharing Error:", error);
//             setScreen(false);
//         }
//     };

//     const stopScreenSharing = async () => {

//         if (screenStreamRef.current) {
//             screenStreamRef.current.getTracks().forEach(track => track.stop());
//             screenStreamRef.current = null;
//         }

//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: videoAvailable && video,
//                 audio: audioAvailable && audio
//             });

//             localStreamRef.current = stream;

//             if (localVideoref.current) {
//                 localVideoref.current.srcObject = stream;
//             }

//             Object.entries(connectionsRef.current).forEach(async ([id, peer]) => {

//                 const sender = peer.getSenders().find(
//                     item => item.track?.kind === "video"
//                 );

//                 const videoTrack = stream.getVideoTracks()[0];

//                 if (sender && videoTrack) {
//                     await sender.replaceTrack(videoTrack);
//                 }

//                 createOffer(id);
//             });

//         } catch (error) {
//             console.error("Stop Screen Share Error:", error);
//         }
//     };

//     const connectToSocketServer = () => {

//         if (socketRef.current?.connected) return;

//         socketRef.current = io(server_url, {
//             transports: ["websocket", "polling"],
//             reconnection: true,
//             forceNew: true
//         });

//         socketRef.current.on('connect', () => {

//             console.log("Socket Connected:", socketRef.current.id);

//             socketIdRef.current = socketRef.current.id;

//             socketRef.current.emit('join-call', window.location.href);

//             socketRef.current.on('user-joined', async (id, clients) => {

//                 console.log("User Joined:", id, clients);

//                 if (!Array.isArray(clients)) return;

//                 for (const clientId of clients) {

//                     if (clientId === socketIdRef.current) continue;

//                     createPeerConnection(clientId);

//                     if (socketIdRef.current === id) {
//                         await createOffer(clientId);
//                     }

//                 }

//             });

//             socketRef.current.on('signal', gotMessageFromServer);

//             socketRef.current.on('user-left', (id) => {
//                 cleanupPeer(id);
//             });

//             socketRef.current.on('chat-message', (data, sender, senderId) => {

//                 setMessages(prev => [
//                     ...prev,
//                     {
//                         sender: sender || "User",
//                         data
//                     }
//                 ]);

//                 if (senderId !== socketIdRef.current) {
//                     setNewMessages(prev => prev + 1);
//                 }

//             });

//             socketRef.current.on('code-update', (updatedCode) => {
//                 setCode(updatedCode);
//             });

//         });

//         socketRef.current.on('connect_error', (error) => {
//             console.error("Socket Connection Error:", error);
//         });

//     };

//     const getMedia = async () => {

//         try {

//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: videoAvailable && video,
//                 audio: audioAvailable && audio
//             });

//             localStreamRef.current = stream;

//             if (localVideoref.current) {
//                 localVideoref.current.srcObject = stream;
//             }

//             connectToSocketServer();

//         } catch (error) {
//             console.error("Camera/Microphone Error:", error);
//             alert("Please allow camera and microphone permissions.");
//         }

//     };

//     const handleVideo = async () => {

//         if (screen) return;

//         const nextValue = !video;
//         setVideo(nextValue);

//         if (localStreamRef.current) {
//             localStreamRef.current.getVideoTracks().forEach(track => {
//                 track.enabled = nextValue;
//             });
//         }

//     };

//     const handleAudio = () => {

//         const nextValue = !audio;
//         setAudio(nextValue);

//         if (localStreamRef.current) {
//             localStreamRef.current.getAudioTracks().forEach(track => {
//                 track.enabled = nextValue;
//             });
//         }

//     };

//     const handleScreen = () => {
//         if (!screen) {
//             setScreen(true);
//             getDisplayMedia();
//         } else {
//             setScreen(false);
//             stopScreenSharing();
//         }
//     };

//     const handleEndCall = () => {

//         Object.values(connectionsRef.current).forEach(peer => {
//             peer.close();
//         });

//         connectionsRef.current = {};

//         if (localStreamRef.current) {
//             localStreamRef.current.getTracks().forEach(track => track.stop());
//         }

//         if (screenStreamRef.current) {
//             screenStreamRef.current.getTracks().forEach(track => track.stop());
//         }

//         if (socketRef.current) {
//             socketRef.current.disconnect();
//         }

//         window.location.href = "/";
//     };

//     const handleMessage = (e) => {
//         setMessage(e.target.value);
//     };

//     const sendMessage = () => {

//         if (!message.trim()) return;

//         if (!socketRef.current?.connected) {
//             alert("Socket is not connected.");
//             return;
//         }

//         socketRef.current.emit('chat-message', message.trim(), username);

//         setMessage("");
//     };

//     const handleCodeChange = (value) => {

//         const updatedCode = value ?? "";

//         setCode(updatedCode);

//         if (socketRef.current?.connected) {
//             socketRef.current.emit('code-update', updatedCode);
//         }

//     };

//     const connect = () => {

//         if (!username.trim()) {
//             alert("Please enter your username.");
//             return;
//         }

//         setAskForUsername(false);

//         getMedia();
//     };

//     const openChat = () => {
//         setModal(true);
//         setNewMessages(0);
//     };

//     const closeChat = () => {
//         setModal(false);
//     };

//     const toggleChat = () => {
//         setModal(prev => !prev);
//         setNewMessages(0);
//     };

//     return (
//         <div>

//             {askForUsername ? (

//                 <div>
//                     <h2>Enter into Lobby</h2>

//                     <TextField
//                         id="outlined-basic"
//                         label="Username"
//                         value={username}
//                         onChange={e => setUsername(e.target.value)}
//                         variant="outlined"
//                     />

//                     <Button
//                         variant="contained"
//                         onClick={connect}
//                     >
//                         Connect
//                     </Button>

//                     <div>
//                         <video
//                             ref={localVideoref}
//                             autoPlay
//                             muted
//                             playsInline
//                         />
//                     </div>
//                 </div>

//             ) : (

//                 <div className={styles.meetVideoContainer}>

//                     {showModal && (

//                         <div className={styles.chatRoom}>

//                             <div style={{
//                                 display: 'flex',
//                                 background: '#2d2d2d',
//                                 padding: '5px',
//                                 gap: '10px'
//                             }}>

//                                 <Button
//                                     variant={activeTab === 'chat' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('chat')}
//                                     size="small"
//                                 >
//                                     Chat
//                                 </Button>

//                                 <Button
//                                     variant={activeTab === 'code' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('code')}
//                                     size="small"
//                                     startIcon={<CodeIcon />}
//                                 >
//                                     Code
//                                 </Button>

//                                 <Button
//                                     onClick={closeChat}
//                                     size="small"
//                                     variant="outlined"
//                                 >
//                                     Close
//                                 </Button>

//                             </div>

//                             {activeTab === 'chat' ? (

//                                 <div className={styles.chatContainer}>

//                                     <h1>Chat</h1>

//                                     <div className={styles.chattingDisplay}>

//                                         {messages.length !== 0
//                                             ? messages.map((item, index) => (

//                                                 <div
//                                                     style={{ marginBottom: "20px" }}
//                                                     key={index}
//                                                 >
//                                                     <p style={{ fontWeight: "bold" }}>
//                                                         {item.sender}
//                                                     </p>

//                                                     <p>{item.data}</p>

//                                                 </div>

//                                             ))
//                                             : <p>No Messages Yet</p>
//                                         }

//                                     </div>

//                                     <div className={styles.chattingArea}>

//                                         <TextField
//                                             value={message}
//                                             onChange={handleMessage}
//                                             label="Enter Your chat"
//                                             backgroundColor="#fff"
//                                             variant="outlined"
//                                             onKeyDown={e => {
//                                                 if (e.key === "Enter") sendMessage();
//                                             }}
//                                                 sx={{
//         backgroundColor: "#ffffff",
//         borderRadius: "8px",

//         "& .MuiOutlinedInput-root": {
//             color: "#000000",
//             backgroundColor: "#ffffff",
//         },

//         "& .MuiOutlinedInput-input": {
//             color: "#000000",
//             WebkitTextFillColor: "#000000",
//         },

//         "& .MuiInputLabel-root": {
//             color: "#555555",
//         },

//         "& .MuiOutlinedInput-notchedOutline": {
//             borderColor: "#cccccc",
//         },

//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//             borderColor: "#1976d2",
//         },
//     }}
// />

//                                         <Button
//                                             variant="contained"
//                                             onClick={sendMessage}
//                                             backgroundColor="#fff"
//                                         >
//                                             Send
//                                         </Button>

//                                     </div>

//                                 </div>

//                             ) : (

//                                 <div style={{
//                                     flex: 1,
//                                     height: 'calc(100% - 40px)',
//                                     background: '#1e1e1e',
//                                     color: '#fff'
//                                 }}>

//                                     <MyCodeEditor
//                                         code={code}
//                                         onChange={handleCodeChange}
//                                         socket={socketRef.current}
//                                         roomId={window.location.href}
//                                     />

//                                 </div>

//                             )}

//                         </div>

//                     )}

//                     <div className={styles.buttonContainers}>

//                         <IconButton
//                             onClick={handleVideo}
//                             style={{ color: "white" }}
//                         >
//                             {video
//                                 ? <VideocamIcon />
//                                 : <VideocamOffIcon />
//                             }
//                         </IconButton>

//                         <IconButton
//                             onClick={handleEndCall}
//                             style={{ color: "red" }}
//                         >
//                             <CallEndIcon />
//                         </IconButton>

//                         <IconButton
//                             onClick={handleAudio}
//                             style={{ color: "white" }}
//                         >
//                             {audio
//                                 ? <MicIcon />
//                                 : <MicOffIcon />
//                             }
//                         </IconButton>

//                         {screenAvailable && (

//                             <IconButton
//                                 onClick={handleScreen}
//                                 style={{ color: "white" }}
//                             >
//                                 {screen
//                                     ? <StopScreenShareIcon />
//                                     : <ScreenShareIcon />
//                                 }
//                             </IconButton>

//                         )}

//                         <Badge
//                             badgeContent={newMessages}
//                             max={999}
//                             color="secondary"
//                         >

//                             <IconButton
//                                 onClick={toggleChat}
//                                 style={{ color: "white" }}
//                             >
//                                 <ChatIcon />
//                             </IconButton>

//                         </Badge>

//                     </div>

//                     <video
//                         className={styles.meetUserVideo}
//                         ref={localVideoref}
//                         autoPlay
//                         muted
//                         playsInline
//                     />

//                     <div className={styles.conferenceView}>

//                         {videos.map(item => (

//                             <div key={item.socketId}>

//                                 <video
//                                     data-socket={item.socketId}
//                                     ref={ref => {
//                                         if (ref && item.stream) {
//                                             ref.srcObject = item.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                     playsInline
//                                 />

//                             </div>

//                         ))}

//                     </div>

//                 </div>

//             )}

//         </div>
//     );

// }



// import { useEffect, useRef, useState } from 'react'
// import io from "socket.io-client";
// import { Badge, IconButton, TextField } from '@mui/material';
// import { Button } from '@mui/material';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import VideocamOffIcon from '@mui/icons-material/VideocamOff'
// import styles from "../styles/videoComponent.module.css";
// import CallEndIcon from '@mui/icons-material/CallEnd'
// import MicIcon from '@mui/icons-material/Mic'
// import MicOffIcon from '@mui/icons-material/MicOff'
// import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
// import ChatIcon from '@mui/icons-material/Chat'
// import server from '../environment';
// import Editor from '@monaco-editor/react';
// import CodeIcon from '@mui/icons-material/Code';
// import MyCodeEditor from './MyCodeEditor';

// const server_url = server;

// var connections = {};

// const peerConfigConnections = {
//     "iceServers": [
//         { "urls": "stun:stun.l.google.com:19302" }
//     ]
// }

// export default function VideoMeetComponent() {

//     var socketRef = useRef();
//     let socketIdRef = useRef();

//     let localVideoref = useRef();

//     let [videoAvailable, setVideoAvailable] = useState(true);

//     let [audioAvailable, setAudioAvailable] = useState(true);

//     let [video, setVideo] = useState([]);

//     let [audio, setAudio] = useState();

//     let [screen, setScreen] = useState();

//     let [showModal, setModal] = useState(true);

//     let [screenAvailable, setScreenAvailable] = useState();

//     let [messages, setMessages] = useState([])

//     let [message, setMessage] = useState("");

//     let [activeTab, setActiveTab] = useState("chat");
    
//     let [code, setCode] = useState("// Start coding here...");


//     let [newMessages, setNewMessages] = useState(3);

//     let [askForUsername, setAskForUsername] = useState(true);

//     let [username, setUsername] = useState("");

//     const videoRef = useRef([])

//     let [videos, setVideos] = useState([])

//     useEffect(() => {
//         console.log("HELLO")
//         getPermissions();
//     }, []); 

//     let getDislayMedia = () => {
//         if (screen) {
//             if (navigator.mediaDevices.getDisplayMedia) {
//                 navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
//                     .then(getDislayMediaSuccess)
//                     .then((stream) => { })
//                     .catch((e) => console.log(e))
//             }
//         }
//     }

//     const getPermissions = async () => {
//         try {
//             const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoPermission) {
//                 setVideoAvailable(true);
//                 console.log('Video permission granted');
//             } else {
//                 setVideoAvailable(false);
//                 console.log('Video permission denied');
//             }

//             const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
//             if (audioPermission) {
//                 setAudioAvailable(true);
//                 console.log('Audio permission granted');
//             } else {
//                 setAudioAvailable(false);
//                 console.log('Audio permission denied');
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }

//             if (videoAvailable || audioAvailable) {
//                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
//                 if (userMediaStream) {
//                     window.localStream = userMediaStream;
//                     if (localVideoref.current) {
//                         localVideoref.current.srcObject = userMediaStream;
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//             console.log("SET STATE HAS ", video, audio);
//         }
//     }, [video, audio])

//     let getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocketServer();
//     }

//     let getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 console.log(description)
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setVideo(false);
//             setAudio(false);

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             for (let id in connections) {
//                 connections[id].addStream(window.localStream)

//                 connections[id].createOffer().then((description) => {
//                     connections[id].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         })
//     }

//     let getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then(getUserMediaSuccess)
//                 .then((stream) => { })
//                 .catch((e) => console.log(e))
//         } else {
//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { }
//         }
//     }

//     let getDislayMediaSuccess = (stream) => {
//         console.log("HERE")
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setScreen(false)

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             getUserMedia()
//         })
//     }

//     let gotMessageFromServer = (fromId, message) => {
//         var signal = JSON.parse(message)

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
//                     if (signal.sdp.type === 'offer') {
//                         connections[fromId].createAnswer().then((description) => {
//                             connections[fromId].setLocalDescription(description).then(() => {
//                                 socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
//                             }).catch(e => console.log(e))
//                         }).catch(e => console.log(e))
//                     }
//                 }).catch(e => console.log(e))
//             }

//             if (signal.ice) {
//                 connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
//             }
//         }
//     }

//     let connectToSocketServer = () => {
//         socketRef.current = io.connect(server_url, 
//             { 
//                 secure: false ,
//                 tansports: ['websocket'],
//                 upgrade: false,
//                 forceNew: true,
            
//             })

//         socketRef.current.on('signal', gotMessageFromServer)

//         socketRef.current.on('connect', () => {
//             socketRef.current.emit('join-call', window.location.href)
//             socketIdRef.current = socketRef.current.id

//             socketRef.current.on('chat-message', addMessage)


//             socketRef.current.on('code-update', (updatedCode) => setCode(updatedCode));

//             socketRef.current.on('user-left', (id) => {
//                 setVideos((videos) => videos.filter((video) => video.socketId !== id))
//             })

//             socketRef.current.on('user-joined', (id, clients) => {
//                 clients.forEach((socketListId) => {

//                     connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
//                     connections[socketListId].onicecandidate = function (event) {
//                         if (event.candidate != null) {
//                             socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
//                         }
//                     }

//                     connections[socketListId].onaddstream = (event) => {
//                         console.log("BEFORE:", videoRef.current);
//                         console.log("FINDING ID: ", socketListId);

//                         let videoExists = videoRef.current.find(video => video.socketId === socketListId);

//                         if (videoExists) {
//                             console.log("FOUND EXISTING");

//                             setVideos(videos => {
//                                 const updatedVideos = videos.map(video =>
//                                     video.socketId === socketListId ? { ...video, stream: event.stream } : video
//                                 );
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         } else {
//                             console.log("CREATING NEW");
//                             let newVideo = {
//                                 socketId: socketListId,
//                                 stream: event.stream,
//                                 autoplay: true,
//                                 playsinline: true
//                             };

//                             setVideos(videos => {
//                                 const updatedVideos = [...videos, newVideo];
//                                 videoRef.current = updatedVideos;
//                                 return updatedVideos;
//                             });
//                         }
//                     };

//                     if (window.localStream !== undefined && window.localStream !== null) {
//                         connections[socketListId].addStream(window.localStream)
//                     } else {
//                         let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//                         window.localStream = blackSilence()
//                         connections[socketListId].addStream(window.localStream)
//                     }
//                 })

//                 if (id === socketIdRef.current) {
//                     for (let id2 in connections) {
//                         if (id2 === socketIdRef.current) continue

//                         try {
//                             connections[id2].addStream(window.localStream)
//                         } catch (e) { }

//                         connections[id2].createOffer().then((description) => {
//                             connections[id2].setLocalDescription(description)
//                                 .then(() => {
//                                     socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
//                                 })
//                                 .catch(e => console.log(e))
//                         })
//                     }
//                 }
//             })
//         })
//     }

//     let silence = () => {
//         let ctx = new AudioContext()
//         let oscillator = ctx.createOscillator()
//         let dst = oscillator.connect(ctx.createMediaStreamDestination())
//         let track = dst.stream.getAudioTracks()[0];
//         oscillator.start()
//         ctx.resume()
//         return Object.assign(track, { enabled: false })
//     }
    
//     let black = ({ width = 640, height = 480 } = {}) => {
//         let canvas = Object.assign(document.createElement("canvas"), { width, height })
//         canvas.getContext('2d').fillRect(0, 0, width, height)
//         let stream = canvas.captureStream()
//         return Object.assign(stream.getVideoTracks()[0], { enabled: false })
//     }

//     let handleVideo = () => {
//         setVideo(!video);
//     }
//     let handleAudio = () => {
//         setAudio(!audio)
//     }

//     useEffect(() => {
//         if (screen !== undefined) {
//             getDislayMedia();
//         }
//     }, [screen])

//     let handleScreen = () => {
//         setScreen(!screen);
//     }

//     let handleEndCall = () => {
//         try {
//             let tracks = localVideoref.current.srcObject.getTracks()
//             tracks.forEach(track => track.stop())
//         } catch (e) { }
//         window.location.href = "/"
//     }

//     let openChat = () => {
//         setModal(true);
//         setNewMessages(0);
//     }
//     let closeChat = () => {
//         setModal(false);
//     }
//     let handleMessage = (e) => {
//         setMessage(e.target.value);
//     }

//     let toggleChat = () => {
//         if (showModal) {
//             closeChat();
//         } else {
//             openChat();
//         }
//     }

//     const addMessage = (data, sender, socketIdSender) => {
//         setMessages((prevMessages) => [
//             ...prevMessages,
//             { sender: sender, data: data }
//         ]);
//         if (socketIdSender !== socketIdRef.current) {
//             setNewMessages((prevNewMessages) => prevNewMessages + 1);
//         }
//     };

//     let sendMessage = () => {
//         console.log(socketRef.current);
//         socketRef.current.emit('chat-message', message, username)
//         setMessage("");
//     }

//     let handleCodeChange = (value) => {
//         setCode(value);
//         socketRef.current.emit('code-update', value);
//     }

//     let connect = () => {
//         setAskForUsername(false);
//         getMedia();
//     }


//     return (
//         <div>
//             {askForUsername === true ? (
//                 <div>
//                     <h2>Enter into Lobby </h2>
//                     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
//                     <Button variant="contained" onClick={connect}>Connect</Button>

//                     <div>
//                         <video ref={localVideoref} autoPlay muted></video>
//                     </div>
//                 </div>
//             ) : (
//                 <div className={styles.meetVideoContainer}>
                    
//                     {/* 🚀 फक्त एकच आणि सुरक्षित शो-मोडल ब्लॉक */}
//                     {showModal && (
//                         <div className={styles.chatRoom}>
//                             {/* टॅब सिस्टीम बटने (फक्त एकदाच) */}
//                             <div style={{ display: 'flex', background: '#2d2d2d', padding: '5px', gap: '10px' }}>
//                                 <Button
//                                     variant={activeTab === 'chat' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('chat')}
//                                     size="small"
//                                 >
//                                     Chat
//                                 </Button>
//                                 <Button
//                                     variant={activeTab === 'code' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('code')}
//                                     size="small"
//                                     startIcon={<CodeIcon />}
//                                 >
//                                     Code
//                                 </Button>
//                             </div>

//                             {/* टॅबच्या व्हॅल्युवर आधारित रेंडरिंग */}
//                             {activeTab === 'chat' ? (
//                                 <div className={styles.chatContainer}>
//                                     <h1>Chat</h1>

//                                     <div className={styles.chattingDisplay}>
//                                         {messages.length !== 0 ? messages.map((item, index) => {
//                                             return (
//                                                 <div style={{ marginBottom: "20px" }} key={index}>
//                                                     <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                                     <p>{item.data}</p>
//                                                 </div>
//                                             )
//                                         }) : <p>No Messages Yet</p>}
//                                     </div>

//                                     <div className={styles.chattingArea}>
//                                         <TextField value={message} onChange={handleMessage} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                                         <Button variant='contained' onClick={sendMessage}>Send</Button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div style={{ flex: 1, height: 'calc(100% - 40px)', background: '#1e1e1e', color: '#fff' }}>
//                                     <MyCodeEditor 
//                                         code={code} 
//                                         onChange={handleCodeChange} 
//                                         socket={socketRef.current}
//                                         roomId={window.location.href}
//                                        // roomId={window.location.pathname.split("/").pop()}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* कंट्रोल्स आणि व्हिडिओ ग्रिड एरिया */}
//                     <div className={styles.buttonContainers}>
//                         <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                             {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
//                         </IconButton>
//                         <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                             <CallEndIcon />
//                         </IconButton>
//                         <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                             {audio === true ? <MicIcon /> : <MicOffIcon />}
//                         </IconButton>

//                         {screenAvailable === true && (
//                             <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                                 {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                             </IconButton>
//                         )}

//                         <Badge badgeContent={newMessages} max={999} color='secondary'>
//                             <IconButton onClick={toggleChat} style={{ color: "white" }}>
//                                 <ChatIcon />                                 
//                             </IconButton>
//                         </Badge>
//                     </div>

//                     <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

//                     <div className={styles.conferenceView}>
//                         {videos.map((video) => (
//                             <div key={video.socketId}>
//                                 <video
//                                     data-socket={video.socketId}
//                                     ref={ref => {
//                                         if (ref && video.stream) {
//                                             ref.srcObject = video.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 >
//                                 </video>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//}




//     return (
//         <div>
//             {askForUsername === true ?
//                 <div>
//                     <h2>Enter into Lobby </h2>
//                     <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
//                     <Button variant="contained" onClick={connect}>Connect</Button>

//                     <div>
//                         <video ref={localVideoref} autoPlay muted></video>
//                     </div>
//                 </div> :

//                 <div className={styles.meetVideoContainer}>
//                     {showModal ? (
//                         <div className={styles.chatRoom}>
//                             {/* टॅब सिस्टीम बटने */}
//                             <div style={{ display: 'flex', background: '#2d2d2d', padding: '5px', gap: '10px' }}>
//                                 <Button
//                                     variant={activeTab === 'chat' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('chat')}
//                                     size="small"
//                                 >
//                                     Chat
//                                 </Button>
//                                 <Button
//                                     variant={activeTab === 'code' ? 'contained' : 'outlined'}
//                                     onClick={() => setActiveTab('code')}
//                                     size="small"
//                                     startIcon={<CodeIcon />}
//                                 >
//                                     Code
//                                 </Button>
//                             </div>


//                             {showModal && (
//     <div className={styles.chatRoom}>
//         {/* टॅब सिस्टीम बटने */}
//         <div style={{ display: 'flex', background: '#2d2d2d', padding: '5px', gap: '10px' }}>
//             <Button
//                 variant={activeTab === 'chat' ? 'contained' : 'outlined'}
//                 onClick={() => setActiveTab('chat')}
//                 size="small"
//             >
//                 Chat
//             </Button>
//             <Button
//                 variant={activeTab === 'code' ? 'contained' : 'outlined'}
//                 onClick={() => setActiveTab('code')}
//                 size="small"
//                 startIcon={<CodeIcon />}
//             >
//                 Code
//             </Button>
//         </div>

//         {/* टॅबच्या व्हॅल्युवर आधारित रेंडरिंग */}
//         {activeTab === 'chat' ? (
//             <div className={styles.chatContainer}>
//                 <h1>Chat</h1>

//                 <div className={styles.chattingDisplay}>
//                     {messages.length !== 0 ? messages.map((item, index) => {
//                         return (
//                             <div style={{ marginBottom: "20px" }} key={index}>
//                                 <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                 <p>{item.data}</p>
//                             </div>
//                         )
//                     }) : <p>No Messages Yet</p>}
//                 </div>

//                 <div className={styles.chattingArea}>
//                     <TextField value={message} onChange={handleMessage} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                     <Button variant='contained' onClick={sendMessage}>Send</Button>
//                 </div>
//             </div>
//         ) : (
//             /* 🔥 बॅकग्राउंड #1e1e1e (डार्क) केला जेणेकरून एडिटरशी मॅच होईल */
//             <div style={{ flex: 1, height: 'calc(100% - 40px)', background: '#1e1e1e', color: '#fff' }}>
//                 <MyCodeEditor 
//                     code={code} 
//                     onChange={handleCodeChange} 
//                     roomId={window.location.pathname.split("/").pop()}
//                 />
//             </div>
//         )}
//     </div>
// )} 




//                             {/* टॅबच्या व्हॅल्युवर आधारित रेंडरिंग
//                             {activeTab === 'chat' ? (
//                                 <div className={styles.chatContainer}>
//                                     <h1>Chat</h1>

//                                     <div className={styles.chattingDisplay}>
//                                         {messages.length !== 0 ? messages.map((item, index) => {
//                                             return (
//                                                 <div style={{ marginBottom: "20px" }} key={index}>
//                                                     <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                                     <p>{item.data}</p>
//                                                 </div>
//                                             )
//                                         }) : <p>No Messages Yet</p>}
//                                     </div>

//                                     <div className={styles.chattingArea}>
//                                         <TextField value={message} onChange={handleMessage} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                                         <Button variant='contained' onClick={sendMessage}>Send</Button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div style={{ flex: 1, height: 'calc(100% - 40px)', background: 'white' , color: 'white' }}>
//                                     <MyCodeEditor 
//                                         code={code} 
//                                         onChange={handleCodeChange} 
//                                         roomId={window.location.pathname.split("/").pop()}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     ) : <></>} */}

//                     {/* कंट्रोल्स आणि व्हिडिओ ग्रिड एरिया */}
//                     <div className={styles.buttonContainers}>
//                         <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                             {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
//                         </IconButton>
//                         <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                             <CallEndIcon  />
//                         </IconButton>
//                         <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                             {audio === true ? <MicIcon /> : <MicOffIcon />}
//                         </IconButton>

//                         {screenAvailable === true ?
//                             <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                                 {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                             </IconButton> : <></>}

//                         <Badge badgeContent={newMessages} max={999} color='secondary'>
//                             <IconButton onClick={toggleChat} style={{ color: "white" }}>
//                                 <ChatIcon />                                 
//                             </IconButton>
//                         </Badge>
//                     </div>

//                     <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

//                     <div className={styles.conferenceView}>
//                         {videos.map((video) => (
//                             <div key={video.socketId}>
//                                 <video
//                                     data-socket={video.socketId}
//                                     ref={ref => {
//                                         if (ref && video.stream) {
//                                             ref.srcObject = video.stream;
//                                         }
//                                     }}
//                                     autoPlay
//                                 >
//                                 </video>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             }
//         </div>
//     )
