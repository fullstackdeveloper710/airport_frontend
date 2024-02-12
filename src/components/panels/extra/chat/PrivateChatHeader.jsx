import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ActionButton } from 'office-ui-fabric-react';

import {
    setLoading,
    setInviteLoading,
    toggleNotification,
    leaveChannel,
    deleteChannel
} from 'store/reducers/channel';
import { ConfirmDialog } from 'components/dialogs';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { openExtraPanel, setEventPanelSectionStack } from 'store/reducers/panel';
import { UserAvatar } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setShowDialog } from 'store/reducers/chat';

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

export const PrivateChatHeader = () => {
    const {
        components: {
            panels: {
                extra: {
                    chat: {
                        privateChat: { privateChat: privateLs },
                    },
                },
            },
        },
    } = useLabelsSchema();


    const {
        components: {
            panels: {
                extra: {
                    chat: {
                        channelChat: { channelChat: ls },
                    },
                },
            },
        }
    } = useLabelsSchema();

    const channel = useSelector((state) => state.channel);
    const currentUser = useSelector((state) => state.user.current);
    const extraPanelData = useSelector((state) => state.panel.extraPanelData);
    const usersList = useSelector((state) => state.usersList);
    const chat = useSelector((state) => state.chat)
    const panel = useSelector((state) => state.panel)
    const [showHideMore, setShowHideMore] = useState(false);
    const [dialog, setDialog] = useState(null);
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
                .replace(currentUser.id, '')
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

    const enableParticipant = () => {
        dispatch(setShowDialog('chatUser'));
    };
    const handleMovingBack = () => {
        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('chat-' + currentPage)?.classList.remove('show')
        document.getElementById('chatHeader')?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
            document.getElementById('chatHeader')?.classList.add('show')
        }, 120);
    }

    useEffect(() => {
        const header = document.getElementById('chatHeader')
        if (header) {
            header?.classList.add('show')
        }
    }, [])

    return (
        <>
            {
                panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === "list" ?
                    <div id='chatHeader' className='show'><h4 className="privateChatHeader-Title">Chats</h4></div> :
                    panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'private' ?
                        <>
                            {!channel.loading && privateChatPartner && (
                                <div
                                    id="chatHeader"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '60%',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <UserAvatar
                                            titleEllipsisWidth={150}
                                            user={privateChatPartner}
                                            size={13}
                                            text={`${privateChatPartner.firstName} ${privateChatPartner.lastName}`}
                                            secondaryText={privateChatPartner.organization}
                                            tertiaryText={privateChatPartner.title}
                                        />
                                    </div>
                                    {channel.current && channel.current.status === 'joined' && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '38%' }}>
                                            <span style={{ marginBottom: '5px' }}>
                                                <ActionButton
                                                    className='backButton'
                                                    iconProps={{ iconName: 'Back' }}
                                                    onClick={() => handleMovingBack()}
                                                    color="white"
                                                    title={privateLs.leaveMeetingText}
                                                    styles={actionButtonStyles}
                                                />
                                            </span>
                                            <span style={{ marginBottom: '5px' }}>
                                                <ActionButton
                                                    iconProps={
                                                        disabledNotification
                                                            ? { iconName: 'RingerOff' }
                                                            : { iconName: 'Ringer' }
                                                    }
                                                    onClick={() => {
                                                        dispatch(setShowDialog('confirmNotificatoin'))
                                                    }}
                                                    color="white"
                                                    title={
                                                        disabledNotification
                                                            ? privateLs.enableNotification
                                                            : privateLs.disabledNotification
                                                    }
                                                    styles={actionButtonStyles}
                                                />
                                                <ConfirmDialog
                                                    text={
                                                        disabledNotification
                                                            ? privateLs.enableNotificationMessage
                                                            : privateLs.disableNotificationMessage
                                                    }
                                                    open={chat.showDialog === 'confirmNotificatoin'}
                                                    onDismiss={() => {
                                                        dispatch(setShowDialog(null))
                                                    }}
                                                    onConfirm={() => {
                                                        toggleChannelNotification(disabledNotification);
                                                        dispatch(setShowDialog(null));
                                                    }}
                                                />
                                            </span>
                                            <span style={{ marginBottom: '5px' }}>
                                                <ActionButton
                                                    iconProps={{ iconName: 'Leave' }}
                                                    onClick={() => {
                                                        dispatch(setShowDialog('confirm-leave'))
                                                    }}
                                                    color="white"
                                                    title={privateLs.leaveMeetingText}
                                                    styles={actionButtonStyles}
                                                />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </> :
                        panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'channel' ?
                            <>
                                {!channel.loading && extraPanelData && (
                                    <div
                                        id="chatHeader"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '60%',
                                            }}
                                        >
                                            <h4 className="privateChatHeader-Title">{`${extraPanelData.friendlyName}`}</h4>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '40%',
                                                justifyContent: 'end'
                                            }}
                                        >
                                            {channel.current && channel.current.status === 'joined' && (
                                                <div style={{ display: 'flex', width: '95%', alignItems: 'center', justifyContent: 'space-around' }}>
                                                    <span style={{ marginBottom: '5px' }}>
                                                        <ActionButton
                                                            iconProps={{ iconName: 'Back' }}
                                                            className='backButton'
                                                            onClick={() => handleMovingBack()}
                                                            color="white"
                                                            title={privateLs.leaveMeetingText}
                                                            styles={actionButtonStyles}
                                                        />
                                                    </span>
                                                    <span>
                                                        <ActionButton
                                                            style={{ marginBottom: '3px' }}
                                                            iconProps={{ iconName: 'People' }}
                                                            onClick={enableParticipant}
                                                            color="white"
                                                            title={ls.participantsText}
                                                            styles={actionButtonStyles}
                                                        ></ActionButton>
                                                    </span>
                                                    <span className="more-action">
                                                        <ActionButton
                                                            style={{ marginBottom: '5px' }}
                                                            iconProps={{ iconName: 'MoreVertical' }}
                                                            onClick={() => setShowHideMore(!showHideMore)}
                                                            color="white"
                                                            title={ls.moreText}
                                                            styles={actionButtonStyles}
                                                        />
                                                        {showHideMore ? (
                                                            <div className="more-content">
                                                                <ul>
                                                                    <li>
                                                                        <ActionButton
                                                                            iconProps={
                                                                                disabledNotification
                                                                                    ? { iconName: 'RingerOff' }
                                                                                    : { iconName: 'Ringer' }
                                                                            }
                                                                            onClick={() => setDialog('confirmNotificatoin')}
                                                                            color="white"
                                                                            title={
                                                                                disabledNotification
                                                                                    ? ls.enableNotification
                                                                                    : ls.disabledNotification
                                                                            }
                                                                            text={
                                                                                disabledNotification
                                                                                    ? ls.enableNotification
                                                                                    : ls.disabledNotification
                                                                            }
                                                                            styles={actionButtonStyles}
                                                                        />
                                                                        <ConfirmDialog
                                                                            text={
                                                                                disabledNotification
                                                                                    ? ls.enableNotificationMessage
                                                                                    : ls.disableNotificationMessage
                                                                            }
                                                                            open={dialog === 'confirmNotificatoin'}
                                                                            onDismiss={() => setDialog(null)}
                                                                            onConfirm={() => {
                                                                                toggleChannelNotification(
                                                                                    disabledNotification
                                                                                );
                                                                                setDialog(null);
                                                                                setShowHideMore(false);
                                                                            }}
                                                                        />
                                                                    </li>
                                                                    {channel.current.isPrivate && (
                                                                        <>
                                                                            <li>
                                                                                {(channel.userRole === 'service_admin' ||
                                                                                    channel.userRole === 'channel_admin') && (
                                                                                        <span className="ms-mr-2">
                                                                                            <ActionButton
                                                                                                iconProps={{ iconName: 'Rename' }}
                                                                                                onClick={() => {
                                                                                                    dispatch(setShowDialog('rename'))
                                                                                                }}
                                                                                                color="white"
                                                                                                title={ls.renameTitle}
                                                                                                text={ls.renameText}
                                                                                                styles={actionButtonStyles}
                                                                                            />
                                                                                        </span>
                                                                                    )}
                                                                            </li>
                                                                            <li>
                                                                                {(channel.userRole === 'service_admin' ||
                                                                                    channel.userRole === 'channel_admin') && (
                                                                                        <span className="ms-mr-2">
                                                                                            <ActionButton
                                                                                                iconProps={{ iconName: 'AddFriend' }}
                                                                                                onClick={() => {
                                                                                                    dispatch(setShowDialog('addUser'))
                                                                                                }}
                                                                                                color="white"
                                                                                                title={ls.addUserText}
                                                                                                text={ls.addUserText}
                                                                                                styles={actionButtonStyles}
                                                                                            />
                                                                                        </span>
                                                                                    )}
                                                                            </li>
                                                                            <li>
                                                                                {channel.userRole === 'service_admin' ||
                                                                                    channel.userRole === 'channel_admin' ? (
                                                                                    <span className="ms-mr-2">
                                                                                        <ActionButton
                                                                                            iconProps={{ iconName: 'Leave' }}
                                                                                            onClick={() => {
                                                                                                dispatch(setShowDialog('confirm-delete'))
                                                                                            }}
                                                                                            color="white"
                                                                                            title={ls.leaveAndDeleteText}
                                                                                            text={ls.leaveAndDeleteText}
                                                                                            styles={actionButtonStyles}
                                                                                        />
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="ms-mr-2">
                                                                                        <ActionButton
                                                                                            iconProps={{ iconName: 'Leave' }}
                                                                                            onClick={() =>
                                                                                                dispatch(setShowDialog('confirm-leave'))
                                                                                            }
                                                                                            color="white"
                                                                                            title={ls.leaveChannelText}
                                                                                            text={ls.leaveChannelText}
                                                                                            styles={actionButtonStyles}
                                                                                        />
                                                                                    </span>
                                                                                )}
                                                                            </li>
                                                                        </>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        ) : null}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </> : <div id='chatHeader'></div>
            }
        </>
    );
};
