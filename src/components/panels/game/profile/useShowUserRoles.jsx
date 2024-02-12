import { useState, useEffect } from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export function useShowUserRoles(availableRoles = []) {
  const {
    components: {
      panels: {
        game: { profile: ls },
      },
    },
  } = useLabelsSchema();
  const [userRoles, setUserRoles] = useState('');
  const stringAvailableRoles = JSON.stringify(availableRoles);
  useEffect(() => {
    let rolesArr = '';
    if (availableRoles.includes('ROLE_EMCEE')) {
      rolesArr += (rolesArr ? ', ' : '') + ls.roleVOG;
      setUserRoles(rolesArr);
    }
    if (availableRoles.includes('ROLE_PRESENTER')) {
      rolesArr += (rolesArr ? ', ' : '') + ls.rolePresenter;
      setUserRoles(rolesArr);
    }
    if (availableRoles.includes('ROLE_ATTENDEE')) {
      rolesArr += (rolesArr ? ', ' : '') + ls.roleAttendee;
      setUserRoles(rolesArr);
    }
  }, [stringAvailableRoles]);
  return userRoles;
}
