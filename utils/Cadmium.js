const EventEmitter = require('events');
const request = require("request");
const split2 = require('split2');
const U = require('./Utils');
const P = require('./Permissions.js');
const fs = require('fs');
const WebSocket = require('ws');

const rootCACert = fs.readFileSync('./assets/cadmiumRootCert.pem');

/**
 * Cadmium connection handler
 * @author UniQMG
 */
module.exports = class Cadmium {
  constructor({app, requestUrl, endpointUrl, secret, version}) {
    this.emitter = new EventEmitter();
    this.version = version;
    this.secret = secret;
    this.app = app;

    this.requestUrl = requestUrl.replace(/\/$/, '');
    this.endpointUrl = endpointUrl.replace(/\/$/, '');
  }

  /**
   * Connects to the Cadmium server
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.skipReconnect = true;
        this.ws.terminate();
      }

      this.ws = new WebSocket(this.requestUrl, {
        headers: { secret: this.secret },
        ca: rootCACert
      });

      let ws = this.ws;
      let heartbeatTimeout;
      const heartbeat = (() => {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = setTimeout(() => {
          console.log('Cadmium missed heartbeat, attempting instant reconnect.');
          ws.skipReconnect = true;
          this.connect();
        }, 6000); // server heartbeat frequency is 5 seconds
      });
      this.ws.on('ping', heartbeat);

      this.ws.on('open', () => {
        console.log("Cadmium server connected");
        heartbeat();
        resolve();
      });

      this.ws.on('close', () => {
        clearTimeout(heartbeatTimeout);
        if (ws.skipReconnect) return;
        console.log('Cadmium server disconnected, attempting reconnect in 60s');
        setTimeout(() => this.connect().catch(ex => null), 60 * 1000);
      });

      this.ws.on('error', err => {
        this.emitter.emit('error', err)
        reject(err);
      })

      this.ws.on('message', data => {
        this._processPacket(JSON.parse(data));
      });
    })
  }

  /**
   * @typedef {Object} VertPacket
   * @param {string} uuid - unique pipeline result id
   * @param {string} pipeline - the pipeline command
   * @param {string} action - notifyProcessing, playSong
   * @param {string} user - user id
   * @param {string} channel - text channel id
   */

  /**
   * Tests whether the originating user of a given packet has a permission
   * @param {VertPacket} packet the packet
   * @param {String} permission the permission string
   */
  async _testPermission(packet, permission) {
    var playlist = await this.app.db.getPlaylist(packet.guild);
    let guild = this.app.bot.guilds.get(packet.guild);
    let member = guild.members.get(packet.user);
    var perms = await P.getPerms(this.app, { member });
    return U.canUseCommand(perms, { permissions: [permission] }, playlist);
  }

  /**
   * Cancels a Cadmium pipeline via a packet
   * @param {VertPacket} packet
   */
   async _cancelPipeline(packet) {
     this.ws.send(JSON.stringify({ action: 'cancel', uuid: packet.uuid }));
   }

  /**
   * Proceses a packet
   * @param {VertPacket} packet
   */
  async _processPacket(packet) {
    var playlist = await this.app.db.getPlaylist(packet.guild);
    let djError = playlist.djmode && !await this._testPermission(packet, "dj");

    switch (packet.action) {
      case "notifyProcessing":
        if (djError) {
          this.app.bot.createMessage(packet.channel, U.createErrorEmbed(
            "Cannot add Cadmium song",
            "You require the `dj` permission"
          ));
          this._cancelPipeline(packet);
          return;
        }
        this.app.bot.createMessage(packet.channel, U.createQuickEmbed(
          "Awaiting Cadmium song",
          "Song will be added to queue on pipeline complete"
        ));
        break;

      case "playSong":
        if (djError) return;
        let guild = this.app.bot.guilds.get(packet.guild);
        if (!guild) return;

        let url = this.endpointUrl + '/' + packet.uuid + '.wav';
        let channel = guild.channels.get(packet.channel);
        let fakeMessage = { channel, content: url };

        this.app.lavalink.caddyAdd(fakeMessage, url, null, packet.pipeline).catch(ex => {
          this.app.bot.createMessage(packet.channel, U.createErrorEmbed(
            "Error playing Cadmium track",
            "This appears to be an internal issue, and changing your " +
            "command will likely not help. Try again later"
          ));
          this.emitter.emit('error', ex);
        });
        break;
    }
  }

  /**
   * Alias for getEmitter().on
   */
  on() {
    return this.emitter.on(...arguments)
  }
}
