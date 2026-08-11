import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { syncDataStoreWithSupabase } from './utils/dataStore';

// Public Layout Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MembershipModal } from './components/common/MembershipModal';
import { DonateModal } from './components/common/DonateModal';
import { WhatsAppButton } from './components/common/WhatsAppButton';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { OurWorkPage } from './pages/OurWorkPage';
import { ImpactPage } from './pages/ImpactPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { GalleryPage } from './pages/GalleryPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { ContactPage } from './pages/ContactPage';

// Admin Auth Helper & Components
import { isAdminAuthenticated } from './utils/adminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminContributionsPage } from './pages/admin/AdminContributionsPage';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage';
import { AdminExpensesPage } from './pages/admin/AdminExpensesPage';
import { AdminTreasuryPage } from './pages/admin/AdminTreasuryPage';
import { AdminProgramsPage } from './pages/admin/AdminProgramsPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminUpdatesPage } from './pages/admin/AdminUpdatesPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminEngagementPage } from './pages/admin/AdminEngagementPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Member Portal Components
import { MemberLoginPage } from './pages/member/MemberLoginPage';
import { MemberLayout } from './layouts/MemberLayout';
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';
import { MemberContributionsPage } from './pages/member/MemberContributionsPage';
import { MemberEventsPage } from './pages/member/MemberEventsPage';
import { MemberPointsPage } from './pages/member/MemberPointsPage';

// Public Layout Wrapper Component
const PublicLayout: React.FC<{
  onOpenMembership: () => void;
  isMembershipModalOpen: boolean;
  onCloseMembership: () => void;
  onOpenDonate: () => void;
  isDonateModalOpen: boolean;
  onCloseDonate: () => void;
}> = ({
  onOpenMembership,
  isMembershipModalOpen,
  onCloseMembership,
  onOpenDonate,
  isDonateModalOpen,
  onCloseDonate
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#1E293B] antialiased selection:bg-[#047857] selection:text-white">
      {/* Sticky Public Header */}
      <Header onOpenMembership={onOpenMembership} onOpenDonate={onOpenDonate} />

      {/* Public Pages Main Container */}
      <main className="grow">
        <Outlet />
      </main>

      {/* Public Institutional Footer */}
      <Footer onOpenMembership={onOpenMembership} />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton variant="floating" />

      {/* Public Membership Application Modal */}
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={onCloseMembership}
      />

      {/* Public Donation Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={onCloseDonate}
      />
    </div>
  );
};

// Admin Auth Guard Layout Wrapper
const ProtectedAdminLayout: React.FC = () => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
};

export default function App() {
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  useEffect(() => {
    syncDataStoreWithSupabase();
  }, []);

  const handleOpenMembership = () => {
    setIsMembershipModalOpen(true);
  };

  const handleCloseMembership = () => {
    setIsMembershipModalOpen(false);
  };

  const handleOpenDonate = () => {
    setIsDonateModalOpen(true);
  };

  const handleCloseDonate = () => {
    setIsDonateModalOpen(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* ================= PUBLIC WEBSITE ROUTES ================= */}
        <Route
          element={
            <PublicLayout
              onOpenMembership={handleOpenMembership}
              isMembershipModalOpen={isMembershipModalOpen}
              onCloseMembership={handleCloseMembership}
              onOpenDonate={handleOpenDonate}
              isDonateModalOpen={isDonateModalOpen}
              onCloseDonate={handleCloseDonate}
            />
          }
        >
          <Route path="/" element={<HomePage onOpenMembership={handleOpenMembership} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<AboutPage onOpenMembership={handleOpenMembership} />} />
          <Route path="/our-work" element={<OurWorkPage onOpenMembership={handleOpenMembership} />} />
          <Route path="/impact" element={<ImpactPage onOpenMembership={handleOpenMembership} />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/contact" element={<ContactPage onOpenMembership={handleOpenMembership} />} />
        </Route>

        {/* ================= MEMBER PORTAL ================= */}
        <Route path="/member/login" element={<MemberLoginPage />} />
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<Navigate to="/member/dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboardPage />} />
          <Route path="profile" element={<MemberProfilePage />} />
          <Route path="contributions" element={<MemberContributionsPage />} />
          <Route path="events" element={<MemberEventsPage />} />
          <Route path="points" element={<MemberPointsPage />} />
        </Route>

        {/* ================= ADMIN PORTAL LOGIN ================= */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ================= ADMIN PORTAL PROTECTED ROUTES ================= */}
        <Route path="/admin" element={<ProtectedAdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          
          {/* Members Routes */}
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="members/applications" element={<AdminApplicationsPage />} />
          <Route path="members/payments" element={<AdminContributionsPage />} />
          
          {/* Finance Routes */}
          <Route path="donations" element={<AdminDonationsPage />} />
          <Route path="finance" element={<Navigate to="/admin/finance/treasury" replace />} />
          <Route path="finance/donations" element={<AdminDonationsPage />} />
          <Route path="finance/contributions" element={<AdminContributionsPage />} />
          <Route path="finance/expenses" element={<AdminExpensesPage />} />
          <Route path="finance/treasury" element={<AdminTreasuryPage />} />

          {/* Content Management Routes */}
          <Route path="programs" element={<AdminProgramsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="updates" element={<AdminUpdatesPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="engagement" element={<AdminEngagementPage />} />

          {/* System Admin Routes */}
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
