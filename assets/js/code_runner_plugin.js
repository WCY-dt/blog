class CodeRunner {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
    if (!this.container) return;

    this.languageSelect = this.container.querySelector('.code-runner__language-select');
    this.editor = this.container.querySelector('.code-runner__editor');
    this.output = this.container.querySelector('.code-runner__output');
    this.status = this.container.querySelector('.code-runner__status-text');
    this.runBtn = this.container.querySelector('.code-runner__run-btn');
    this.refreshBtn = this.container.querySelector('.code-runner__refresh-btn');

    this.currentLanguage = this.container.dataset.language || 'python';
    this.pyodide = null;
    this.compilersList = [];
    this.compilers = {};

    this.originalLanguage = this.currentLanguage;
    this.originalCode = this.editor.value;

    this.init();
  }

  async init() {
    this.languageSelect.value = this.currentLanguage;
    this.languageSelect.addEventListener('change', async (e) => await this.switchLanguage(e.target.value));
    await this.initializeLanguage(this.currentLanguage);
    this.runBtn.addEventListener('click', async () => await this.runCode());
    this.refreshBtn.addEventListener('click', async () => await this.refresh());
  }

  async runCode() {
    this.output.textContent = '';

    const code = this.editor.value;
    if (!code.trim()) {
      this.setStatus('No code to run', true);
      return;
    }

    this.setStatus('Running...', true);

    try {
      let result;
      if (this.currentLanguage === 'python') {
        result = await this.runPythonCode(code);
      } else if (this.currentLanguage === 'javascript') {
        result = await this.runJavaScriptCode(code);
      } else {
        result = await this.runWandboxCode(code, this.currentLanguage);
      }
      this.output.textContent = result;
      this.setStatus('Ready to run');
    } catch (error) {
      this.output.textContent = `Error: ${error.message}`;
      this.setStatus('Error occurred', true);
    }
  }

  async runPythonCode(code) {
    try {
      if (!this.pyodide) {
        this.setStatus('Failed to load Pyodide', true);
        throw new Error('Pyodide not loaded');
      }

      await this.pyodide.runPythonAsync('import sys\nfrom io import StringIO\nold_stdout = sys.stdout\nsys.stdout = captured_output = StringIO()');

      await this.pyodide.runPythonAsync(code);

      const result = await this.pyodide.runPythonAsync('captured_output.getvalue()');
      await this.pyodide.runPythonAsync('sys.stdout = old_stdout');

      return result || 'Code executed successfully';
    } catch (error) {
      throw new Error('Python Error: ' + error.message);
    }
  }

  async runJavaScriptCode(code) {
    try {
      let result = '';
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        result += args.join(' ') + '\n';
      };

      eval(code);

      console.log = originalConsoleLog;

      return result || 'Code executed successfully';
    } catch (error) {
      console.log = originalConsoleLog;
      throw new Error('JavaScript Error: ' + error.message);
    }
  }

  async runWandboxCode(code, language) {
    const compiler = this.selectCompiler(language);
    if (!compiler) {
      throw new Error(`No compiler found for ${language}`);
    }

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        compiler: compiler.name,
        options: '',
        'compiler-option-raw': '',
        'runtime-option-raw': ''
      })
    });

    if (!response.ok) {
      console.error('Wandbox API error:', response.status, response.statusText, await response.text());
      throw new Error('Compilation failed');
    }

    const result = await response.json();

    if (parseInt(result.status) === 0) {
      return result.program_output || 'Compilation successful';
    } else {
      throw new Error(`Compilation failed: ${result.compiler_error || result.program_error || result.compiler_message || 'Unknown error'}`);
    }
  }

  async initializeLanguage(language) {
    if (language === 'python') {
      await this.initializePyodide();
    } else if (['javascript', 'python'].includes(language)) {
      // Ready for JS/Python
    } else {
      await this.initializeWandboxCompilers();
    }
  }

  async initializePyodide() {
    if (this.pyodide) return;
    this.setStatus('Loading Pyodide...', true);

    try {
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
      });
      this.setStatus('Ready to run');
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      this.setStatus('Failed to load Pyodide', true);
    }
  }

  async initializeWandboxCompilers() {
    if (this.compilersList.length > 0) return;
    this.setStatus('Loading compilers...', true);

    try {
      const response = await fetch('https://wandbox.org/api/list.json');
      this.compilersList = await response.json();
      this.setStatus('Ready to run');
    } catch (error) {
      console.error('Failed to fetch compilers:', error);
      this.setStatus('Failed to load compilers', true);
    }
  }

  selectCompiler(language) {
    const languageToCompilerConfig = {
      'c': { language: 'C', keywords: ['gcc', 'c'], excludes: ['-c', '-pp'] },
      'cpp': { language: 'C++', keywords: ['gcc'] },
      'go': { language: 'Go', keywords: ['go'] },
      'haskell': { language: 'Haskell', keywords: ['ghc'] },
      'java': { language: 'Java', keywords: ['openjdk'] },
      'lua': { language: 'Lua', keywords: ['lua'] },
      'perl': { language: 'Perl', keywords: ['perl'] },
      'ruby': { language: 'Ruby', keywords: ['ruby'] },
      'rust': { language: 'Rust', keywords: ['rust'] }
      // python and javascript are handled separately, not via Wandbox
    };

    // Set compilers to latest versions based on mapping
    for (const lang in languageToCompilerConfig) {
      const languageConfig = languageToCompilerConfig[lang];

      const matching = this.compilersList.filter(c => {
        return (languageConfig.keywords.every(kw => c.name.toLowerCase().includes(kw)) &&
        (languageConfig.excludes || []).every(ex => !c.name.toLowerCase().includes(ex)));
      });
      if (matching.length === 0) this.compilers[lang] = null;

      // Helper function to parse and compare versions
      function compareVersions(a, b) {
        const parseVersion = (v) => {
          const match = v.match(/(\d+(?:\.\d+)*)/);
          return match ? match[1].split('.').map(Number) : [0];
        }

        const va = parseVersion(a);
        const vb = parseVersion(b);

        for (let i = 0; i < Math.max(va.length, vb.length); i++) {
          const na = va[i] || 0;
          const nb = vb[i] || 0;
          if (na > nb) return 1;
          if (na < nb) return -1;
        }

        return 0;
      }

      // Prefer HEAD versions first
      const heads = matching.filter(c => {
        return c.name.toLowerCase().includes('head');
      });
      if (heads.length > 0) {
        heads.sort((a, b) => compareVersions(b.version, a.version));
        this.compilers[lang] = heads[0].name;
      } else {
        // Otherwise, select the one with the highest version
        matching.sort((a, b) => compareVersions(b.version, a.version));
        this.compilers[lang] = matching[0].name;
      }
    }

    return { name: this.compilers[language] };
  }

  async switchLanguage(language) {
    this.currentLanguage = language;
    this.editor.value = '';
    await this.clearOutput();
  }

  async clearOutput() {
    this.output.textContent = '';
    this.setStatus('Ready to run');
    await this.initializeLanguage(this.currentLanguage);
  }

  async refresh() {
    this.editor.value = this.originalCode;
    this.currentLanguage = this.originalLanguage;
    this.languageSelect.value = this.originalLanguage;
    this.clearOutput();
    await this.initializeLanguage(this.currentLanguage);
  }

  setStatus(text, isErr = false) {
    this.status.textContent = text;
    this.status.className = `code-runner__status-text${isErr ? ' code-runner__status-text--error' : ''}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.code-runner__container');
  containers.forEach(container => {
    new CodeRunner(`#${container.id}`);
  });
});
