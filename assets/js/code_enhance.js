(function () {
  'use strict';

  window.showCodeButtons = function (codeId) {
    const buttons = document.querySelector('#wrapper-' + codeId + ' .code-block-buttons');
    if (buttons) {
      buttons.style.opacity = '1';
    }
  };

  window.hideCodeButtons = function (codeId) {
    const buttons = document.querySelector('#wrapper-' + codeId + ' .code-block-buttons');
    if (buttons) {
      const wrapper = document.getElementById('wrapper-' + codeId);
      if (wrapper && !wrapper.classList.contains('fullscreen')) {
        buttons.style.opacity = '0';
      }
    }
  };

  // Keep old functions for backward compatibility
  window.showCopyButton = window.showCodeButtons;
  window.hideCopyButton = window.hideCodeButtons;

  window.toggleCodeFullscreen = function (codeId) {
    const wrapper = document.getElementById('wrapper-' + codeId);
    const fullscreenBtn = document.getElementById('fullscreen-btn-' + codeId);

    if (!wrapper || !fullscreenBtn) {
      return;
    }

    const icon = fullscreenBtn.querySelector('.material-symbols-outlined');

    if (wrapper.classList.contains('fullscreen')) {
      wrapper.classList.remove('fullscreen');
      icon.textContent = 'open_in_full';
      fullscreenBtn.title = 'Toggle Fullscreen';
      document.body.style.overflow = '';
    } else {
      wrapper.classList.add('fullscreen');
      icon.textContent = 'close_fullscreen';
      fullscreenBtn.title = 'Exit Fullscreen';
      document.body.style.overflow = 'hidden';
    }
  };

  // ESC key to exit fullscreen
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const fullscreenWrapper = document.querySelector('.code-block-wrapper.fullscreen');
      if (fullscreenWrapper) {
        const codeId = fullscreenWrapper.id.replace('wrapper-', '');
        toggleCodeFullscreen(codeId);
      }
    }
  });

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
        navigator.clipboard.writeText(codeText).then(function () {
          showSuccessState(copyIcon, checkIcon);
        }).catch(function (err) {
          console.error('Failed to copy text:', err);
          fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
        });
      } else {
        fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
      }
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

  function showSuccessState(copyIcon, checkIcon) {
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'inline-block';

    setTimeout(function () {
      checkIcon.style.display = 'none';
      copyIcon.style.display = 'inline-block';
    }, 2000);
  }

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

  document.addEventListener('DOMContentLoaded', function () {
    const codeBlocks = document.querySelectorAll('pre code:not(.language-mermaid)');

    codeBlocks.forEach(function (codeBlock, index) {
      if (!codeBlock.closest('.code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        if (!codeBlock.id) {
          codeBlock.id = 'code-' + Math.random().toString(36).substr(2, 9);
        }

        wrapper.id = 'wrapper-' + codeBlock.id;
        wrapper.setAttribute('onmouseenter', 'showCodeButtons("' + codeBlock.id + '")');
        wrapper.setAttribute('onmouseleave', 'hideCodeButtons("' + codeBlock.id + '")');

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'code-block-buttons';

        const fullscreenButton = document.createElement('button');
        fullscreenButton.className = 'code-fullscreen-button';
        fullscreenButton.id = 'fullscreen-btn-' + codeBlock.id;
        fullscreenButton.setAttribute('onclick', 'toggleCodeFullscreen("' + codeBlock.id + '")');
        fullscreenButton.setAttribute('title', 'Toggle Fullscreen');
        fullscreenButton.innerHTML = '<span class="material-symbols-outlined">open_in_full</span>';

        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.id = 'copy-btn-' + codeBlock.id;
        copyButton.setAttribute('onclick', 'copyCode("' + codeBlock.id + '")');
        copyButton.setAttribute('title', 'Copy Code');
        copyButton.innerHTML = '<span class="copy-icon material-symbols-outlined">content_copy</span><span class="check-icon material-symbols-outlined" style="display: none;">check</span>';

        buttonContainer.appendChild(fullscreenButton);
        buttonContainer.appendChild(copyButton);

        const pre = codeBlock.parentNode;
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(buttonContainer);
        wrapper.appendChild(pre);
      }
    });
  });

})()
