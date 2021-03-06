# node-showbot

Node.js port of [showbot by lkalif](https://github.com/lkalif/ShowBot)

> [Showbot is a] system used for collecting suggestions from a IRC channel. Those suggestions are then sent to a web backend where people can vote on them.

# Installation

## Development

```
git clone
npm install
cp config/local.json.dist config/local.json
```

Change `config/local.json` with your settings. Check `config/default.json` for possible values

Starting server: `npm run dev`, visit :8080 for user interface

## Production

```
git clone
npm install
cp config/local.json.dist config/local.json
npm run build
```

[Install a database driver](http://knexjs.org/#Installation-node) and configure it in config/local.json

Pm2 config file is included for long running.

# IRC Commands Manual

## Channel

### Everyone

* `!s <title>` - Add title to the list of suggestions

### Channel Opers (+q/+a/+o/+h)

* `!showbot delete <suggestion>` / `!showbot remove <suggestion>` - Removes a suggestion from the list
* `!showbot reset` - Removes all suggestions for the channel
* `!showbot top` - Says the current top 5 in the channel
