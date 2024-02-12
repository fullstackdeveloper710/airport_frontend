import React from 'react';
import { Image } from 'office-ui-fabric-react';

import statusActiveImage from 'assets/images/status_active.png';
import statusAwayImage from 'assets/images/status_away.png';
import statusNotDisturbImage from 'assets/images/status_notdisturb.png';
import statusInvisibleImage from 'assets/images/status_offline.png';

const ImageStatus = {
  online: statusActiveImage,
  away: statusAwayImage,
  dnd: statusNotDisturbImage,
  offline: statusInvisibleImage,
};

export const UserStatus = (props) => {
  const { status } = props;
  return <Image {...props} src={ImageStatus[status]} alt={status} />;
};
