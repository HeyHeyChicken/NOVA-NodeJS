<div align="center">
 
<img src="https://github.com/HeyHeyChicken/NOVA/blob/master/resources/github-logo.svg" alt="NOVA" width="300">

**NOVA** is a customizable voice assistant made with Node.js.<br>
<br>
[![Discord](https://img.shields.io/discord/704685696513736765?label=Discord&style=flat&logo=discord)](https://discord.gg/CzasNJfW)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FHeyHeyChicken%2FNOVA.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FHeyHeyChicken%2FNOVA?ref=badge_shield)
</div>
<br><br>
<div align="center">
<img src="https://github.com/HeyHeyChicken/NOVA/blob/master/resources/screenshot.jpg">
</div>

<br>

## Introduction

**NOVA** is an open-source personal assistant that you can host on your server.<br/>
You can communicate with it orally or in writing, most of his skills are designed to work offline to protect your privacy.

## Installation

1) Clone it directly from GitHub.
```
git clone https://github.com/HeyHeyChicken/NOVA.git
```
2) Install packages
```
cd NOVA
npm install
```

## Usage

1) Launch this command.
```
node index.js
```
2) If you start the launcher for the first time, it will ask you if you want to launch a client or/and a server.<br/>
   If you need to change it in the future, you'll have to edit the "/settings.json".

If you want more detailed explanations, you will find them on the [Wiki](//github.com/HeyHeyChicken/NOVA/wiki).

## Features

When you install NOVA, no features are installed. You need to add them.<br/>
1) Go to your NOVA's server UI (the default URL is "http://localhost:8080/")
2) Go to the "Skills" tab.
3) Find skills you want, open the modal and click on the "Install" button.<br/>
   The server and clients will restarts, and the skill will be installed.

## Support and contribution

I provide support for all users through [GitHub issues](//github.com/HeyHeyChicken/NOVA/issues).

If you would like to contribute to this project, make sure you first read the [guide for contributors](//github.com/HeyHeyChicken/NOVA/blob/master/CONTRIBUTING.md).

<a href="//discord.gg/pkWbhDn" rel="nofollow"><img src="https://github.com/HeyHeyChicken/NOVA/blob/master/resources/join-us-discord.png" alt="Discord" width="200"></a><br/>

## Compatibility

NOVA has only been officially tested on Mac and Linux.

## License key

**The license key is obligatory.**

If you use NOVA for purposes not intended toward monetary compensation such as, but not limited to, teaching, academic research, evaluation, testing and experimentation, pass the phrase `'non-commercial-and-evaluation'` in the "/settings.json" file, as presented below:

```json
{
  "LicenseKey": "non-commercial-and-evaluation"
}
```

The license key is validated in an offline mode.<br/>
No connection is made to any server.<br/>

<br>
<br>

Created by [Antoine Duval (HeyHeyChicken)](//antoine.cuffel.fr) with ❤ and ☕ (chocolate) in [Mesnil-Panneville](//en.wikipedia.org/wiki/Mesnil-Panneville).
