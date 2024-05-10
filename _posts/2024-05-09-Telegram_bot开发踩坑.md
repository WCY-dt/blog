---
layout: post
title:  "【杂项】Telegram bot 开发踩坑"
date:   2024-05-09 00:00:00 +0800
categories: 其它
tags: python
comments: 1
mathjax: true
copyrights: 原创
---

首先，在 Telegram 里搜索 [@BotFather](https://t.me/BotFather)，输入 `/new` 指令，然后在提示下创建机器人的 name 和 username，你便可以获得一个 token。

然后，安装 pyTelegramBotAPI 包：

```shell
pip install pyTelegramBotAPI
```

通常，一个 Telegram bot 只需要下面的代码就能运行起来：

```python
import telebot

API_TOKEN = "YOUR_BOT_TOKEN"
bot = telebot.TeleBot(API_TOKEN)

# 一些操作

bot.infinity_polling()
```

其中，要把 `YOUR_BOT_TOKEN` 替换为 @BotFather 给你的 token。

在洼地做开发时，如果直接运行这个程序，会遇到网络问题。这是因为 telegram 需要挂梯子，而挂了梯子就会报错 `ValueError: check_hostname requires server_hostname`。因此，你可能需要设置一下代理：

```python
import telebot.apihelper

telebot.apihelper.proxy = {
    "http": "http://127.0.0.1:7890",
    "https": "http://127.0.0.1:7890",
}
```

其中，https 的代理是必须的。你把地址替换成自己的就好。

添加下面的代码来处理 `start` 和 `info` 指令：

```python
@bot.message_handler(commands=['start', 'info'])
def send_welcome(message):
    bot.send_message(
        message.chat.id, 
        "Welcome to MyBot! Type /help to get more information."
    )
```

然后，你便可以在 telegram 中搜索自己机器人的 username，然后发送 `/start` 查看效果。

如果你希望机器人以回复的形式发消息，可以这样写：

```python
@bot.message_handler(commands=['start', 'info'])
def send_welcome(message):
    bot.reply_to(
        message, 
        "Welcome to MyBot! Type /help to get more information."
    )
```

消息可以增加一些样式，比如以 HTML 的格式：

```python
@bot.message_handler(commands=['start', 'info'])
def send_welcome(message):
    bot.send_message(
        message.chat.id, 
        "Welcome to <b>MyBot</b>! Type /help to get more information.",
        parse_mode='HTML'
    )
```

当然你也可以搞一个重话的功能：

```python
@bot.message_handler(func=lambda message: True)
def send_repeat(message):
    bot.send_message(
        message.chat.id, 
        message.text
    )
```

机器人可以按照步骤进行对话。比如，我们希望在用户发出 `/help` 后再问他具体的内容：

```python
def help_next(message, result: str, time: str):
    bot.reply_to(
        message, 
        f"Found {result}! Try again {time} later."
    )

@bot.message_handler(commands=['help'])
def send_help(message):
    bot.reply_to(
        message, 
        "What do you need?"
    )
    bot.register_next_step_handler(
        message, 
        help_next, 
        "nothing", "1 century"
    )
```

如果想要在输入框下方弹出供用户选择的按钮，可以这样写：

```python
from telebot.types import ReplyKeyboardMarkup, ReplyKeyboardRemove

def help_next(message, result: str):
    bot.reply_to(
        message,
        f"Found {result} about {message.text}.",
        reply_markup=ReplyKeyboardRemove(),
    )

@bot.message_handler(commands=['help'])
def send_help(message):
    markup = ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add("usage", "authorization", "nothing")
    bot.reply_to(
        message, 
        "What do you need?",
        reply_markup = markup
    )
    bot.register_next_step_handler(
        message, 
        help_next, 
        "nothing"
    )
```

需要注意的是，只有设置了 `ReplyKeyboardRemove` 后，按钮才会消失。

如果要在消息的下方显示按钮，则需要使用 `quick_markup`：

```python
from telebot.util import quick_markup

@bot.message_handler(commands=["visit"])
def send_visit(message):
    button = {
        "ChatGPT": {
            "callback_data": "block"
        }, 
        "Baidu": {
            "url": "baidu.com"
        }
    }
    bot.send_message(
        message.chat.id, 
        "Test", 
        reply_markup=quick_markup(button, row_width=2)
    )

@bot.callback_query_handler(func=lambda call: True)
def refresh(call):
    if call.data == "block":
        bot.send_message(
            call.message.chat.id,
             "Your IP is blocked!"
        )
        bot.answer_callback_query(call.id)
```

其中，按下按钮后，按钮上会显示进度，调用 `answer_callback_query` 的作用是关闭进度。
