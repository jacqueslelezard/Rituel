// import client side soundworks and player experience
import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience.js';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';

// list of files to load (passed to the experience)
const files = [
    'sounds/SFX_Animals_01_Loop.wav',
    'sounds/SFX_Animals_02_Loop.wav',
    'sounds/SFX_Animals_03_Loop.wav',
    'sounds/SFX_Bodyguard_01_Loop.wav',
    'sounds/SFX_Prey_01_Loop.wav',
    'sounds/hunter.wav',
    'sounds/SFX_Crowd_11.wav',
    'sounds/SFX_Crowd_04.wav',
    'sounds/SFX_Crowd_07.wav',
    'sounds/activate_power.wav'
];

// launch application when document is fully loaded
window.addEventListener('load', () => {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const { appName, clientType, socketIO, assetsDomain }  = window.soundworksConfig;
  // initialize the 'player' client
  soundworks.client.init(clientType, { appName, socketIO });
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  // create client side (player) experience
  const experience = new PlayerExperience(assetsDomain, files);

  // start the client
  soundworks.client.start();
});
