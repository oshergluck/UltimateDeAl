import React, { useState, useEffect } from 'react';

const QuantumBusinessInterface = () => {
    const [consoleLines, setConsoleLines] = useState([]);
    const [timer, setTimer] = useState(61);
    
    const asciiCrown = `
    ⚜️ 👑 ⚜️
    ===============
    `;

    const consoleStyles = {
        fontFamily: 'monospace',
        backgroundColor: '#1a1a1a',
        color: '#00ff00',
        padding: '40px',
        borderRadius: '10px',
        height: '600px',
        overflow: 'auto',
        whiteSpace: 'pre',
        fontSize: '14px'
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (timer > 0) {
                setTimer(prev => prev - 1);
                addConsoleLine(`Time remaining: ${timer - 1} seconds`);
                
                // רנדומלי מוסיף פקודות "מלכותיות" לקונסול
                if (Math.random() > 0.7) {
                    const commands = [
                        '> Scanning royal treasury...',
                        '> Checking castle defenses...',
                        '> Monitoring kingdom borders...',
                        '> Updating cat positions...',
                        '> Processing wisdom levels...',
                        '> Calculating silence intensity...',
                        '> Measuring knight bravery...',
                        '> Analyzing princess strategies...'
                    ];
                    addConsoleLine(commands[Math.floor(Math.random() * commands.length)]);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const addConsoleLine = (line) => {
        setConsoleLines(prev => {
            const newLines = [...prev, line];
            if (newLines.length > 100) newLines.shift(); // שומר על גודל סביר
            return newLines;
        });
    };

    const generateStatusBar = () => {
        const length = 42;
        const filled = Math.floor((timer / 61) * length);
        return `[${'▓'.repeat(filled)}${'░'.repeat(length - filled)}]`;
    };

    return (
        <div style={consoleStyles}>
            {asciiCrown}
            {`Royal Terminal v1.0.0 - Kingdom Management System\n`}
            {`Status: ${generateStatusBar()} ${timer}s\n`}
            {`Current Power Level: ${Math.floor(Math.random() * 100)}%\n`}
            {`=`.repeat(50)}
            {'\n\n'}
            {consoleLines.map((line, index) => (
                <div key={index} style={{ color: line.startsWith('>') ? '#ffff00' : '#00ff00' }}>
                    {line}
                </div>
            ))}
        </div>
        
    );
};



export default QuantumBusinessInterface;