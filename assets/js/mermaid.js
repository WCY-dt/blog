// Resolve the blog's theme and font before Mermaid measures its labels.
document.addEventListener('DOMContentLoaded', async () => {
  const diagrams = Array.from(document.querySelectorAll('.language-mermaid'), (node) => ({
    node,
    source: node.textContent,
  }));
  if (!diagrams.length) return;

  for (const diagram of diagrams) {
    const { node, source } = diagram;
    const status = document.createElement('div');
    status.className = 'diagram-status';
    status.setAttribute('role', 'status');
    status.textContent = '正在绘制图表…';
    node.insertAdjacentElement('beforebegin', status);
    diagram.status = status;
    node.hidden = true;
    node.nextElementSibling?.classList.contains('media-open-trigger') && (node.nextElementSibling.hidden = true);
    const fence = '`'.repeat(Math.max(3, ...(source.match(/`+/g) || []).map((run) => run.length + 1)));
    const button = window.markdownCopy?.button(`${fence}mermaid\n${source.trimEnd()}\n${fence}`, { label: '复制图表 Markdown', iconOnly: true });
    if (button) {
      button.classList.add('mermaid-copy-button');
      node.parentElement.append(button);
    }
  }

  await document.fonts.ready;
  const root = document.documentElement;
  // Navigation can detach the document while fonts are still loading.
  if (!root) return;
  let rendering = false;
  let pending = false;
  let revision = 0;

  function config(source) {
    const styles = getComputedStyle(root);
    const color = (name) => styles.getPropertyValue(`--mermaid-${name}`).trim();
    const text = color('text');
    const edgeText = color('edge-text');
    const surface = color('surface');
    const background = color('background');
    const border = color('border');
    const group = color('group');
    const groupBorder = color('group-border');
    const line = color('line');
    const fontFamily = styles.getPropertyValue('--text-font').trim();
    const isFlowchart = /^\s*(?:%%[^\n]*\n\s*)*(?:flowchart|graph)\b/.test(source);
    return {
      startOnLoad: false,
      securityLevel: 'loose',
      suppressErrorRendering: true,
      theme: 'base',
      look: isFlowchart ? 'neo' : 'classic',
      fontFamily,
      htmlLabels: isFlowchart,
      // Size labels to their content; only explicit breaks should split a line.
      markdownAutoWrap: false,
      // SVG edge labels have a hardcoded wrap width in Mermaid. HTML labels let
      // us remove that limit before Mermaid measures and lays out the graph.
      themeCSS: isFlowchart ? `
        /* Match measurement fonts after insertion into a styled code block. */
        foreignObject, foreignObject * { font-family: ${fontFamily} !important; }
        foreignObject > div {
          max-width: none !important;
          white-space: nowrap !important;
          line-height: 1.1 !important;
        }
        .node foreignObject > div { line-height: 1.4 !important; }
        /* Keep article paragraph styles from changing labels after measurement. */
        foreignObject p {
          font-size: inherit !important;
          line-height: inherit !important;
        }
        .cluster-label span {
          color: ${color('accent')} !important;
          font-weight: 600 !important;
        }
        .edgeLabel span, .edgeLabel p { color: ${edgeText} !important; }
      ` : '',
      sequence: { wrap: false },
      flowchart: {
        curve: 'rounded', htmlLabels: true, nodeSpacing: 36, rankSpacing: 48,
        wrappingWidth: Number.POSITIVE_INFINITY,
      },
      themeVariables: {
        darkMode: root.dataset.theme === 'dark',
        fontFamily,
        fontSize: '16px',
        background,
        primaryColor: surface,
        primaryTextColor: text,
        primaryBorderColor: border,
        secondaryColor: group,
        secondaryTextColor: text,
        secondaryBorderColor: groupBorder,
        tertiaryColor: group,
        tertiaryTextColor: text,
        tertiaryBorderColor: groupBorder,
        mainBkg: surface,
        nodeBorder: border,
        textColor: text,
        titleColor: text,
        lineColor: line,
        defaultLinkColor: line,
        // Labels mask only the line behind their text; the canvas stays clear.
        edgeLabelBackground: surface,
        clusterBkg: group,
        clusterBorder: groupBorder,
        actorBkg: surface,
        actorBorder: border,
        actorTextColor: text,
        actorLineColor: groupBorder,
        signalColor: line,
        signalTextColor: edgeText,
        labelBoxBkgColor: color('accent-surface'),
        labelBoxBorderColor: color('accent-border'),
        labelTextColor: color('accent'),
        loopTextColor: text,
        noteBkgColor: surface,
        noteBorderColor: color('accent-border'),
        noteTextColor: text,
        activationBkgColor: group,
        activationBorderColor: border,
        sequenceNumberColor: styles.getPropertyValue('--true-white-color').trim(),
        relationColor: line,
        relationLabelColor: text,
        relationLabelBackground: surface,
        xyChart: {
          backgroundColor: background, titleColor: text,
          xAxisLabelColor: text, xAxisTitleColor: text, xAxisTickColor: line, xAxisLineColor: line,
          yAxisLabelColor: text, yAxisTitleColor: text, yAxisTickColor: line, yAxisLineColor: line,
          plotColorPalette: `${color('accent')},${line}`,
        },
        dropShadow: false,
        useGradient: false,
      },
    };
  }

  // Theme changes during a render request another pass; never render concurrently.
  async function render() {
    pending = true;
    if (rendering) return;
    rendering = true;
    try {
      while (pending) {
        pending = false;
        for (const [index, { node, source }] of diagrams.entries()) {
          const { status } = diagrams[index];
          const zoom = node.parentElement.querySelector('.media-open-trigger');
          node.setAttribute('aria-busy', 'true');
          try {
            mermaid.initialize(config(source));
            const { svg, bindFunctions } = await mermaid.render(`blog-mermaid-${index}-${revision++}`, source);
            node.innerHTML = svg;
            node.hidden = false;
            status.hidden = true;
            node.closest('pre')?.classList.remove('diagram-failed');
            if (zoom) zoom.hidden = false;
            // Give percentage-sized SVGs a real containing width. Shrink-wrapping
            // a percentage SVG otherwise falls back to the browser's 300px box.
            const graphic = node.querySelector('svg');
            const naturalWidth = graphic?.viewBox?.baseVal?.width || parseFloat(graphic?.style.maxWidth);
            if (Number.isFinite(naturalWidth) && naturalWidth > 0) {
              node.closest('pre')?.style.setProperty('--diagram-width', `${naturalWidth}px`);
            }
            // Sankey emits labels before links; keep the labels above the flow bands.
            const sankey = node.querySelector('svg[aria-roledescription="sankey"]');
            const labels = sankey?.querySelector('.node-labels');
            if (labels) sankey.append(labels);
            bindFunctions?.(node);
          } catch (error) {
            console.error('Mermaid failed to render:', error);
            node.hidden = true;
            if (zoom) zoom.hidden = true;
            node.closest('pre')?.classList.add('diagram-failed');
            status.hidden = false;
            status.className = 'diagram-status diagram-error';
            status.replaceChildren();
            const title = document.createElement('strong');
            title.textContent = '图表暂时未能显示';
            const explanation = document.createElement('p');
            explanation.textContent = '可以重新绘制，或展开源码查看原始内容。';
            const details = document.createElement('details');
            details.className = 'diagram-source';
            const summary = document.createElement('summary');
            summary.textContent = '查看图表源码';
            const code = document.createElement('code');
            code.textContent = source;
            details.append(summary, code);
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'component-retry';
            retry.textContent = '重新绘制';
            retry.addEventListener('click', async () => {
              retry.disabled = true;
              retry.textContent = '正在绘制…';
              diagrams[index].restoreFocus = true;
              await render();
            });
            status.append(title, explanation, details, retry);
          } finally {
            node.removeAttribute('aria-busy');
          }
        }
      }
    } finally {
      rendering = false;
      for (const diagram of diagrams) {
        if (!diagram.restoreFocus) continue;
        diagram.restoreFocus = false;
        const target = diagram.status.hidden ? diagram.node : diagram.status.querySelector('button');
        target?.focus({ preventScroll: true });
      }
    }
  }

  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  await render();
});
