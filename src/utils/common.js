import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import AgoraRTC from 'agora-rtc-sdk-ng';
import html2canvas from 'html2canvas';
import logoImage from 'assets/images/logo/logo.png';
import frameImage from 'assets/images/frame.png';

import {
  GAME_STAGE_NO_SERVERS,
  GAME_STAGE_MEETING,
  GAME_STAGE_ERROR,
  GAME_STAGE_IDLE,
  GAME_STAGE_INITIAL,
  GAME_STAGE_AVATAR,
  GAME_STAGE_ENTERING,
  GAME_STAGE_SLEEPING_SERVERS,
  GAME_STAGE_INSTANCE_ERROR,
  GAME_STAGE_DUPLICATE_SESSION,
  GAME_STAGE_HANG_TIGHT,
  GAME_STAGE_FREEZE_FRAME,
} from 'constants/game';
import { EventUserService } from 'services';
import { setMessage } from 'store/reducers/message';
import config from '../config';
import {
  agoraStreamDeviceBusy,
  agoraStreamPermissionDenied,
  agoraStreamGenericError,
  enableMicAccess,
  enableCameraAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from './eventVariables';
import store from '../store';
import { prefetchAssets } from 'prefetchAssets';


const preloadChunk = (currentChunk, callback) => {
  const preloadImage = (url) => {
    const img = new Image();
    img.src = url;
  };

  const preloadVideo = (url) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'auto';
  };

  const preloadImages = (imageUrls) => {
    imageUrls.forEach(preloadImage);
  };

  const preloadVideos = (videoUrls) => {
    videoUrls.forEach(preloadVideo);
  };

  preloadImages(currentChunk.images);
  preloadVideos(currentChunk.videos);

  const preloadCallback = () => {
    callback();
  };

  const lastVideoUrl = currentChunk.videos[currentChunk.videos.length - 1];
  const lastVideo = document.createElement('video');
  lastVideo.preload = 'auto';
  lastVideo.onloadeddata = preloadCallback;
  lastVideo.src = lastVideoUrl;
}

export const preloadChunksSequentially = (chunksArray, currentIndex, callback) => {
  if (currentIndex < chunksArray.length) {
    const currentChunk = prefetchAssets[chunksArray[currentIndex]];
    preloadChunk(currentChunk, () => {
      preloadChunksSequentially(chunksArray, currentIndex + 1, callback);
    });
  } else {
    console.log("LOADED ALL CHUNKS IN SEQUENCE", chunksArray)
    if (callback) {
      callback();
    }
  }
}

export const generateUuid = (name = undefined) => {
  if (name) {
    return uuidv5(name, uuidv5.URL);
  }
  return uuidv4();
};

export const getGameServerURL = ({
  fullURL,
  userId,
  userName,
  eventId,
  eventUserId,
  userRoles,
  token,
  os,
  browser,
  // instanceId
}) => {
  const url = `wss://${fullURL}?auth=${encodeURIComponent(
    JSON.stringify({
      userId,
      userName,
      eventId,
      eventUserId,
      userRoles,
      token,
      os,
      browser,
      // instanceId
    })
  )}`;
  console.log(url, '<<<fulURL');
  return url;
};

export const createAgoraVideoStream = async (cameraId, dispatch) => {
  try {
    let _cameraId = cameraId
    const localVideo = await AgoraRTC.createCameraVideoTrack({
      cameraId: _cameraId,
    });
    return cameraId ? localVideo : null;
  } catch (err) {
    if (err.code === 'ENUMERATE_DEVICES_FAILED') {
      dispatch(
        setMessage({
          message: agoraStreamDeviceBusy,
        })
      );
    } else if (err.code === 'PERMISSION_DENIED') {
      dispatch(
        setMessage({
          message: agoraStreamPermissionDenied,
        })
      );
    } else {
      dispatch(
        setMessage({
          message: agoraStreamGenericError,
        })
      );
    }
    return { audio: null, video: null };
  }
};

export const createAgoraMicroPhoneStream = async (microphoneId, dispatch) => {
  try {
    const localAudio = await AgoraRTC.createMicrophoneAudioTrack({
      microphoneId,
    });
    return microphoneId ? localAudio : null;
  } catch (err) {
    if (err.code === 'ENUMERATE_DEVICES_FAILED') {
      dispatch(
        setMessage({
          message: agoraStreamDeviceBusy,
        })
      );
    } else if (err.code === 'PERMISSION_DENIED') {
      dispatch(
        setMessage({
          message: agoraStreamPermissionDenied,
        })
      );
    } else {
      dispatch(
        setMessage({
          message: agoraStreamGenericError,
        })
      );
    }
    return { audio: null, video: null };
  }
};

export const getValidChannelName = (channelName) => {
  return generateUuid(channelName);
};

export const isInGame = (stage) => {
  return (
    stage &&
    isGameStarted(stage) &&
    [
      GAME_STAGE_IDLE,
      GAME_STAGE_INITIAL,
      GAME_STAGE_AVATAR,
      GAME_STAGE_ENTERING,
      GAME_STAGE_HANG_TIGHT,
    ].indexOf(stage) === -1
  );
};

export const isInGameMeeting = (stage) => {
  return stage === GAME_STAGE_MEETING;
};

export const isGameStarted = (stage) => {
  return (
    stage &&
    [
      GAME_STAGE_SLEEPING_SERVERS,
      GAME_STAGE_NO_SERVERS,
      GAME_STAGE_INSTANCE_ERROR,
      GAME_STAGE_DUPLICATE_SESSION,
      GAME_STAGE_ERROR,
      GAME_STAGE_FREEZE_FRAME,
    ].indexOf(stage) === -1
  );
};

export const getProductSpecLink = (sku) => {
  return `https://www.kichler.com/products/spec-sheet?sku=${sku}`;
};

export const getMapData = (
  map,
  children = [],
  parentRoom = null,
  isGroup = false
) => {
  if (!map) {
    return;
  }
  return map
    .filter((mapItem, index) =>
      parentRoom ? children.indexOf(index) !== -1 : mapItem.bIsRootEntry
    )
    .map((mapItem) =>
      isGroup
        ? {
            roomName: parentRoom,
            groupName: mapItem.name,
            displayName: mapItem.displayName,
            defaultRoomTypeForMap: mapItem.defaultRoomTypeForMap,
            children: getMapData(map, mapItem.children, mapItem.name),
          }
        : {
            roomName: mapItem.name,
            displayName: mapItem.displayName,
            defaultRoomTypeForMap: mapItem.defaultRoomTypeForMap,
            children: getMapData(
              map,
              mapItem.children,
              mapItem.name,
              mapItem.name === 'Breakout'
            ),
          }
    );
};

export const getDuration = (startTime) => {
  if (!startTime) {
    return '00:00';
  }

  const duration = Math.floor((new Date().getTime() - startTime) / 1000);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  return `${hours ? `${hours > 9 ? '' : '0'}${hours}:` : ''}${
    minutes > 9 ? '' : '0'
  }${minutes}:${seconds > 9 ? '' : '0'}${seconds}`;
};

export const getFutureTime = (date, hours) => {
  var today = new Date(date);
  today.setHours(today.getHours() + hours);
  return today;
};

export const addImageProcess = (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const takeScreenshot = async () => {
  //  const screenshotTarget =document.getElementById("player");// document.body;
  let logo;
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  const videos = document.querySelectorAll('video');
  try {
    const frame = await addImageProcess(frameImage);

    for (let i = 0, len = videos.length; i < len; i++) {
      const v = videos[i];
      if (v.id === 'streamingVideo') {
        try {
          const w = v.videoWidth;
          const h = v.videoHeight;
          canvas.width = w;
          canvas.height = h;
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(v, 0, 0, w, h);
          v.style.backgroundImage = `url(${canvas.toDataURL()})`;
          v.style.backgroundSize = 'cover';
        } catch (e) {
          console.error(e);
          continue;
        }
      }
    }

    // canvas = await html2canvas(screenshotTarget, {
    //   backgroundColor: null,
    //   width: 1980,
    //   height: 1080,
    // });
    // ctx = canvas.getContext('2d');

    const panelTarget = document.querySelector('.ms-Panel');

    if (panelTarget) {
      let panelCanvas = await html2canvas(panelTarget, {
        backgroundColor: null,
      });
      ctx.drawImage(panelCanvas, 60, 0);
    }

    // Drawing Logo
    const logoWidth = 120;
    const logoHeight = 120;
    const logoXPosition = 50;
    const logoYPosition = 50;
    logo = await addImageProcess(logoImage);

    ctx.drawImage(
      logo,
      logoXPosition,
      canvas.height - logoYPosition - logoHeight,
      logoWidth,
      logoHeight
    );

    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error(error);
  }

  return canvas.toDataURL('image/png');
};

export const generateTweetsPage = (imageURL, title, description) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>

        <meta name="twitter:card" content="summary_large_image">

        <meta name="twitter:title" content="${title}">
        <meta name="description" content="${description}">
        <meta name="twitter:description" content="${description}">

        <meta name="twitter:url" content="${imageURL}">
        <meta name="twitter:image" content="${imageURL}">
        
        <meta property="og:title" content="${title}" >
        <meta property="og:description" content="${description}">

        <meta property="og:url" content="${imageURL}">
        <meta property="og:image" content="${imageURL}">
      </head>
      <body style="width: 100vw; height: 100vh; margin: 0;">
        <img src="${imageURL}" style="width: 100%; height:100%;">
      </body>
    </html>
  `;
};

export const isEmptyText = (text) => !text || text.replace(/\s/g, '') === '';

export const isVideoURL = (url) => {
  const videoExtensions = [
    '.mp4',
    '.mov',
    '.wmv',
    '.flv',
    '.avi',
    '.avchd',
    '.webm',
    '.mkv',
  ];
  for (let extension of videoExtensions) {
    if (url.toLowerCase().includes(extension)) {
      return true;
    }
  }
  return false;
};

export const convertIdToEventLoggerFormat = (id) => {
  try {
    const splitId = id.split('-');
    const formattedId =
      splitId[2] + splitId[1] + splitId[0] + splitId[3] + splitId[4];
    return formattedId.toUpperCase();
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const teleportToUser = async (eventId, userId, onError) => {
  if (window.gameClient) {
    if (eventId && userId) {
      const formattedEventId = convertIdToEventLoggerFormat(eventId);
      const formattedUserId = convertIdToEventLoggerFormat(userId);
      if (formattedEventId && formattedUserId) {
        const eventUserService = new EventUserService();
        try {
          const eventLoggerRes = await eventUserService.getEventUserGameId({
            eventId: formattedEventId,
            userId: formattedUserId,
          });
          if (eventLoggerRes.gameId) {
            if (eventLoggerRes.gameId.indexOf('.MeetingRoom.') !== -1) {
              throw new Error('The user is in private room.');
            }
            const cmsRes = await eventUserService.getEventUser({
              eventId,
              userId,
            });
            window.gameClient.teleportToUserRoom(
              eventLoggerRes.gameId,
              cmsRes.id
            );
          } else {
            throw new Error('The user is not in the game.');
          }
        } catch (error) {
          onError(error);
        }
      } else {
        console.log('Error : Formatted ID not present for user or event');
      }
    } else {
      console.log('Error : Event ID or user ID not present');
    }
  }
};

export const agendaTeleportToUser = async (eventId, userId, agendaLocation, dispatch, onError) => {
  if (window.gameClient) {
    if (eventId && userId) {
      const formattedEventId = convertIdToEventLoggerFormat(eventId);
      const formattedUserId = convertIdToEventLoggerFormat(userId);
      if (formattedEventId && formattedUserId) {
        const eventUserService = new EventUserService();
        try {
          const eventLoggerRes = await eventUserService.getEventUserGameId({
            eventId: formattedEventId,
            userId: formattedUserId,
          });
          if (eventLoggerRes.gameId) {
            if(eventLoggerRes.gameId.indexOf(agendaLocation) === -1) {
              dispatch(
                setMessage({
                  message: "The Host has not yet started the meeting",
                })
              );
              return
            }
            if (eventLoggerRes.gameId.indexOf('.Meeting.') !== -1) {
              const indexOfRoomSeparator = eventLoggerRes?.gameId?.indexOf(".")
              const meetingRoom =  eventLoggerRes?.gameId?.slice(indexOfRoomSeparator+1)
              window.gameClient.teleportUserToMeetingRoom(meetingRoom)
              return
            }
            const cmsRes = await eventUserService.getEventUser({
              eventId,
              userId,
            });
            window.gameClient.teleportToUserRoom(
              eventLoggerRes.gameId,
              cmsRes.id
            );
          } else {
            throw new Error('The user is not in the game.');
          }
        } catch (error) {
          onError(error);
        }
      } else {
        console.log('Error : Formatted ID not present for user or event');
      }
    } else {
      console.log('Error : Event ID or user ID not present');
    }
  }
};

export const teleportToLatest = (eventId, userId, onError) => {
  if (window.gameClient) {
    const eventUserService = new EventUserService();
    eventUserService
      .getEventUser({ eventId, userId })
      .then((response) => {
        if (response.gameId) {
          const [, , mapName, groupName] = response.gameId.match(
            /(.*)\.(.*)\.(.*)\.(.*)/
          );
          if (mapName && groupName) {
            if (mapName === 'MeetingRoom') {
              window.gameClient.teleportUserToMeetingRoom(response.gameId);
            } else {
              window.gameClient.joinLevelNew(mapName, groupName);
            }
          }
        } else {
          throw new Error('Error loading last game position.');
        }
      })
      .catch(onError);
  }
};

export const deBounce = (fn, ms = 500) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
};
export const getChatID = (userObj) => {
  return config.event.name + '-' + userObj.eventUserId;
};

export const getLocalStream = async () => {
  const mediaStream = {};
  const currentUser = store.getState().user.current;
  mediaStream.audio =
    (enableMicAccess ||
      (enablePresenterMicAccess &&
        currentUser?.roles?.includes('ROLE_PRESENTER'))) &&
    (await navigator?.mediaDevices?.getUserMedia({
      audio: true,
    }))
      ? true
      : false;
  mediaStream.video =
    (enableCameraAccess ||
      (enablePresenterCameraAccess &&
        currentUser?.roles?.includes('ROLE_PRESENTER'))) &&
    (await navigator?.mediaDevices?.getUserMedia({
      video: true,
    }))
      ? true
      : false;
  return mediaStream;
};
export function toTitleCase(str) {
  return str
    .split(' ')
    .map(function (val) {
      return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
    })
    .join(' ');
}
export function toTitleCasePreserving(str) {
  return str
    .split(' ')
    .map(function (val) {
      return val.charAt(0).toUpperCase() + val.substr(1);
    })
    .join(' ');
}
