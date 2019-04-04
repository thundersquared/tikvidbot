<p align="center">
  <img src="media/Icon@2x.png" width="128" />
  <h3 align="center">tikvidbot</h3>
  <p align="center">A Telegram bot to fetch TikTok videos locally</p>
  <p align="center">
    <a href="https://t.me/tikvidbot" target="_blank">
      <img src="media/Button@2x.png" width="128" />
    </a>
  </p>
</p>

## A bot for what?
tikvidbot is a bot allows you to save TikTok videos locally. To get a video, just share it's URL to the chat and it'll send the file.

## Tech stack
The bot is written in Node.JS, relies on [telegraf](https://github.com/telegraf/telegraf) to consume Telegram's Bot API, loves [got](https://github.com/sindresorhus/got) for fetching video pages and streaming videos and [jsdom](https://github.com/jsdom/jsdom) for parsing and interacting with them.

## How to run
1. Clone the repo
   ```
   git clone this repo
   ```
2. Install packages
   ```
   yarn
   ```
3. Run
   ```
   yarn dev
   ```

## Config vars
| Block    | Var      | Required |
| -------- | -------- | -------- |
| telegram | token    | **Yes**  |
| telegram | username | No       |
| http     | agent    | **Yes**  |
| mysql    | host     | No       |
| mysql    | database | No       |
| mysql    | user     | No       |
| mysql    | password | No       |


## License
The code in this repo and used modules are open-sourced software licensed under the [MIT license](LICENSE.md).
