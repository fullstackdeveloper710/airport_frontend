import WebRTCClient from './webRTCClient';
import config from 'config';
export const WS_OPEN_STATE = 1;
const DISCONNECT_CODE = 4000;

export default class SignalingClient {
  constructor(gameClient, socketURL) {
    this.gameClient = gameClient;
    this.socketURL = socketURL;
    this.config = {};
  }

  /***********
   * Getters *
   ***********/
  getGameClient = () => {
    return this.gameClient;
  };

  getWebSocket = () => {
    return this.ws;
  };

  getWebRTClient = () => {
    return this.webRTCClient;
  };

  setWebSocketURL = (socketURL) => {
    this.socketURL = socketURL;
  };

  /****************************
   * WebSocket Event Handlers *
   ****************************/
  onConfig = (config) => {
    this.config = config;

    // Start Unreal as soon as we recieve configuration data back
    // this.sendData(
    //   JSON.stringify({
    //     type: 'startunreal',
    //   })
    // );
    this.getGameClient().startGame();
  };

  onWebRtcAnswer = (webRTCData) => {
    this.webRTCClient.onWebRtcAnswer(webRTCData);
  };

  ongetGameVersion = (msg) => {
    try {
      if (typeof config.build !== 'undefined') {
        window.gameVersion = msg.data;
      } else {
        window.gameVersion = '';
      }
    } catch (e) {
      console.log(e);
    }
  };

  onWebRtcOffer = (webRTCData) => {
    this.webRTCClient.onWebRtcOffer(webRTCData);
  };

  onWebRtcIce = (iceCandidate) => {
    this.webRTCClient.onWebRtcIce(iceCandidate);
  };

  setupEventHandlers = () => {
    this.ws.onmessage = (event) => {
      console.log(`<- SS: ${event.data}`);
      let msg = JSON.parse(event.data);
      if (msg.type === 'config') {
        this.onConfig(msg);
      } else if (msg.type === 'playerCount') {
        // this.updateKickButton(msg.count - 1);
      } else if (msg.type === 'offer') {
        console.log(
          '%c[Inbound SS (offer)]',
          'background: lightblue; color: black',
          msg
        );
        this.onWebRtcOffer(msg);
      } else if (msg.type === 'answer') {
        this.onWebRtcAnswer(msg);
      } else if (msg.type === 'iceCandidate') {
        this.onWebRtcIce(msg.candidate);
      } else if (msg.type === 'onlineStatus') {
        console.log("ONLINE USERS DATA", msg.data)
        this.getGameClient().setOnlineUsers(
          typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data || []
        );
      } else if (msg.type === 'gameversion') {
        this.ongetGameVersion(msg);
      } else {
        console.log(`invalid SS message type: ${msg.type}`);
      }
    };

    this.ws.onerror = (error) => {
      console.log(
        `WS error: ${JSON.stringify(error, [
          'message',
          'arguments',
          'type',
          'name',
        ])} at ${new Date().toString()}`
      );
    };

    this.ws.onclose = (event) => {
      console.log(`WS closed: ${JSON.stringify(event.code)} - ${event.reason}`);
      this.ws = undefined;
      if (this.webRTCClient) {
        this.webRTCClient.close();
      }
      if (this.gameClient.getPlayerWindow()) {
        this.gameClient.getPlayerWindow().destroy();
      }
      if (event.code !== DISCONNECT_CODE) {
        // this.gameClient.startGame();
        // Do not auto reconnect
        this.gameClient.triggerEvent('websocket-error');
      }
    };
  };

  /***************************
   * WebSocket Communication *
   ***************************/
  sendData = (data) => {
    if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
      // console.log(`-> SS: ${data}`);
      this.ws.send(data);
    }
  };

  connect = () => {
    this.ws = new WebSocket(this.socketURL);
    this.setupEventHandlers();
  };

  disconnect = () => {
    if (this.webRTCClient) {
      this.webRTCClient.close();
    }
    if (this.ws) {
      this.ws.close(DISCONNECT_CODE);
    }
  };

  /** WebRTC connection */
  setupWebRTCClient = () => {
    this.webRTCClient = new WebRTCClient(this, this.config);
    this.webRTCClient.addResponseEventListener(
      'handle_response',
      this.gameClient.handleUE5Response
    );
  };
}
