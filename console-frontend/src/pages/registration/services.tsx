import { RegistrationThirdPage } from 'screens/registration/services';

RegistrationThirdPage.getInitialProps = async (context) => {
  const userAgent = context.req
    ? context.req.headers['user-agent']
    : navigator.userAgent;

  return { userAgent };
};

export default RegistrationThirdPage;
