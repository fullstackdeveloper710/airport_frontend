import React, { Fragment, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Tutorial } from './Tutorial';
import { DialogBox } from 'components/common/DialogBox';
import { PrimaryButton, Icon } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux/'
import { setPanelName, openPanel } from 'store/reducers/panel';
import { isInGame } from 'utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const educateDialogStyles = {
  main: {
    width: '1024px !important',
    height: '550px',
    maxWidth: '1024px !important',
    background: 'var(--sr-color-background-educateDialogStyles)',
  },
};

const contentStyle = {
  title: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 36,
    marginTop: 22,
  },
  inner: {
    textAlign: 'center',
  },
  subText: {
    color: 'var(--sr-color-white)',
  },
};

const buttonStyle = {
  height: 48,
  width: 170,
  fontSize: 16,
  lineHeight: 24,
};

export const PermissionIcon = forwardRef(({ size = null, goToSetting = false, blockClick = false, children, showIcon = true }, ref) => {
  const {
    components: {
      panels: {
        game: { deviceSelectionModal:{permissionIcon: ls} },
      },
    },
  } = useLabelsSchema();

  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);


  const onClick = () => {
    if (goToSetting) {
        dispatch(setPanelName('settings'));
        dispatch(openPanel(true));
    } else {
      toggle();
    }
  };

  useImperativeHandle(ref, ()=>{
    return {
      permissionOnCick : onClick
    }
  })

  useEffect(()=>{
    setShow(false)
  },[isInGame(game.stage)])

  const toggle = () => {
    setShow((p) => !p);
  };

  const style = { root : { color : 'var(--sr-color-primary)' + " !important"} }

  if(size){
    for(let key in size){
      style.root[key] = size[key] + " !important"
    }
  }


  return (
    <Fragment>
      {children &&  children({onClick})}
      {showIcon && <Icon
        iconName="AlertSolid"
        className="permission-info-icon"
        styles={style}
        onClick={blockClick ? ()=>{} : onClick}
      />}
      <DialogBox
        styles={educateDialogStyles}
        hidden={!show}
        header={ls.dialogHeaderText}
        text=""
        showClose={false}
        showOk={false}
        showFooter={false}
        innerStyle={contentStyle}
      >
        <Tutorial showCheckBox={false}>
          {() => {
            return (
              <div className="ms-Flex ms-Flex-justify-content-center">
                <PrimaryButton style={buttonStyle} onClick={toggle}>{ls.okText}</PrimaryButton>
              </div>
            );
          }}
        </Tutorial>
      </DialogBox>
    </Fragment>
  );
}) 

