import React, { Suspense } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import ToastContainer from './components/common/ToastContainer';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import AddCameraModal from './components/cameras/AddCameraModal';
import CameraDetailsDrawer from './components/cameras/CameraDetailsDrawer';
const ThreeDCarViewer = React.lazy(() => import('./components/map/ThreeDCarViewer'));

// Pages
import DashboardPage from './pages/DashboardPage';
import LiveCamerasPage from './pages/LiveCamerasPage';
import CityMapPage from './pages/CityMapPage';
import AlertsPage from './pages/AlertsPage';
import IncidentsPage from './pages/IncidentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import AIModelsPage from './pages/AIModelsPage';
import CameraManagementPage from './pages/CameraManagementPage';
import SystemHealthPage from './pages/SystemHealthPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { 
    activeTab, 
    isAddCameraOpen, 
    setIsAddCameraOpen 
  } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'live':
        return <LiveCamerasPage />;
      case 'map':
        return <CityMapPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'incidents':
        return <IncidentsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'ai-models':
        return <AIModelsPage />;
      case 'camera-mgmt':
        return <CameraManagementPage />;
      case 'health':
        return <SystemHealthPage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-command-bg text-command-text">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Layout (Sidebar + Page Content) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 relative">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <GlobalSearchModal />
      <CameraDetailsDrawer />
      <Suspense fallback={null}>
        <ThreeDCarViewer />
      </Suspense>
      <AddCameraModal
        isOpen={isAddCameraOpen}
        onClose={() => setIsAddCameraOpen(false)}
      />
    </div>
  );
}
