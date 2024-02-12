import React, { useEffect, useState } from 'react';
import { Checkbox, PrimaryButton, mergeStyles } from 'office-ui-fabric-react';

import { UserAvatar } from './UserAvatar';

const wrapperClass = mergeStyles({
  cursor: 'pointer',
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
});

const containerClass = mergeStyles({
  width: '100%',
  margin: '0 5px 5px 0',
  padding: '5px',
  background: 'var(--sr-color-transparent)',
  display: 'flex',
  alignItems: 'center',

  '&:hover': {
    background: 'var(--sr-color-transparent-b-022)',
  },
});

const checkboxStyles = {
  checkbox: {
    width: 16,
    height: 16,
  },
};

const buttonStyles = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
  },
  rootHovered: {
    borderColor: 'none',
    background: 'var(--sr-color-grey)',
  },
  label: {
    fontWeight: 300,
  },
};

export const UserListItem = ({
  user,
  selectable,
  onClick,
  onSelectionChange,
  onClickRemove,
  showRemoveBtn,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (user) {
      onSelectionChange(user, isChecked);
    }
  }, [isChecked]);

  const toggleChecked = () => {
    setIsChecked((isChecked) => !isChecked);
  };

  const handleChange = () => {
    toggleChecked();
  };

  const handleClick = () => {
    if (selectable) {
      toggleChecked();
    } else if (onClick) {
      onClick(user);
    }
  };

  const handleClickRemove = () => {
    if (onClickRemove) {
      onClickRemove(user);
    }
  };

  return (
    <div className={wrapperClass}>
      <div className={containerClass} onClick={handleClick}>
        {selectable && (
          <Checkbox
            checked={isChecked}
            onChange={handleChange}
            styles={checkboxStyles}
          />
        )}
        {user && (
          <UserAvatar
            showCompany
            user={user}
            size={10}
            text={`${user.firstName} ${user.lastName}`}
            imageInitials={
              user.photo
                ? user.photo.url
                : (user.firstName || ' ').toUpperCase()[0] +
                  (user.lastName || ' ').toUpperCase()[0]
            }
          />
        )}
      </div>
      {showRemoveBtn && (
        <PrimaryButton
          text="Remove"
          styles={buttonStyles}
          onClick={handleClickRemove}
        />
      )}
    </div>
  );
};
