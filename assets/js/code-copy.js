// 代码块复制功能
(function() {
  'use strict';

  // 显示复制按钮
  window.showCopyButton = function(codeId) {
    const button = document.getElementById('copy-btn-' + codeId);
    if (button) {
      button.style.opacity = '1';
    }
  };

  // 隐藏复制按钮
  window.hideCopyButton = function(codeId) {
    const button = document.getElementById('copy-btn-' + codeId);
    if (button) {
      // 如果正在显示成功状态，不要隐藏
      const checkIcon = button.querySelector('.check-icon');
      if (checkIcon && checkIcon.style.display === 'inline-block') {
        return;
      }
      button.style.opacity = '0';
    }
  };

  // 复制代码到剪贴板
  window.copyCode = function(codeId) {
    const codeElement = document.getElementById(codeId);
    const button = document.getElementById('copy-btn-' + codeId);

    if (!codeElement || !button) {
      return;
    }

    const copyIcon = button.querySelector('.copy-icon');
    const checkIcon = button.querySelector('.check-icon');

    try {
      // 获取代码文本
      const codeText = codeElement.textContent || codeElement.innerText;

      // 使用现代剪贴板API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeText).then(function() {
          showSuccessState(copyIcon, checkIcon);
        }).catch(function(err) {
          console.error('复制失败:', err);
          fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
        });
      } else {
        // 回退到传统方法
        fallbackCopyTextToClipboard(codeText, copyIcon, checkIcon);
      }
    } catch (err) {
      console.error('复制代码时出错:', err);
    }
  };

  // 显示成功状态
  function showSuccessState(copyIcon, checkIcon) {
    // 隐藏复制图标，显示勾勾
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'inline-block';

    // 2秒后切换回复制图标
    setTimeout(function() {
      checkIcon.style.display = 'none';
      copyIcon.style.display = 'inline-block';
    }, 2000);
  }

  // 传统复制方法（兼容旧浏览器）
  function fallbackCopyTextToClipboard(text, copyIcon, checkIcon) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 避免滚动到底部
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
        console.error('复制命令失败');
      }
    } catch (err) {
      console.error('传统复制方法失败:', err);
    }

    document.body.removeChild(textArea);
  }

  // 页面加载完成后的初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 为已存在的代码块添加复制功能
    const codeBlocks = document.querySelectorAll('pre code:not(.language-mermaid)');

    codeBlocks.forEach(function(codeBlock, index) {
      // 如果代码块还没有包装器，为其添加
      if (!codeBlock.closest('.code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        wrapper.setAttribute('onmouseenter', 'showCopyButton("' + codeBlock.id + '")');
        wrapper.setAttribute('onmouseleave', 'hideCopyButton("' + codeBlock.id + '")');

        // 如果代码块没有ID，生成一个
        if (!codeBlock.id) {
          codeBlock.id = 'code-' + Math.random().toString(36).substr(2, 9);
        }

        // 创建复制按钮
        const button = document.createElement('div');
        button.className = 'code-copy-button';
        button.id = 'copy-btn-' + codeBlock.id;
        button.setAttribute('onclick', 'copyCode("' + codeBlock.id + '")');
        button.setAttribute('title', '复制代码');
        button.innerHTML = '<span class="copy-icon">📋</span><span class="check-icon" style="display: none;">✅</span>';

        // 包装代码块
        const pre = codeBlock.parentNode;
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);
      }
    });
  });

})();
