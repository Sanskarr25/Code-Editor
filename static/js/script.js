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
    python: `#Type your Python code here`,
    
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
            <h3>Run ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} without any worries</h3>
            <p>Click <strong>"Run Code"</strong> to execute</p>
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
        // Handle empty code editor
        return;
    }

    if (language === 'python') {
        runPythonCode();  // <-- Calls Python API
    } else if (language === 'javascript') {
        executeJavaScript(code);  // <-- Execute JS locally
    } else {
        showPreviewMode(language, code);  // <-- C, C++, Java, TypeScript → Preview mode
    }
}

document.getElementById('run-button').addEventListener('click', runCode);


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

async function runPythonCode() {
    const code = document.getElementById("code").value;

    const response = await fetch('/execute/python', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })  // <-- Sending as JSON
    });

    const result = await response.json();

    console.log(result);

    outputSection.innerText = result.error ? result.error : result.output;
}


class CodeEditor {
    constructor() {
        this.currentLanguage = 'Python'; // Default to Python
        this.consoleOutput = [];
        this.originalConsole = console.log;
        this.setupEventListeners();
        this.loadInitialCode();
    }

    getEditorContent() {
        return document.getElementById('code').value; // ← YOUR textarea ID
    }

        // GET STDIN CONTENT - You might add an input field for this later
    getStdinContent() {
        // For now, return empty string. You can add an input field later
        return "";
    }

    

}