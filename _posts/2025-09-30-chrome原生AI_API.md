---
layout: post
title:  "Chrome 原生 AI API 开发实践"
date:   2025-09-30 00:00:00 +0800
categories: 前端
tags: javascript ai chrome
summary: "Chrome 内置了一些 AI 相关的 API，可以直接在浏览器中使用，无需依赖第三方服务。本文介绍了翻译、语言检测、摘要和提示词等 API 的使用方法和示例代码。"
comments: true
copyrights: 原创
---

随着 Web AI 技术的快速发展，浏览器厂商开始将 AI 能力直接集成到浏览器内核中。Chrome 从 138 版本开始，正式提供了一套原生的 AI API，包括翻译、语言检测、文本摘要和语言模型等功能。这意味着开发者可以在不依赖外部服务的情况下，直接调用浏览器内置的 AI 能力来构建智能化的 Web 应用。

本文将详细介绍这些 API 的使用方法，并提供完整的示例代码。

这些功能基本都需要 Chrome 浏览器 138 或更高版本，下面的小工具展示了你的浏览器是否支持这些 API：

{% iframe frontend_ai height=80px hide_header=true %}

## 翻译 API

### 样例

如果你使用的是 Chrome 浏览器 138 或更高版本，下面的示例便可以直接运行。

{% iframe frontend_ai_translate height=750px %}

当然，这套 API 目前正在逐渐被各浏览器支持，你也可以在 [Can I use](https://caniuse.com/mdn-api_translator) 上查看最新的支持情况。

### 使用

首先，由于这些 API 刚结束实验阶段，你需要先检查一下浏览器是否支持这些 API：

```javascript
if ('Translator' in self) {
  console.log('翻译 API 可用');
}
```

然后，便可以创建一个翻译器实例：

```javascript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'zh-CN',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

第一次创建实例时，浏览器会自动下载所需的翻译模型。你可以通过 `monitor` 回调来监控下载进度。

执行翻译很简单：

```javascript
const result = await translator.translate('How are you?');
console.log(result);
```

对于较长的文本，可以使用流式翻译：

```javascript
const stream = translator.translateStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

## 语言检测 API

### 样例

同样，如果你使用的是 Chrome 浏览器的最新版本，下面的示例也可以直接运行。

{% iframe frontend_ai_language_detect height=950px %}

语言检测 API 目前也在逐步推广中，你也可以在 [Can I use](https://caniuse.com/mdn-api_languagedetector) 上查看最新的支持情况。

### 使用

首先检查浏览器是否支持语言检测 API：

```javascript
if ('LanguageDetector' in self) {
  // 语言检测 API 可用
}
```

然后创建一个语言检测器实例：

```javascript
const detector = await LanguageDetector.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

同样，第一次创建实例时，浏览器会自动下载所需的语言模型。你可以通过 `monitor` 回调来监控下载进度。

执行语言检测：

```javascript
const someUserText = 'Hallo und herzlich willkommen!';
const results = await detector.detect(someUserText);
for (const result of results) {
  // 显示所有可能的语言及其置信度，按可能性从高到低排序
  console.log(result.detectedLanguage, result.confidence);
}
// 输出示例：
// de 0.9993835687637329
// en 0.00038279531872831285
// nl 0.00010798392031574622
// ...
```

## 摘要 API

### 样例

如果你使用的是支持摘要 API 的 Chrome 浏览器版本，下面的示例可以直接运行。

{% iframe frontend_ai_summarizer height=1450px %}

摘要 API 目前也在逐步推广中，你也可以在 [Can I use](https://caniuse.com/mdn-api_summarizer) 上查看最新的支持情况。

> 首次创建摘要器实例时，浏览器会下载所需的模型文件，可能需要一些时间。大小通常在 20MB 到 100MB 之间，具体取决于所选的模型和配置。

### 使用

首先检查浏览器是否支持摘要 API：

```javascript
if ('Summarizer' in self) {
  // 摘要 API 可用
}
```

在使用前，建议检查 API 的可用性：

```javascript
const availability = await Summarizer.availability();
if (availability === 'unavailable') {
  // 摘要 API 不可用
  return;
}
```

然后创建一个摘要器实例。注意，创建摘要器需要用户激活（如点击事件）：

```javascript
if (navigator.userActivation.isActive) {
  const summarizer = await Summarizer.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    }
  });
}
```

你也可以在创建时指定更多选项：

```javascript
const options = {
  sharedContext: 'This is a scientific article',
  type: 'key-points',        // 摘要类型：tldr、teaser、key-points、headline
  format: 'markdown',        // 输出格式：markdown、plain-text
  length: 'medium',          // 摘要长度：short、medium、long
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
};

const summarizer = await Summarizer.create(options);
```

执行摘要生成：

```javascript
const longText = document.querySelector('article').innerHTML;
const summary = await summarizer.summarize(longText, {
  context: 'This article is intended for a tech-savvy audience.',
});
console.log(summary);
```

对于较长的文本，可以使用流式摘要：

```javascript
const stream = summarizer.summarizeStreaming(longText, {
  context: 'This article is intended for junior developers.',
});
for await (const chunk of stream) {
  console.log(chunk);
}
```

## 提示词 API

### 样例

如果你使用的是支持 Language Model API 的 Chrome 浏览器版本，下面的示例可以直接运行。

{% iframe frontend_ai_language_model height=950px %}

提示词 API 目前也在逐步推广中，你也可以在 [Can I use](https://caniuse.com/mdn-api_languagemodel) 上查看最新的支持情况。

> 首次创建语言模型会话时，浏览器会下载所需的模型文件，通常需要一些时间。模型大小可能在几百MB到几GB之间，具体取决于模型类型。

### 使用

首先检查浏览器是否支持 Language Model API：

```javascript
if ('LanguageModel' in self) {
  // Language Model API 可用
}
```

在使用前，建议检查 API 的可用性和参数：

```javascript
const availability = await LanguageModel.availability();
if (availability === 'unavailable') {
  // Language Model API 不可用
  return;
}

// 获取模型参数
const params = await LanguageModel.params();
console.log(params);
// {defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2}
```

#### 基本使用

创建一个基本的语言模型会话：

```javascript
const session = await LanguageModel.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});

// 发送提示并获得响应
const result = await session.prompt('Write me a poem!');
console.log(result);
```

#### 参数调节

你可以调整模型的温度和 `TopK` 参数来控制输出的随机性：

```javascript
const params = await LanguageModel.params();

// 创建一个温度稍高的会话（更有创意）
const creativeSession = await LanguageModel.create({
  temperature: Math.min(params.defaultTemperature * 1.2, params.maxTemperature),
  topK: params.defaultTopK,
});
```

#### 初始对话历史

你可以在创建会话时提供初始的对话历史：

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    { role: 'system', content: 'You are a helpful and friendly assistant.' },
    { role: 'user', content: 'What is the capital of Italy?' },
    { role: 'assistant', content: 'The capital of Italy is Rome.' },
    { role: 'user', content: 'What language is spoken there?' },
    { role: 'assistant', content: 'The official language of Italy is Italian.' },
  ],
});

// 继续对话
const followup = await session.prompt('Tell me about the food there.');
```

#### 多轮对话

使用数组形式进行多轮对话：

```javascript
const followup = await session.prompt([
  {
    role: "user",
    content: "I'm nervous about my presentation tomorrow"
  },
  {
    role: "assistant", 
    content: "Presentations are tough!"
  }
]);
```

#### 流式响应

对于较长的响应，可以使用流式输出：

```javascript
const stream = session.promptStreaming('Write me an extra-long poem!');
for await (const chunk of stream) {
  console.log(chunk);
}
```

#### 图像输入

语言模型也支持图像输入（多模态）：

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    {
      role: 'system',
      content: 'You are a skilled analyst who correlates patterns across multiple images.',
    },
  ],
  expectedInputs: [{ type: 'image' }],
});

// 添加图像到对话
await session.append([
  {
    role: 'user',
    content: [
      {
        type: 'text',
        value: `Here's one image. Notes: ${fileNotesInput.value}`,
      },
      { type: 'image', value: fileUpload.files[0] },
    ],
  },
]);

// 分析图像
const result = await session.prompt('What do you see in this image?');
```

#### 结构化输出

你可以约束模型输出特定格式的 JSON：

```javascript
const schema = {
  "type": "object",
  "properties": {
    "rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 5
    }
  },
  "required": ["rating"]
};

const result = await session.prompt(`
  Summarize this feedback into a rating between 0-5. Only output a JSON
  object { rating }, with a single property whose value is a number:
  The food was delicious, service was excellent, will recommend.
`, { 
  responseConstraint: schema,
  omitResponseConstraintInput: true 
});

console.log(JSON.parse(result)); // { rating: 5 }
```

#### 会话管理

```javascript
// 取消操作
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const result = await session.prompt('Write me a poem!', {
  signal: controller.signal,
});

// 检查使用配额
console.log(`${session.inputUsage}/${session.inputQuota}`);

// 克隆会话
const clonedSession = await session.clone();

// 销毁会话
session.destroy();
```
