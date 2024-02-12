import React, { useEffect, useState } from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import selectedImage from '../../../../assets/images/selectedImage.png';
import OTP from './common/OTP.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { OTPVerificationVRSubsessionsById } from 'store/reducers/vrResources';
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
const Step3 = () => {
  const dispatch = useDispatch();
  const {
    components: {
      dialogs: { vrScreensDialog: ls },
    },
  } = useLabelsSchema();
  const {
    vrResources,
    getVrSubSessionById,
    vrFurtherSubsession,
    vrSubsessionId,
    loading,
    vrResourceId,
    OTPVerificationCodeResponse,
  } = useSelector((state) => state.VrResourcesSlice);
  const [staticData, setStaticData] = useState({ name: '', title: '' });
  useEffect(() => {
    if (getVrSubSessionById.length === 0) {
      vrResources.filter((x) => {
        if (x.id === vrResourceId)
          setStaticData({
            name: x.name,
            title: x.title,
          });
      });
    }
  }, [vrResourceId, vrResources.length]);
  useEffect(() => {
    if (vrSubsessionId) {
      handleGenerateVerificationOTP();
    }
  }, [vrSubsessionId]);

  const handleGenerateVerificationOTP = () => {
    let data = {
      guideType: false,
      playerType: false,
      agoraChanelId: null,
      agenda: {
        id: 108,
        inviteesSurrealUser: [],
      },
      surrealSubExperienceId: 1,
      role: 'ATTENDEE',
    };
    OTPVerificationVRSubsessionsById(vrSubsessionId, vrResourceId, data, dispatch);
  };
  return loading ? (
    <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
  ) : (
    <div className="guideItem-row">
      <div className="guideItem">
        <div className="guideItem-head">
          <figure className="guideItem-figure">
            <span>
              <img src={selectedImage} alt="Selected Image" />
            </span>
          </figure>
          <strong>{staticData.name || vrFurtherSubsession.title}</strong>
          <h2>{staticData.title || vrFurtherSubsession.name}</h2>
        </div>
        <OTP
          ls={ls}
          code={OTPVerificationCodeResponse.verificationCode}
          codeGenerateTime={
            OTPVerificationCodeResponse.verificationCodeGenerateTime
          }
          codeExpiryTime={
            OTPVerificationCodeResponse.verificationCodeExpiredTime
          }
          handleGenerateVerificationOTP={handleGenerateVerificationOTP}
        />
      </div>
    </div>
  );
};

export default Step3;
