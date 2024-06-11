import dynamic from 'next/dynamic';

const CallbackComponent = dynamic(() => import('/components/CallbackComponent'), { ssr: false });

const CallbackPage = () => {
  return <CallbackComponent />;
};

export default CallbackPage;
