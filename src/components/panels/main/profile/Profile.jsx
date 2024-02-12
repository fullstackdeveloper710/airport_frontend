import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  FontWeights,
  PrimaryButton,
  ActionButton,
  Dropdown,
  Stack,
  TextField,
  Spinner,
  SpinnerSize,
} from 'office-ui-fabric-react';
import { openPanel } from 'store/reducers/panel';
import { ReactComponent as ChevronDown } from "assets/images/icons/ChevronDown.svg";
import { ReactComponent as UserFocusIcon } from "assets/images/icons/UserFocus.svg";
import { ReactComponent as SignOutIcon } from "assets/images/icons/SignOut.svg";
import { logout } from 'store/reducers/user';
import { setUserStatus } from 'store/reducers/usersList';
import { UserAvatar, UserStatus } from 'components/common';
import { useShowUserRoles } from 'components/panels/game/profile/useShowUserRoles';
import { useDeviceMedia } from 'hooks/useDeviceMedia';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setEventPanelSectionStack } from 'store/reducers/panel';

const spinnerStyles = {
  circle: {
    color: 'var(--sr-color-primary)',
  },
  root: {
    margin: '10px 0',
  },
};

const contentTextStyles = {
  root: {
    width: '100%',
    background: 'var(--sr-color-transparent)',
  },
  field: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '15px',
    fontWeight: FontWeights.regular,
    color: 'var(--sr-color-white)',
    background: 'transparent !important',
  },
  fieldGroup: {
    background: 'var(--sr-color-transparent)',
  },
};
const dropdownStyles = {
  root: {
    marginBottom: '20px',
  },
  dropdown: {
    width: 300,
  },
  title: {
    background: 'var(--sr-color-transparent)',
    border: 'none',
  },
  label: {
    fontWeight: 300,
    color: 'var(--sr-color-label-maybe)',
  },
};
const visibilitydropdownStyles = {
  root: {
    color: 'var(--sr-color-secondary)',
    borderColor: 'var(--sr-color-transparent)',
  },
  title: {
    border: 0,
    color: 'var(--sr-color-secondary)',
    background: 'var(--sr-color-transparent)',
  },
  caretDown: {
    color: 'var(--sr-color-secondary)',
  },
};
const infoWrapperStyles = {
  root: {
    width: '100%',
    overflow: 'auto',
    transition: 'all 0.75s ease',
  },
};
const buttonStyles = {
  root: {
    marginBottom: '0px',
  },
  rootHovered: {
    background: 'var(--sr-color-background-profile-actionbuton-hovered)',
  },
  icon: {
    color: 'var(--sr-color-white)',
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
  iconPressed: {
    color: 'var(--sr-color-white)',
  },
  label: {
    fontWeight: 300,
    color: 'var(--sr-color-white)',
  },
};

const onRenderOption = (option) => (
  <div className="profile-dropdown-item">
    {option.key && <UserStatus status={option.key} width={13} />}
    <span>{option.text}</span>
  </div>
);

const onRenderTitle = (options) => {
  const option = options[0];
  if (!option) return null;
  return (
    <div className="profile-dropdown-item">
      {option.key && <UserStatus status={option.key} width={13} />}
      <span>{option.text}</span>
    </div>
  );
};
const useDynamicDropDownOptions = () => {
  const {
    components: {
      panels: {
        main: { profile: ls },
      },
    },
  } = useLabelsSchema();
  const statusOptions = useMemo(() => {
    return [
      { key: 'online', text: ls.statusOptions.onlineText },
      { key: 'away', text: ls.statusOptions.afkText },
      { key: 'dnd', text: ls.statusOptions.dndText },
      { key: 'offline', text: ls.statusOptions.invisibleText },
    ];
  }, [ls.statusOptions]);
  const visibilityOptions = useMemo(
    () => [
      { key: 'public', text: ls.visibilityOptions.publicText },
      { key: 'private', text: ls.visibilityOptions.privateText },
    ],
    [ls]
  );
  return { statusOptions, visibilityOptions };
};

function hashCode(string) {
  var hash = 0;
  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash = hash & hash;
  }
  return hash;
}

const InfoItem = (props) => {
  const {
    label,
    value,
    visibility,
    onDropDownChange,
  } = props;
  const { visibilityOptions } = useDynamicDropDownOptions();
  const handleDropDownChange = (event, newPair) => {
    if (onDropDownChange) onDropDownChange(newPair.key);
  };
  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  return (
    <div className="seph__profile_InfoItem">
      <div className="seph__profile_InfoItem_label">
        {label}
      </div>
      <div className="seph__profile_InfoItem_data">
        <TextField
          type="text"
          value={value}
          borderless
          styles={contentTextStyles}
          onKeyDown={stopPropagation}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          disabled
          readOnly
        />
      </div>
      {onDropDownChange ? (
        <div className="seph__profile_InfoItem_action">
          <Dropdown
            onChange={handleDropDownChange}
            styles={visibilitydropdownStyles}
            options={visibilityOptions}
            defaultSelectedKey={visibility}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export const Profile = () => {
  const {
    components: {
      panels: {
        main: { profile: ls },
      },
    },
  } = useLabelsSchema();

  const { panel } = useSelector(
    (state) => state
  );
  const { statusOptions } = useDynamicDropDownOptions();
  const hiddenFileInput = useRef(null);

  const user = useSelector((state) => state.user.current);
  const eventID = useSelector((state) => state.user.eventID);
  const userLoading = useSelector((state) => state.user.loading);
  const userStatuses = useSelector((state) => state.usersList.statuses);
  const agora = useSelector((state) => state.agora);

  const [status, setStatus] = useState(userStatuses[user.eventUserId] || 'online');
  const { game, event } = useSelector((state) => state);
  const [userForm, setUserForm] = useState({});
  const [showExpandedForm, toggleExpandForm] = useState(false);
  const [showExpandedFormInputs, toggleExpandFormInputs] = useState(false);
  const [visibilityHash, setVisibilityHash] = useState(hashCode(JSON.stringify(user.userFieldVisibility)))
  const [userFieldVisibility, setUserFieldVisibility] = useState(user.userFieldVisibility);
  const [isCustomizeDisable, setCustomizeDisable] = useState(false);

  const dispatch = useDispatch();

  const userFormStyles = useMemo(
    () => ({
      root: {
        ...infoWrapperStyles.root,
        minHeight: showExpandedForm ? 'auto' : '0px',
      },
    }),
    [showExpandedForm]
  );

  const originalVisibilityHash = hashCode(JSON.stringify(user.userFieldVisibility))

  useEffect(() => {
    (() => {
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        title: user.title
      });
    })();
  }, [user]);

  useEffect(() => {
    if (userStatuses[user.eventUserId]) {
      (() => {
        setStatus(userStatuses[user.eventUserId]);
      })();
    }
  }, [userStatuses[user.eventUserId]]);

  useEffect(() => {
    const disableCustomize = event.map?.filter(
      (mapData) => mapData.name === game?.currentRoom?.nextMapName
    );
    if (disableCustomize?.length > 0) {
      setCustomizeDisable(disableCustomize[0]['bAvatarCustomizationDisabled']);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      console.log(document.getElementById('profile-main'))
      document.getElementById('profile-main')?.classList.add('show')
    }, 300)
  }, [])

  const handleSectionChange = (section) => {
    document.getElementById('profile-main')?.classList.remove('show')
    setTimeout(() => {
      dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, section]))
    }, 300);
  }

  const exitSurreal = () => {
    try {
      agora?.ongoingStream?.current?.video?.close();
    } catch (err) {
      console.log('Agora Error');
    }
    try {
      agora.ongoingStream?.current?.audio?.close();
    } catch (err) {
      console.log('Agora Error');
    }

    window?.gameClient?.logUserAction?.({
      eventName: 'LOGOUT',
      eventSpecificData: JSON.stringify({
        method: 'Signout',
      }),
      beforeState: JSON.stringify({ mapName: game?.currentRoom?.nextMapName }),
      afterState: null,
    });

    dispatch(logout());
  };

  const onDropDownChange = (event, item) => {
    dispatch(setUserStatus(user.eventUserId, item.key));
    if (item.key === 'online') {
      window?.gameClient?.setOnlineUserStatusToCirrus?.(true);
    }
    if (item.key === 'offline') {
      window?.gameClient?.setOnlineUserStatusToCirrus?.(false);
    }
    setStatus(item.key);
  };

  const handleAvatarClick = () => {
    hiddenFileInput?.current?.click?.();
  };

  const handleVisibilityChange = (item, value) => {
    setUserFieldVisibility((visibility) => {
      let newVisibility = {
        ...visibility,
        [item]: value === 'public',
      }
      setVisibilityHash(hashCode(JSON.stringify(newVisibility)))
      return newVisibility
    });
  };

  const shouldSave = () => {
    if (originalVisibilityHash !== visibilityHash) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    if (originalVisibilityHash !== visibilityHash) {
      // dispatch(
      //   updateEventUser(eventID, user.id, {
      //     userFieldVisibility,
      //   })
      // );
    }
  };

  const handleShowAvatar = () => {
    dispatch(openPanel(false));
    window.gameClient?.joinLevelNew('AvatarEditor');
  };

  const userRoles = useShowUserRoles(user?.roles);
  const { isDesktop, isTablet } = useDeviceMedia();
  const coinSize = isDesktop ? 170 : isTablet ? 130 : 80;

  const onToggleExpandForm = () => {
    toggleExpandForm(prev => !prev);
    if (!showExpandedForm) {
      setTimeout(() => {
        toggleExpandFormInputs(true);
      }, 350);
      return;
    }
    toggleExpandFormInputs(false);
  };

  return (
    <div className="profile-Panel seph__profile" id='profile-main'>
      <div className='seph__profile_top'>
        <div className="profile-Avatar-Wrapper">
          <UserAvatar
            user={user}
            coinSize={coinSize}
            onClick={handleAvatarClick}
          />
        </div>
      </div>
      <Stack styles={userFormStyles}>
        <InfoItem
          label={ls.nameLabel}
          value={`${userForm.firstName}${userForm.lastName ? " " : ""}${userForm.lastName}`}
          onDropDownChange={(value) =>
            handleVisibilityChange('firstName', value)
          }
          visibility={userFieldVisibility.firstName ? 'public' : 'private'}
        />
        {showExpandedForm && showExpandedFormInputs && (
          <>
            <InfoItem
              label={ls.emailLabel}
              value={userForm.email}
              onDropDownChange={(value) => handleVisibilityChange('email', value)}
              visibility={userFieldVisibility.email ? 'public' : 'private'}
            />
            {user?.roles?.includes('ROLE_PRESENTER') && (
              <InfoItem label={ls.roleLabel} value={userRoles} />
            )}
            <InfoItem
              label={ls.titleLabel}
              value={userForm.title}
              onDropDownChange={(value) =>
                handleVisibilityChange('title', value)
              }
              visibility={userFieldVisibility.title ? 'public' : 'private'}
            />
            <InfoItem
              label={ls.organizationLabelShort}
              value={userForm.organization}
              onDropDownChange={(value) =>
                handleVisibilityChange('organization', value)
              }
              visibility={
                userFieldVisibility.organization ? 'public' : 'private'
              }
            />
          </>
        )}
      </Stack>
      <div
        onClick={onToggleExpandForm}
        className={`profile-form-toggler ms-Flex ms-Flex-justify-content-center ms-Flex-align-items-center${showExpandedForm ? " toggler-state-epxanded" : ""}`}
      >
        <span className="button-text">
          {showExpandedForm ? ls.collapseInformation : ls.editMoreInfoSpoiler}{' '}
        </span>
        <ChevronDown />
      </div>
      <div className="ms-Flex ms-Flex-justify-content-between ms-Flex-align-items-center seph__profile_InfoItem user-status">
        <span className='seph__profile_InfoItem_label'>{ls.statusLabel}</span>
        <div className='seph__profile_InfoItem_data'>
          <Dropdown
            placeholder={ls.setOnlineStatusLabel}
            ariaLabel={ls.setOnlineStatusLabel}
            styles={dropdownStyles}
            onChange={onDropDownChange}
            options={statusOptions}
            onRenderTitle={onRenderTitle}
            onRenderOption={onRenderOption}
            defaultSelectedKey={status}
          />
        </div>
        <div className='seph__profile_InfoItem_action'>
          {shouldSave() ? (
            !userLoading ? (
              <PrimaryButton text={ls.saveText} onClick={handleSave} />
            ) : (
              <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
            )
          ) : (
            <div></div>
          )}
        </div>
      </div>
      <div className="profile-Actions">
        <ActionButton
          className={
            isCustomizeDisable || game.avatarCustomization
              ? 'cursor-not-allow disableField'
              : ''
          }
          disabled={isCustomizeDisable || game.avatarCustomization}
          onClick={handleShowAvatar}
          styles={buttonStyles}
        >
          <UserFocusIcon />
          <span>{ls.customizeCharacterText}</span>
        </ActionButton>
        <ActionButton
          onClick={exitSurreal}
          styles={buttonStyles}
        >
          <SignOutIcon />
          <span>{ls.logout}</span>
        </ActionButton>
        <div
          className={`profile-form-toggler ms-Flex ms-Flex-justify-content-center ms-Flex-align-items-center${showExpandedForm ? " toggler-state-epxanded" : ""}`}
        >
          <span className="button-text">Settings</span>
        </div>
        <div className="settings">
          <div className="settingItem" onClick={() => handleSectionChange('camera')}>Camera and Microphone</div>
          <div className="settingItem" onClick={() => handleSectionChange('sound')}>Sound</div>
          <div className="settingItem" onClick={() => handleSectionChange('stream')}>Stream</div>
          <div className="settingItem" onClick={() => handleSectionChange('lang')}>Language</div>
        </div>
      </div>
    </div>
  );
};
