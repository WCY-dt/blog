(function () {
  'use strict';

  window.showCopyButton = function (codeId) {
    const button = document.getElementById('copy-btn-' + codeId);
    if (button) {
      button.style.opacity = '1';
    }
  };

  window.hideCopyButton = function (codeId) {
    const button = document.getElementById('copy-btn-' + codeId);
    if (button) {
      button.style.opacity = '0';
    }
  };

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

        wrapper.setAttribute('onmouseenter', 'showCopyButton("' + codeBlock.id + '")');
        wrapper.setAttribute('onmouseleave', 'hideCopyButton("' + codeBlock.id + '")');

        const button = document.createElement('div');
        button.className = 'code-copy-button';
        button.id = 'copy-btn-' + codeBlock.id;
        button.setAttribute('onclick', 'copyCode("' + codeBlock.id + '")');
        button.setAttribute('title', 'copy code');
        button.innerHTML = '<span class="copy-icon material-symbols-outlined">content_copy</span><span class="check-icon material-symbols-outlined" style="display: none;">check</span>';

        const pre = codeBlock.parentNode;
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);
      }
    });
  });

})()
