import React, { useEffect } from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import SectionCircle from './common/SectionCircle';
import guide from '../../../../assets/images/guideExp.png';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react';
import {
  getVrFurtherSubsessionData,
  setVRSubsessionId,
  setVrEmptyFurtherSubsession,
} from 'store/reducers/vrResources';
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
const Step2 = ({ steps, setSteps, setScreenType }) => {
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  //const sections = ls.dialogContentProps.step2.sections;
  const { getVrSubSessionById, loading, vrResourceId } = useSelector(
    (state) => state.VrResourcesSlice
  );
  useEffect(() => {
    if (getVrSubSessionById.length === 0) {
      setSteps(1);
    }
  }, [steps, getVrSubSessionById.length]);

  const handleOnClick = (obj) => {
    if (obj.name === 'Colleague') {
      setSteps(5);
      dispatch(setVrEmptyFurtherSubsession([]));
      setScreenType('Colleague');
      dispatch(setVRSubsessionId(obj.id));
      getVrFurtherSubsessionData(vrResourceId, obj.id, dispatch);
    } else {
      getVrFurtherSubsessionData(vrResourceId, obj.id, dispatch);
      setScreenType('');
      setSteps(3);
      dispatch(setVRSubsessionId(obj.id));
    }
  };
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <>
      <h2>{getVrSubSessionById?.[0]?.title}</h2>
      <div className="guideItem-row">
        {getVrSubSessionById.map((x, i) => {
          return (
            <SectionCircle
              key={i}
              title={x.name}
              onClick={() => handleOnClick(x)}
              img={guide}
            />
          );
        })}
      </div>
    </>
  );
};

export default Step2;
