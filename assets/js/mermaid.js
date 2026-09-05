// Resolve the blog's theme and font before Mermaid measures its labels.
document.addEventListener('DOMContentLoaded', async () => {
  const diagrams = Array.from(document.querySelectorAll('.language-mermaid'), (node) => ({
    node,
    source: node.textContent,
  }));
  if (!diagrams.length) return;

  for (const { node, source } of diagrams) {
    const fence = '`'.repeat(Math.max(3, ...(source.match(/`+/g) || []).map((run) => run.length + 1)));
    const button = window.markdownCopy?.button(`${fence}mermaid\n${source.trimEnd()}\n${fence}`);
    if (button) {
      button.classList.add('mermaid-copy-button');
      node.parentElement.append(button);
    }
  }

  await document.fonts.ready;
  const root = document.documentElement;
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
        edgeLabelBackground: background,
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
        relationLabelBackground: background,
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
          try {
            mermaid.initialize(config(source));
            const { svg, bindFunctions } = await mermaid.render(`blog-mermaid-${index}-${revision++}`, source);
            node.innerHTML = svg;
            // Sankey emits labels before links; keep the labels above the flow bands.
            const sankey = node.querySelector('svg[aria-roledescription="sankey"]');
            const labels = sankey?.querySelector('.node-labels');
            if (labels) sankey.append(labels);
            bindFunctions?.(node);
          } catch (error) {
            console.error('Mermaid failed to render:', error);
          }
        }
      }
    } finally {
      rendering = false;
    }
  }

  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  await render();
});
