import React from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import stepimg1 from '../../../../assets/images/stepimg1.png';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { getVrFurtherSubsessionData, getVrSubSessionData } from 'store/reducers/vrResources';
const Step6 = ({ setSteps, setMenuType }) => {
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  // let menus = ls.dialogContentProps.step6.menus;
  const { getVrSubSessionById, loading } = useSelector(
    (state) => state.VrResourcesSlice
  );
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
  const dispatch = useDispatch();
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <>
      <h2>{getVrSubSessionById[0].title }</h2>
      <div className="guideItem-row">
        {getVrSubSessionById.map((x, i) => {
          return (
            <div
              className="guideItem"
              key={i}
              onClick={() => {
                setMenuType(x.description);
                setSteps(7);
                getVrFurtherSubsessionData(4, x.id, dispatch);
              }}
            >
              <figure className="guideItem-figure">
                <img src={stepimg1} />
              </figure>
              <h4>{x.description}</h4>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Step6;
