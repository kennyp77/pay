import { ExamplePage } from 'screens/example';

ExamplePage.getInitialProps = async (context) => {
  const userAgent = context.req
    ? context.req.headers['user-agent']
    : navigator.userAgent;

  return { userAgent };
};

export default ExamplePage;
