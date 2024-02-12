import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import {
  ListPeoplePicker,
  ValidationState,
} from 'office-ui-fabric-react/lib/Pickers';
import { PersonaPresence } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

/**    moved to translation file
 */
// const suggestionProps = {
//   suggestionsHeaderText: 'Suggested People',
//   mostRecentlyUsedHeaderText: 'Suggested Contacts',
//   noResultsFoundText: 'No results found',
//   loadingText: 'Loading',
//   showRemoveButtons: false,
//   suggestionsAvailableAlertText: 'Suggestions available',
//   suggestionsContainerAriaLabel: 'Suggested contacts',
// };

export const PeoplePicker = (props) => {
  const { people, selectedKeys, onChange } = props;
  const {
    components: {
      common: { peoplePicker: ls },
    },
  } = useLabelsSchema();
  const [currentKeys, setCurrentKeys] = useState(selectedKeys);
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);

  let peopleList = _.sortBy(
    people.map((item) => ({
      id: item.id,
      key: item.key,
      eventUserId: item.eventUserId,
      imageUrl: item.photo ? item.photo.url : null,
      text: `${item.firstName} ${item.lastName}`,
      secondaryText: item.organization,
      presence:
        PersonaPresence[
          onlineUsers.includes(item.eventUserId)
            ? usersStatuses[item.id] || 'online'
            : 'offline'
        ],
    })),
    ['text']
  );


  const peopleListActive = peopleList.filter((item)=>{
    return onlineUsers.includes(item.eventUserId)
  })

  const peopleListInactive = peopleList.filter((item)=>{
    return !onlineUsers.includes(item.eventUserId)
  })

  peopleList = [...peopleListActive, ...peopleListInactive]
  
  const picker = useRef(null);

  const onFilterChanged = (filterText, currentPersonas) => {
    if (filterText) {
      let filteredPersonas = filterPersonasByText(filterText);

      filteredPersonas = removeDuplicates(filteredPersonas, currentPersonas);
      return filteredPersonas;
    } else {
      return [];
    }
  };

  const filterPersonasByText = (filterText) => {
    return peopleList.filter((item) =>
      doesTextStartWith(getTextFromItem(item), filterText)
    );
  };

  const returnMostRecentlyUsed = (currentPersonas) => {
    return removeDuplicates(peopleList, currentPersonas);
  };

  const onItemsChange = (items) => {
    const keys = items.map((item) => item.id);
    setCurrentKeys(keys);
    onChange(keys);
  };

  return (
    <div>
      <ListPeoplePicker
        // eslint-disable-next-line react/jsx-no-bind
        onResolveSuggestions={onFilterChanged}
        // eslint-disable-next-line react/jsx-no-bind
        onEmptyInputFocus={returnMostRecentlyUsed}
        getTextFromItem={getTextFromItem}
        selectedItems={peopleList.filter((item) =>
          currentKeys.includes(item.id)
        )}
        pickerSuggestionsProps={{
          ...ls.suggestionProps,
          showRemoveButtons: false,
        }}
        className={'ms-PeoplePicker'}
        key={'normal'}
        // eslint-disable-next-line react/jsx-no-bind
        onValidateInput={validateInput}
        removeButtonAriaLabel={ls.removeButtonAriaLabel}
        inputProps={{
          'aria-label': 'People Picker',
        }}
        componentRef={picker}
        onInputChange={onInputChange}
        onChange={onItemsChange}
        resolveDelay={300}
      />
    </div>
  );
};

function doesTextStartWith(text, filterText) {
  return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
}

function removeDuplicates(personas, possibleDupes) {
  return personas.filter(
    (persona) => !listContainsPersona(persona, possibleDupes)
  );
}

function listContainsPersona(persona, personas) {
  if (!personas || !personas.length || personas.length === 0) {
    return false;
  }
  return (
    personas.filter(
      (item) => getTextFromItem(item) === getTextFromItem(persona)
    ).length > 0
  );
}
function getTextFromItem(persona) {
  return persona.text;
}

function validateInput(input) {
  if (input.indexOf('@') !== -1) {
    return ValidationState.valid;
  } else if (input.length > 1) {
    return ValidationState.warning;
  } else {
    return ValidationState.invalid;
  }
}

/**
 * Takes in the picker input and modifies it in whichever way
 * the caller wants, i.e. parsing entries copied from Outlook (sample
 * input: "Aaron Reid <aaron>").
 *
 * @param input The text entered into the picker.
 */
function onInputChange(input) {
  const outlookRegEx = /<.*>/g;
  const emailAddress = outlookRegEx.exec(input);

  if (emailAddress && emailAddress[0]) {
    return emailAddress[0].substring(1, emailAddress[0].length - 1);
  }

  return input;
}
