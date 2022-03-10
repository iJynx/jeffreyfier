# Jeffreyfier

A bot to get rid of jeffries.

Features:

- A command handler
- A basic permission system
- An event handler
- Basic useful commands
- Per-server configuration system
- A logging system

Based on [guidebot](https://github.com/AnIdiotsGuide/guidebot/)

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win) | [Linux](https://git-scm.com/download/linux) | [MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 16.x](https://nodejs.org)
- The node-gyp build tools. This is a pre-requisite for Enmap, but also for a **lot** of other modules. See [The Enmap Guide](https://enmap.evie.codes/install#pre-requisites) for details and requirements for your OS. Just follow what's in the tabbed block only, then come back here!

- In the folder from where you ran the git command, run `npm install`, which will install the required packages.
- **If you get any error about python or msibuild.exe or binding, read the requirements section again!**
- Rename `config.js.example` to `config.js`, and give it the required intents and any partials you may require.
- Rename `.env-example` to `.env` and put in your bot token in it and save.
