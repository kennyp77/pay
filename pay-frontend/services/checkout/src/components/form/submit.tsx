import React from 'react';

import { useFormikContext } from 'formik';

import { Button, ButtonProps } from '../button';

export const FormSubmit: React.FC<ButtonProps> = (props) => {
    const formik = useFormikContext();

    return (
        <Button
            type="submit"
            view="action"
            variant="primary"
            size="m"
            pin="round-m"
            {...props}
            disabled={!formik.isValid}
        />
    );
};
