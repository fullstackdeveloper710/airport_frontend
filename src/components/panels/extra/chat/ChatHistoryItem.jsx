import React from 'react';
import moment from 'moment';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const ChatHistoryItem = (props) => {
  const { isYou, message, name, date, showUsersName } = props;
  const {
    components: {
      panels: {
        extra: { chat: { chatHistoryItem: ls } },
      },
    },
  } = useLabelsSchema();
  const splitedMessage = message.split('\n');

  return (
    <div className="chatHistoryItem">
      {!showUsersName ?
        <div
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '50%',
            overflow: 'hidden',
          }}
        >
          {isYou ? <>{ls.you}</> : <>{name}</>}
        </div>
        : <></>}
      <div className="chatDate">
        {moment(new Date(date)).format('MM/DD h:mm A')}
      </div>
      {splitedMessage.map((msg, index) => (
        <div key={index} className="chatText">
          {msg}
        </div>
      ))}
    </div>
  );
};
