import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button, CircularProgress, MenuItem, Select, FormControl } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import io from 'socket.io-client'; 
import server from '../environment'; 


// const socket = io(server);


export default function MyCodeEditor({ code, onChange, roomId, socket }) {
    const [language, setLanguage] = useState('java');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!socket || !roomId) return;


      console.log(`[Editor] Listening for codeOutput on room: ${roomId}`)

      socket.on('codeOutput', (data) => {
        console.log("📥 [Editor] Output received from server:", data);

        if(data.success){
            setOutput(data.output || 'code executed successfully with no output.');
        } else {
            setOutput(`Error:\n${data.error }`);
        }
        setLoading(false);
      });

      return () => {
        socket.off('codeOutput');
      }
    }, [roomId, socket]);

    const handleRunCode = async () => {
        if (!roomId) {
            setOutput("Error: Room ID is missing. Cannot execute code.");
            return;
        }

        setLoading(true);
        setOutput('Code is in queue... Executing...');

        try {
            const response = await fetch(`${server}/api/compile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({ code, language, roomId }),
            });

            const data = await response.json();
            

            if (!data.success) {
                setOutput(`Queue Error:\n${data.error}`);
                setLoading(false);
            }
            
            

        } catch (error) {
            setOutput(`Server Error: Unable to connect to execution server.\n${error.message}`);
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#1e1e1e' }}>
            {/* Top Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#2d2d2d' }}>
                <FormControl size="small" style={{ minWidth: 120, background: '#fff', borderRadius: '4px' }}>
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="cpp">Cpp</MenuItem>
                        <MenuItem value="c">C</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="success"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleRunCode}
                    disabled={loading}
                >
                    {loading ? 'Running...' : 'Run Code'}
                </Button>
            </div>

            {/* Editor Workspace */}
            <div style={{ flex: 1, minHeight: '300px' }}>
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={onChange}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Output Panel */}
            <div style={{ height: '150px', background: '#000', color: '#00ff00', padding: '10px', fontFamily: 'monospace', overflowY: 'auto', borderTop: '2px solid #333' }}>
                <div style={{ fontWeight: 'bold', color: '#aaa', marginBottom: '5px', fontSize: '12px' }}>OUTPUT:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
            </div>
        </div>
    );
}