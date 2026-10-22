export const LayoutDashboard: Router_Layout = (propeties) => {
   const { children } = propeties;

   return children;

   return (
      <div className="flex flex-col h-screen">
         <header className="bg-gray-800 text-white p-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
         </header>
         <main className="flex-1 p-4 bg-gray-100">{children}</main>
         <footer className="bg-gray-800 text-white p-4">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
         </footer>
      </div>
   );
};
