import { useState, useEffect } from 'react';
import { generateMockData, mockBookings, mockAnalytics } from '../utils/mockData';

export const useParkingData = () => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState(mockBookings);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [notifications, setNotifications] = useState([
    {
      title: "New Booking",
      message: "Slot 15 has been reserved by John Doe",
      time: "2 minutes ago",
      read: false
    },
    {
      title: "Payment Received",
      message: "Payment of Lkr 15 processed successfully",
      time: "5 minutes ago",
      read: false
    }
  ]);

  useEffect(() => {
    setSlots(generateMockData());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSlots(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const statuses = ['available', 'occupied', 'reserved'];
        updated[randomIndex].status = statuses[Math.floor(Math.random() * statuses.length)];
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleReserveSlot = (slotId, duration) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, status: 'reserved', reservedBy: 'Current User' }
        : slot
    ));
    
    setNotifications(prev => [{
      title: "Reservation Confirmed",
      message: `Slot ${slotId} reserved for ${duration} hour${duration > 1 ? 's' : ''}`,
      time: "Just now",
      read: false
    }, ...prev]);
  };

  const handleUpdateSlot = (slotId) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const statuses = ['available', 'occupied', 'reserved'];
        const currentIndex = statuses.indexOf(slot.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...slot, status: nextStatus };
      }
      return slot;
    }));
  };

  const handleMarkAsRead = (index) => {
    setNotifications(prev => prev.map((notif, i) => 
      i === index ? { ...notif, read: true } : notif
    ));
  };

  return {
    slots,
    bookings,
    analytics,
    notifications,
    handleReserveSlot,
    handleUpdateSlot,
    handleMarkAsRead
  };
};