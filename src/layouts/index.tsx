import { Outlet } from '@umijs/max';
import React, { useEffect } from 'react';
import GlobalHeader from '@/components/GlobalHeader';

export default () => {
  useEffect(() => {
    const fix = () => {
      const el = document.querySelector('.ant-pro-layout aside.ant-layout-sider') as HTMLElement;
      if (el) {
        el.style.setProperty('top', '56px', 'important');
        return true;
      }
      return false;
    };
    if (!fix()) {
      const id = setInterval(() => { if (fix()) clearInterval(id); }, 100);
      return () => clearInterval(id);
    }
  }, []);

  return (
    <>
      <GlobalHeader />
      <Outlet />
    </>
  );
};
