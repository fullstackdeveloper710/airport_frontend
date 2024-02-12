import playVideo from 'assets/images/play_video.png';
import slideShow from 'assets/images/slide_show.png';
import webBrowser from 'assets/images/web_browser.png';
import liveStream from 'assets/images/live_stream.png';
import inactive from 'assets/images/inactive.png';
import whiteBoard from 'assets/images/whiteboard.jpg';
import i18next from 'i18next';
export const Present_Modes = [
  {
    id: 'VideoPlayer',
    text: i18next.t('constants.web.presentModes.videoPlayText'),
    image: playVideo,
  },
  {
    id: 'slide_show',
    text: i18next.t('constants.web.presentModes.slideShowText'),
    image: slideShow,
  },
  {
    id: 'Whiteboard',
    text: i18next.t('constants.web.presentModes.whiteBoardText'),
    image: whiteBoard,
  },
  {
    id: 'WebBrowser',
    text: i18next.t('constants.web.presentModes.webBrowserText'),
    image: webBrowser,
  },
  {
    id: 'ScreenSharePlayer',
    text: i18next.t('constants.web.presentModes.screenShareText'),
    image: liveStream,
  },
  {
    id: 'Idle',
    text: i18next.t('constants.web.presentModes.inactiveText'),
    image: inactive,
  },
];

// Chat
export const CHAT_DM_CHANNEL = '*DIRECT_MESSAGE*';

// User Roles
export const ROLE_PRESENTER = 'ROLE_PRESENTER';
export const ROLE_USER = 'ROLE_USER';

// Poll Prefixes
export const USER_STATUS_PREFIX = 'user-status-';
export const GOD_USER_LIST_PREFIX = 'god-user-list-';
export const EVENT_MEETING_POLL_PREFIX = 'event-meeting-poll-';
export const EVENT_USERS_LIST_POLL_PREFIX = 'event-users-list-';
export const EVENT_PROMOTION_POLL_PREFIX = 'event-promotion-';
export const EVENT_AUDIO_CHAT_POLL_PREFIX = 'event-audio-chat-poll-';
export const EVENT_TRANSCRIPTION_CHAT_POLL_PREFIX =
  'event-transcription-chat-poll-';
export const EVENT_TELEPORT_REQUEST_POLL_PREFIX =
  'event-teleport-request-poll-';
export const EVENT_FOLLOW_ME_POLL_PREFIX = 'event-follow-me-poll-';
export const EVENT_SCREEN_SHARE_POLL_PREFIX = 'event-screen-share-poll-';
export const EVENT_PRESENTERS_LIST_POLL_PREFIX = 'event-presenters-list-poll-';

// Tips
export const TipTypes = {
  TEXT: 'text',
  ICON: 'icon',
};

//LocalStorage
export const CHANNEL_PERMISSIONS = 'channelPermissions';

export const newUserInfoMenu = [
  'map',
  'chat',
  'agenda',
  'profile',
  'settings',
  'help',
  'emotes',
  'info',
  'mic',
  'video',
  'time',
  'expand',
];

export const tips = [
  [],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip1_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomSmile',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip1_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip2_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomMap',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip2_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip3_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomCalendar',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip3_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip4_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomAccountCircle',
    },
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip4_2'),
    },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip5_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomAccountCircle',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip5_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip6_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomHelp',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip6_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip7_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomChat',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip7_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip8_1'),
    },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip9_1'),
    },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip10_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomSmile',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip1_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip11_1'),
    },
    {
      type: TipTypes.ICON,
      content: 'CustomSmile',
    },
    { type: TipTypes.TEXT, content: i18next.t('constants.web.tips.tip1_2') },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip12_1'),
    },
  ],
  [
    {
      type: TipTypes.TEXT,
      content: i18next.t('constants.web.tips.tip13_1'),
    },
  ],
];
