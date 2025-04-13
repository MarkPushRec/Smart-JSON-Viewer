import React, { useState } from 'react';
import JSONTree from 'react-json-tree';
import './App.css';

const { ipcRenderer } = window.require('electron'); // Use require for Electron modules

// Google AI Studio Inspired Dark Theme for react-json-tree
const aiStudioTheme = {
    scheme: 'google-ai-studio',
    author: 'Smart JSON Viewer',
    base00: '#131314', // Background
    base01: '#202124', // Lighter Background
    base02: '#303134', // Selection background
    base03: '#5F6368', // Comments, invisibles, line highlighting
    base04: '#9AA0A6', // Dark foreground
    base05: '#E8EAED', // Default foreground
    base06: '#FFFFFF', // Light foreground
    base07: '#FFFFFF', // Light background
    base08: '#F28B82', // Red - Variables, XML tags, markup link text, markup lists
    base09: '#FDD663', // Orange - Integers, boolean, constants, XML attributes, markup link url
    base0A: '#FDD663', // Yellow - Classes, markup bold, search text background
    base0B: '#81C995', // Green - Strings (we'll use a different color below)
    base0C: '#78D9EC', // Aqua - Support, regular expressions, escape chars, markup quotes
    base0D: '#8AB4F8', // Blue - Functions, methods, attribute IDs, headings
    base0E: '#C58AF9', // Purple - Keywords, storage, selector, markup italic, diff changed
    base0F: '#F28B82', // Brown - Deprecated, opening/closing embedded language tags
};

// Override specific value rendering
const getValueStyle = (_, nodeType, keyPath) => {
    switch(nodeType) {
        case 'String':
            return { color: '#AECBFA' }; // Light blue for strings
        case 'Number':
            return { color: '#C58AF9' }; // Purple for numbers
        case 'Boolean':
            return { color: '#FDD663' }; // Yellow for booleans
        case 'Null':
            return { color: '#F28B82' }; // Red for null
        default:
            return {};
    }
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
                    <JSONTree 
                        data={jsonData}
                        theme={aiStudioTheme}
                        invertTheme={false}
                        getItemString={(type, data) => (
                            <span>{type === 'Object' ? `{ ${Object.keys(data).length} keys }` : 
                                  type === 'Array' ? `[ ${data.length} items ]` : type}</span>
                        )}
                        valueRenderer={(raw, value, ...rest) => {
                            if (typeof value === 'string') {
                                return <span style={{ color: '#AECBFA' }}>{raw}</span>;
                            }
                            if (typeof value === 'number') {
                                return <span style={{ color: '#C58AF9' }}>{raw}</span>;
                            }
                            if (typeof value === 'boolean') {
                                return <span style={{ color: '#FDD663' }}>{raw.toString()}</span>;
                            }
                            if (value === null) {
                                return <span style={{ color: '#F28B82' }}>null</span>;
                            }
                            return raw;
                        }}
                        labelRenderer={([key]) => (
                            <span style={{ color: '#8AB4F8' }}>{key}</span>
                        )}
                        shouldExpandNode={() => false} // Collapse by default
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