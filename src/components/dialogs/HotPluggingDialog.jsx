import React, { useEffect, useRef, useState } from 'react';
import { IconButton, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { useSelector } from 'react-redux';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
const buttonStyles = {
  root: {
    background: 'var(--sr-color-transparent)',
  },
  rootHovered: {
    background: 'var(--sr-color-transparent)',
  },
  rootPressed: {
    background: 'var(--sr-color-transparent)',
  },
  icon: {
    fontSize: 20,
  },
  iconHovered: {
    color: 'var(--sr-color-primary)',
  },
};

const closeButtonStyles = {
  ...buttonStyles,
  icon: {
    fontSize: 12,
  },
};

const messageBarStyles = {
  root: {
    width: 'auto',
    pointerEvents: 'all',
    background: 'var(--sr-color-transparent)',
  },
  icon: {
    color: 'var(--sr-color-white)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    padding: '4px 0',
  },
};

const HotPluggingItem = ({ onDismiss, device }) => {
  const {
    components: {
      dialogs: { hotPluginDialog: ls },
    },
  } = useLabelsSchema();
  const timeRef = useRef();
  const clearingTimeout = () => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
  };

  useEffect(() => {
    timeRef.current = setTimeout(() => {
      onDismiss(device.id);
    }, 3000);
    return () => {
      clearingTimeout();
    };
  }, []);

  return (
    <div className="roundPanel ms-mb-1">
      <MessageBar
        messageBarType={MessageBarType.info}
        isMultiline={false}
        styles={messageBarStyles}
        actions={
          <>
            <IconButton
              iconProps={{ iconName: 'Clear' }}
              onClick={() => onDismiss(device.id)}
              styles={closeButtonStyles}
            />
          </>
        }
      >
        {ls.label(device.label)}
      </MessageBar>
    </div>
  );
};

export const HotPluggingDialog = () => {
  const { changingDevice } = useSelector((state) => state.agora);

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (changingDevice.id) {
      if (!devices.some((v) => v.id === changingDevice.id)) {
        setDevices((p) => [...p, { ...changingDevice }]);
      }
    }
  }, [changingDevice.id]);

  const removeDevice = (id) => {
    setDevices((p) => {
      return p.filter((v) => v.id !== id);
    });
  };

  return (
    <div className="hotpluggingWrapper">
      {devices.map((device) => {
        return (
          <HotPluggingItem
            key={device.id}
            device={device}
            onDismiss={removeDevice}
          />
        );
      })}
    </div>
  );
};
