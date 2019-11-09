const path = require('path');
const axios = require('axios');
const inquirer = require('inquirer');
const cheerio = require('cheerio');
const unzip = require('unzip');
require('./env');

const emulators = {
  'Gameboy Advance': {
    url: 'gameboy-advance',
    pi: 'gba'
  },
  'Super Nintendo': {
    url: 'super-nintendo',
    pi: 'snes'
  },
  'Gamebody Color': {
    url: 'gameboy-color',
    pi: 'gbc'
  },
  'Nintendo 64': {
    url: 'nintendo-64',
    pi: 'n64'
  },
  'Nintendo': {
    url: 'nintendo',
    pi: 'nes'
  },
  'Playstation': {
    url: 'playstation',
    pi: 'psx'
  },
  'Gameboy': {
    url: 'gameboy',
    pi: 'gb'
  },
  'Sega Genesis': {
    url: 'sega-genesis',
    pi: 'megadrive'
  },
  'MAME': {
    url: 'mame-037b11',
    pi: 'mame-mame4all'
  },
  'Neo Geo': {
    url: 'neo-geo',
    pi: 'neogeo'
  },
  'Atari 800': {
    url: 'atari-800',
    pi: 'atari800'
  },
  'Atari 2600': {
    url: 'atari-1600',
    pi: 'atari2600'
  },
  'Game Gear': {
    url: 'game-gear',
    pi: 'gamegear'
  },
  'Amstrad CPC': {
    url: 'amstrad-cpc',
    pi: 'amstradcpc'
  },
  'Sega Master System': {
    url: 'sega-master-system',
    pi: 'mastersystem'
  },
  'ZX Spectrum': {
    url: 'zx-spectrum',
    pi: 'zxspectrum'
  },
  'Famicom Disk System': {
    url: 'nintendo-famicom-disk-system',
    pi: 'fds'
  },
  'Neo Geo Pocket Color': {
    url: 'neo-geo-pocket-color',
    pi: 'ngpc'
  },
  'Atari 5200': {
    url: 'atari-5200',
    pi: 'atari5200'
  },
  'Atari Lynx': {
    url: 'atari-lynx',
    pi: 'atarilynx'
  },
  'Sega 32x': {
    url: 'sega-32x',
    pi: 'sega32x'
  },
  'Atari 7800': {
    url: 'atari-7800',
    pi: 'atari7800'
  },
  'Sega SG1000': {
    url: 'sega-sg1000',
    pi: 'sg-1000'
  },
  'GCE Vectrex': {
    url: 'gce-vectrex',
    pi: 'vectrex'
  },
  'Neo Geo Pocket': {
    url: 'neo-geo-pocket',
    pi: 'ngp'
  }
}

inquirer.prompt({
  type: 'list',
  name: 'system',
  message: 'Which system?',
  choices: Object.keys(emulators)
}).then(({ system }) => {
  const emulator = emulators[system];

  axios.get(`https://${process.env.ROM_SITE}/roms/${emulator.url}`).then(({ data: html }) => {
    const roms = {};
    const $ = cheerio.load(html);

    $('.results table.table tbody tr').toArray().forEach((el) => {
      const link = $(el).find('td > a');

      roms[link.text()] = link.attr('href');
    });

    inquirer.prompt({
      type: 'list',
      name: 'rom',
      message: 'Which ROM?',
      choices: Object.keys(roms)
    }).then(({ rom }) => {
      axios.get(roms[rom].replace('.cc/roms', '.cc/download/roms')).then(({ data: html }) => {
        const $ = cheerio.load(html);
        const link = $('.wait__link').attr('href');

        downloadROM(link, path.resolve(`../RetroPie/roms/${emulator.pi}`));
      });
    });
  }).catch((err) => {
    throw err;
  })
}).catch((err) => {
  throw err;
});

downloadROM = (url, newPath) => {
  axios({
    url,
    method: 'GET',
    responseType: 'stream'
  }).then(({ data }) => {
    data.pipe(unzip.Extract({ path: newPath }));
  });
}