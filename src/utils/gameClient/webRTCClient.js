import { ToClientMessageType } from '.';
//import i18next from 'i18next';
export default class WebRTCClient {
  constructor(signalingClient, config) {
    this.signalingClient = signalingClient;
    this.responseEventListeners = new Map();
    this.VideoEncoderQP = 'N/A';

    this.setupWebRTCPlayer(config);
    }

  addResponseEventListener = (name, listener) => {
    this.responseEventListeners.set(name, listener);
  };

  removeResponseEventListener = (name) => {
    this.responseEventListeners.remove(name);
  };

  createWebRtcOffer = () => {
    if (this.webRtcPlayerObj) {
      // console.log('Creating offer');
      this.webRtcPlayerObj.createOffer();
    } else {
      console.log('WebRTC player not setup, cannot create offer');
    }
  };

  close = () => {
    // destroy `webRtcPlayerObj` if any
    // let playerDiv = document.getElementById("player");
    // playerDiv.removeChild(this.webRtcPlayerObj.video);
    if (this.webRtcPlayerObj) {
      this.webRtcPlayerObj.close();
    }
    this.webRtcPlayerObj = undefined;
  };

  setupStats = () => {
    const _this = this;
    _this.webRtcPlayerObj.aggregateStats(1 * 1000 /*Check every 1 second*/);

    let printInterval = 5 * 60 * 1000; /*Print every 5 minutes*/
    let nextPrintDuration = printInterval;

    _this.webRtcPlayerObj.onAggregatedStats = (aggregatedStats) => {
      _this.signalingClient
        .getGameClient()
        .triggerEvent('stream-stats', { data: aggregatedStats });

      let numberFormat = new Intl.NumberFormat(window.navigator.language, {
        maximumFractionDigits: 0,
      });
      let timeFormat = new Intl.NumberFormat(window.navigator.language, {
        maximumFractionDigits: 0,
        minimumIntegerDigits: 2,
      });

      // Calculate duration of run
      let runTime =
        (aggregatedStats.timestamp - aggregatedStats.timestampStart) / 1000;
      let timeValues = [];
      let timeDurations = [60, 60];
      for (let timeIndex = 0; timeIndex < timeDurations.length; timeIndex++) {
        timeValues.push(runTime % timeDurations[timeIndex]);
        runTime = runTime / timeDurations[timeIndex];
      }
      timeValues.push(runTime);

      let runTimeSeconds = timeValues[0];
      let runTimeMinutes = Math.floor(timeValues[1]);
      let runTimeHours = Math.floor([timeValues[2]]);

      let receivedBytesMeasurement = 'B';
      let receivedBytes = aggregatedStats.hasOwnProperty('bytesReceived')
        ? aggregatedStats.bytesReceived
        : 0;
      let dataMeasurements = ['kB', 'MB', 'GB'];
      for (let index = 0; index < dataMeasurements.length; index++) {
        if (receivedBytes < 100 * 1000) break;
        receivedBytes = receivedBytes / 1000;
        receivedBytesMeasurement = dataMeasurements[index];
      }

      let qualityStatus = document.getElementById('qualityStatus');

      // "blinks" quality status element for 1 sec by making it transparent, speed = number of blinks
      let blinkQualityStatus = function (speed) {
        let iter = speed;
        let opacity = 1; // [0..1]
        let tickId = setInterval(
          function () {
            opacity -= 0.1;
            // map `opacity` to [-0.5..0.5] range, decrement by 0.2 per step and take `abs` to make it blink: 1 -> 0 -> 1
            if (qualityStatus) {
              qualityStatus.style = `opacity: ${Math.abs((opacity - 0.5) * 2)}`;
            }
            if (opacity <= 0.1) {
              if (--iter == 0) {
                clearInterval(tickId);
              } else {
                // next blink
                opacity = 1;
              }
            }
          },
          100 / speed // msecs
        );
      };

      const orangeQP = 26;
      const redQP = 35;

      let statsText = '';

      let color = 'lime';
      if (_this.VideoEncoderQP > redQP) {
        color = 'red';
        blinkQualityStatus(2);
        statsText += `<div style="color: ${color}">Very blocky encoding quality</div>`;
      } else if (_this.VideoEncoderQP > orangeQP) {
        color = 'orange';
        blinkQualityStatus(1);
        statsText += `<div style="color: ${color}">Blocky encoding quality</div>`;
      }

      if (qualityStatus) {
        qualityStatus.className = `${color}Status`;
      }

      statsText += `<div>Duration: ${timeFormat.format(
        runTimeHours
      )}:${timeFormat.format(runTimeMinutes)}:${timeFormat.format(
        runTimeSeconds
      )}</div>`;
      statsText += `<div>Video Resolution: ${
        aggregatedStats.hasOwnProperty('frameWidth') &&
        aggregatedStats.frameWidth &&
        aggregatedStats.hasOwnProperty('frameHeight') &&
        aggregatedStats.frameHeight
          ? aggregatedStats.frameWidth + 'x' + aggregatedStats.frameHeight
          : 'N/A'
      }</div>`;
      statsText += `<div>Received (${receivedBytesMeasurement}): ${numberFormat.format(
        receivedBytes
      )}</div>`;
      statsText += `<div>Frames Decoded: ${
        aggregatedStats.hasOwnProperty('framesDecoded')
          ? numberFormat.format(aggregatedStats.framesDecoded)
          : 'N/A'
      }</div>`;
      statsText += `<div>Packets Lost: ${
        aggregatedStats.hasOwnProperty('packetsLost')
          ? numberFormat.format(aggregatedStats.packetsLost)
          : 'N/A'
      }</div>`;
      statsText += `<div style="color: ${color}">Bitrate (kbps): ${
        aggregatedStats.hasOwnProperty('bitrate')
          ? numberFormat.format(aggregatedStats.bitrate)
          : 'N/A'
      }</div>`;
      statsText += `<div>Framerate: ${
        aggregatedStats.hasOwnProperty('framerate')
          ? numberFormat.format(aggregatedStats.framerate)
          : 'N/A'
      }</div>`;
      statsText += `<div>Frames dropped: ${
        aggregatedStats.hasOwnProperty('framesDropped')
          ? numberFormat.format(aggregatedStats.framesDropped)
          : 'N/A'
      }</div>`;
      statsText += `<div>Net RTT (ms): ${
        aggregatedStats.hasOwnProperty('currentRoundTripTime')
          ? numberFormat.format(aggregatedStats.currentRoundTripTime * 1000)
          : 'N/A'
      }</div>`;
      statsText += `<div>Browser receive to composite (ms): ${
        aggregatedStats.hasOwnProperty('receiveToCompositeMs')
          ? numberFormat.format(aggregatedStats.receiveToCompositeMs)
          : 'N/A'
      }</div>`;
      statsText += `<div style="color: ${color}">Video Quantization Parameter: ${_this.VideoEncoderQP}</div>`;

      let statsDiv = document.getElementById('stats');

      if (statsDiv) {
        statsDiv.innerHTML = statsText;
      }

      /*if (true) {*/
      if (aggregatedStats.timestampStart) {
        if (
          aggregatedStats.timestamp - aggregatedStats.timestampStart >
          nextPrintDuration
        ) {
          if (_this.ws && _this.ws.readyState === _this.WS_OPEN_STATE) {
            console.log(`-> SS: stats\n${JSON.stringify(aggregatedStats)}`);
            _this.ws.send(
              JSON.stringify({ type: 'stats', data: aggregatedStats })
            );
          }
          nextPrintDuration += printInterval;
        }
      }
      //}
    };

    this.webRtcPlayerObj.latencyTestTimings.OnAllLatencyTimingsReady =
      function (timings) {
        if (!timings.BrowserReceiptTimeMs) {
          return;
        }

        let latencyExcludingDecode =
          timings.BrowserReceiptTimeMs - timings.TestStartTimeMs;
        let encodeLatency = timings.UEEncodeMs;
        let uePixelStreamLatency = timings.UECaptureToSendMs;
        let ueTestDuration =
          timings.UETransmissionTimeMs - timings.UEReceiptTimeMs;
        let networkLatency = latencyExcludingDecode - ueTestDuration;

        //these ones depend on FrameDisplayDeltaTimeMs
        let endToEndLatency = null;
        let browserSideLatency = null;

        if (timings.FrameDisplayDeltaTimeMs && timings.BrowserReceiptTimeMs) {
          endToEndLatency =
            timings.FrameDisplayDeltaTimeMs +
            networkLatency +
            (typeof uePixelStreamLatency === 'string'
              ? 0
              : uePixelStreamLatency);
          browserSideLatency =
            timings.FrameDisplayDeltaTimeMs +
            (latencyExcludingDecode - networkLatency - ueTestDuration);
        }

        let latencyStatsInnerHTML = '';
        latencyStatsInnerHTML += `<div>Net latency RTT (ms): ${networkLatency.toFixed(
          2
        )}</div>`;
        latencyStatsInnerHTML += `<div>UE Encode (ms): ${
          typeof encodeLatency === 'string'
            ? encodeLatency
            : encodeLatency.toFixed(2)
        }</div>`;
        latencyStatsInnerHTML += `<div>UE Send to capture (ms): ${
          typeof uePixelStreamLatency === 'string'
            ? uePixelStreamLatency
            : uePixelStreamLatency.toFixed(2)
        }</div>`;
        latencyStatsInnerHTML += `<div>UE probe duration (ms): ${ueTestDuration.toFixed(
          2
        )}</div>`;
        latencyStatsInnerHTML +=
          timings.FrameDisplayDeltaTimeMs && timings.BrowserReceiptTimeMs
            ? `<div>Browser composite latency (ms): ${timings.FrameDisplayDeltaTimeMs.toFixed(
                2
              )}</div>`
            : '';
        latencyStatsInnerHTML += browserSideLatency
          ? `<div>Total browser latency (ms): ${browserSideLatency.toFixed(
              2
            )}</div>`
          : '';
        latencyStatsInnerHTML += endToEndLatency
          ? `<div>Total latency (ms): ${endToEndLatency.toFixed(2)}</div>`
          : '';

        let latencyStats = document.getElementById('LatencyStats');

        if (latencyStats) {
          latencyStats.innerHTML = latencyStatsInnerHTML;
        }
      };
  };

  onWebRtcOffer = (webRTCData) => {
    this.webRtcPlayerObj.receiveOffer(webRTCData);
    this.setupStats();
  };

  onWebRtcAnswer = (webRTCData) => {
    this.webRtcPlayerObj.receiveAnswer(webRTCData);
    this.setupStats();
  };

  onWebRtcIce = (iceCandidate) => {
    if (this.webRtcPlayerObj) {
      this.webRtcPlayerObj.handleCandidateFromServer(iceCandidate);
    }
  };

  setupWebRTCEventHandlers = () => {
    const _this = this;
    const playerWindow = _this.signalingClient
      .getGameClient()
      .getPlayerWindow();

    _this.webRtcPlayerObj.onWebRtcOffer = (offer) => {
      let offerStr = JSON.stringify(offer);
      console.log(
        '%c[Outbound signaling message (offer)]',
        'background: lightgreen; color: black',
        offerStr
      );
      _this.signalingClient.sendData(offerStr);
    };

    _this.webRtcPlayerObj.onWebRtcCandidate = (candidate) => {
      // console.log(_this, candidate);
      _this.signalingClient.sendData(
        JSON.stringify({
          type: 'iceCandidate',
          candidate: candidate,
        })
      );
    };

    _this.webRtcPlayerObj.onWebRtcAnswer = (answer) => {
      let answerStr = JSON.stringify(answer);
      console.log(
        '%c[Outbound signaling message (offer)]',
        'background: lightgreen; color: black',
        answerStr
      );
      _this.signalingClient.sendData(answerStr);
    };

    _this.webRtcPlayerObj.onVideoInitialised = function () {
      if (_this.webRtcPlayerObj && _this.webRtcPlayerObj.video) {
        _this.webRtcPlayerObj.video.muted = 'muted';
        _this.webRtcPlayerObj.video.play();
        const gameClient = _this?.signalingClient?.getGameClient();
        if (gameClient?.isInitialized===false) {
          gameClient?.initialize();
        }
      }
    };

    _this.webRtcPlayerObj.onDataChannelConnected = function () {};

    _this.webRtcPlayerObj.onDataChannelMessage = async function (data) {
      let _data;
      try {
        _data = await data.arrayBuffer();
      } catch {
        _data = data;
      }
      var view = new Uint8Array(_data);

      if (view[0] === ToClientMessageType.QualityControlOwnership) {
        let ownership = view[1] === 0 ? false : true;
        console.log(
          'Received quality controller message, will control quality: ' +
            ownership
        );
      } else if (view[0] === ToClientMessageType.Response) {
        const response = new TextDecoder('utf-16').decode(_data.slice(1));
        for (let listener of _this.responseEventListeners.values()) {
          listener(response);
        }
      } else if (view[0] === ToClientMessageType.Command) {
        let commandAsString = new TextDecoder('utf-16').decode(_data.slice(1));
        // console.log(commandAsString);
        let command = JSON.parse(commandAsString);
        if (command.command === 'onScreenKeyboard') {
          playerWindow.showOnScreenKeyboard(command);
        }
      } else if (view[0] === ToClientMessageType.FreezeFrame) {
        playerWindow.processFreezeFrameMessage(view);
      } else if (view[0] === ToClientMessageType.UnFreezeFrame) {
        playerWindow.invalidateFreezeFrameOverlay();
      } else if (view[0] === ToClientMessageType.VideoEncoderAvgQP) {
        _this.VideoEncoderQP = new TextDecoder('utf-16').decode(data.slice(1));
        // console.log(`received VideoEncoderAvgQP ${_this.VideoEncoderQP}`);
      } else if (view[0] == ToClientMessageType.LatencyTest) {
        let latencyTimingsAsString = new TextDecoder('utf-16').decode(
          data.slice(1)
        );
        console.log('Got latency timings from UE.');
        console.log(latencyTimingsAsString);
        let latencyTimingsFromUE = JSON.parse(latencyTimingsAsString);
        if (_this.webRtcPlayerObj) {
          _this.webRtcPlayerObj.latencyTestTimings.SetUETimings(
            latencyTimingsFromUE
          );
        }
      } else if (view[0] == ToClientMessageType.InitialSettings) {
        let settingsString = new TextDecoder('utf-16').decode(data.slice(1));
        let settingsJSON = JSON.parse(settingsString);

        // reminder bitrates are sent in bps but displayed in kbps

        if (settingsJSON.Encoder) {
          let checkElement = document.getElementById('encoder-rate-control');
          if (checkElement) {
            document.getElementById('encoder-rate-control').value =
              settingsJSON.Encoder.RateControl;
            document.getElementById('encoder-target-bitrate-text').value =
              settingsJSON.Encoder.TargetBitrate > 0
                ? settingsJSON.Encoder.TargetBitrate / 1000
                : settingsJSON.Encoder.TargetBitrate;
            document.getElementById('encoder-max-bitrate-text').value =
              settingsJSON.Encoder.MaxBitrate > 0
                ? settingsJSON.Encoder.MaxBitrate / 1000
                : settingsJSON.Encoder.MaxBitrate;
            document.getElementById('encoder-min-qp-text').value =
              settingsJSON.Encoder.MinQP;
            document.getElementById('encoder-max-qp-text').value =
              settingsJSON.Encoder.MaxQP;
            document.getElementById('encoder-filler-data-tgl').checked =
              settingsJSON.Encoder.FillerData == 1;
            document.getElementById('encoder-multipass').value =
              settingsJSON.Encoder.MultiPass;
          }
        }
        if (settingsJSON.WebRTC) {
          let checkElement = document.getElementById('encoder-rate-control');
          if (checkElement) {
            document.getElementById('webrtc-degradation-pref').value =
              settingsJSON.WebRTC.DegradationPref;
            document.getElementById('webrtc-max-fps-text').value =
              settingsJSON.WebRTC.MaxFPS;
            document.getElementById('webrtc-min-bitrate-text').value =
              settingsJSON.WebRTC.MinBitrate / 1000;
            document.getElementById('webrtc-max-bitrate-text').value =
              settingsJSON.WebRTC.MaxBitrate / 1000;
            document.getElementById('webrtc-low-qp-text').value =
              settingsJSON.WebRTC.LowQP;
            document.getElementById('webrtc-high-qp-text').value =
              settingsJSON.WebRTC.HighQP;
          }
        }
      } else {
        console.error(`unrecognized data received, packet ID ${view[0]}`);
      }
    };
  };

  setupWebRTCPlayer = (config) => {
    this.webRtcPlayerObj = new window.webRtcPlayer(config);
    const playerWindow = this.signalingClient.getGameClient().getPlayerWindow();

    playerWindow.getPlayerElement().appendChild(this.webRtcPlayerObj.video);
    playerWindow
      .getPlayerElement()
      .appendChild(playerWindow.getFreezeFrameOverlay());

    this.setupWebRTCEventHandlers();

    playerWindow.registerInputs(this.webRtcPlayerObj.video);

    // On a touch device we will need special ways to show the on-screen keyboard.
    if ('ontouchstart' in document.documentElement) {
      playerWindow.createOnScreenKeyboardHelpers(
        playerWindow.getPlayerElement()
      );
    }

    //this.createWebRtcOffer();

    playerWindow.resizePlayerStyle();
    playerWindow.registerControlSchema(this.webRtcPlayerObj.video);
  };

  sendInputData = (data) => {
    if (this.webRtcPlayerObj) {
      this.webRtcPlayerObj.send(data);
    }
  };

  unMuteWebRtcPlayer = () => {
    if (
      this.webRtcPlayerObj &&
      this.webRtcPlayerObj.video &&
      this.webRtcPlayerObj.video.muted
    ) {
      this.webRtcPlayerObj.video.muted = undefined;
    }
  };

  changeControlScheme = (controlScheme) => {
    const playerWindow = this.signalingClient.getGameClient().getPlayerWindow();

    if (playerWindow && this.webRtcPlayerObj && this.webRtcPlayerObj.video) {
      playerWindow.changeControlScheme(controlScheme);
      playerWindow.registerControlSchema(this.webRtcPlayerObj.video);
    }
  };

  lockDynamicMouseEvents = () => {
    const playerWindow = this.signalingClient.getGameClient().getPlayerWindow();

    if (playerWindow && this.webRtcPlayerObj && this.webRtcPlayerObj.video) {
      playerWindow.lockDynamicMouseEvents(this.webRtcPlayerObj.video);
    }
  };

  unlockDynamicMouseEvents = () => {
    const playerWindow = this.signalingClient.getGameClient().getPlayerWindow();

    if (playerWindow) {
      playerWindow.unlockDynamicMouseEvents();
    }
  };
}
