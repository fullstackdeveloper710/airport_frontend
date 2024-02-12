import React, { useState } from 'react';
import { Dialog } from 'office-ui-fabric-react';
import Step1 from 'components/panels/game/vrScreens/InitiateMainScreen';
import Step2 from 'components/panels/game/vrScreens/A380Economy';
import Step3 from 'components/panels/game/vrScreens/CommonOTPScreen';
import Step4 from 'components/panels/game/vrScreens/Familiarisation';
import Step5 from 'components/panels/game/vrScreens/InviteFriend';
import Step6 from 'components/panels/game/vrScreens/ScoredPractice';
import StepsHeader from 'components/panels/game/vrScreens/StepHeader';
import StepsFooter from 'components/panels/game/vrScreens/StepFooter';
import InitiateScreen from 'components/panels/game/vrScreens/common/InitiateScreen.jsx';
const stepsComponents = [
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step3,
  Step3,
  Step3,
  Step3,
];
const VRConnectionsScreenDialog = ({ open, setOpen }) => {
  const [steps, setSteps] = useState(1);
  const [menuType, setMenuType] = useState('');
  const RenderStepComponent = stepsComponents[steps - 1];
  const [screenType, setScreenType] = useState('');
  return open ? (
    <Dialog
      dialogContentProps={{ titleProps: { style: { display: 'none' } } }}
      minWidth={'100%'}
      hidden={!open}
      onDismiss={() => setOpen(false)}
      modalProps={{
        containerClassName: 'splashModal',
      }}
    >
      <StepsHeader
        steps={steps}
        setSteps={setSteps}
        setOpen={setOpen}
        screenType={screenType}
      />
      <InitiateScreen steps={steps}>
        <RenderStepComponent
          steps={steps}
          setOpen={setOpen}
          setSteps={setSteps}
          setMenuType={setMenuType}
          menuType={menuType}
          setScreenType={setScreenType}
        />
      </InitiateScreen>
      <StepsFooter
        text={
          'Please ensure your headset is ready to initialise your chosen VR experience'
        }
        icon={null}
      />
    </Dialog>
  ) : null;
};

export default VRConnectionsScreenDialog;
