
// import React from "react";
// import { Navigate } from "react-router-dom";

// type Props = {
//   children: React.ReactNode;
// };

// const ProtectedRoute: React.FC<Props> = ({ children }) => {
//   try {
//     const raw = localStorage.getItem("student");
//     if (!raw) {
//       // No stored session -> force login
//       return <Navigate to="/login" replace />;
//     }
//     const user = JSON.parse(raw);
//     if (!user?.email) {
//       localStorage.removeItem("student");
//       return <Navigate to="/login" replace />;
//     }
//     return <>{children}</>;
//   } catch (err) {
//     localStorage.removeItem("student");
//     return <Navigate to="/login" replace />;
//   }
// };

// export default ProtectedRoute;
