import { RegistrationPage } from 'screens/registration';

RegistrationPage.getInitialProps = async (context) => {
  const userAgent = context.req
    ? context.req.headers['user-agent']
    : navigator.userAgent;

  return { userAgent };
};

export default RegistrationPage;
