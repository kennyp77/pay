import { NextPage } from 'next';
import React, { useCallback, useRef } from 'react';

interface IndexPageProps {
  userAgent?: string;
}

export const IndexPage: NextPage<IndexPageProps> = ({ userAgent }) => {
  const fetchRef = useRef<HTMLParagraphElement>(null);
  const onClick = useCallback(async () => {
    try {
      if (fetchRef.current) {
        fetchRef.current.innerHTML = 'Fetch data: progress...';
      }

      const res = await fetch('/api/web/v1/partners');
      const data = await res.json();

      if (fetchRef.current) {
        fetchRef.current.innerHTML = `Fetch data: ${JSON.stringify(data)}`;
      }
    } catch (err) {
      if (fetchRef.current) {
        fetchRef.current.innerHTML = `Fetch data: Error — ${err}`;
      }
    }
  }, []);

  return (
    <main>
      <h1>Index page</h1>
      <h3>Data from server</h3>
      <p>Your user agent: {userAgent}</p>
      <p>
        window.__CONFIG:{' '}
        {JSON.stringify(typeof window === 'undefined' ? {} : window.__CONFIG)}
      </p>
      <br />
      <h3>Lego Component</h3>
      <div style={{ paddingLeft: 50 }}>
        <button onClick={onClick}>GET /api/web/v1/partners</button>
      </div>
      <p ref={fetchRef} />
    </main>
  );
};
