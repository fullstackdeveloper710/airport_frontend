import React from 'react';
import moment from 'moment';
import { Text } from '@fluentui/react';
import { ReactComponent as ArrowImgUrl } from '../../../../assets/images/icons/right-arrow.svg'

export const EventItem = (props) => {
  const { data, setData, handleSectionChange } = props;

  return (
    <div className="meetingItem" onClick={() => {
      handleSectionChange('detail')
      setData(data)
    }}>
      <Text>
        <div className="name">{data.title} <ArrowImgUrl className='rightArrow' /></div>
      </Text>
      <Text><div className="time">{moment(data.startTime).format('h:mm a')}</div></Text>
    </div>
  );
};
