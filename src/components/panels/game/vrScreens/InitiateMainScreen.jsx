import LockIcon from '../../../../assets/images/icons/LockIcon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import stepimg1 from '../../../../assets/images/stepimg1.png';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getVrResourcesData,
  getVrSubSessionData,
  setEmptySubsession,
  setVRSubsessionId,
  setVrEmptyFurtherSubsession,
  setVrResourceId,
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
const Step1 = ({ setSteps, setScreenType }) => {
  let dispatch = useDispatch();
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  const topics = ls.dialogContentProps.step1.topics;
  useEffect(() => {
    dispatch(setEmptySubsession([]));
    dispatch(setVrEmptyFurtherSubsession([]));
  }, []);
  useEffect(() => {
    getVrResourcesData(dispatch);
  }, []);
  const { vrResources, loading } = useSelector(
    (state) => state.VrResourcesSlice
  );
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <div className="stepWrapper-inner">
      {vrResources.map((x, i) => (
        <div
          key={i}
          className="stepWrapper-item"
          onClick={() => {
            dispatch(setVrResourceId(x.id));
            getVrSubSessionData(x.id, dispatch).then((res) => {
              if (res.length > 0) {
                setSteps(2);
                setScreenType('');
              } else {
                setSteps(3);
                dispatch(setVRSubsessionId(x.id));
                setScreenType('');
              }
            });
          }}
        >
          <figure className="stepWrapper-figure">
            <span>{<img src={stepimg1} alt="Image" />}</span>
          </figure>
          <div className="stepWrapper-caption">
            <span>{x.name}</span>
            <h2>{x.title}</h2>
            <p>{x.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Step1;
