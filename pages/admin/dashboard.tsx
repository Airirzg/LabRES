import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { withAdmin } from '@/middleware/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ReservationCalendar from '@/components/admin/ReservationCalendar';
import ReservationManagement from '@/components/admin/ReservationManagement';
import EquipmentManagement from '@/components/admin/EquipmentManagement';

interface Stats {
  totalReservations: number;
  pendingReservations: number;
  totalEquipment: number;
  availableEquipment: number;
}

interface Reservation {
  id: string;
  userId: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'calendar' | 'equipment'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    pendingReservations: 0,
    totalEquipment: 0,
    availableEquipment: 0
  });
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      // setStats(data);
      
      // Mock data for now
      setStats({
        totalReservations: 25,
        pendingReservations: 5,
        totalEquipment: 15,
        availableEquipment: 10
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setActiveTab('reservations');
  };

  if (loading) {
    return <Loading fullScreen message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      
      <main className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar border-end">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                  >
                    <i className="bi bi-calendar me-2"></i>
                    Calendar
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'reservations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reservations')}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Reservations
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'equipment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('equipment')}
                  >
                    <i className="bi bi-tools me-2"></i>
                    Equipment
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Admin Dashboard</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group me-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
              </div>
            </div>

            <ErrorMessage error={error} />

            {activeTab === 'overview' && (
              <div className="row">
                <div className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title text-muted">Total Reservations</h5>
                      <h2 className="mt-3 mb-3">{stats.totalReservations}</h2>
                      <p className="mb-0 text-success">
                        <i className="bi bi-arrow-up me-2"></i>
                        12% increase
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title text-muted">Pending Reservations</h5>
                      <h2 className="mt-3 mb-3">{stats.pendingReservations}</h2>
                      <p className="mb-0 text-warning">
                        <i className="bi bi-clock me-2"></i>
                        Needs attention
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title text-muted">Total Equipment</h5>
                      <h2 className="mt-3 mb-3">{stats.totalEquipment}</h2>
                      <p className="mb-0 text-info">
                        <i className="bi bi-tools me-2"></i>
                        In inventory
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title text-muted">Available Equipment</h5>
                      <h2 className="mt-3 mb-3">{stats.availableEquipment}</h2>
                      <p className="mb-0 text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Ready to use
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="card">
                <div className="card-body">
                  <ReservationCalendar onEventClick={handleReservationClick} />
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="card">
                <div className="card-body">
                  <ReservationManagement />
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="card">
                <div className="card-body">
                  <EquipmentManagement />
                </div>
              </div>
            )}
          </main>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default withAdmin(AdminDashboard);
