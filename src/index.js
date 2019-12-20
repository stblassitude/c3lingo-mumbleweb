/**
 *
 */

let mumbleConnect = require('mumble-client-websocket')
import BufferQueueNode from 'web-audio-buffer-queue'

// Monkey-patch to allow webworkify-webpack and codecs to work inside of web worker
/* global URL */
window.URL = URL

// Using require to ensure ordering relative to monkey-patch above
let CodecsBrowser = require('@stblassitude/mumble-client-codecs-browser')

class MumbleWebPlayer {
  constructor() {
    this.newUser = user => {
      user.on('voice', stream => {
        console.log(`${user.username} started talking`)
        var userNode = new BufferQueueNode({
          audioContext: this.context
        })
        userNode.connect(this.context.destination)

        stream.on('data', data => {
          console.log('voice data')
          userNode.write(data.buffer)
        }).on('end', () => {
          console.log(`${user.username} stopped talking`)
          userNode.end()
        })
      })
    }

    this.context = new (window.AudioContext || window.webkitAudioContext)()
    document.getElementById('play').addEventListener('click', event => {
      var source = this.context.createBufferSource()
      source.buffer = this.context.createBuffer(1, 480, 48000);
      source.connect(this.context.destination)
      source.start()
      this.connect()
      event.target.style.display = 'none'
    })

    this.connect = () => {
      mumbleConnect('wss://c3lingo.gruenkohl.org/mumble', {
        username: 'Testasdfas',
        password: 'Pass123',
        codecs: CodecsBrowser
      }).done(client => {
        // Connection established
        console.log('Welcome message:', client.welcomeMessage)
        console.log('Actual username:', client.self.username)

        var testChannel = client.getChannel('test')
        if (testChannel) {
          client.self.setChannel(testChannel)
        }

        client.users.forEach(user => this.newUser(user))
        client.on('newUser', this.newUser)
      }, function(err) {
        console.log('Connection failed:', err)
      })
    }
  }
}

addEventListener("DOMContentLoaded", function(){
  var mumbleWebPlayer = new MumbleWebPlayer()
});
