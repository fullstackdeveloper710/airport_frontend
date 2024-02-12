import React, { useEffect, useState } from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import selectedImage from '../../../../assets/images/selectedImage.png';
import { useSelector } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react';
const spinnerStyles = {
  root: {
    margin: '0 1rem',
  },
  circle: {
    borderWidth: 2,
    width: 30,
    height: 30,
  },
};
const Step5 = ({ steps, setOpen, setSteps, setScreenType }) => {
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  const [options] = useState([
    ls.dialogContentProps.step5.userName,
    ls.dialogContentProps.step5.userName,
    ls.dialogContentProps.step5.userName,
    ls.dialogContentProps.step5.userName,
  ]);

  const { vrFurtherSubsession, loading } = useSelector(
    (state) => state.VrResourcesSlice
  );

  useEffect(() => {
    setScreenType('inviteFriend');
  }, []);

  console.log(vrFurtherSubsession, 'vrFurtherSubsession');
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <div className="guideItem-row">
      <div className="guideItem">
        <div className="guideItem-head">
          <figure className="guideItem-figure">
            <span>
              <img src={selectedImage} />
            </span>
          </figure>

          <strong>{vrFurtherSubsession.title}</strong>
          <h2>{vrFurtherSubsession.name}</h2>
        </div>
        <div className="guideItem-caption">
          <div className="stepSearch">
            <p className="stepSearcHeading">
              {ls.dialogContentProps.step5.sendInvite}
            </p>
            <div className="searchInputWrap">
              <label>{vrFurtherSubsession.name}</label>
              <div className="searchInput">
                <input type="text" placeholder="Type here..." />
                <div className="searchInputDropdown">
                  <ul className="searchList">
                    {options.map((x, i) => {
                      return (
                        <li className="activelist" key={i}>
                          <span className="listImg">
                            <img src={selectedImage} />
                            <b className="online-user"></b>
                          </span>
                          {x}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <button
                type="submit"
                className="search-btn"
                onClick={() => setSteps(3)}
              >
                {ls.dialogContentProps.step5.sendInvite}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;
