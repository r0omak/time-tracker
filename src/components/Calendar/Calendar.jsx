import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Timestamp } from 'firebase/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const TimeCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'time_entries'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const formattedEvents = snapshot.docs.map((doc) => {
        const data = doc.data();

        const start =
          data.start_time instanceof Timestamp
            ? data.start_time.toDate()
            : new Date(data.start_time);

        const end =
          data.end_time instanceof Timestamp ? data.end_time.toDate() : new Date(data.end_time);

        return {
          title: 'Робоча сесія',
          start,
          end,
        };
      });

      setEvents(formattedEvents);
    };

    fetchEntries();
  }, []);

  return (
    <div className="calendar-container">
      <h2>Календар сесій</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
};

export default TimeCalendar;
