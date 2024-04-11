import { IndexPage } from '../client/screens';

IndexPage.getInitialProps = async (context) => {
  const userAgent = context.req
    ? context.req.headers['user-agent']
    : navigator.userAgent;

  return { userAgent };
};

export default IndexPage;
