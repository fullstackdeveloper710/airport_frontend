import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import agenda from './agenda';
import agora from './agora';
import audioChatPoll from './audioChatPoll';
import channel from './channel';
import chat from './chat';
import dialog from './dialog';
import event from './event';
import game from './game';
import meetingPoll from './meetingPoll';
import message from './message';
import panel from './panel';
import user from './user';
import usersList from './usersList';
import smartScreen from './smartScreen';
import teleportRequestPoll from './teleportRequestPoll';
import followRequestPoll from './followRequestPoll';
import screenShare from './screenShare';
import presenterPollList from './presenterPollList';
import sidePanel from './sidePanel';
import virtualClassroom from './virtualClassroom';
import VrResourcesSlice from './vrResources';
import polls from './polls';
import quiz from './quiz';
import breakout from './breakout';
import styleStudio from './styleStudio';

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    agenda,
    agora,
    audioChatPoll,
    channel,
    chat,
    dialog,
    event,
    game,
    message,
    meetingPoll,
    panel,
    user,
    usersList,
    smartScreen,
    teleportRequestPoll,
    followRequestPoll,
    screenShare,
    presenterPollList,
    sidePanel,
    virtualClassroom,
    VrResourcesSlice,
    polls,
    quiz,
    breakout,
    styleStudio
  });
