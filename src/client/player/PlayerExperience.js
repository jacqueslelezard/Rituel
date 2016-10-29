import * as soundworks from 'soundworks/client';
import PlayerRenderer from './PlayerRenderer';

const audioContext = soundworks.audioContext;

let hunter_power = false;
let volumeHunter;

const viewTemplate = `
  <canvas class="background" style="display:none"></canvas>
  <div class="foreground">
    <div class="header flex-center"></div>
    <div class="section-center flex-center menu">
        <button class="big" onclick="gardian()">Gardien</button>
        <button class="big" onclick="target()">Cible</button>
        <button class="big" onclick="hunter()">Initié</button>
        <button class="big" onclick="foule()">Public</button>
    </div>
    <div class="section-center flex-center gardian">
        <h1>Gardien</h1>
        <p>Utilisez votre énergie pour perturber l’initié et protéger la cible.</p>
        <button class="big back" onclick="back()">Retour</button>
    </div>
    <div class="section-center flex-center target">
        <h1>Cible</h1>
        <p>Utilisez votre énergie pour échapper à l’initié.
        </p>
        <button class="big back" onclick="back()">Retour</button>
    </div>
    <div class="section-center flex-center hunter">
        <h1>Initié</h1>
        <p>Repérez et attrapez votre cible au milieu des perturbations sonores. Toutes les 20s vous pouvez neutraliser temporairement les gardiens.
        </p>
        <button class="big desactivate" onclick="houm()">Pouvoir de l'initié</button>
        <button class="big back" onclick="back()">Retour</button>
    </div>
    <div class="section-center flex-center foule">
        <h1>Public</h1>
        <p>Ouha ouha amanha (Utilisez votre énergie pour encourager l'initié)</p>
        <button class="big back" onclick="back()">Retour</button>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, audioFiles) {
    super();

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sync = this.require('sync');
    this.network = this.require('network');
    this.loader = this.require('loader', {
      assetsDomain: assetsDomain,
      files: audioFiles,
    });
      
    // in the experince constructor
    this.motionInput = this.require('motion-input', { descriptors: ['energy'] });
  }

  init() {
    // initialize the view
    this.viewTemplate = viewTemplate;
    this.viewContent = { title: `Let's go!` };
    this.viewCtor = soundworks.CanvasView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();
    this.desactivate = this.desactivate.bind(this);
    this.receive('desactivate', this.desactivate);
  }
    
    desactivate(){
        console.log("gardiens desactivés");
        /*document.querySelector(".desactivate").style.display = "none";
        setTimeout(function(){
            document.querySelector(".desactivate").style.display = "flex";
        }, 10000);*/
        hunter_power = true;
        setTimeout(function(){
            hunter_power = false;
        }, 10000);
    }
    
  start() {
    super.start(); // don't forget this
      
    if (!this.hasStarted)
      this.init();

    this.show();
      
      
    // play the first loaded buffer immediately
    const src = audioContext.createBufferSource();
      src.buffer = this.loader.buffers[1];
      const volume = audioContext.createGain();
      volume.gain.value = 0;
      src.connect(volume);
      volume.connect(audioContext.destination);

    const srcGardian = audioContext.createBufferSource();
      srcGardian.buffer = this.loader.buffers[3];
      const volumeGardian = audioContext.createGain();
      volumeGardian.gain.value = 0;
      srcGardian.connect(volumeGardian);
      volumeGardian.connect(audioContext.destination);
      
    const srcGardian2 = audioContext.createBufferSource();
      srcGardian2.buffer = this.loader.buffers[2];
      const volumeGardian2 = audioContext.createGain();
      volumeGardian2.gain.value = 0;
      srcGardian2.connect(volumeGardian2);
      volumeGardian2.connect(audioContext.destination);
      
    const srcGardian3 = audioContext.createBufferSource();
      srcGardian3.buffer = this.loader.buffers[4];
      const volumeGardian3 = audioContext.createGain();
      volumeGardian3.gain.value = 0;
      srcGardian3.connect(volumeGardian3);
      volumeGardian3.connect(audioContext.destination);
      
    const srcHunter = audioContext.createBufferSource();
      srcHunter.buffer = this.loader.buffers[5];
      volumeHunter = audioContext.createGain();
      volumeHunter.gain.value = 0;
      srcHunter.connect(volumeHunter);
      volumeHunter.connect(audioContext.destination);
      
    let srcHunter2 = audioContext.createBufferSource();
      srcHunter2.buffer = this.loader.buffers[9];
      let volumeHunter2 = audioContext.createGain();
      volumeHunter2.gain.value = 1;
      srcHunter2.connect(volumeHunter2);
      volumeHunter2.connect(audioContext.destination);
      
    const srcCrowd = audioContext.createBufferSource();
      srcCrowd.buffer = this.loader.buffers[6];
      const volumeCrowd = audioContext.createGain();
      volumeCrowd.gain.value = 0;
      srcCrowd.connect(volumeCrowd);
      volumeCrowd.connect(audioContext.destination);
      
    const srcCrowd2 = audioContext.createBufferSource();
      srcCrowd2.buffer = this.loader.buffers[7];
      const volumeCrowd2 = audioContext.createGain();
      volumeCrowd2.gain.value = 0;
      srcCrowd2.connect(volumeCrowd2);
      volumeCrowd2.connect(audioContext.destination);

    src.loop = true;
    srcGardian.loop = true;
    srcGardian2.loop = true;
    srcGardian3.loop = true;
    srcHunter.loop = true;
    srcCrowd.loop = true;
    //srcCrowd2.loop = true;
    
    let userTeam = "none"
      
    // when the experience has started
    this.network.receive('my:client', (...args) => {
        console.log("juste received a msg");
        console.log(args);
    });
    
    if (this.motionInput.isAvailable('energy')) {
      this.motionInput.addListener('energy', (data) => {
          //console.log(data)
          if(userTeam == "target"){
              if(data>0.90){
                  data = 0.9;
              }
              volume.gain.value = 1 - data;
              volumeGardian.gain.value = 0;
              volumeGardian2.gain.value = 0;
              volumeGardian3.gain.value = 0;
              volumeCrowd.gain.value = 0;
          }else if(userTeam == "gardian"){
              if(hunter_power){
                  data = 0;
              }
              volumeGardian.gain.value = data;
              volumeGardian2.gain.value = data;
              volume.gain.value=0;
              volumeGardian3.gain.value=0;
              volumeCrowd.gain.value = 0;
          }else if(userTeam == "hunter"){
              volume.gain.value = 0;
              volumeGardian.gain.value = 0;
              volumeGardian2.gain.value = 0;
              volumeGardian3.gain.value = 0;
              volumeCrowd.gain.value = 0;
          }else if(userTeam == "foule"){
              volume.gain.value = 0;
              volumeGardian.gain.value = 0;
              volumeGardian2.gain.value = 0;
              volumeGardian3.gain.value = 0;
              volumeCrowd.gain.value = data;
          }else{
              volume.gain.value = 0;
              volumeGardian.gain.value = 0;
              volumeGardian2.gain.value = 0;
              volumeGardian3.gain.value = 0.5;
              volumeCrowd.gain.value = 0;
          }
      });
    } else {
      // handle error
    }
      
    src.start(audioContext.currentTime);
    srcGardian.start(audioContext.currentTime);
    srcGardian2.start(audioContext.currentTime);
    srcGardian3.start(audioContext.currentTime);
    srcHunter.start(audioContext.currentTime);
    srcCrowd.start(audioContext.currentTime);
    srcCrowd2.start(audioContext.currentTime);
      
    window.gardian = function(){
        userTeam = "gardian";
        console.log(userTeam);
        window.goto("gardian");
        volumeHunter.gain.value = 0;
    }
    window.hunter = function(){
        userTeam = "hunter";
        console.log(userTeam);
        window.goto("hunter");
        setTimeout(function(){
            document.querySelector(".desactivate").style.display = "flex";
            if(userTeam = "hunter"){
                volumeHunter.gain.value = 1;
            }
        }, 20000);
    }
    window.target = function(){
        userTeam = "target";
        console.log(userTeam);
        window.goto("target");
        volumeHunter.gain.value = 0;
    }
    window.foule = function(){
        userTeam = "foule";
        console.log(userTeam);
        window.goto("foule");
        volumeHunter.gain.value = 0;
    }
    window.houm = () => {
        console.log("houm");
        this.send('houm');
        srcHunter2 = audioContext.createBufferSource();
        srcHunter2.buffer = this.loader.buffers[9];
        volumeHunter2 = audioContext.createGain();
        volumeHunter2.gain.value = 1;
        srcHunter2.connect(volumeHunter2);
        volumeHunter2.connect(audioContext.destination);
        srcHunter2.start(audioContext.currentTime);
        document.querySelector(".desactivate").style.display = "none";
        volumeHunter.gain.value = 0;
        setTimeout(function(){
            document.querySelector(".desactivate").style.display = "flex";
            volumeHunter.gain.value = 1;
            srcHunter2.stop();
        }, 30000);
    }
    
    document.querySelector(".desactivate").style.display = "none";
    
    window.goto = function(screen){
        var screensToHide = document.querySelectorAll(".section-center");
        for(let i=0; i<screensToHide.length; i++){
            screensToHide[i].style.display = "none";
        }
        var screensTodisplay = document.querySelectorAll('.'+screen);
        for(let i=0; i<screensTodisplay.length; i++){
            screensTodisplay[i].style.display = "flex";
        }
    }
    window.back = function(){
        window.goto("menu");
        userTeam = "menu";
    }
    
    window.goto('menu');
    
    //src.loop = true;
   /* myAudio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);*/

    // play the second loaded buffer when the message `play` is received from
    // the server, the message is send when another player joins the experience.
   /* this.receive('houm', () => {
      alert('desactivate');
      const delay = Math.random();
      const src = audioContext.createBufferSource();
      src.buffer = this.loader.buffers[1];
      src.connect(audioContext.destination);
      src.start(audioContext.currentTime + delay);
    });*/
    

    // initialize rendering
    this.renderer = new PlayerRenderer(100, 100);
    this.view.addRenderer(this.renderer);
    //this.play();
      //this.send socketio

    // this function is called before each update (`Renderer.render`) of the canvas
    this.view.setPreRender(function(ctx, dt) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#151000';
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fill();
      ctx.restore();
    });
  }
}
