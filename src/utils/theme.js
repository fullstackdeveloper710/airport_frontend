// Styles for the app
import 'assets/scss/index.scss';
// Styles for Containers + Grid
import 'office-ui-fabric-react/dist/css/fabric.min.css';

import React from 'react';
import { loadTheme } from '@fluentui/react';
import { registerIcons } from '@fluentui/react';
import { initializeIcons } from '@uifabric/icons';

loadTheme({
  defaultFontStyle: {
    fontFamily: 'var(--sr-font-primary)',
    fontWeight: 'regular',
  },
  palette: {
    themePrimary: 'var(--sr-color-primary)', //'#ff0378',
    themeLighterAlt: '#fff5fa',
    themeLighter: '#ffd7e9',
    themeLight: '#ffb3d7',
    themeTertiary: 'rgba(255, 255, 255, 0.7)',
    themeSecondary: 'var(--sr-color-primary)',//'#ff2189',
    themeDarkAlt: 'var(--sr-color-primary)',//'#e6026c',
    themeDark: 'rgba(255, 255, 255, 0.7)',
    themeDarker: 'rgba(255, 255, 255, 0.7)',
    neutralLighterAlt: '#000000',
    neutralLighter: '#000000',
    neutralLight: '#000000',
    neutralQuaternaryAlt: '#000000',
    neutralQuaternary: '#000000',
    neutralTertiaryAlt: '#000000',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    lightBrown: '#C8A960',
    black: '#f8f8f8',
    white: '#000000',
  },
});

initializeIcons();
registerIcons({
  icons: {
    Male: (
      <svg
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 28 28"
      >
        <path
          d="M25,3.38a.48.48,0,0,0-.27-.27.45.45,0,0,0-.2,0H19a.5.5,0,1,0,0,1h4.28l-5.1,5.1a8.47,8.47,0,1,0,.69.72L24,4.78V9a.5.5,0,0,0,.5.5A.5.5,0,0,0,25,9V3.57A.43.43,0,0,0,25,3.38ZM12.28,23.09a7.65,7.65,0,1,1,7.65-7.65A7.65,7.65,0,0,1,12.28,23.09Z"
          fill="white"
        />
      </svg>
    ),
    Female: (
      <svg
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 28 28"
      >
        <path
          d="M22,10.55a8.07,8.07,0,1,0-8.56,8V22H10.42a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h3.05v2.9a.5.5,0,0,0,.5.5.51.51,0,0,0,.5-.5V23h3a.5.5,0,0,0,.5-.5.5.5,0,0,0-.5-.5h-3V18.59A8.07,8.07,0,0,0,22,10.55Zm-15.13,0A7.07,7.07,0,1,1,14,17.61,7.08,7.08,0,0,1,6.9,10.55Z"
          fill="white"
        />
      </svg>
    ),
    CustomAccountCircle: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M7.9998 2C6.78573 1.99965 5.60012 2.3676 4.59958 3.05527C3.59903 3.74293 2.83064 4.71794 2.39591 5.85151C1.96117 6.98507 1.88054 8.22385 2.16468 9.40421C2.44881 10.5846 3.08434 11.6509 3.9873 12.4625V12.4625C4.36355 11.7216 4.9376 11.0993 5.64584 10.6647C6.35407 10.23 7.16883 9.99996 7.9998 10C7.50535 10 7.022 9.85338 6.61088 9.57868C6.19975 9.30397 5.87932 8.91353 5.6901 8.45671C5.50088 7.99989 5.45137 7.49723 5.54784 7.01228C5.6443 6.52732 5.8824 6.08187 6.23203 5.73223C6.58167 5.3826 7.02712 5.1445 7.51208 5.04804C7.99703 4.95157 8.49969 5.00108 8.95651 5.1903C9.41333 5.37952 9.80377 5.69995 10.0785 6.11108C10.3532 6.5222 10.4998 7.00555 10.4998 7.5C10.4998 8.16304 10.2364 8.79893 9.76757 9.26777C9.29873 9.73661 8.66284 10 7.9998 10C8.83077 9.99996 9.64553 10.23 10.3538 10.6647C11.062 11.0993 11.6361 11.7216 12.0123 12.4625C12.9153 11.6509 13.5508 10.5846 13.8349 9.40421C14.1191 8.22385 14.0384 6.98507 13.6037 5.85151C13.169 4.71794 12.4006 3.74293 11.4 3.05527C10.3995 2.3676 9.21387 1.99965 7.9998 2Z"
            fill="white"
          />
          <path
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 10C9.38071 10 10.5 8.88071 10.5 7.5C10.5 6.11929 9.38071 5 8 5C6.61929 5 5.5 6.11929 5.5 7.5C5.5 8.88071 6.61929 10 8 10Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.9873 12.4625C4.3635 11.7215 4.93753 11.0992 5.64577 10.6645C6.35401 10.2297 7.16879 9.99963 7.9998 9.99963C8.83082 9.99963 9.6456 10.2297 10.3538 10.6645C11.0621 11.0992 11.6361 11.7215 12.0123 12.4625"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    CustomCalendar: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M2.5 5.5H13.5V3C13.5 2.86739 13.4473 2.74021 13.3536 2.64645C13.2598 2.55268 13.1326 2.5 13 2.5H3C2.86739 2.5 2.74021 2.55268 2.64645 2.64645C2.55268 2.74021 2.5 2.86739 2.5 3V5.5Z"
            fill="white"
          />
          <path
            d="M13 2.5H3C2.72386 2.5 2.5 2.72386 2.5 3V13C2.5 13.2761 2.72386 13.5 3 13.5H13C13.2761 13.5 13.5 13.2761 13.5 13V3C13.5 2.72386 13.2761 2.5 13 2.5Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 1.5V3.5"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 1.5V3.5"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 5.5H13.5"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.75 8H7.5L6.5 9.25C6.66457 9.24972 6.82667 9.29006 6.97192 9.36744C7.11717 9.44483 7.24107 9.55686 7.33263 9.69361C7.4242 9.83036 7.4806 9.9876 7.49683 10.1514C7.51307 10.3151 7.48863 10.4804 7.42569 10.6325C7.36274 10.7845 7.26325 10.9187 7.13602 11.0231C7.00879 11.1275 6.85776 11.1988 6.69633 11.2309C6.5349 11.2629 6.36807 11.2546 6.21062 11.2067C6.05317 11.1588 5.90998 11.0728 5.79375 10.9563"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.75L10 8V11.25"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    CustomChat: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M10.2438 5.00623C10.4153 5.48551 10.502 5.99096 10.5001 6.49998C10.5001 7.69345 10.026 8.83804 9.18208 9.68196C8.33816 10.5259 7.19357 11 6.0001 11H5.75635C6.0666 11.8775 6.64133 12.6372 7.40137 13.1745C8.1614 13.7118 9.06933 14.0002 10.0001 14H14.1251C14.2246 14 14.3199 13.9605 14.3903 13.8901C14.4606 13.8198 14.5001 13.7244 14.5001 13.625V9.49998C14.5017 8.34819 14.061 7.23976 13.269 6.40352C12.4769 5.56729 11.394 5.0671 10.2438 5.00623Z"
            fill="white"
          />
          <path
            d="M6 11H1.875C1.77554 11 1.68016 10.9605 1.60983 10.8902C1.53951 10.8198 1.5 10.7245 1.5 10.625V6.5C1.5 5.30653 1.97411 4.16193 2.81802 3.31802C3.66193 2.47411 4.80653 2 6 2V2C7.19347 2 8.33807 2.47411 9.18198 3.31802C10.0259 4.16193 10.5 5.30653 10.5 6.5V6.5C10.5 7.69347 10.0259 8.83807 9.18198 9.68198C8.33807 10.5259 7.19347 11 6 11V11Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.75635 11C6.0666 11.8775 6.64133 12.6372 7.40137 13.1745C8.1614 13.7118 9.06933 14.0002 10.0001 14H14.1251C14.2246 14 14.3199 13.9605 14.3903 13.8901C14.4606 13.8198 14.5001 13.7244 14.5001 13.625V9.49998C14.5017 8.34819 14.061 7.23976 13.269 6.40352C12.4769 5.56729 11.394 5.0671 10.2438 5.00623"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    CustomHelp: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            fill="white"
          />
          <path
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 12C8.41421 12 8.75 11.6642 8.75 11.25C8.75 10.8358 8.41421 10.5 8 10.5C7.58579 10.5 7.25 10.8358 7.25 11.25C7.25 11.6642 7.58579 12 8 12Z"
            fill="white"
          />
          <path
            d="M8 9V8.5C8.34612 8.5 8.68446 8.39736 8.97225 8.20507C9.26003 8.01278 9.48433 7.73947 9.61679 7.4197C9.74924 7.09993 9.7839 6.74806 9.71637 6.40859C9.64885 6.06913 9.48218 5.75731 9.23744 5.51256C8.99269 5.26782 8.68087 5.10115 8.34141 5.03363C8.00194 4.9661 7.65007 5.00076 7.3303 5.13321C7.01053 5.26566 6.73722 5.48997 6.54493 5.77775C6.35264 6.06554 6.25 6.40388 6.25 6.75"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    CustomMap: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M10 13.5L6 11.5V2.5L10 4.5V13.5Z"
            fill="white"
          />
          <path
            d="M6 11.5L2 12.5V3.5L6 2.5"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 13.5L6 11.5V2.5L10 4.5V13.5Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 4.5L14 3.5V12.5L10 13.5"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
    CustomSmile: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path
            opacity="0.2"
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            fill="white"
          />
          <path
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            stroke="white"
            strokeWidth="1.25"
            strokeMiterlimit="10"
          />
          <path
            d="M5.75 7.5C6.16421 7.5 6.5 7.16421 6.5 6.75C6.5 6.33579 6.16421 6 5.75 6C5.33579 6 5 6.33579 5 6.75C5 7.16421 5.33579 7.5 5.75 7.5Z"
            fill="white"
          />
          <path
            d="M10.25 7.5C10.6642 7.5 11 7.16421 11 6.75C11 6.33579 10.6642 6 10.25 6C9.83579 6 9.5 6.33579 9.5 6.75C9.5 7.16421 9.83579 7.5 10.25 7.5Z"
            fill="white"
          />
          <path
            d="M10.5999 9.5C10.3356 9.95537 9.9563 10.3333 9.50001 10.5961C9.04372 10.8588 8.52643 10.9971 7.9999 10.9971C7.47338 10.9971 6.95608 10.8588 6.49979 10.5961C6.0435 10.3333 5.66422 9.95537 5.3999 9.5"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    ),
  },
});
