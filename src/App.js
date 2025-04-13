import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import './App.css'; // We'll create this next

const { ipcRenderer } = window.require('electron'); // Use require for Electron modules

// Google AI Studio Inspired Dark Theme for react-json-view
const aiStudioDarkTheme = {
    base00: "#131314", // Background
    base01: "#202124", // Lighter Background (GUIDs, Indexes)
    base02: "#303134", // Content border
    base03: "#5F6368", // ? (unused?)
    base04: "#9AA0A6", // Comments, brackets, syntax guides
    base05: "#BDC1C6", // ? (unused?)
    base06: "#E8EAED", // Default Text
    base07: "#F8F9FA", // ? (unused?)
    base08: "#F28B82", // NULL, undefined
    base09: "#FDD663", // Variables, Identifiers (Booleans in our case)
    base0A: "#FDD663", // Constants, exports (Booleans)
    base0B: "#81C995", // Strings (Using a slightly different green here) - Replaced by aiStudioBlue
    // base0B: "#8AB4F8", // Strings - AI Studio Blue
    base0C: "#78D9EC", // Classes, types
    base0D: "#8AB4F8", // Function names, methods (Keys in our case) - AI Studio Blue
    base0E: "#C58AF9", // Keywords, storage, selector (Numbers in our case) - AI Studio Purple
    base0F: "#F28B82"  // Deprecated, warnings (Null/Undefined)
};

// Custom styling adjustments for keys, strings, numbers, booleans
const customAiStyle = {
    // Customize specific types if needed beyond the theme
    objectKey: { color: "#8AB4F8" }, // Explicitly set key color - AI Studio Blue
    string: { color: "#AECBFA"}, // Lighter blue for strings
    integer: { color: "#C58AF9" }, // Purple for numbers
    float: { color: "#C58AF9" }, // Purple for numbers
    boolean: { color: "#FDD663"}, // Yellowish for booleans
};


function App() {
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');

    const handleLoadJson = async () => {
        setError(''); // Clear previous errors
        setFileName('');
        try {
            const result = await ipcRenderer.invoke('open-file-dialog');
            if (result.error) {
                setError(result.error);
                setJsonData(null); // Clear data on error
                setFileName(result.filePath || '');
            } else {
                setJsonData(result.data);
                setFileName(result.filePath || 'Loaded JSON');
            }
        } catch (ipcError) {
            console.error("IPC Error:", ipcError);
            setError('Failed to communicate with the main process.');
            setJsonData(null);
        }
    };

    return (
        <div className="App">
            <div className="toolbar">
                <button onClick={handleLoadJson} className="load-button">
                    Load JSON
                </button>
                {fileName && <span className="file-name">Viewing: {fileName}</span>}
            </div>

            {error && <div className="error-message">Error: {error}</div>}

            <div className="json-container">
                {jsonData && (
                    <ReactJson
                        src={jsonData}
                        theme={aiStudioDarkTheme}
                        name={false} // Don't display root name "root"
                        collapsed={1} // Collapse root level by default
                        collapseStringsAfterLength={50}
                        displayObjectSize={true}
                        displayDataTypes={true}
                        enableClipboard={true}
                        style={{ // Apply base background and font smoothing
                            backgroundColor: aiStudioDarkTheme.base00,
                            padding: '20px',
                            borderRadius: '5px',
                            overflowY: 'auto', // Ensure scrolling works
                            height: 'calc(100vh - 80px)', // Adjust based on toolbar height
                            fontSmooth: 'always',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                        }}
                        // Apply specific type styling
                        styleOverrides={customAiStyle}
                    />
                )}
                {!jsonData && !error && (
                     <div className="placeholder">Click "Load JSON" to select a file.</div>
                )}
            </div>
        </div>
    );
}

export default App;