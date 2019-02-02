const EventEmitter = require('events');
const request = require("request");
const split2 = require('split2');
const U = require('./Utils');
const P = require('./Permissions.js');
const fs = require('fs');

const rootCACert = fs.readFileSync('./assets/cadmiumRootCert.pem');

/**
 * Cadmium connection handler
 * @author UniQMG
 */
module.exports = class Cadmium {
  constructor({app, requestUrl, endpointUrl, secret, version}) {
    this.emitter = new EventEmitter();
    this.requestPipe = null;
    this.connection = null;
    this.connected = false;
    this.version = version;
    this.secret = secret;
    this.app = app;
    this.requestUrl = requestUrl.replace(/\/$/, '');
    this.endpointUrl = endpointUrl.replace(/\/$/, '');
    this._processPackets();
  }

  /**
   * Returns request parameters for a given query
   * @param {String} query the bit after the domain name (e.g. /status)
   * @returns {Object} the request params
   */
  getRequestOptions(query) {
    return {
      url: this.requestUrl + (query || ''),
      auth: {
        user: 'vertbot',
        pass: this.secret
      },
      agentOptions: {
        ca: rootCACert
      },
      json: true
    }
  }

  /**
   * Attempts a first-connect handshake with the Cadmium server.
   * @returns {Promise} resolves on connection
   */
  connect() {
    return new Promise((resolve, reject) => {
      request(this.getRequestOptions(), (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }

        if (res.statusCode >= 400) {
          reject(new Error("Unexpected response code "+res.statusCode))
          return;
        }

        if (this.version == "skipCheck") {
          console.log("Skipping Cadmium version check");
        } else {
          if (body.version !== this.version) {
            let exp = `expected "${this.version}", got "${body.version}"`
            reject(new Error(`Version mismatch, ${exp}.`));
            return;
          }
        }

        resolve();
      });
    }).then(() => this._listen());
  }

  /**
   * Sets up and maintains a streaming HTTP request to the Cadmium server.
   * Retries endlessly, don't call unless you're sure there's a cadmium
   * server listening (i.e. connect() resolves)!
   * @returns {Promise} resolves on first connect
   */
  _listen() {
    return new Promise((resolve, reject) => {
      if (this.requestPipe) this.requestPipe.terminate();
      this.requestPipe = request(this.getRequestOptions('/listen'));

      let terminated = false;
      let pipe = this.requestPipe;
      pipe.terminate = (() => {
        terminated = true;
        pipe.abort();
        resolve();
      });

      this.requestPipe.on('response', response => {
        if (terminated) return;
        console.log("Cadmium connection established");
        this.emitter.emit('connectionOpened', response);
        this._hookStreamToEmitter(pipe);
        this.connection = response;
        this.connected = true;
        resolve();
      });
      this.requestPipe.on('error', err => {
        if (terminated) return;
        this.emitter.emit('connectionError', err);
        console.log("Failed to connect, retrying in 10s: " + err);
        setTimeout(() => this._listen(), 10000);
        this.requestPipe = null;
        this.connection = null;
        this.connected = false;
      });
      this.requestPipe.on('close', () => {
        if (terminated) return;
        this.emitter.emit('connectionClosed');
        console.log("Cadmium disconnected, attempting reconnect in 5s");
        setTimeout(() => this._listen(), 5000);
        this.requestPipe = null;
        this.connection = null;
        this.connected = false;
      });
    });
  }

  /**
   * Tests whether the originating user of a given packet has a permission
   * @param {Object} packet the packet
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
   * @param {Object} packet
   */
   _cancelPipeline(packet) {
    if (!packet.cancelUrl) return;
    request(this.getRequestOptions(packet.cancelUrl), (err, res, body) => {
      if (err) return this.emitter.emit('error', err);
      if (res.statusCode !== 200) this.emitter.emit('error', new Error(
        'Unexpected response code while canceling pipeline: ' + res.statusCode
      ));
    });
  }

  /**
   * Begins processing packets
   */
  _processPackets() {
    this.on('packet', async packet => {
      if (packet.action !== 'heartbeat')
        console.log(packet.action, "packet", Date.now());

      var playlist = await this.app.db.getPlaylist(packet.guild);
      let djError = playlist.djmode && !await this._testPermission(packet, "dj");

      switch (packet.action) {
        case "heartbeat":
          break;

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

          let url = this.endpointUrl + packet.url;
          let channel = guild.channels.get(packet.channel);
          let voiceChannel = guild.channels.get(packet.voicechat);
          let fakeMessage = { channel, content: url };

          this.app.lavalink.caddyAdd(fakeMessage, url, voiceChannel, packet.pipeline).catch(ex => {
            this.app.bot.createMessage(packet.channel, U.createErrorEmbed(
              "Error playing Cadmium track",
              "This appears to be an internal issue, and changing your " +
              "command will likely not help. Try again later"
            ));
            this.emitter.emit('error', ex);
          });
          break;
      }
    });
  }

  /**
   * Hooks a connection up to the emitter, which then fires 'packet' events.
   * @emits packet: Object
   */
  _hookStreamToEmitter(conn) {
    conn.pipe(split2()).on('data', line => {
      if (line.trim().length == 0) return;
      try {
        this.emitter.emit('packet', JSON.parse(line));
      } catch(ex) {
        // "Unexpected error parsing response: " + ex.stack + ', "' + line + '"'
        let err = new Error(`Unexpected error parsing response ("${line}"): ${ex.stack}`);
        this.emitter.emit('error', err);
      }
    });
  }

  /**
   * Gets the event emitter associated with this Cadmium connection
   * @returns {EventEmitter}
   */
  getEmitter() {
    return this.emitter;
  }

  /**
   * Alias for getEmitter().on
   */
  on() {
    return this.emitter.on(...arguments)
  }
}
