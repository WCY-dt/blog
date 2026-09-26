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
    this.fullscreenBtn = this.container.querySelector('.code-runner__fullscreen-btn');

    this.currentLanguage = this.container.dataset.language || 'python';
    this.pyodide = null;
    this.compilersList = [];
    this.compilers = {};

    this.originalLanguage = this.currentLanguage;
    this.originalCode = this.editor.value;
    this.drafts = new Map([[this.currentLanguage, this.originalCode]]);
    this.preparationRevision = 0;

    this.init();
  }

  async init() {
    this.languageSelect.value = this.currentLanguage;
    this.languageLocked = this.languageSelect.disabled;
    this.languageSelect.setAttribute('aria-label', '代码语言');
    this.editor.setAttribute('aria-label', '可运行代码');
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');
    this.retryBtn = document.createElement('button');
    this.retryBtn.type = 'button';
    this.retryBtn.className = 'component-retry';
    this.retryBtn.textContent = '重新准备';
    this.retryBtn.hidden = true;
    this.retryBtn.addEventListener('click', async () => {
      if (await this.prepareLanguage()) this.runBtn.focus({ preventScroll: true });
    });
    this.status.parentElement.append(this.retryBtn);
    window.articleTools.label(this.refreshBtn, '恢复初始代码');
    this.runBtn.setAttribute('aria-label', '运行代码');
    const runIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    runIcon.setAttribute('class', 'runner-play-icon');
    runIcon.setAttribute('viewBox', '0 0 16 16');
    runIcon.setAttribute('width', '14');
    runIcon.setAttribute('height', '14');
    runIcon.setAttribute('aria-hidden', 'true');
    const runTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    runTriangle.setAttribute('d', 'M4 2 14 8 4 14Z');
    runTriangle.setAttribute('fill', 'currentColor');
    runIcon.append(runTriangle);
    const runLabel = document.createElement('span');
    runLabel.textContent = '运行';
    this.runLabel = runLabel;
    this.runBtn.replaceChildren(runIcon, runLabel);
    window.articleTools.label(this.fullscreenBtn, '全屏显示代码运行器');
    this.languageSelect.addEventListener('change', async (e) => await this.switchLanguage(e.target.value));
    this.runBtn.addEventListener('click', async () => await this.runCode());
    this.refreshBtn.addEventListener('click', async () => await this.refresh());
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    await this.clearOutput();
  }

  async runCode() {
    if (this.running || this.runBtn.disabled) return;
    this.output.textContent = '';

    const code = this.editor.value;
    if (!code.trim()) {
      this.setStatus('请先输入代码', true);
      return;
    }

    this.running = true;
    this.container.dataset.runnerState = 'running';
    delete this.container.dataset.runnerError;
    if (this.runLabel) this.runLabel.textContent = '运行中…';
    this.runBtn.disabled = true;
    this.refreshBtn.disabled = true;
    this.languageSelect.disabled = true;
    this.container.setAttribute('aria-busy', 'true');
    this.setStatus('正在运行…');

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
      this.setStatus('运行完成');
      this.container.dataset.runnerState = 'ready';
    } catch (error) {
      this.output.textContent = `Error: ${error.message}`;
      this.setStatus('运行失败', true);
      this.container.dataset.runnerState = 'error';
      this.container.dataset.runnerError = 'runtime';
    } finally {
      this.running = false;
      if (this.runLabel) this.runLabel.textContent = '运行';
      this.runBtn.disabled = false;
      this.refreshBtn.disabled = false;
      this.languageSelect.disabled = this.languageLocked;
      this.container.removeAttribute('aria-busy');
    }
  }

  async runPythonCode(code) {
    try {
      if (!this.pyodide) {
        throw new Error('Python 尚未准备就绪');
      }

      await this.pyodide.runPythonAsync('import sys\nfrom io import StringIO\nold_stdout = sys.stdout\nsys.stdout = captured_output = StringIO()');

      let result;
      try {
        await this.pyodide.runPythonAsync(code);
        result = await this.pyodide.runPythonAsync('captured_output.getvalue()');
      } finally {
        await this.pyodide.runPythonAsync('sys.stdout = old_stdout');
      }

      return result || '运行成功（无输出）';
    } catch (error) {
      throw new Error('Python Error: ' + error.message);
    }
  }

  async runJavaScriptCode(code) {
    let result = '';
    const capturedConsole = Object.create(console);
    capturedConsole.log = (...args) => { result += args.join(' ') + '\n'; };
    try {
      // Keep each editor's logging local, including asynchronous evaluations.
      await (function(console) { return eval(code); })(capturedConsole);
      return result || '运行成功（无输出）';
    } catch (error) {
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
    // Reuse an in-flight load when a reader switches away and back.
    if (!this.pyodideLoading) {
      this.pyodideLoading = (async () => {
        if (CodeRunner.pyodideFactoryFailed) await CodeRunner.restorePyodideFactory();
        try {
          this.pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
          });
        } catch (error) {
          if (typeof globalThis._createPyodideModule !== 'function') CodeRunner.pyodideFactoryFailed = true;
          throw error;
        }
      })();
    }
    try { await this.pyodideLoading; }
    finally { this.pyodideLoading = null; }
  }

  static async restorePyodideFactory() {
    if (typeof globalThis._createPyodideModule === 'function') return;
    // The bundled 0.29 loader imports this file only when its global factory is
    // absent. A failed import stays in the browser's module map. The same
    // official file also supports classic scripts and publishes that factory,
    // letting the unchanged loader retry without reloading the reader's page.
    if (!CodeRunner.pyodideFactoryLoading) {
      CodeRunner.pyodideFactoryLoading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.asm.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        const finish = error => {
          clearTimeout(timer);
          script.onload = null;
          script.onerror = null;
          script.remove();
          if (error) reject(error);
          else resolve();
        };
        const timer = setTimeout(() => finish(new Error('Python 加载超时')), 30000);
        script.onload = () => finish(typeof globalThis._createPyodideModule === 'function' ? null : new Error('Python 运行模块未能初始化'));
        script.onerror = () => finish(new Error('Python 运行模块加载失败'));
        document.head.append(script);
      });
    }
    try { await CodeRunner.pyodideFactoryLoading; }
    finally { CodeRunner.pyodideFactoryLoading = null; }
  }

  async initializeWandboxCompilers() {
    if (this.compilersList.length > 0) return;
    if (!this.compilersLoading) this.compilersLoading = (async () => {
      const response = await fetch('https://wandbox.org/api/list.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const catalogue = await response.json();
      if (!Array.isArray(catalogue) || !catalogue.length) throw new Error('编译器列表为空');
      this.compilersList = catalogue;
    })();
    try { await this.compilersLoading; }
    finally { this.compilersLoading = null; }
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
      if (matching.length === 0) {
        this.compilers[lang] = null;
        continue;
      }

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

    return this.compilers[language] ? { name: this.compilers[language] } : null;
  }

  async switchLanguage(language) {
    if (this.running || language === this.currentLanguage) return;
    this.drafts.set(this.currentLanguage, this.editor.value);
    this.currentLanguage = language;
    this.editor.value = this.drafts.get(language) || '';
    await this.clearOutput();
  }

  async clearOutput() {
    this.output.textContent = '';
    return this.prepareLanguage();
  }

  async prepareLanguage() {
    if (this.running) return false;
    const revision = ++this.preparationRevision;
    const language = this.currentLanguage;
    this.container.dataset.runnerState = 'preparing';
    delete this.container.dataset.runnerError;
    this.container.setAttribute('aria-busy', 'true');
    this.setStatus(language === 'python' ? '正在准备 Python…' : language === 'javascript' ? '正在准备…' : '正在准备编译器…');
    this.runBtn.disabled = true;
    this.retryBtn.disabled = true;
    try {
      await this.initializeLanguage(language);
      if (revision !== this.preparationRevision) return false;
      if (!['javascript', 'python'].includes(language) && !this.selectCompiler(language)) {
        this.compilersList = [];
        throw new Error('当前服务没有此语言的编译器');
      }
      this.container.dataset.runnerState = 'ready';
      this.retryBtn.hidden = true;
      this.runBtn.disabled = false;
      this.setStatus('准备就绪');
      return true;
    } catch (error) {
      if (revision !== this.preparationRevision) return false;
      console.warn('运行环境准备失败:', error);
      this.container.dataset.runnerState = 'error';
      this.container.dataset.runnerError = 'preparation';
      this.retryBtn.hidden = false;
      this.setStatus(`${language === 'python' ? 'Python' : '编译器'} 准备失败，可重新准备；代码已保留`, true);
      return false;
    } finally {
      if (revision === this.preparationRevision) {
        this.retryBtn.disabled = false;
        this.container.removeAttribute('aria-busy');
      }
    }
  }

  async refresh() {
    if (this.running) return;
    this.drafts.set(this.currentLanguage, this.editor.value);
    this.editor.value = this.originalCode;
    this.currentLanguage = this.originalLanguage;
    this.drafts.set(this.originalLanguage, this.originalCode);
    this.languageSelect.value = this.originalLanguage;
    await this.clearOutput();
  }

  setStatus(text, isErr = false) {
    this.status.textContent = text;
    this.status.className = `code-runner__status-text${isErr ? ' code-runner__status-text--error' : ''}`;
  }

  toggleFullscreen() {
    const isFullscreen = this.container.classList.contains('fullscreen');
    window.articleTools.label(this.fullscreenBtn, isFullscreen ? '全屏显示代码运行器' : '退出全屏 · Esc');
    this.fullscreenBtn.setAttribute('aria-pressed', String(!isFullscreen));

    if (isFullscreen) {
      // Exit fullscreen
      this.container.classList.remove('fullscreen');
      document.body.style.overflow = this.previousOverflow || '';

      // Update button icon
      const icon = this.fullscreenBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = 'open_in_full';
      }

      // Remove escape key listener
      document.removeEventListener('keydown', this.escapeHandler);
    } else {
      // Enter fullscreen
      this.container.classList.add('fullscreen');
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Update button icon
      const icon = this.fullscreenBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = 'close_fullscreen';
      }

      // Add escape key listener
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
          this.toggleFullscreen();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
    this.fullscreenBtn.focus({ preventScroll: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.code-runner__container');
  containers.forEach(container => {
    new CodeRunner(`#${container.id}`);
  });
});
