import { RegistrationSecondPage } from 'screens/registration/providers';

RegistrationSecondPage.getInitialProps = async (context) => {
  const userAgent = context.req
    ? context.req.headers['user-agent']
    : navigator.userAgent;

  return { userAgent };
};

export default RegistrationSecondPage;
