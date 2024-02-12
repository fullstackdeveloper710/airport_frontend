import React, { Fragment } from 'react';
import { Icon } from '@fluentui/react';
import { useDispatch } from 'react-redux/'
import { setPanelName, openPanel } from 'store/reducers/panel'; 

export const AllowDeviceIcon = ({ size = null, className = ''}) => {
  const dispatch = useDispatch()

  const onClick = () => {
    dispatch(setPanelName('settings'));
    dispatch(openPanel(true));
  };

  const style = { root : {} }

  if(size){
    for(let key in size){
      style.root[key] = size[key] + " !important"
    }
  }

  return (
    <Fragment>
      <Icon
        iconName="LocationDot"
        className={`permission-info-icon cursor-default ${className}`} 
        styles={style}
        onClick={onClick}
      />
    </Fragment>
  );
};
