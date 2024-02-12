import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon, ActionButton } from 'office-ui-fabric-react';
import vCardJS from 'vcards-js';

import {
  setLoading,
  setInviteLoading,
  toggleNotification,
  leaveChannel,
  deleteChannel
} from 'store/reducers/channel';
import { ConfirmDialog } from 'components/dialogs';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { openExtraPanel } from 'store/reducers/panel';
import { UserAvatar } from 'components/common';
import { ChatForm } from './ChatForm';
import EventUserService from 'services/eventUserService';
import config from 'config';
import { setShowDialog } from 'store/reducers/chat';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setEventPanelSectionStack } from 'store/reducers/panel';

const closeButtonStyles = {
  root: {
    marginLeft: '5px',
    position: 'relative',
    top: '3px',
    color: 'var(--sr-color-white)',
  },
  rootHovered: {
    opacity: '70%',
    color: 'var(--sr-color-primary)',
  },
  rootPressed: {
    opacity: '70%',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: 16,
  },
};

const actionButtonStyles = {
  root: {
    marginTop: '5px',
    marginLeft: '-9px',
  },
  rootHovered: {
    opacity: '80%',
  },
  rootPressed: {
    opacity: '80%',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: 22,
  },
};

export const PrivateChat = () => {
  const {
    components: {
      panels: {
        extra: {
          chat: {
            privateChat: { privateChat: ls },
          },
        },
      },
    },
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);
  const user = useSelector((state) => state.user);
  const usersList = useSelector((state) => state.usersList);
  const chat = useSelector((state) => state.chat)
  const panel = useSelector((state) => state.panel)
  const [disabledNotification, setDisabledNotification] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (channel?.current?.sid) {
      setDisabledNotification(channel.blockList.includes(channel.current.sid));
    }
  }, [channel.blockList]);

  const other =
    channel.current && channel.current.friendlyName
      ? channel.current.friendlyName
        .replace(CHAT_DM_CHANNEL, '')
        .replace(user.current.id, '')
        .replace('/', '')
      : '';

  const privateChatPartner =
    other && usersList.list.filter((item) => item.id === other).length
      ? usersList.list.find((item) => item.id === other)
      : null;
  
  const closeChat = () => {
    dispatch(setLoading(false));
    dispatch(setInviteLoading(false));
    dispatch(openExtraPanel(false));
  };
  const closeDialog = () => {
    dispatch(setShowDialog(null));
  }

  const toggleChannelNotification = (enable) => {
    dispatch(toggleNotification(channel.current.sid, enable));
  };

  const leaveCurrentChannel = () => {
    dispatch(leaveChannel(channel.current));
    closeDialog();
  };

  const downloadContactCard = async () => {
    try {
      const eventUserService = new EventUserService();
      const eventId = user.eventID;
      if (privateChatPartner) {
        let userData = await eventUserService.getEventUser({
          eventId,
          userId: privateChatPartner.id,
        });
        if (userData && userData.user) {
          userData = {
            ...userData.user,
            roles: userData.roles,
            userFieldVisibility: userData.userFieldVisibility || {},
          };
        }
        if (userData) {
          const vCard = vCardJS();
          //set properties
          let firstName = ls.hiddenText,
            lastName = ls.hiddenText;
          if (userData.userFieldVisibility.firstName) {
            vCard.firstName = userData.firstName;
            firstName = userData.firstName;
          }
          if (userData.userFieldVisibility.lastName) {
            vCard.lastName = userData.lastName;
            lastName = userData.lastName;
          }
          if (userData.userFieldVisibility.organization) {
            vCard.organization = userData.organization;
          }
          if (userData.userFieldVisibility.email) {
            vCard.email = userData.email;
          }
          if (userData.photo && userData.userFieldVisibility.photo) {
            vCard.photo.attachFromUrl(userData.photo.url, 'PNG');
          }
          if (userData.userFieldVisibility.phoneNumber) {
            vCard.cellPhone = userData.phoneNumber;
          }
          if (userData.userFieldVisibility.title) {
            vCard.title = userData.title;
          }
          vCard.homeAddress.label = ls.homeAddressText;
          if (
            userData.userFieldVisibility.addressLine1 &&
            userData.userFieldVisibility.addressLine2
          ) {
            vCard.homeAddress.street = `${userData.addressLine1} ${userData.addressLine2}`;
          }
          if (userData.userFieldVisibility.city) {
            vCard.homeAddress.city = userData.city;
          }
          if (userData.userFieldVisibility.state) {
            vCard.homeAddress.stateProvince = userData.state;
          }
          if (userData.userFieldVisibility.zip) {
            vCard.homeAddress.postalCode = userData.zip;
          }
          if (userData.userFieldVisibility.country) {
            vCard.homeAddress.countryRegion = userData.country;
          }
          //save to file
          const FileSaver = require('file-saver');
          const blob = new Blob([vCard.getFormattedString()], {
            type: 'text/vcard;charset=utf-8',
          });
          FileSaver.saveAs(blob, `${firstName}-${lastName}.vcf`);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleMovingBack = () => {
    if (panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === "private") {
      let tempStack = [...panel.eventPanelSectionStack]
      const currentPage = tempStack.pop()
      document.getElementById('chat-' + currentPage)?.classList?.remove('show')
      setTimeout(() => {
        dispatch(setEventPanelSectionStack(tempStack))
      }, 300);
    }
  }
  // if (privateChatPartner == null) {
  //   handleMovingBack()
  // }

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('chat-private')?.classList?.add('show')
    }, 120)
  }, [])

  return (
    <div className="privateChat" id="chat-private">
      {privateChatPartner ?
        <ChatForm
          onTriggerParticipant={downloadContactCard}
          privateChatPartner={privateChatPartner}
        /> :
        <div className="waitingWrapper">Loading...</div>
      }
      {privateChatPartner && (
        <ConfirmDialog
          open={chat.showDialog === 'confirm-leave'}
          text={ls.confirmLeaveDialogText(
            privateChatPartner?.firstName,
            privateChatPartner?.lastName
          )}
          onDismiss={closeDialog}
          onConfirm={() => leaveCurrentChannel()}
        />
      )}
    </div>
  );
};
