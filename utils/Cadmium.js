const EventEmitter = require('events');
const request = require("request");
const split2 = require('split2');
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
    this.requestUrl = requestUrl;
    this.endpointUrl = endpointUrl;
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
      // TODO: agentOptions: { ca: foo }
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

        if (body.version !== this.version) {
          let exp = `expected "${this.version}", got "${body.version}"`
          reject(new Error(`Version mismatch, ${exp}.`));
          return;
        }

        resolve();
      });
    }).then(() => {
      this._processPackets();
      this._listen();
    });
  }

  /**
   * Sets up and maintains a streaming HTTP request to the Cadmium server.
   * Retries endlessly, don't call unless you're sure there's a cadmium
   * server listening (i.e. connect() resolves)!
   * @returns {Promise} resolves on first connect
   */
  _listen() {
    return new Promise((resolve, reject) => {
      this.requestPipe = request(this.getRequestOptions('/listen'))
        .on('response', response => {
          console.log("Cadmium connection established");
          this.emitter.emit('connectionOpened', response);
          this.connection = response;
          this.connected = true;
          this._hookStreamToEmitter(this.requestPipe);
          resolve();
        })
        .on('error', err => {
          this.emitter.emit('connectionError', err);
          console.log("Failed to connect, retrying in 1s: " + err);
          setTimeout(() => this._listen(), 1000);
          this.requestPipe = null;
          this.connection = null;
          this.connected = false;
        })
        .on('close', () => {
          this.emitter.emit('connectionClosed');
          console.log("Cadmium disconnected, attempting reconnect in 1s");
          setTimeout(() => this._listen(), 1000);
          this.requestPipe = null;
          this.connection = null;
          this.connected = false;
        });
    });
  }

  /**
   * Begins processing packets
   */
  _processPackets() {
    this.on('packet', packet => {
      let guild = this.app.bot.guilds.get(packet.guild);
      if (!guild) return;

      let url = this.endpointUrl + packet.url;
      this.app.bot.createMessage(packet.channel, "Cadmium song added to queue");

      let channel = guild.channels.get(packet.channel);
      let voiceChannel = guild.channels.get(packet.voicechat);
      let fakeMessage = { channel, content: url };

      this.app.lavalink.add(fakeMessage, url, false, voiceChannel, this);
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
        let err = new Error("Unexpected error parsing response: " + ex.stack + ', "' + line + '"');
        this.emitter.emit('error', err);
      }
    })
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