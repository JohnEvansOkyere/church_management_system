import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="mx-auto max-w-[1600px] gap-4 p-4 md:grid md:grid-cols-[18rem_1fr] md:p-4">
      <Sidebar />
      <main className="mt-4 md:mt-0">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}
