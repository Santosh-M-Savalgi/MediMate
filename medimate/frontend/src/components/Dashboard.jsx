import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api';

// Simulate some analytics data
const generateAnalytics = (days = 7) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    appointments: Math.floor(Math.random() * 8) + 1,
    ratings: Number((Math.random() * 5).toFixed(1))
  }));
};

const StatCard = ({ title, value, icon, trend }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </motion.div>
);

const AppointmentCard = ({ appointment }) => (
  <motion.div
    className="appointment-card"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="appointment-time">
      {new Date(appointment.appointment_date + 'T' + appointment.appointment_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })}
    </div>
    <div className="appointment-details">
      <div className="appointment-with">
        {appointment.role === 'doctor' ? 'Patient' : 'Doctor'} #{appointment.role === 'doctor' ? appointment.patient_id : appointment.doctor_id}
      </div>
      <div className="appointment-notes">{appointment.notes}</div>
    </div>
    <div className={`appointment-status ${appointment.status}`}>{appointment.status}</div>
  </motion.div>
);

function Dashboard() {
  const [user, setUser] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, appointmentsRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/appointments')
        ]);
        
        setUser(userRes.data);
        setAppointments(appointmentsRes.data);
        
        if (userRes.data.role === 'doctor') {
          const ratingsRes = await API.get(`/ratings?doctor_id=${userRes.data.user_id}`);
          setRatings(ratingsRes.data);
        }
        
        // Set analytics data
        setAnalyticsData(generateAnalytics());
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
        Loading your dashboard...
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    app => new Date(`${app.appointment_date}T${app.appointment_time}`) > new Date()
  ).sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`));

  return (
    <div className="dashboard-container">
      {/* Welcome Hero */}
      <motion.div 
        className="dashboard-welcome"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="welcome-content">
          <h1>Welcome back, {user.name}</h1>
          <p className="role-badge">{user.role}</p>
        </div>
        <div className="welcome-meta">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Appointments"
          value={appointments.length}
          icon="📅"
          trend={12}
        />
        {user.role === 'doctor' && (
          <StatCard
            title="Average Rating"
            value={ratings.length > 0 
              ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
              : 'N/A'
            }
            icon="⭐"
            trend={5}
          />
        )}
        <StatCard
          title="Upcoming"
          value={upcomingAppointments.length}
          icon="📋"
          trend={-8}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Appointments Timeline */}
        <div className="dashboard-card appointments-timeline">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-list">
            <AnimatePresence>
              {upcomingAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="no-appointments"
                >
                  No upcoming appointments
                </motion.div>
              ) : (
                upcomingAppointments.slice(0, 5).map(appointment => (
                  <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="dashboard-card analytics-chart">
          <h2>Activity Overview</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-1)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-1)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-2)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-2)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(13,17,23,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="var(--accent-1)" 
                  fillOpacity={1} 
                  fill="url(#colorAppointments)" 
                />
                {user.role === 'doctor' && (
                  <Area 
                    type="monotone" 
                    dataKey="ratings" 
                    stroke="var(--accent-2)" 
                    fillOpacity={1} 
                    fill="url(#colorRatings)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="dashboard-card recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-timeline">
            {[...appointments, ...ratings]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
              .map((item, index) => (
                <motion.div 
                  key={index}
                  className="activity-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="activity-icon">
                    {item.rating ? '⭐' : '📅'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {item.rating 
                        ? `New ${item.rating}-star rating received`
                        : `Appointment ${item.status}`}
                    </div>
                    <div className="activity-time">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="action-button"
              onClick={() => window.location.href = '/appointments'}
            >
              Schedule Appointment
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="action-button"
              onClick={() => window.location.href = '/chat'}
            >
              Start Chat
            </motion.button>
            {user.role === 'patient' && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="action-button"
                onClick={() => window.location.href = '/posts'}
              >
                Create Post
              </motion.button>
            )}
            {user.role === 'doctor' && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="action-button"
                onClick={() => window.location.href = '/comments'}
              >
                View Patient Posts
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
