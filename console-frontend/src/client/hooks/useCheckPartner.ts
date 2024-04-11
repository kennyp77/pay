import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchPartnerMerchantsRequest } from 'store/partner-submit/actions';

import { getPartnerDataSelector } from 'store/partner-data/selectors';

export const useCheckPartner = () => {
  const dispatch = useDispatch();
  const partnerData = useSelector(getPartnerDataSelector);

  useEffect(() => {
    if (!partnerData) {
      dispatch(fetchPartnerMerchantsRequest());
    }
  }, [dispatch, partnerData]);
};
