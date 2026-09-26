# 提示词与认可样稿

## 已认可的视觉基准

2026-09-26 用户认可了以下三张样稿。它们是风格基准，不是必须复制的物体大小或像素色值；后续明确反馈可以更新基准。

| 文章／系列 | 样稿 | 画面要点 |
| --- | --- | --- |
| 银行卡交易剖析——从刷卡到结算 | [bank-card.png](../assets/bank-card.png) | 蓝色银行卡，金色芯片，浅杏色放射背景 |
| 企鹅岛上的鱼指导 | [standing-fish.png](../assets/standing-fish.png) | 银蓝色直立鱼，若有所思，薄荷绿整齐波浪 |
| 深入 Java | [java-series.png](../assets/java-series.png) | 陶土红咖啡杯，少量蒸汽，浅紫色三角密铺 |

使用本地图片查看工具打开最相关的样稿后再生成。参考用于保持两种媒介的对照和主体的厚涂质感；新题材仍需重新选主体。样稿为工具原始输出，尺寸以文件为准。

## 可复用提示词模板

替换方括号中的设计变量即可。数值用于表达意图，最后仍须检查实际构图；工具支持的参数以当前工具说明为准。

```text
Use case: stylized-concept.
Asset type: one square editorial blog cover in a coherent collection.
Canvas: 1:1 square, approximately 1024 x 1024 pixels.

Subject: exactly ONE [object or creature], representing [article or series].
[Necessary shape, pose, identifying details, and subject colors.]
Subject palette: [explicit dominant hue and limited secondary colors]. Keep this
dominant hue readable across the object. Choose a palette distinct from adjacent
covers; do not default every subject to blue, orange and gold. Preserve essential
brand colors or natural identifying colors when relevant.

Composition: the complete subject at the exact visual center. All extremities
and attachments fully inside the frame. Generous breathing room on every side.
Subject long edge roughly 60–80% of the canvas, adjusted to its silhouette.
Balance the entire outline, including handles or fins. Ancillary steam must not
push the main object low in the frame. Clear recognizable silhouette at thumbnail size.

Two distinct media:
1. Subject: Impressionist oil painting, visible broken brushstrokes, rich colored
light, cool and warm reflected colors, moderate impasto, lively painterly volume.
Maintain recognizable anatomy or object structure without photographic detail.
2. Background: [one geometric pattern] in [pale base and subtle pattern colors].
Precise computer-drawn geometry, clean crisp edges, regular spacing, flat pastel
fills, low contrast. No oil-paint, canvas, paper or distressed texture on background.
Use broad filled bands or large tessellated color areas, NEVER hairlines, thin
grids, fine outlines or dense stripes. Any band should be about 2–5% of canvas
width and clearly visible at thumbnail size. Every pixel must be FULLY OPAQUE;
fill the complete background with pale color, no transparent or semitransparent regions.

Constraints: one subject, no extra props or scenery; no title, readable lettering,
watermark or border. No photographic subject, smooth 3D render, flat vector subject,
heavy cartoon outlines, dramatic drop shadow or luminous sticker edge.
```

使用样稿作为图像输入时补充：

```text
The supplied image is a STYLE REFERENCE ONLY for brushwork, framing and the
relationship between painterly subject and geometric digital background.
Do NOT copy its subject or color palette. Follow the NEW explicitly specified
dominant subject hue, secondary colors and background pattern instead.
```

## 三张样稿的原始提示词

原生成调用将以下共享前缀与相应主体段直接拼接。仅为历史记录：其中的细波浪线、固定蓝橙金配色不再符合后续反馈。新增或修订封面必须使用上面的结构化模板，并遵循当前的宽纹样、完全不透明、主体配色多样化和生成后转 WebP 要求。

### 共享前缀

```text
Use case: stylized-concept. Create ONE square 1:1 editorial blog cover, 1024x1024. A coherent sophisticated cover collection with a SINGLE fully visible subject exactly at the geometric center, generous breathing room, all extremities inside the frame, main subject occupies about 60–68% of canvas. Two clearly distinct media: background is perfectly flat precise computer-generated vector geometry with crisp edges, uniformly pale low-contrast pastel colors, no paper or canvas texture on background; subject is unmistakably hand-painted French Impressionist oil painting with visible broken brushstrokes, rich colored light, soft lively edges and painterly volume, not photorealistic, not 3D rendering, not a flat vector icon, not a cartoon outline. Subject cleanly separates from background, small thumbnail readable. No title, no lettering, no watermark, no border, no extra objects or scene.
```

### 银行卡

```text
Subject: exactly ONE blue bank payment card, recognizable rounded rectangular bank-card proportions, front face clearly visible with gold EMV chip, slightly tilted 12 degrees, all four corners fully shown. Blue/cobalt/teal impressionist brushwork with warm glints, a few abstract tiny pale dashes to suggest embossed details without any legible numbers, names, logos or words. Backdrop: pale warm apricot and ivory alternating broad radial sunburst wedges radiating precisely from canvas center, crisp mathematical lines, low contrast. The bank card is the only object.
```

### 直立的鱼

```text
Subject: exactly ONE anthropomorphic fish standing upright vertically on its tail fins, head at top, full fish body and all fins visible, three-quarter view, calm thoughtful slightly weary expression; a real fish-like silver-blue body with teal and warm coral impressionist strokes, natural small eye, pectoral fins resting by its sides. Standing silhouette should read immediately as a fish, not a penguin or human; no human limbs, clothing, tools or accessories. Backdrop: pale mint green base with evenly spaced thin slightly darker mint sinusoidal horizontal wave lines across the entire square, exact identical wavelength, digitally plotted, low contrast. No landscape or water scene.
```

### Java 咖啡杯

```text
Subject: exactly ONE warm terracotta-red ceramic coffee cup with a handle and visible dark coffee surface, no saucer, no spoon, no beans. Three-quarter view with whole cup and handle fully visible. A small graceful curl of rising steam rendered as painterly strokes belonging to the subject; cup and steam together centered in the frame. Impressionist oil painting, distinct warm red-orange, rose and golden strokes, cool reflected shadows, thick lively brushwork. Backdrop: a precise repeating tessellation of medium sized equilateral triangles in pale lavender, lilac and almost-white, crisp straight vector edges, only subtle color differences. The cup symbolizes the Java programming article series. No logos or words.
```

## 定向修订示例

```text
Edit target: the supplied fish cover.
Change only subject scale: make the complete fish slightly smaller so the top
and bottom margins are more generous, while keeping it at the exact center.
Preserve the fish identity, upright pose, Impressionist brushwork, silver-blue
and coral colors. Replace the old thin wave lines with broad mint sinusoidal
color bands over a completely opaque pale mint base, retaining a quiet low contrast.
Do not add accessories, lettering, scenery or extra creatures.
```

背景太抢眼时，仅降低几何纹样和底色之间的差异，保留主体笔触和配色。主体过于光滑时，仅加强主体的断续色块和可见笔触，不给背景叠加油画纹理。
