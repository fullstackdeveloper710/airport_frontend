import { Client } from '@twilio/conversations';
import { setPanelName, openPanel } from 'store/reducers/panel';
import BaseAPIService from './baseAPIService';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { initChannels, setPublicFriendlyNames } from 'store/reducers/channel';
import config from 'config';
import { getChatID } from 'utils/common';
import store from 'store';

class ChatService extends BaseAPIService {
  constructor() {
    super();
    this.messageListeners = [];
    this.isActive = false;
    this.retryCount = 1;
    this.retryInterval = 200;
    this.dispatch = null;
    this.retryTimeoutRef = null;
  }

  stopService = () => {
    this.isActive = false;
    this.client.shutdown();
    this.client = null;
  };

  setupMessenger = async (res) => {
    return new Promise(async (resolve, reject) => {
      if (res.status === 'success') {
        this.identity = res.identity;
        console.log("IDENTITY", res.identity)
        this.token = res.token;
        this.client = new Client(this.token);
        if (!this.client) return;
        this.client.on('tokenAboutToExpire', this.updateToken);
        try {
          this.connectionErrorAndRestart(() => resolve(true));
        } catch (err) {
          console.log(err);
        }
      } else {
        reject();
      }
    });
  };

  updateToken = async () => {
    const res = await this.getToken(this.userId, 86400);
    if (res.status && res.status === 'success') {
      this.token = res.token;
      if (!this.token) return;
      if (this.client) {
        await this.client.updateToken(this.token);
      }
    }
  };

  setChannelInviteHandler = (channelInviteHandler) => {
    if (!this.client) return;
    this.client.on('conversationAdded', channelInviteHandler);
  };

  setChannelUpdateHandler = (channelUpdateHandler) => {
    if (!this.client) return;
    this.client.on('conversationUpdated', channelUpdateHandler);
  };

  setChannelRomovedHandler = (channelRomovedHandler) => {
    if (!this.client) return;
    this.client.on('conversationRemoved', channelRomovedHandler);
  };

  setChannelLeftHandler = (channelLeftHandler) => {
    if (!this.client) return;
    this.client.on('conversationLeft', channelLeftHandler);
  };

  setUserUpdateHandler = (user, handler) => {
    if (user) {
      user.on('updated', handler);
    }
  };

  setDispatch = (dispatch) => {
    this.dispatch = dispatch;
  };

  configurePublicChannels = async (publicChannelSID) => {
    try {
      if (!this.channels[publicChannelSID]) {
        let channel = await this.client.getConversationBySid(publicChannelSID);
        if (channel?._internalState?.status !== 'joined') {
          this.channels[publicChannelSID] = await this.joinChannel(channel);
        } else {
          this.channels[publicChannelSID] = channel;
        }
      }
    } catch (err) {
      if (err.message === 'Forbidden' || err.message === 'Not Found') {
        try {
          await this.addParticpantToGeneral(this.identity, publicChannelSID);
          this.channels[publicChannelSID] =
            await this.client.getConversationBySid(publicChannelSID);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("ERROR CONFIGURING PUBLIC CHANNEL",err, publicChannelSID);
      }
    }
    return null;
  };

  configureKnownChannels = async (knownChannel) => {
    try {
      let participants;
      participants = await knownChannel.getParticipants();
      this.numberOfParticipants[knownChannel.sid] = participants.length;
      if (!this.channels[knownChannel.sid]) {
        this.channels[knownChannel.sid] = knownChannel;
      }
    } catch (error) {
      console.log('-->[error]: configureKnownChannels', error);
    }
    return null;
  };

  loadChannelList = async (
    eventId,
    currentUser,
    messageListener,
    messageLimit = 999999999
  ) => {
    if (!this.client) {
      return;
    }
    this.eventID = eventId;
    this.messageListener = messageListener;
    this.channels = {};

    // let publicChannels = await this.getPublicChannels({ eventId });
    let publicChannels = []
    if (!this.client) return;
    let knownChannels = await this.client.getSubscribedConversations();
    let promises = [];
    let publicFriendlyNames = [];
    this.numberOfParticipants = {};

    for (let item of publicChannels) {
      publicFriendlyNames.push(item.friendlyName);
      promises.push(
        new Promise(async (resolve) => {
          await this.configurePublicChannels(item.sid);
          resolve();
        })
      );
    }

    await Promise.all(promises);
    promises = [];
    this.dispatch(setPublicFriendlyNames(publicFriendlyNames));
  
    while (knownChannels) {
      for (let item of knownChannels.items) {
        promises.push(
          new Promise(async (resolve) => {
            await this.configureKnownChannels(item);
            resolve();
          })
        );
      }
      if (!knownChannels.hasNextPage) {
        break;
      }
      knownChannels = await knownChannels.nextPage();
    }

    await Promise.all(promises);

    let channelArray = [];
    let messages = {};
    promises = [];

    for (let i in this.channels) {
      promises.push(
        new Promise(async (resolve) => {
          if (this.channels[i]?._internalState?.status === 'joined') {
            if (messageListener) {
              this.addMessageHandlerToChannel(this.channels[i]);
            }
            let message = await this.loadMessages(
              this.channels[i],
              messageLimit
            );
            if (!message) return;
            messages[i] = [];
            if (!message.items) return;
            for (let item of message.items) {
              messages[i].push({
                id: item.state.sid,
                from: item.state.author,
                message: item.state.body,
                date: item.state.dateUpdated.toString(),
              });
            }
          }
          channelArray.push({
            sid: this.channels[i].sid,
            uniqueName: this.channels[i].uniqueName,
            friendlyName: this.channels[i].friendlyName,
            isPrivate:
              this.channels[i].friendlyName.indexOf(CHAT_DM_CHANNEL) === 0 ||
              publicFriendlyNames.includes(this.channels[i].friendlyName)
                ? false
                : true,
            membersCount: this.numberOfParticipants[this.channels[i].sid],
            status: this.channels[i].status,
          });
          resolve();
        })
      );
    }
    await Promise.all(promises);

    return {
      channels: channelArray,
      messages
    };
  };

  addMessageHandlerToChannel = (channel) => {
    if (!this.messageListeners.includes(channel.sid)) {
      this.messageListeners.push(channel.sid);
      if (!channel) return;
      channel.on('messageAdded', this.messageListener);
    }
  };

  createNewChannel = async (channelInfo) => {
    let channel;
    try {
      channel = await this.client.createConversation({
        friendlyName: channelInfo.friendlyName,
        uniqueName: channelInfo.uniqueName,
      });
    } catch (error) {
      console.log(error);
    }
    if (this.isActive) {
      await this.joinChannel(channel);
      this.channels[channel.sid] = channel;
      this.addMessageHandlerToChannel(channel);
    }
    return channel;
  };

  removeNotificationFromAllChannel = () => {
    for (let i in this.channels) {
      this.channels[i].removeListener('messageAdded', this.messageListener);
    }
  };

  joinChannel = async (_channel) => {
    try {
      if (this.isActive) {
        let joinedChannel = await _channel.join();
        return joinedChannel;
      }
      return null;
    } catch (err) {
      if (_channel.status == 'joined') {
        return _channel;
      } else {
        console.error(
          "Couldn't join channel " +
            _channel.friendlyName +
            ' because -> ' +
            err
        );
        return null;
      }
    }
  };

  initChannelEvents = (
    showTypingStarted,
    hideTypingStarted,
    notifyMemberJoined,
    notifyMemberLeft
  ) => {
    if (!this.currentChannel) {
      return;
    }
    if (showTypingStarted) {
      this.showTypingStarted = showTypingStarted;
      this.currentChannel.on('typingStarted', this.showTypingStarted);
    }
    if (hideTypingStarted) {
      this.hideTypingStarted = hideTypingStarted;
      this.currentChannel.on('typingEnded', this.hideTypingStarted);
    }
    if (notifyMemberJoined) {
      this.notifyMemberJoined = notifyMemberJoined;
      this.currentChannel.on('participantJoined', this.notifyMemberJoined);
    }
    if (notifyMemberLeft) {
      this.notifyMemberLeft = notifyMemberLeft;
      this.currentChannel.on('participantLeft', this.notifyMemberLeft);
    }
  };

  setupChannel = (
    sid,
    showTypingStarted,
    hideTypingStarted,
    notifyMemberJoined,
    notifyMemberLeft
  ) => {
    if (this.currentChannel && this.currentChannel.sid === sid) {
      return this.currentChannel;
    }
    if (!this.channels[sid]) {
      console.error("***Couldn't setup channel with sid of ", sid);
      return null;
    }
    this.leaveChannelEvents(this.currentChannel);
    this.currentChannel = this.channels[sid];
    this.initChannelEvents(
      showTypingStarted,
      hideTypingStarted,
      notifyMemberJoined,
      notifyMemberLeft
    );
    return this.currentChannel;
  };

  sendTypingSignal = () => {
    if (this.currentChannel) {
      if (this.isActive) {
        this.currentChannel.typing();
      }
    }
  };

  loadMessages = async (channel, limit = 999999999) => {
    let messages = {
      items : []
    };
    let messageCount = 0
    let hasPrevPage = false
    let messagePage = null
    if (this.isActive) {
      messagePage = await channel.getMessages(50);
      messages["items"] = [...messagePage.items]
      hasPrevPage = messagePage.hasPrevPage
      while(hasPrevPage && messageCount <= limit){
        try{
          const prevPage = await messagePage.prevPage()
          if(prevPage?.items?.length !== 0){
            messagePage = prevPage
            messages["items"] = [...messagePage.items, ...messages["items"]]
            messageCount += messagePage.items.length
            hasPrevPage = messagePage.hasPrevPage
          }else{
            hasPrevPage = false
          }
        }catch(err){
          console.log("ERROR WHILE MESSAGE PAGINATION --> ", err)
          break
        }
      }
    }
    return messages;
  };

  sendMessage = async (msg) => {
    if (this.isActive) {
      await this.currentChannel?.sendMessage(msg);
    }
  };

  leaveChannelEvents = (channel) => {
    if (channel && channel.status === 'joined') {
      if (this.showTypingStarted)
        channel.removeListener('typingStarted', this.showTypingStarted);
      if (this.hideTypingStarted)
        channel.removeListener('typingEnded', this.hideTypingStarted);
      if (this.notifyMemberJoined)
        channel.removeListener('participantJoined', this.notifyMemberJoined);
      if (this.notifyMemberLeft)
        channel.removeListener('participantLeft', this.notifyMemberLeft);
    }
  };

  addUser = async (user) => {
    if (!this.currentChannel) {
      return;
    }
    if (this.isActive) {
      await this.currentChannel.add(getChatID(user));
      const currentUser = store.getState()?.user?.current;
      window?.gameClient?.logUserAction?.({
        eventName: 'INVITE_TO_CHANNEL',
        eventSpecificData: JSON.stringify({
          channel: this.currentChannel.friendlyName,
          invitee: user.eventUserId,
          inviter: currentUser?.eventUserId,
        }),
        beforeState: null,
        afterState: null,
      });
    }
  };

  leaveChannel = (channel) => {
    if (channel && channel.status === 'joined') {
      this.leaveChannelEvents(channel);
      const index = this.messageListeners.indexOf(channel.sid);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    }
    if (this.currentChannel.sid === channel.sid) {
      this.currentChannel = null;
    }
    delete this.channels[channel.sid];
    if (this.isActive) {
      channel.leave();
    }
  };

  removeChannel = (channel) => {
    const index = this.messageListeners.indexOf(channel.sid);
    channel.removeListener('messageAdded', this.messageListener);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
    if (this.currentChannel && this.currentChannel?.sid === channel.sid) {
      this.currentChannel = null;
    }
    delete this.channels[channel.sid];
  };

  deleteChannel = (channel) => {
    if (channel && channel.status === 'joined') {
      this.leaveChannelEvents(channel);
      channel.removeListener('messageAdded', this.messageListener);
      const index = this.messageListeners.indexOf(channel.sid);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    }
    if (this.currentChannel && this.currentChannel.sid === channel.sid) {
      this.currentChannel = null;
    }
    delete this.channels[channel.sid];
    if (this.isActive) {
      channel.delete();
    }
  };

  removeUser = async (channel, identity) => {
    if (this.isActive) {
      let member = await channel.getParticipantByIdentity(identity);
      channel.removeParticipant(member);
    }
  };

  updateFriendlyName = async (channel, newName) => {
    if (this.isActive) {
      await channel.updateFriendlyName(newName);
    }
  };

  updateUniqueName = async (channel, newName) => {
    if (this.isActive) {
      await channel.updateUniqueName(newName);
    }
  };

  /* CMS APIs */
  getPublicChannels = ({ eventId }) => {
    return this.requestCMSAPIWithAuth(`/events/${eventId}/channels`, 'GET');
  };

  getToken = (userId, durationSeconds = 1410) => {
    this.userId = userId;
    return this.requestTwilioLambdaAPI('/createChatToken', 'POST', {
      ttl: durationSeconds,
      eventName: config.event.name,
      id: userId,
    });
  };

  /* LOCAL API */
  getBlockList = (eventId, userId) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventId}/users/${userId}/blocked-channels`,
      'GET'
    );
  };

  updateBlockList = (eventId, userId, channels) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventId}/users/${userId}/blocked-channels`,
      'PUT',
      {
        channels,
      }
    );
  };

  /*LAMBDA APIS */
  addParticpantToGeneral = (participantIdentity, conversationSID) => {
    return this.requestTwilioLambdaAPI(
      '/addParticipant',
      'POST',
      JSON.stringify({
        participantIdentity: participantIdentity,
        conversationSID: conversationSID,
      })
    );
  };

  restartService = async () => {
    const twilioTokenResult = await this.getToken(this.userId, 86400);
    this.dispatch(initChannels(twilioTokenResult));
  };

  resetService = async () => {
    if (this.client) {
      this.messageListener = null;
      this.messageListeners = [];
      this.dispatch(setPanelName(null));
      this.dispatch(openPanel(false));
      this.currentChannel = null;
      this.channels = {};

      this.isActive = false;
      await this.client.shutdown();
      if (this.retryCount <= 3) {
        this.retryCount = this.retryCount + 1;
        this.retryInterval = this.retryInterval * 2;
        setTimeout(() => {
          this.restartService();
        }, this.retryInterval);
      }
    }
  };

  connectionErrorAndRestart = async (callback) => {
    if (this.client) {
      this.client.on('connectionStateChanged', (state) => {
        if (state === 'connected') {
          this.retryCount = 1;
          this.retryInterval = 200;
          this.isActive = true;
          if (callback) callback();
        }
      });

      this.client.on('connectionError', async (connectionError) => {
        console.error('Connection was interrupted:', connectionError.message);
        console.error('Is terminal:', connectionError.terminal);
        if (
          connectionError.errorCode === '20429' ||
          connectionError.errorCode === 20429
        ) {
          this.isActive = false;
          if (this.retryTimeoutRef) clearTimeout(this.retryTimeoutRef);
          this.retryTimeoutRef = setTimeout(() => {
            this.resetService();
          }, 1000);
        }
      });
    }
  };
}
const chatService = new ChatService();
export default chatService;
