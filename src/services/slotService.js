import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getBookingsFromFirestore } from './bookingService';

const SLOTS_COLLECTION = 'parkingSlots';
const BOOKINGS_COLLECTION = 'bookings';
const DESIGNS_COLLECTION = 'parkingDesigns';

// Get slot prices from parking design
export const getSlotPrices = async (adminUid) => {
  try {
    const designRef = doc(db, DESIGNS_COLLECTION, adminUid);
    const designSnap = await getDoc(designRef);
    
    if (designSnap.exists()) {
      const designData = designSnap.data();
      const elements = designData.elements || [];
      
      // Create a map of slot prices
      const slotPrices = {};
      elements.forEach(element => {
        if (element.type === 'slot' && element.meta?.slotNumber) {
          slotPrices[element.meta.slotNumber] = element.meta.price || 5.00;
        }
      });
      
      return slotPrices;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting slot prices:', error);
    return {};
  }
};

// Get all parking slots with their current status based on bookings
export const getParkingSlotsWithStatus = async (adminUid = null) => {
  try {
    // Get all bookings to determine slot statuses
    const bookings = await getBookingsFromFirestore();
    
    // Filter bookings by park ID if adminUid is provided
    const filteredBookings = adminUid 
      ? bookings.filter(booking => booking.parkId === adminUid)
      : bookings;
    
    // Get slot prices if adminUid is provided
    const slotPrices = adminUid ? await getSlotPrices(adminUid) : {};
    
    // Create a map of slot statuses based on bookings
    const slotStatusMap = {};
    
    filteredBookings.forEach(booking => {
      const slotId = booking.slotId;
      if (slotId) {
        // Determine status based on booking status
        let status = 'available';
        if (booking.status === 'approved' || booking.status === 'active') {
          status = 'occupied';
        } else if (booking.status === 'pending') {
          status = 'reserved';
        }
        // If cancelled or completed, slot becomes available again
        else if (booking.status === 'cancelled' || booking.status === 'completed') {
          status = 'available';
        }
        
        slotStatusMap[slotId] = {
          id: slotId,
          status: status,
          price: slotPrices[slotId] || 5.00, // Default price if not found
          bookingId: booking.id,
          customerName: booking.customerName,
          vehicleNumber: booking.vehicleNumber,
          checkInTime: booking.checkInTime,
          userEmail: booking.userEmail,
          parkId: booking.parkId,
          uniqueSlotId: booking.uniqueSlotId
        };
      }
    });
    
    // Generate all slots with new format (S1, S2, etc.)
    const allSlots = [];
    
    // Generate all 50 slots (S1 to S50) - same IDs for all parks
    for (let i = 1; i <= 50; i++) {
      const slotId = `S${i}`;
      if (slotStatusMap[slotId]) {
        allSlots.push(slotStatusMap[slotId]);
      } else {
        allSlots.push({
          id: slotId,
          status: 'available',
          price: slotPrices[slotId] || 5.00, // Default price if not found
          bookingId: null,
          customerName: null,
          vehicleNumber: null,
          checkInTime: null,
          userEmail: null,
          parkId: adminUid || null,
          uniqueSlotId: adminUid ? `${adminUid}_${slotId}` : null
        });
      }
    }
    
    return allSlots;
  } catch (error) {
    console.error('Error getting parking slots with status:', error);
    throw error;
  }
};

// Update slot status in Firestore
export const updateSlotStatus = async (slotId, status, bookingData = null) => {
  try {
    const slotRef = doc(db, SLOTS_COLLECTION, slotId.toString());
    const updateData = {
      status: status,
      updatedAt: serverTimestamp()
    };
    
    if (bookingData) {
      updateData.bookingId = bookingData.id;
      updateData.customerName = bookingData.customerName;
      updateData.vehicleNumber = bookingData.vehicleNumber;
      updateData.checkInTime = bookingData.checkInTime;
    }
    
    await updateDoc(slotRef, updateData);
    console.log('Slot status updated in Firestore:', slotId, status);
    
    return true;
  } catch (error) {
    console.error('Error updating slot status in Firestore:', error);
    throw error;
  }
};

// Get available slots only
export const getAvailableSlots = async (adminUid = null) => {
  try {
    const allSlots = await getParkingSlotsWithStatus(adminUid);
    return allSlots.filter(slot => slot.status === 'available');
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

// Get slots by status
export const getSlotsByStatus = async (status, adminUid = null) => {
  try {
    const allSlots = await getParkingSlotsWithStatus(adminUid);
    return allSlots.filter(slot => slot.status === status);
  } catch (error) {
    console.error('Error getting slots by status:', error);
    throw error;
  }
};

// Refresh slot statuses based on current bookings
export const refreshSlotStatuses = async (adminUid = null) => {
  try {
    const bookings = await getBookingsFromFirestore();
    
    // Filter bookings by park ID if adminUid is provided
    const filteredBookings = adminUid 
      ? bookings.filter(booking => booking.parkId === adminUid)
      : bookings;
      
    const slots = await getParkingSlotsWithStatus(adminUid);
    
    // Update each slot based on current bookings
    for (const slot of slots) {
      const slotBookings = filteredBookings.filter(booking => booking.slotId === slot.id);
      
      if (slotBookings.length === 0) {
        // No bookings for this slot, mark as available
        await updateSlotStatus(slot.id, 'available');
      } else {
        // Get the most recent booking for this slot
        const latestBooking = slotBookings.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        let status = 'available';
        if (latestBooking.status === 'approved' || latestBooking.status === 'active') {
          status = 'occupied';
        } else if (latestBooking.status === 'pending') {
          status = 'reserved';
        }
        
        await updateSlotStatus(slot.id, status, latestBooking);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error refreshing slot statuses:', error);
    throw error;
  }
};
