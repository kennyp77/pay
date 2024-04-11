import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'const';

export const useResponsive = () => {
  return {
    isMobile: useMediaQuery({ query: `(max-width: ${breakpoints.tablet}` }),
    isTablet: useMediaQuery({
      query: `(min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.tabletHorizontal})`,
    }),
    isDesktop: useMediaQuery({
      query: `(min-width: ${breakpoints.desktop})`,
    }),
    isNotDesktop: useMediaQuery({
      query: `(max-width: ${breakpoints.desktop})`,
    }),
  };
};
