import React, { useState } from 'react';
import { Checkbox, mergeStyles } from 'office-ui-fabric-react';
import { useSelector } from 'react-redux';

import { UserListItem } from './UserListItem';
import { SearchInput } from './SearchInput';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  showSearchInActiveOnly,
  showActiveOnlyUsersControl,
} from 'utils/eventVariables';

const listWrapperClass = mergeStyles({
  marginTop: '8px',
  maxHeight: '308px',
  overflowY: 'auto',
});

const sorted = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

export const UserList = ({
  users,
  allowMultiple,
  onClickUserItem,
  onSelectionChange,
}) => {
  const {
    components: {
      common: {
        userList: { serchInput: ls },
      },
    },
  } = useLabelsSchema();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [showActive, setShowActive] = useState(showSearchInActiveOnly);
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);

  const handleSearch = (text) => {
    setSearch(text);
    setLimit(10);
  };

  const handleScroll = (event) => {
    const div = event.target;
    if (div.offsetHeight + div.scrollTop + 10 >= div.scrollHeight) {
      setLimit(limit + 10);
    }
  };
  const onChangeShowActive = () => {
    setShowActive((showActive) => !showActive);
  };

  let usersToShow = users
  .filter((item) => {
    // Online users only if showing active
    if (showActive) {
      if (!onlineUsers.includes(item.eventUserId)) {
        return false;
      }
      if (
        usersStatuses[item.id] &&
        usersStatuses[item.id] !== 'online'
      ) {
        return false;
      }
    }
    // Apply search term to first name, last name, and organization.
    if (
      [
        item.firstName || '',
        item.lastName || '',
        item.organization || '',
      ]
        .join(' ')
        .toLowerCase()
        .indexOf(search.toLowerCase()) === -1
    ) {
      return false;
    }

    return true;
  })
  .sort((a, b) =>
    sorted(a.firstName.toLowerCase(), b.firstName.toLowerCase())
  )
  .slice(0, limit)

  return (
    <>
      <SearchInput
        id="search"
        onChange={handleSearch}
        placeholder={ls.placeholder}
      />
      <div className={listWrapperClass} onScroll={handleScroll}>
        {usersToShow
          .map((user, index) => (
            <UserListItem
              selectable={allowMultiple}
              key={user.id || index}
              user={user}
              onClick={onClickUserItem}
              onSelectionChange={onSelectionChange}
            />
          ))}
      </div>
      {showActiveOnlyUsersControl && (
        <div style={{ marginTop: '8px' }}>
          <Checkbox
            className="form-control"
            label={ls.checkboxLabel}
            checked={showActive}
            onChange={onChangeShowActive}
          />
        </div>
      )}
    </>
  );
};
