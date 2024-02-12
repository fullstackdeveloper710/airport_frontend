import React from 'react';
import LockIcon from 'assets/images/icons/LockIcon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const Menus = ({ menus }) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  return (
    <div className="textLayout__topItemWrap">
      {menus.map((x, i) => {
        return (
          <div className="topItem" key={i}>
            <figure className="topItem__img">
              <span>
                <LockIcon />
              </span>
            </figure>
            <h4>{ls.tour2.tourPlaces.menuTitle(x)}</h4>
          </div>
        );
      })}
    </div>
  );
};

export default Menus;
