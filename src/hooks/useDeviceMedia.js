import { useState, useEffect, useMemo } from 'react';

const isDesktopQuery = '(min-width: 1275px) and (min-height: 717px)';
const isTabletQuery = '(min-width: 906px) and (min-height: 510px)';
const getWindowDimensions = () => {
  const width = window?.innerWidth ?? null;
  const height = window?.innerHeight ?? null;
  return { width, height };
};

export const useDeviceMedia = () => {
  const hasWindow = typeof window !== 'undefined';
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [isDesktop, setIsDesktop] = useState(
    window?.matchMedia(isDesktopQuery)?.matches
  );
  const [isTablet, setIsTablet] = useState(
    window?.matchMedia(isTabletQuery)?.matches
  );
  const [isMobile, setIsMobile] = useState(false);

  const buttonsTextSize = useMemo(
    () => (isDesktop ? '14px' : isTablet ? '11px' : '9px'),
    [isDesktop, isTablet]
  );

  const buttonsMargin = useMemo(
    () => (isDesktop ? '4px 20px' : isTablet ? '2px 16px' : '1px 12px'),
    [isDesktop, isTablet]
  );
  const viewportType = useMemo(
    () => (isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile'),
    [isDesktop, isTablet]
  );
  const resizeEventHandler = () => {
    setWindowDimensions(getWindowDimensions());
  };
  const isDesktopEventHandler = (e) => setIsDesktop(e.matches);
  const isTabletEventHandler = (e) => setIsTablet(e.matches);

  useEffect(() => {
    setIsMobile(!isDesktop && !isTablet ? true : false);
  }, [isDesktop, isTablet]);

  useEffect(() => {
    const remove = () => {
      window
        ?.matchMedia(isDesktopQuery)
        ?.removeEventListener('change', isDesktopEventHandler);

      window
        ?.matchMedia(isTabletQuery)
        ?.removeEventListener('change', isTabletEventHandler);
    };

    if (hasWindow) {
      remove();
      window
        ?.matchMedia(isDesktopQuery)
        ?.addEventListener('change', isDesktopEventHandler);

      window
        ?.matchMedia(isTabletQuery)
        ?.addEventListener('change', isTabletEventHandler);
    }

    return remove;
  }, []);

  useEffect(() => {
    const remove = () => {
      window.removeEventListener('resize', resizeEventHandler);
    };
    if (hasWindow) {
      remove();
      window.addEventListener('resize', resizeEventHandler);
    }
    return remove;
  }, [hasWindow]);

  return {
    isDesktop: isDesktop,
    isTablet: isTablet,
    isMobile: isMobile,
    windowDimensions: windowDimensions,
    buttonsTextSize: buttonsTextSize,
    buttonsMargin: buttonsMargin,
    viewportType: viewportType,
  };
};
