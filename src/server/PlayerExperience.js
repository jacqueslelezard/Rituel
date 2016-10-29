import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.network = this.require('network');
  }

  // if anything needs to append when the experience starts
  start() {
      this.houm = this.houm.bind(this);
  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);
    // send a message to all the other clients of the same type
    this.broadcast(client.type, client, 'play');
      
    this.receive(client, 'houm', () => this.houm(client));
    //this.receive(client, houm(), callback(params))
    //this.broadcast(client.type, client, 'houm');
  }
    
  
   houm(client){
     this.broadcast(client.type, client, 'desactivate');
   }
    

  exit(client) {
    super.exit(client);
    // ...
  }
}
