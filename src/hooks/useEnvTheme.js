import { loadTheme } from '@fluentui/react';
import { getTheme } from 'office-ui-fabric-react';
import { useEffect } from 'react';
import { darken, transparentize } from 'polished';
import bgAuth from 'assets/images/background/bg-auth.jpg';
import bgLoading from 'assets/images/background/bg-loading.jpg';
import bgMain from 'assets/images/background/bg-main.jpg';
import logo from 'assets/images/logo/logo.png';
import logoBig from 'assets/images/logo/logo-big.png';
import logoMainPanelHeader from 'assets/images/logo/main-panel-header.png';

/** Used for updating theme colors and css color variables from event control panel.
 * At this stage does not exist the api for retrieving colors from control panel.
 * Actual left-over is using variable from .env file for retrieving colors values.
 * ToDo : expose colors variables into event control pannel and implement api call for retrieving them
 */
export const useEnvTheme = () => {
  const setVariables = (vars) =>
    Object.entries(vars).forEach((v) =>
      document?.querySelector(':root')?.style.setProperty(v[0], v[1])
    );
  const theme = getTheme();
  const { themePrimary, themeSecondary, themeDarker } =
    windowsEnvVariableExtract();

  const myVariables = {
    '--sr-color-primary': themePrimary ?? '#ff0378',
    '--sr-color-primary-light': transparentize(0.3, themePrimary ?? '#ff0378'),
    '--sr-color-primary-dark':
      themeDarker ?? darken(0.3, themePrimary ?? '#ff0378'),
    '--sr-color-primary-variant1': '#ff0077',
    '--sr-color-primary-background': darken(0.8, themePrimary ?? '#40169af7'),
    '--sr-color-secondary': themeSecondary ?? '#ff057a',

    '--sr-background-image-auth': `url(${bgAuth})`,
    '--sr-background-image-loading': `url(${bgLoading})`,
    '--sr-background-image-main': `url(${bgMain})`,

    '--sr-logo-main': `url(${logo})`,
    '--sr-logo-big': `url(${logoBig})`,
    '--sr-logo-main-panel-header': `url(${logoMainPanelHeader})`,
  };

  setVariables(myVariables);
  useEffect(() => {
    setVariables(myVariables);
    loadTheme({
      defaultFontStyle: {
        fontFamily: 'var(--sr-font-primary)',
        fontWeight: 'regular',
      },
      palette: {
        ...theme.palette,
        themePrimary: 'var(--sr-color-primary)',
        themeSecondary: 'var(--sr-color-secondary)',
        themeDark: 'var(--sr-color-primary-dark)',
      },
    });
  }, []);
  return;
};

const windowsEnvVariableExtract = () => {
  const eventTheme = process.env.REACT_APP_CUSTOM_THEME;

  /**  Temporary workaround for windows run on dev where seems that
   * variable object from .env file is not parsed
   */
  const parsedEventTheme = JSON.parse(JSON.stringify(eventTheme));
  const palette = parsedEventTheme?.split('},')[1].slice(0, -2).split(',');
  const themePrimaryComputed = palette[0]
    ?.split(':')
    ?.map((i) => i?.trim())[2]
    ?.split(',')[0]
    ?.slice(1, -1);
  const themeSecondaryComputed = palette[1]
    ?.split(':')
    ?.map((i) => i.trim())[1]
    ?.slice(1, -1);
  const themeDarkerComputed = palette[2]
    ?.split(':')
    ?.map((i) => i.trim())[1]
    ?.slice(1, -1);

  const themePrimary =
    eventTheme?.palette?.themePrimary ||
    parsedEventTheme?.palette?.themePrimary ||
    themePrimaryComputed;

  const themeSecondary =
    eventTheme?.palette?.themeSecondary ||
    parsedEventTheme?.palette?.themeSecondary ||
    themeSecondaryComputed;

  const themeDarker =
    eventTheme?.palette?.themeDarker ||
    parsedEventTheme?.palette?.themeDarker ||
    themeDarkerComputed;

  return { themePrimary, themeSecondary, themeDarker };
};
