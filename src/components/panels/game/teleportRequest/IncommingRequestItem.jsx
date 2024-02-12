import React from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { IconButton } from '@fluentui/react';
import { Text, DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

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
export const IncommingRequestItem = (props) => {
  const {
    calloutProps,
    hostStyles,
    buttonStyles,
    iconWrapperStyle,
    onAccept,
    onDecline,
    request,
    normalTextStyles,
  } = props;
  const {
    components: {
      panels: {
        game: {
          teleportRequest: { incomingRequestItem: ls },
        },
      },
    },
  } = useLabelsSchema();

  const cancelRequest = () => {
    onDecline(request);
  };

  return (
    <div className="requestList roundPanel">
      <div className="close-button">
        <TooltipHost
          content={ls.closeText}
          calloutProps={calloutProps}
          tooltipProps={hostStyles}
        >
          <IconButton
            toggle
            iconProps={{
              iconName: 'ErrorBadge',
            }}
            onClick={cancelRequest}
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
              iconName: request.declined ? 'InfoSolid' : 'RingerSolid',
            }}
            allowDisabledFocus
            styles={iconbuttonStyles}
          />
        </div>
        <div>
          <div className="ms-Flex ms-Flex-justify-content-start">
            <p className="headerText">{ls.teleportRequestText}</p>
          </div>
          <div
            className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center"
            key={`${request.sender} - ${request.recipient}`}
          >
            <div>
              <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1 ms-mt-1">
                <Text styles={normalTextStyles}>
                  {request.is_request
                    ? ls.wouldYouLikeToJoinRequestMessage(request.sender_name)
                    : ls.wantsToJoinRequestMessage(request.sender_name)}
                </Text>
                <Text styles={normalTextStyles}>
                  {request.is_request
                    ? ls.acceptingGoingToRequestMessage
                    : ls.acceptingReceivingTeleporterMessage(
                        request.sender_name
                      )}
                </Text>
              </div>
              <div className="ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-start ms-mt-1">
                <PrimaryButton
                  text={request.is_request ? ls.letsGoText : ls.acceptText}
                  onClick={() => onAccept(request)}
                  className="ms-mr-1"
                />
                <DefaultButton
                  text={ls.denyText}
                  onClick={() => onDecline(request)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
