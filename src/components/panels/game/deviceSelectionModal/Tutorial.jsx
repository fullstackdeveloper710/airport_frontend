import React, { Fragment, useState } from 'react';
import Edu1 from 'assets/images/e_1.png';
import Edu2 from 'assets/images/e_2.png';
import Edu4 from 'assets/images/e_4.png';
import { Checkbox } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const Tutorial = ({children, showCheckBox = true}) => {
  const {
    components: {
      panels: {
        game: {
          deviceSelectionModal: { tutorial: ls },
        },
      },
    },
  } = useLabelsSchema();
  const [ask, setAsk] = useState(false);


  const changeAskCheckBox = () => {
    setAsk((p) => !p);
  };


  return (
    <Fragment>
      <div className="permission-Container ms-Flex ms-Flex-justify-content-evenly ms-mb-2 ms-mt-1">
        <div className="step">
          <div className="no">01</div>
          <div className="step-box">
            <img src={Edu1} alt="toggle browser site permissions icon" />
          </div>
          <p>{ls.togglePermisionMessage}</p>
        </div>
        <div className="step ms-mx-2">
          <div className="no">02</div>
          <div className="step-box">
            <img src={Edu2} alt="Turn on switches near camera and microphone" />
          </div>
          <p>{ls.turnOnSwitchMessage}</p>
        </div>
        <div className="step">
          <div className="no">03</div>
          <div className="step-box">
            <img src={Edu4} alt="refresh the page" />
          </div>
          <p>{ls.clickReloadMessage}</p>
        </div>
      </div>
      {showCheckBox && <div className="full-screenoption ms-my-2 ms-Flex ms-Flex-justify-content-center">
        <Checkbox
          className="form-control"
          label={ls.dontAskAgainMessage}
          checked={ask}
          onChange={changeAskCheckBox}
        />
      </div>}
      {children && children(ask)}
    </Fragment>
  );
};
