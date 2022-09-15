import Navbar from './Navbar';
import { ReactNode } from 'react';

const PageContainer = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="container text-gray-400 m-auto">
        <div className="pt-5 flex justify-center">{children}</div>
      </main>
    </>
  );
};

export default PageContainer;
