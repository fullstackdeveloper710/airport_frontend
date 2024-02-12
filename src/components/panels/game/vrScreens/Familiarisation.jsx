import React from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import SectionCircle from './common/SectionCircle';
import stepimg1 from '../../../../assets/images/stepimg1.png';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { getVrFurtherSubsessionData } from 'store/reducers/vrResources';
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
const Step4 = ({ steps, setOpen, setSteps }) => {
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  const sections = [
    ls.dialogContentProps.step4.title2,
    ls.dialogContentProps.step4.title3,
  ];
  const { getVrSubSessionById, loading } = useSelector(
    (state) => state.VrResourcesSlice
  );
  const dispatch = useDispatch();
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <>
      <h2>{getVrSubSessionById[0].title}</h2>
      <div className="guideItem-row">
        {getVrSubSessionById.map((x, i) => {
          return (
            <SectionCircle
              key={i}
              title={x.name}
              onClick={() => {
                setSteps(i === 0 ? 9 : 5);
                getVrFurtherSubsessionData(3, x.id, dispatch);
              }}
              img={stepimg1}
            />
          );
        })}
      </div>
    </>
  );
};

export default Step4;
