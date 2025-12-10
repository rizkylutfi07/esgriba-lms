import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";

// Eager load - untuk halaman awal saja
import LoginPage from "./pages/LoginPage";

// Lazy load - semua halaman lainnya
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardLayout = lazy(() => import("./components/layouts/DashboardLayout"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const GuruDashboard = lazy(() => import("./pages/guru/GuruDashboard"));
const SiswaDashboard = lazy(() => import("./pages/siswa/SiswaDashboard"));
const TestList = lazy(() => import("./pages/TestList"));
const TestDetail = lazy(() => import("./pages/guru/TestDetail"));
const TestDetailStudent = lazy(() => import("./pages/siswa/TestDetailStudent"));
const TakeTest = lazy(() => import("./pages/siswa/TakeTest"));
const TestResult = lazy(() => import("./pages/siswa/TestResult"));
const CreateTest = lazy(() => import("./pages/guru/CreateTest"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageMajors = lazy(() => import("./pages/admin/ManageMajors"));
const ManageClasses = lazy(() => import("./pages/admin/ManageClasses"));
const ManageSubjects = lazy(() => import("./pages/admin/ManageSubjects"));
const ManageRooms = lazy(() => import("./pages/admin/ManageRooms"));
const ManageAcademicYears = lazy(() => import("./pages/admin/ManageAcademicYears"));
const ManageTeachers = lazy(() => import("./pages/admin/ManageTeachers"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageSessions = lazy(() => import("./pages/admin/ManageSessions"));
const PrintExamCards = lazy(() => import("./pages/admin/PrintExamCards"));
const QuestionBank = lazy(() => import("./pages/guru/QuestionBank"));
const ImportQuestions = lazy(() => import("./pages/guru/ImportQuestions"));
const QuestionPackages = lazy(() => import("./pages/guru/QuestionPackages"));
const QuestionPackageDetail = lazy(() => import("./pages/guru/QuestionPackageDetail"));
const TestMonitoring = lazy(() => import("./pages/guru/TestMonitoring"));
const TestResults = lazy(() => import("./pages/guru/TestResults"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "guru":
        return <GuruDashboard />;
      case "siswa":
        return <SiswaDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <ThemeProvider 
      defaultTheme="system" 
      storageKey="cbt-theme"
      forceLightMode={user?.role === "siswa"}
    >
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
          />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={getDashboard()} />

            {/* Test Routes */}
            <Route path="/tests" element={<TestList />} />
            <Route
              path="/tests/:id"
              element={
                user?.role === "siswa" ? (
                  <ProtectedRoute allowedRoles="siswa">
                    <TestDetailStudent />
                  </ProtectedRoute>
                ) : (
                  <ProtectedRoute allowedRoles={["guru", "admin"]}>
                    <TestDetail />
                  </ProtectedRoute>
                )
              }
            />
            <Route
              path="/tests/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <CreateTest />
                </ProtectedRoute>
              }
            />

            {/* Siswa Routes */}
            <Route
              path="/tests/:id/take"
              element={
                <ProtectedRoute allowedRoles="siswa">
                  <TakeTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:attemptId"
              element={
                <ProtectedRoute allowedRoles="siswa">
                  <TestResult />
                </ProtectedRoute>
              }
            />

            {/* Guru Routes */}
            <Route
              path="/tests/create"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <CreateTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests/:testId/results"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <TestResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question-bank"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <QuestionBank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question-bank/import"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <ImportQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question-packages"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <QuestionPackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question-packages/:id"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <QuestionPackageDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring"
              element={
                <ProtectedRoute allowedRoles={["guru", "admin"]}>
                  <TestMonitoring />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-cards"
              element={
                <ProtectedRoute allowedRoles={["admin", "guru"]}>
                  <PrintExamCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/majors"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageMajors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageRooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academic-years"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageAcademicYears />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes - will be implemented later */}
            <Route
              path="/school-profile"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <div className="p-6">School Profile - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parents"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <div className="p-6">Parents - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={<div className="p-6">Assignments - Coming Soon</div>}
            />
            <Route
              path="/virtual-class"
              element={<div className="p-6">Virtual Class - Coming Soon</div>}
            />
            <Route
              path="/reports/grades"
              element={
                <ProtectedRoute allowedRoles={["admin", "guru"]}>
                  <div className="p-6">Grade Reports - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/attendance"
              element={
                <ProtectedRoute allowedRoles={["admin", "guru"]}>
                  <div className="p-6">Attendance Reports - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["admin", "guru"]}>
                  <div className="p-6">Attendance - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/materials"
              element={<div className="p-6">Materials - Coming Soon</div>}
            />
            <Route
              path="/videos"
              element={<div className="p-6">Videos - Coming Soon</div>}
            />
            <Route
              path="/grade-settings"
              element={
                <ProtectedRoute allowedRoles="admin">
                  <div className="p-6">Grade Settings - Coming Soon</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/e-rapor"
              element={<div className="p-6">e-Rapor - Coming Soon</div>}
            />
          </Route>
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
