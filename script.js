        const codeEditor = document.getElementById('code');
        const outputSection = document.getElementById('output');
        const runButton = document.getElementById('run-button');
        const clearButton = document.getElementById('clear-button');
        const languageSelect = document.getElementById('language');

        // Sample code for different languages
        const samples = {
            javascript: `// Write your JavaScript code here...
console.log('Hello World!');
return 'Code executed successfully!';`,
            python: `# Python code (simulated - runs as JavaScript)
# Note: This is a demo. Python syntax shown but executes as JS
print = console.log;
print('Hello from Python!');
return 'Python simulation complete!';`,
            html: `// HTML code preview
const html = \`
<div>
    <h1>Hello World!</h1>
    <p>This is a sample HTML structure.</p>
</div>
\`;
console.log(html);
return 'HTML structure created!';`,
            css: `// CSS code preview
const css = \`
body {
    font-family: Arial, sans-serif;
    background: #f0f0f0;
    margin: 0;
    padding: 20px;
}
\`;
console.log(css);
return 'CSS styles defined!';`,
            json: `// JSON data example
const jsonData = {
    "name": "Code Editor",
    "version": "1.0",
    "features": ["syntax highlighting", "multi-language", "responsive"]
};
console.log(JSON.stringify(jsonData, null, 2));
return 'JSON data processed!';`
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

        // Language change handler
        languageSelect.addEventListener('change', () => {
            const selectedLanguage = languageSelect.value;
            codeEditor.value = samples[selectedLanguage];
            outputSection.textContent = `${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} template loaded. Click "Run" to execute.`;
        });

        runButton.addEventListener('click', () => {
            const code = codeEditor.value.trim();
            const language = languageSelect.value;
            
            if (!code) {
                outputSection.textContent = 'Please enter some code first.';
                return;
            }

            // Only JavaScript can actually execute
            if (language !== 'javascript') {
                outputSection.textContent = `Note: Currently only JavaScript execution is supported. 
Showing ${language} code structure...

${code}`;
                return;
            }

            consoleOutput = [];
            captureConsole();

            try {
                const func = new Function(code);
                const result = func();
                
                restoreConsole();
                
                let output = '';
                if (consoleOutput.length > 0) {
                    output += consoleOutput.join('\n') + '\n\n';
                }
                
                if (result !== undefined) {
                    output += 'Return: ' + String(result);
                } else if (consoleOutput.length === 0) {
                    output = 'Code executed successfully.';
                }
                
                outputSection.textContent = output;
                
            } catch (error) {
                restoreConsole();
                outputSection.textContent = 'Error: ' + error.message;
            }
        });

        clearButton.addEventListener('click', () => {
            codeEditor.value = '';
            outputSection.textContent = 'Output cleared.';
            codeEditor.focus();
        });

        // Keyboard shortcut: Ctrl+Enter to run
        codeEditor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runButton.click();
            }
        });

        // Initialize with JavaScript template
        codeEditor.value = samples.javascript;
    