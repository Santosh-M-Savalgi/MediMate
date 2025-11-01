import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import API from '../api';

const statusColors = {
  pending: { bg: 'rgba(234,179,8,0.2)', color: '#fbbf24' },
  confirmed: { bg: 'rgba(34,197,94,0.2)', color: '#4ade80' },
  cancelled: { bg: 'rgba(239,68,68,0.2)', color: '#f87171' }
};

function AppointmentCard({ appointment, onStatusChange }) {
  const statusStyle = statusColors[appointment.status] || statusColors.pending;
  
  return (
    <motion.div
      className="appointment-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="appointment-datetime">
        <div className="appointment-date">
          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
        </div>
        <div className="appointment-time">
          {appointment.appointment_time}
        </div>
      </div>

      <div className="appointment-details">
        <div className="appointment-with">
          With Doctor #{appointment.doctor_id}
        </div>
        <div className="appointment-notes">{appointment.notes}</div>
      </div>

      <div 
        className="appointment-status"
        style={{ 
          backgroundColor: statusStyle.bg,
          color: statusStyle.color
        }}
      >
        {appointment.status}
      </div>

      {onStatusChange && (
        <div className="appointment-actions">
          {appointment.status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="action-btn confirm"
                onClick={() => onStatusChange(appointment.appointment_id, 'confirmed')}
              >
                Confirm
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="action-btn cancel"
                onClick={() => onStatusChange(appointment.appointment_id, 'cancelled')}
              >
                Cancel
              </motion.button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    
    try {
      await API.post('/appointments', {
        doctor_id: formData.doctorId,
        appointment_date: formData.date,
        appointment_time: formData.time,
        notes: formData.notes,
      });
      
      setMsg('Appointment booked successfully!');
      setFormData({ doctorId: '', date: '', time: '', notes: '' });
      setShowBooking(false);
      loadAppointments();
    } catch (error) {
      setErr('Booking failed. Please check all fields.');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await API.put(`/appointments/${appointmentId}`, { status: newStatus });
      loadAppointments();
      setMsg(`Appointment ${newStatus} successfully!`);
    } catch (error) {
      setErr('Failed to update appointment status.');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="appointments-page">
      {/* Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Appointments</h1>
          <p className="header-subtitle">Manage your medical appointments</p>
        </div>
        <motion.button
          className="new-appointment-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBooking(true)}
        >
          Book Appointment
        </motion.button>
      </motion.div>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBooking(false)}
          >
            <motion.div
              className="booking-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Book New Appointment</h2>
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label>Doctor ID</label>
                  <input
                    type="number"
                    value={formData.doctorId}
                    onChange={e => setFormData({...formData, doctorId: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="form-input"
                    rows={4}
                    placeholder="Describe your reason for visit"
                    required
                  />
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBooking(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Appointment
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments List */}
      <div className="appointments-list">
        {appointments.length === 0 ? (
          <motion.div
            className="no-appointments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No appointments found. Book your first appointment!
          </motion.div>
        ) : (
          appointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="notification success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {msg}
          </motion.div>
        )}
        {err && (
          <motion.div
            className="notification error"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Appointments;
