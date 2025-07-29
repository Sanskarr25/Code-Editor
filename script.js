// DOM Elements
const codeEditor = document.getElementById('code');
const outputSection = document.getElementById('output');
const runButton = document.getElementById('run-button');
const clearButton = document.getElementById('clear-button');
const shareButton = document.getElementById('share-button');
const formatButton = document.getElementById('format-btn');
const copyOutputButton = document.getElementById('copy-output-btn');
const languageSelect = document.getElementById('language');
const lineNumbers = document.getElementById('line-numbers');
const lineCount = document.getElementById('line-count');
const statusIndicator = document.getElementById('status-indicator');
const executionTime = document.getElementById('execution-time');
const timeValue = document.getElementById('time-value');

// Sample code for different languages
const samples = {
    javascript: `// Welcome to Code Editor Pro! 🚀
// Try out these examples or write your own code

// Basic console output
console.log('Hello, World! 👋');

// Variables and functions
const greetUser = (name) => {
    return \`Welcome, \${name}! Ready to code? ✨\`;
};

// Array operations
const languages = ['JavaScript', 'Python', 'HTML', 'CSS'];
console.log('Supported languages:', languages.join(', '));

// Object manipulation
const codeStats = {
    linesWritten: 42,
    bugsFixed: 7,
    coffeeConsumed: '∞'
};

console.log('Today\\'s coding stats:', codeStats);

// Return a success message
return greetUser('Developer');`,
    
    python: `# Python code (simulated - runs as JavaScript)
# Note: This is a demo. Python syntax shown but executes as JS

# Python-style printing (mapped to console.log)
print = console.log;

# Variables and data structures
name = "Python Developer";
languages = ["Python", "JavaScript", "Java", "C++"];

print("Hello from Python! 🐍");
print(f"Welcome, {name}!");
print("Available languages:", ", ".join(languages));

# Dictionary (object in JS)
stats = {
    "version": "3.9",
    "paradigm": "multi-paradigm",
    "typing": "dynamic"
};

print("Python stats:", JSON.stringify(stats, null, 2));

return "Python simulation complete! 🎉";`,
    
    html: `// HTML code preview
// This shows how HTML structure looks

const createHTML = () => {
    const html = \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome Page</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { color: #333; text-align: center; }
        .content { margin: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to My Page! 🌟</h1>
    </div>
    <div class="content">
        <p>This is a sample HTML structure.</p>
        <ul>
            <li>Modern design</li>
            <li>Responsive layout</li>
            <li>Clean code</li>
        </ul>
    </div>
</body>
</html>
    \`;
    
    console.log('HTML Structure:');
    console.log(html);
    return 'HTML template created successfully! 🎨';
};

return createHTML();`,
    
    css: `// CSS code preview
// This shows modern CSS styling techniques

const modernCSS = \`
/* Modern CSS with Grid and Flexbox */
:root {
    --primary-color: #333;
    --secondary-color: #f8f9fa;
    --accent-color: #007bff;
    --border-radius: 8px;
}

.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    background: var(--secondary-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}
\`;

console.log('Modern CSS Styles:');
console.log(modernCSS);

return 'CSS styles generated! Modern, responsive, and beautiful! 💅';`,
    
    json: `// JSON data example
// Working with JSON in JavaScript

const sampleData = {
    "app": {
        "name": "Code Editor Pro",
        "version": "2.0.0",
        "author": "Developer",
        "features": [
            "Syntax highlighting",
            "Multi-language support",
            "Responsive design",
            "Modern UI",
            "Real-time execution"
        ]
    },
    "settings": {
        "theme": "modern",
        "fontSize": 14,
        "lineNumbers": true,
        "autoSave": false
    },
    "stats": {
        "totalUsers": 1337,
        "codeExecutions": 9001,
        "satisfaction": "100%"
    }
};

// Pretty print JSON
console.log('📊 Application Data:');
console.log(JSON.stringify(sampleData, null, 2));

// Working with the data
console.log(\`\\n🚀 App: \${sampleData.app.name} v\${sampleData.app.version}\`);
console.log(\`⭐ Features: \${sampleData.app.features.length} amazing features!\`);
console.log(\`👥 Users: \${sampleData.stats.totalUsers} developers\`);

return 'JSON data processed successfully! 📋✨';`
};

// Console capture
let consoleOutput = [];
const originalConsole = console.log;

function captureConsole() {
    console.log = (...args) => {
        consoleOutput.push(args.join(' '));
        originalConsole(...args);
    };
}

function restoreConsole() {
    console.log = originalConsole;
}

// Update line numbers
function updateLineNumbers() {
    const lines = codeEditor.value.split('\n');
    const lineNumbersText = lines.map((_, index) => index + 1).join('\n');
    lineNumbers.textContent = lineNumbersText;
    lineCount.textContent = lines.length;
}

// Update status indicator
function updateStatus(status, color = '#28a745') {
    const statusSpan = statusIndicator.querySelector('span');
    const statusIcon = statusIndicator.querySelector('i');
    statusSpan.textContent = status;
    statusIcon.style.color = color;
}

// Format code (basic indentation)
function formatCode() {
    const code = codeEditor.value;
    const lines = code.split('\n');
    const formattedLines = [];
    let currentIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        
        if (!trimmedLine) {
            formattedLines.push('');
            continue;
        }
        
        // Decrease indent for closing brackets (before formatting the line)
        if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']') || trimmedLine.startsWith(')')) {
            currentIndent = Math.max(0, currentIndent - 1);
        }
        
        const formattedLine = '  '.repeat(currentIndent) + trimmedLine;
        formattedLines.push(formattedLine);
        
        // Increase indent for opening brackets (after formatting the line)
        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
            currentIndent++;
        }
    }
    
    codeEditor.value = formattedLines.join('\n');
    updateLineNumbers();
    updateStatus('Code formatted', '#007bff');
    setTimeout(() => updateStatus('Ready'), 2000);
}

// Copy output to clipboard
async function copyOutput() {
    try {
        const text = outputSection.textContent;
        await navigator.clipboard.writeText(text);
        updateStatus('Output copied!', '#28a745');
        setTimeout(() => updateStatus('Ready'), 2000);
    } catch (err) {
        updateStatus('Copy failed', '#dc3545');
        setTimeout(() => updateStatus('Ready'), 2000);
    }
}

// Share code (creates a simple encoded URL)
function shareCode() {
    const code = codeEditor.value;
    const encodedCode = btoa(encodeURIComponent(code));
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodedCode}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        updateStatus('Share link copied!', '#007bff');
        setTimeout(() => updateStatus('Ready'), 2000);
    }).catch(() => {
        updateStatus('Share failed', '#dc3545');
        setTimeout(() => updateStatus('Ready'), 2000);
    });
}

// Load code from URL if present
function loadCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedCode = urlParams.get('code');
    
    if (encodedCode) {
        try {
            const code = decodeURIComponent(atob(encodedCode));
            codeEditor.value = code;
            updateLineNumbers();
            updateStatus('Code loaded from share link', '#007bff');
            setTimeout(() => updateStatus('Ready'), 3000);
        } catch (err) {
            console.error('Failed to load code from URL:', err);
        }
    }
}

// Language change handler
function handleLanguageChange() {
    const selectedLanguage = languageSelect.value;
    codeEditor.value = samples[selectedLanguage];
    updateLineNumbers();
    
    // Clear output and show template loaded message
    outputSection.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-code"></i>
            <h3>${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Template Loaded!</h3>
            <p>Click <strong>"Run Code"</strong> to execute</p>
            <div class="shortcuts">
                <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Run Code</span>
                <span><kbd>Ctrl</kbd> + <kbd>K</kbd> - Clear</span>
            </div>
        </div>
    `;
    
    updateStatus(`${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} loaded`, '#007bff');
    setTimeout(() => updateStatus('Ready'), 2000);
}

// Run code
function runCode() {
    const code = codeEditor.value.trim();
    const language = languageSelect.value;
    
    if (!code) {
        outputSection.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>
                <h3>No Code to Execute</h3>
                <p>Please enter some code first!</p>
            </div>
        `;
        updateStatus('No code entered', '#ffc107');
        return;
    }

    // Only JavaScript can actually execute
    if (language !== 'javascript') {
        outputSection.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-info-circle" style="color: #17a2b8;"></i>
                <h3>Language Preview Mode</h3>
                <p>Currently only JavaScript execution is supported.<br>
                Showing <strong>${language}</strong> code structure...</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px; font-family: monospace; white-space: pre-wrap; border-left: 4px solid #17a2b8;">${code}</div>
        `;
        updateStatus(`${language} preview`, '#17a2b8');
        return;
    }

    // Execute JavaScript
    consoleOutput = [];
    captureConsole();
    updateStatus('Executing...', '#ffc107');
    
    const startTime = performance.now();

    try {
        const func = new Function(code);
        const result = func();
        
        const endTime = performance.now();
        const executionTimeMs = Math.round(endTime - startTime);
        
        restoreConsole();
        
        let output = '';
        if (consoleOutput.length > 0) {
            output += consoleOutput.join('\n') + '\n\n';
        }
        
        if (result !== undefined) {
            output += '🎯 Return: ' + String(result);
        } else if (consoleOutput.length === 0) {
            output = '✅ Code executed successfully (no output)';
        }
        
        outputSection.innerHTML = `<div style="color: #28a745; margin-bottom: 10px;"><i class="fas fa-check-circle"></i> <strong>Execution Successful</strong></div><pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">${output}</pre>`;
        
        updateStatus('Executed successfully', '#28a745');
        
        // Show execution time
        timeValue.textContent = executionTimeMs;
        executionTime.style.display = 'flex';
        
    } catch (error) {
        restoreConsole();
        outputSection.innerHTML = `
            <div style="color: #dc3545; margin-bottom: 15px;">
                <i class="fas fa-exclamation-circle"></i> <strong>Execution Error</strong>
            </div>
            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
        updateStatus('Execution failed', '#dc3545');
        executionTime.style.display = 'none';
    }
}

// Clear code only
function clearCode() {
    codeEditor.value = '';
    outputSection.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-broom"></i>
            <h3>Editor Cleared</h3>
            <p>Ready for your new code!</p>
            <div class="shortcuts">
                <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Run Code</span>
                <span><kbd>Ctrl</kbd> + <kbd>K</kbd> - Clear</span>
            </div>
        </div>
    `;
    updateLineNumbers();
    updateStatus('Cleared', '#6c757d');
    executionTime.style.display = 'none';
    codeEditor.focus();
}

// Event Listeners
languageSelect.addEventListener('change', handleLanguageChange);
runButton.addEventListener('click', runCode);
clearButton.addEventListener('click', clearCode);
shareButton.addEventListener('click', shareCode);
formatButton.addEventListener('click', formatCode);
copyOutputButton.addEventListener('click', copyOutput);

// Update line numbers on input
codeEditor.addEventListener('input', updateLineNumbers);
codeEditor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeEditor.scrollTop;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearCode();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatCode();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    codeEditor.value = samples.javascript;
    updateLineNumbers();
    loadCodeFromURL();
    
    // Sync line numbers scroll with code editor
    lineNumbers.scrollTop = codeEditor.scrollTop;
});