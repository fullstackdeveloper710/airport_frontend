import React from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { IconButton } from '@fluentui/react';
import { Text, DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const buttonStyles = {
  root: {
    width: '3rem',
    height: '3rem',
    color: 'var(--sr-color-secondary)',
    background: 'var(--sr-color-transparent)',
  },
  icon: {
    fontSize: 20,
  },
  iconHovered: {
    color: 'var(--sr-color-primary)',
  },
  iconDisabled: {
    color: 'var(--sr-color-disabled)',
  },
};

const normalTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '14px',
    fontWeight: 300,
    color: 'var(--sr-color-white)',
    marginBottom: '5px',
  },
};

const calloutProps = { gapSpace: 0 };

const hostStyles = {
  styles: {
    content: { color: 'var(--sr-color-primary-text)' },
  },
  calloutProps: {
    styles: {
      beak: { background: 'var(--sr-color-transparent)' },
      beakCurtain: { background: 'var(--sr-color-background-beakCurtain)' },
      calloutMain: { background: 'var(--sr-color-background-calloutMain)' },
    },
  },
};

const iconWrapperStyle = {
  width: 60,
  display: 'flex',
};

const iconbuttonStyles = {
  root: {
    width: '2.3rem',
    height: '2.3rem',
    background: 'var(--sr-color-black)',
    borderRadius: '50%',
    margin: '0 auto',
  },
  icon: {
    fontSize: 20,
  },
};

export const MeetingInvitationDialog = ({
  onDismiss,
  onDecline,
  onAccept,
  sender,
}) => {
  const {
    components: {
      dialogs: { meetingInvitationDialog: ls },
    },
  } = useLabelsSchema();
  return (
    <div className="requestsBigPanel">
      <div className="ms-Flex ms-Flex-column">
        <div className="requestList roundPanel">
          <div className="close-button">
            <TooltipHost
              content={ls.tooltipClose}
              calloutProps={calloutProps}
              tooltipProps={hostStyles}
            >
              <IconButton
                toggle
                iconProps={{
                  iconName: 'ErrorBadge',
                }}
                onClick={onDismiss}
                allowDisabledFocus
                styles={buttonStyles}
              />
            </TooltipHost>
          </div>
          <div className="ms-Flex ms-Flex-row">
            <div style={iconWrapperStyle}>
              <IconButton
                toggle
                iconProps={{
                  iconName: 'InfoSolid',
                }}
                allowDisabledFocus
                styles={iconbuttonStyles}
              />
            </div>
            <div>
              <div className="ms-Flex ms-Flex-justify-content-start">
                <p className="headerText">{ls.title}</p>
              </div>
              <div className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center">
                <div>
                  <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1 ms-mt-1">
                    <Text styles={normalTextStyles}>{ls.content(sender)}</Text>
                  </div>
                  <div className="ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-start ms-mt-1">
                    <PrimaryButton
                      text={ls.primaryButtonText}
                      onClick={onAccept}
                      className="ms-mr-1"
                    />
                    <DefaultButton
                      text={ls.defaultButtonText}
                      onClick={onDecline}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
