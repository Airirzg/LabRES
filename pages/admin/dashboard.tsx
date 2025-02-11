import React, { useState, useEffect } from 'react';
import { FiHome, FiBox, FiCalendar, FiUsers, FiMessageSquare, FiSettings, FiBell, FiUser } from 'react-icons/fi';
import { Equipment, Reservation } from '@prisma/client';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AdminDashboard = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminName, setAdminName] = useState('Admin User');

  useEffect(() => {
    fetchDashboardData();
    // Fetch admin profile
    fetch('/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setAdminName(data.name);
        }
      })
      .catch(error => console.error('Error fetching admin profile:', error));
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [equipmentRes, reservationsRes] = await Promise.all([
        fetch('/api/admin/equipment'),
        fetch('/api/admin/reservations')
      ]);

      if (!equipmentRes.ok || !reservationsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const equipmentData = await equipmentRes.json();
      const reservationsData = await reservationsRes.json();

      setEquipment(Array.isArray(equipmentData) ? equipmentData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setEquipment([]);
      setReservations([]);
    }
  };

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: ['#0d6efd', '#198754'],
    grid: {
      borderColor: '#f1f1f1',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    legend: {
      position: 'top'
    }
  };

  const chartSeries = [
    {
      name: 'Equipment Usage',
      data: [30, 40, 35, 50, 49, 60]
    },
    {
      name: 'Reservations',
      data: [20, 35, 40, 45, 39, 45]
    }
  ];

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-auto px-0 bg-dark text-white min-vh-100" style={{ width: '250px' }}>
            <div className="p-3 d-flex flex-column h-100">
              <div>
                <h5 className="mb-4 py-3 border-bottom">
                  <i className="bi bi-grid-fill me-2"></i>
                  LabRES Admin
                </h5>
                <div className="nav flex-column nav-pills">
                  <Link href="/admin/dashboard" className="nav-link active text-white mb-2 d-flex align-items-center">
                    <FiHome className="me-2" /> Dashboard
                  </Link>
                  <Link href="/admin/equipment" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiBox className="me-2" /> Equipment
                  </Link>
                  <Link href="/admin/reservations" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiCalendar className="me-2" /> Reservations
                  </Link>
                  <Link href="/admin/users" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiUsers className="me-2" /> Users
                  </Link>
                  <Link href="/admin/messages" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiMessageSquare className="me-2" /> Messages
                  </Link>
                  <Link href="/admin/profile" className="nav-link text-white mb-2 d-flex align-items-center">
                    <FiUser className="me-2" /> Profile
                  </Link>
                </div>
              </div>
              <div className="mt-auto pt-3 border-top">
                <Link href="/" className="nav-link text-white d-flex align-items-center">
                  <i className="bi bi-arrow-left me-2"></i> Back to App
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col ps-md-2 pt-2">
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4 rounded">
              <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Admin Dashboard</h5>
                  <Link href="/admin/profile" className="text-decoration-none">
                    <span className="text-primary">{adminName}</span>
                  </Link>
                </div>
                <div className="d-flex align-items-center">
                  <button className="btn btn-link position-relative me-3">
                    <FiBell className="text-muted" size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </button>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="container-fluid px-4">
              {/* Statistics Cards */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Total Equipment</h6>
                          <h4 className="card-title mb-0">
                            {Array.isArray(equipment) ? equipment.length : 0}
                          </h4>
                        </div>
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                          <FiBox className="text-primary" size={24} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">↑ 12%</small>
                        <small className="text-muted ms-2">from last month</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Active Reservations</h6>
                          <h4 className="card-title mb-0">
                            {Array.isArray(reservations) ? reservations.length : 0}
                          </h4>
                        </div>
                        <div className="p-2 bg-success bg-opacity-10 rounded-3">
                          <FiCalendar className="text-success" size={24} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">↑ 8%</small>
                        <small className="text-muted ms-2">from last week</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Available Equipment</h6>
                          <h4 className="card-title mb-0">
                            {Array.isArray(equipment) ? equipment.filter(e => e.status === 'AVAILABLE').length : 0}
                          </h4>
                        </div>
                        <div className="p-2 bg-info bg-opacity-10 rounded-3">
                          <FiBox className="text-info" size={24} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">↑ 5%</small>
                        <small className="text-muted ms-2">from yesterday</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-subtitle mb-1 text-muted">Maintenance Items</h6>
                          <h4 className="card-title mb-0">
                            {Array.isArray(equipment) ? equipment.filter(e => e.status === 'MAINTENANCE').length : 0}
                          </h4>
                        </div>
                        <div className="p-2 bg-warning bg-opacity-10 rounded-3">
                          <FiSettings className="text-warning" size={24} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-danger">↓ 2%</small>
                        <small className="text-muted ms-2">from last week</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Recent Activity */}
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Usage Statistics</h5>
                      <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="line"
                        height={350}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Recent Activity</h5>
                      <div className="list-group list-group-flush">
                        {Array.isArray(reservations) ? reservations.slice(0, 5).map((reservation, index) => (
                          <div key={index} className="list-group-item border-0 px-0">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                  <FiCalendar className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">New Reservation</h6>
                                  <small className="text-muted">
                                    {new Date(reservation.startTime).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                              <small className="text-muted">
                                {new Date(reservation.startTime).toLocaleTimeString()}
                              </small>
                            </div>
                          </div>
                        )) : (
                          <p className="text-muted text-center py-3">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
