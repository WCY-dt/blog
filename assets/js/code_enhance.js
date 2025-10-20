(function () {
  'use strict';

  // Function to toggle fullscreen mode for a code block
  window.toggleCodeFullscreen = function (codeId) {
    const wrapper = document.getElementById('wrapper-' + codeId);
    const fullscreenBtn = document.getElementById('fullscreen-btn-' + codeId);

    if (!wrapper || !fullscreenBtn) {
      return;
    }

    const icon = fullscreenBtn.querySelector('.material-symbols-outlined');

    if (wrapper.classList.contains('fullscreen')) {
      // Exit fullscreen mode
      wrapper.classList.remove('fullscreen');
      icon.textContent = 'open_in_full';
      fullscreenBtn.title = 'Toggle Fullscreen';
      document.body.style.overflow = '';
    } else {
      // Enter fullscreen mode
      wrapper.classList.add('fullscreen');
      icon.textContent = 'close_fullscreen';
      fullscreenBtn.title = 'Exit Fullscreen';
      document.body.style.overflow = 'hidden';
    }
  };

  // Add event listener for the ESC key to exit fullscreen mode
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const fullscreenWrapper = document.querySelector('.code-block-wrapper.fullscreen');
      if (fullscreenWrapper) {
        const codeId = fullscreenWrapper.id.replace('wrapper-', '');
        toggleCodeFullscreen(codeId);
      }
    }
  });

  // Function to copy code content to the clipboard
  window.copyCode = function (codeId) {
    const codeElement = document.getElementById(codeId);
    const button = document.getElementById('copy-btn-' + codeId);

    if (!codeElement || !button) {
      return;
    }

    const copyIcon = button.querySelector('.copy-icon');
    const checkIcon = button.querySelector('.check-icon');

    try {
      const codeText = codeElement.textContent || codeElement.innerText;

      if (navigator.clipboard && window.isSecureContext) {
        // Use the Clipboard API to copy text
        navigator.clipboard.writeText(codeText).then(function () {
          showSuccessState(copyIcon, checkIcon);
        }).catch(function (err) {
          console.error('Failed to copy text:', err);
          fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
        });
      } else {
        // Fallback method for copying text
        fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
      }
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

  // Function to show success state after copying
  function showSuccessState(copyIcon, checkIcon) {
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'inline-block';

    setTimeout(function () {
      checkIcon.style.display = 'none';
      copyIcon.style.display = 'inline-block';
    }, 2000);
  }

  // Fallback method to copy text using a temporary textarea
  function fallbackCopyTextToClipboard(text, copyIcon, checkIcon) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showSuccessState(copyIcon, checkIcon);
      } else {
        console.error('Failed to execute copy command');
      }
    } catch (err) {
      console.error('Failed to copy text using fallback method:', err);
    }

    document.body.removeChild(textArea);
  }

  // Add event listeners after the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners to all copy buttons
    document.querySelectorAll('.code-copy-button').forEach(function (button) {
      const codeId = button.id.replace('copy-btn-', '');
      button.addEventListener('click', function () {
        copyCode(codeId);
      });
    });

    // Add event listeners to all toggle white space buttons
    document.querySelectorAll('.code-white-space-button').forEach(function (button) {
      const codeId = button.id.replace('whitespace-btn-', '');
      button.addEventListener('click', function () {
        const codeElement = document.getElementById(codeId);
        if (codeElement) {
          if (codeElement.style.whiteSpace === 'pre-wrap') {
            codeElement.style.whiteSpace = 'pre';
            codeElement.style.wordBreak = 'normal';
            button.title = 'Enable Word Wrap';
            button.classList.remove('active');
          } else {
            codeElement.style.whiteSpace = 'pre-wrap';
            codeElement.style.wordBreak = 'break-word';
            button.title = 'Disable Word Wrap';
            button.classList.add('active');
          }
        }
      });
    });

    // Add event listeners to all fullscreen buttons
    document.querySelectorAll('.code-fullscreen-button').forEach(function (button) {
      const codeId = button.id.replace('fullscreen-btn-', '');
      button.addEventListener('click', function () {
        toggleCodeFullscreen(codeId);
      });
    });
  });
})();
