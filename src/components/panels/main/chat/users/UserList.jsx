import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconButton,
  ActionButton,
  Spinner,
  SpinnerSize,
} from 'office-ui-fabric-react';
import { v4 as uuidv4 } from 'uuid';
import { openExtraPanel } from 'store/reducers/panel';
import { showInviteChatRoomOrOpenRoom } from 'store/reducers/channel';
import { PublicChatDialog } from 'components/dialogs';
import { UserItem } from './UserItem';
import { publishTeleportRequestPoll } from 'store/reducers/teleportRequestPoll';
import { setMessage } from 'store/reducers/message';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const sorted = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

const addButtonStyles = {
  root: {
    width: '1rem',
    height: '1rem',
    marginRight: '10px',
    marginTop: '5px',
  },
  rootHovered: {
    opacity: '80%',
  },
  rootPressed: {
    opacity: '80%',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: 18,
  },
};

const spinnerStyles = {
  circle: {
    color: 'var(--sr-color-primary)',
  },
  root: {
    margin: '10px 0',
  },
};

const itemsWrap = {
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  justifyItems: 'center',
  alignItems: 'center'
};

export const UserList = (props) => {
  const { openPrivateChat } = props;
  const {
    components: {
      panels: {
        main: {
          chat: {
            users: { userList: ls },
          },
        },
      },
    },
  } = useLabelsSchema();
  const [showAddUser, setShowAddUser] = useState(false);
  const [usersShow, setUsersShow] = useState([])
  const [showPersonalList, setShowPersonalList] = useState(true);
  const currentUser = useSelector((state) => state.user.current);

  const dispatch = useDispatch();
  const { chat, usersList, channel, user, teleportRequestPoll } = useSelector(
    (state) => state
  );
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);

  useEffect(() => {
    let users = []
    let channelListItems = [];
    channel.list.forEach((channelListItem) => {
      if (channelListItem.friendlyName.indexOf(CHAT_DM_CHANNEL) === 0) {
        channelListItems.push(channelListItem)
      }
    })
    console.log((channelListItems))
    if (channelListItems.length !== 0) {
      users = chat.connectedUsers
        .filter((item) => item && item.id)
        .sort((a, b) => sorted(a.firstName, b.firstName))

      users.forEach(function (item, i) {
        const isOnline = onlineUsers.includes(item.eventUserId)
        if (isOnline) {
          users.splice(i, 1);
          users.unshift(item);
        }
      })

      users.forEach(function (item, i) {
        const isBold = channel.list.find((chnl) => chnl.sid === item.sid)?.isBold
        if (isBold) {
          users.splice(i, 1);
          users.unshift(item);
        }
        if (item.id === currentUser.id) {
          users.splice(i, 1);
          users.unshift(item);
        }
      });
    }
    // console.log("CHAT USERS LIST", users)
    setUsersShow(users)
  }, [chat.connectedUsers, channel.list, onlineUsers])

  const teleportRoom = (otherUser) => {
    let meeting_name = '';
    if (window.gameClient) {
      const gameCurrentRoomType = window.gameClient.getCurrentRoomType();
      if (gameCurrentRoomType?.toLowerCase()?.includes('meeting')) {
        return dispatch(
          setMessage({ message: ls.unableToTeleportWhileInMeetingRoom })
        );
      }
      if (
        gameCurrentRoomType.includes('none') ||
        gameCurrentRoomType.includes('None')
      ) {
        return dispatch(
          setMessage({ message: ls.unableToCreateTeleportWhileInPrivateRoom })
        );
      }
    }
    if (
      window.agoraClientPrimary &&
      window.agoraClientPrimary.meetingWindowActive
    ) {
      return dispatch(
        setMessage({ message: ls.unableToTeleportWhileInMeeting })
      );
    }

    dispatch(
      publishTeleportRequestPoll({
        sender: user.current.eventUserId,
        userID: otherUser.id,
        meeting_name,
        is_request: false,
        recipient: otherUser.eventUserId,
        sender_name: user.current.firstName + ' ' + user.current.lastName,
        recipient_name: otherUser.firstName + ' ' + otherUser.lastName,
        id: uuidv4(),
      })
    );
  };

  const requestToTeleport = (otherUser) => {
    let meeting_name = '';
    if (window.gameClient) {
      const gameCurrentRoomType = window.gameClient.getCurrentRoomType();
      if (
        gameCurrentRoomType.includes('meeting') ||
        gameCurrentRoomType.includes('Meeting')
      ) {
        return dispatch(
          setMessage({
            message: ls.unableToCreateTeleportWhileInMeeting,
          })
        );
      }
      if (
        gameCurrentRoomType.includes('none') ||
        gameCurrentRoomType.includes('None')
      ) {
        return dispatch(
          setMessage({
            message: ls.unableToCreateTeleportWhileInPrivateRoom,
          })
        );
      }
    }
    if (
      window.agoraClientPrimary &&
      window.agoraClientPrimary.meetingWindowActive
    ) {
      return dispatch(
        setMessage({
          message: ls.unableToTeleportWhileInMeeting,
        })
      );
    }

    if (teleportRequestPoll.is_in_stage) {
      return dispatch(
        setMessage({
          message: ls.unableToCreateTeleportWhileInStage,
        })
      );
    }

    dispatch(
      publishTeleportRequestPoll({
        sender: user.current.eventUserId,
        userID: user.current.id,
        meeting_name,
        is_request: true,
        recipient: otherUser.eventUserId,
        sender_name: user.current.firstName + ' ' + user.current.lastName,
        recipient_name: otherUser.firstName + ' ' + otherUser.lastName,
        id: uuidv4(),
      })
    );
  };

  const openAddUser = () => {
    setShowAddUser(true);
    dispatch(openExtraPanel(false));
  };

  const closeAddUser = () => {
    setShowAddUser(false);
  };

  const showInviteChatForm = (data) => {
    dispatch(showInviteChatRoomOrOpenRoom(data, user.current));
  };

  const toggleShowPrItems = () => setShowPersonalList(!showPersonalList);
  const isUserShow = showPersonalList && usersShow && usersShow.length > 0;

  return (
    <div className="list">
      <div style={itemsWrap}>
        <span style={{ marginBottom: '5px' }} onClick={toggleShowPrItems}>
          <IconButton
            iconProps={
              showPersonalList
                ? { iconName: 'CaretSolidDown' }
                : { iconName: 'CaretRightSolid8' }
            }
            title={ls.iconButton.title}
            ariaLabel={ls.iconButton.title}
            color="white"
          />
          <span className='title'>{ls.title}</span>
        </span>
        <span>
          {(!usersList.loading || usersList.list.length) &&
            !channel.listLoading ? (
            <ActionButton
              iconProps={{ iconName: 'Add' }}
              onClick={openAddUser}
              color="white"
              styles={addButtonStyles}
            />
          ) : (
            <></>
          )}
        </span>
      </div>
      <div className="itemList">
        {(!usersList.loading || usersList.list.length) && !channel.listLoading ? (
          <ul className={`${isUserShow ? "show" : ""}`} style={{ listStyle: 'none', marginTop: '5px', marginBottom: '0' }}>
            {
              usersShow.map((user) => (
                <UserItem
                  user={user}
                  openChat={openPrivateChat}
                  teleportRoom={teleportRoom}
                  requestToTeleport={requestToTeleport}
                  key={user.id}
                  isBold={
                    channel.list.find((item) => item.sid === user.sid)?.isBold
                  }
                />
              ))}
          </ul>
        ) : (
          <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
        )}
      </div>
      <PublicChatDialog
        showInviteChatForm={showInviteChatForm}
        open={showAddUser}
        onDismiss={closeAddUser}
        usersList={usersList.list}
      />
    </div>
  );
};
