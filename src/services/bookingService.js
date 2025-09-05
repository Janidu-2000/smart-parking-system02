import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { generatePaymentFromBooking } from './paymentService';

const BOOKINGS_COLLECTION = 'bookings';

// Add a new booking to Firestore
export const addBookingToFirestore = async (bookingData) => {
  try {
    // Get current user email from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    
    console.log('Current auth user:', authUser);
    console.log('User email:', userEmail);
    
    if (!userEmail) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    const bookingDoc = {
      slotId: bookingData.slot.id,
      customerName: bookingData.customerName,
      phoneNumber: bookingData.phoneNumber,
      vehicleNumber: bookingData.vehicleNumber,
      vehicleType: bookingData.vehicleType,
      duration: bookingData.actualDuration || bookingData.duration,
      startDate: bookingData.effectiveStartDate,
      endDate: bookingData.effectiveEndDate,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      amount: (bookingData.actualDuration || bookingData.duration) * 200, // Rs.200 per hour
      status: "pending", // Changed from "active" to "pending" for admin approval
      notes: bookingData.notes || "",
      userEmail: userEmail, // Add user email to booking
      parkId: bookingData.parkId || authUser.uid, // Add park ID for uniquely identifying slots
      uniqueSlotId: `${bookingData.parkId || authUser.uid}_${bookingData.slot.id}`, // Create unique slot identifier
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingDoc);
    console.log('Booking added to Firestore with ID:', docRef.id);
    
    // Generate payment for this booking
    const bookingWithId = {
      id: docRef.id,
      ...bookingDoc
    };
    
    try {
      await generatePaymentFromBooking(bookingWithId);
      console.log('Payment generated for booking:', docRef.id);
    } catch (paymentError) {
      console.error('Error generating payment for booking:', paymentError);
      // Don't throw error here as booking was successful
    }
    
    return bookingWithId;
  } catch (error) {
    console.error('Error adding booking to Firestore:', error);
    throw error;
  }
};

// Get all bookings from Firestore for the current user
export const getBookingsFromFirestore = async () => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    console.log('Getting bookings for user:', userEmail, 'parkId:', parkId);
    
    if (!userEmail || !parkId) {
      console.log('No authenticated user found, returning empty bookings');
      return [];
    }
    
    // Query by parkId instead of userEmail to get all bookings for this parking lot
    const q = query(
      collection(db, BOOKINGS_COLLECTION), 
      where('parkId', '==', parkId)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        slotId: data.slotId,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        vehicleNumber: data.vehicleNumber,
        vehicleType: data.vehicleType,
        duration: data.duration,
        startDate: data.startDate,
        endDate: data.endDate,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        amount: data.amount,
        status: data.status,
        notes: data.notes,
        userEmail: data.userEmail,
        parkId: data.parkId || data.userEmail, // Include park ID, fallback to userEmail for backward compatibility
        uniqueSlotId: data.uniqueSlotId || `${data.parkId || data.userEmail}_${data.slotId}`, // Include unique slot ID
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });
    
    // Sort bookings by creation date (newest first)
    bookings.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('Found bookings:', bookings.length, bookings);
    return bookings;
  } catch (error) {
    console.error('Error getting bookings from Firestore:', error);
    throw error;
  }
};

// Update booking status in Firestore
export const updateBookingStatusInFirestore = async (bookingId, status) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    
    // First verify the booking belongs to the current parking lot
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data();
    if (bookingData.parkId !== parkId) {
      throw new Error('Unauthorized: Booking does not belong to current parking lot');
    }
    
    const updateData = {
      status: status,
      updatedAt: serverTimestamp()
    };
    
    if (status === "completed") {
      updateData.checkOutTime = new Date().toISOString();
    }
    
    await updateDoc(bookingRef, updateData);
    console.log('Booking status updated in Firestore:', bookingId, status);
    
    return true;
  } catch (error) {
    console.error('Error updating booking status in Firestore:', error);
    throw error;
  }
};

// Approve booking in Firestore
export const approveBookingInFirestore = async (bookingId) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    
    // First verify the booking belongs to the current parking lot
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data();
    if (bookingData.parkId !== parkId) {
      throw new Error('Unauthorized: Booking does not belong to current parking lot');
    }
    
    const updateData = {
      status: "approved",
      approvedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(bookingRef, updateData);
    console.log('Booking approved in Firestore:', bookingId);
    
    return true;
  } catch (error) {
    console.error('Error approving booking in Firestore:', error);
    throw error;
  }
};

// Update booking details in Firestore
export const updateBookingDetailsInFirestore = async (bookingId, bookingData) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    
    // First verify the booking belongs to the current parking lot
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingDataFromDB = bookingDoc.data();
    if (bookingDataFromDB.parkId !== parkId) {
      throw new Error('Unauthorized: Booking does not belong to current parking lot');
    }

    const updateData = {
      slotId: bookingData.slotId,
      customerName: bookingData.customerName,
      phoneNumber: bookingData.phoneNumber,
      vehicleNumber: bookingData.vehicleNumber,
      vehicleType: bookingData.vehicleType,
      duration: bookingData.duration,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      notes: bookingData.notes || "",
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(bookingRef, updateData);
    console.log('Booking details updated in Firestore:', bookingId);
    
    return true;
  } catch (error) {
    console.error('Error updating booking details in Firestore:', error);
    throw error;
  }
};

// Cancel booking in Firestore
export const cancelBookingInFirestore = async (bookingId) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    
    // First verify the booking belongs to the current parking lot
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data();
    if (bookingData.parkId !== parkId) {
      throw new Error('Unauthorized: Booking does not belong to current parking lot');
    }
    
    const updateData = {
      status: "cancelled",
      checkOutTime: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(bookingRef, updateData);
    console.log('Booking cancelled in Firestore:', bookingId);
    
    return true;
  } catch (error) {
    console.error('Error cancelling booking in Firestore:', error);
    throw error;
  }
};

// Get bookings by status for the current user
export const getBookingsByStatus = async (status) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      console.log('No authenticated user found, returning empty bookings');
      return [];
    }
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', status),
      where('parkId', '==', parkId)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });
    
    return bookings;
  } catch (error) {
    console.error('Error getting bookings by status from Firestore:', error);
    throw error;
  }
};

// Delete booking from Firestore
export const deleteBookingFromFirestore = async (bookingId) => {
  try {
    // Get current user from localStorage
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userEmail = authUser.email;
    const parkId = authUser.uid;
    
    if (!userEmail || !parkId) {
      throw new Error('User not authenticated');
    }
    
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    
    // First verify the booking belongs to the current parking lot
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data();
    if (bookingData.parkId !== parkId) {
      throw new Error('Unauthorized: Booking does not belong to current parking lot');
    }
    
    await deleteDoc(bookingRef);
    console.log('Booking deleted from Firestore:', bookingId);
    
    return true;
  } catch (error) {
    console.error('Error deleting booking from Firestore:', error);
    throw error;
  }
};
