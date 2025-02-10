import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';

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

interface Props {
  onEventClick: (reservation: Reservation) => void;
}

export default function ReservationCalendar({ onEventClick }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      
      const formattedEvents = data.map((reservation: Reservation) => ({
        id: reservation.id,
        title: `${reservation.equipmentName} (${reservation.status})`,
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
        backgroundColor: getStatusColor(reservation.status),
        extendedProps: { ...reservation }
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const reservation = clickInfo.event.extendedProps as Reservation;
    onEventClick(reservation);
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="reservation-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        editable={false}
        selectable={true}
        dayMaxEvents={true}
        nowIndicator={true}
      />
    </div>
  );
}
