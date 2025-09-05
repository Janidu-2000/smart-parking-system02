import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Calculate payment amount based on occupied slots and duration
export const calculatePaymentAmount = (duration, ratePerHour = 200) => {
  return duration * ratePerHour;
};

// Add payment to Firestore
export const addPaymentToFirestore = async (paymentData) => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (!authUser.email || !authUser.uid) {
      throw new Error('No authenticated user found');
    }

    const paymentWithUser = {
      ...paymentData,
      userEmail: authUser.email,
      parkId: authUser.uid, // Add parkId for filtering
      createdAt: serverTimestamp(),
      amount: calculatePaymentAmount(paymentData.duration, 200) // Rs.200 per hour
    };

    console.log('Adding payment to Firestore:', paymentWithUser);
    const docRef = await addDoc(collection(db, 'payments'), paymentWithUser);
    console.log('Payment added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment to Firestore:', error);
    throw error;
  }
};

// Get payments from Firestore for logged-in user
export const getPaymentsFromFirestore = async () => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (!authUser.email || !authUser.uid) {
      console.log('No authenticated user found, returning empty payments');
      return [];
    }

    console.log('Fetching payments for user:', authUser.email, 'parkId:', authUser.uid);
    
    const allPayments = [];
    
    // Fetch from paymentHistory collection (primary source)
    try {
      console.log('Fetching from paymentHistory collection...');
      const paymentHistoryRef = collection(db, 'paymentHistory');
      const paymentHistoryQuery = query(paymentHistoryRef, where('parkId', '==', authUser.uid));
      const paymentHistorySnapshot = await getDocs(paymentHistoryQuery);
      
      paymentHistorySnapshot.forEach((doc) => {
        const payment = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          paymentDate: doc.data().paymentDate?.toDate?.() || doc.data().date?.toDate?.() || new Date(),
          source: 'paymentHistory'
        };
        allPayments.push(payment);
      });
      
      console.log('Fetched from paymentHistory:', paymentHistorySnapshot.size);
    } catch (paymentHistoryError) {
      console.warn('Error fetching from paymentHistory:', paymentHistoryError);
    }
    
    // Also fetch from payments collection for backward compatibility
    try {
      console.log('Fetching from payments collection...');
      const paymentsRef = collection(db, 'payments');
      const paymentsQuery = query(paymentsRef, where('parkId', '==', authUser.uid));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      paymentsSnapshot.forEach((doc) => {
        const payment = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          paymentDate: doc.data().paymentDate?.toDate?.() || doc.data().date?.toDate?.() || new Date(),
          source: 'payments'
        };
        allPayments.push(payment);
      });
      
      console.log('Fetched from payments:', paymentsSnapshot.size);
    } catch (paymentsError) {
      console.warn('Error fetching from payments:', paymentsError);
    }

    // Remove duplicates based on bookingId and slotId combination
    const uniquePayments = [];
    const seenCombinations = new Set();
    
    allPayments.forEach(payment => {
      const key = `${payment.bookingId || payment.id}_${payment.slotId}`;
      if (!seenCombinations.has(key)) {
        seenCombinations.add(key);
        uniquePayments.push(payment);
      } else {
        // If duplicate found, prefer paymentHistory over payments
        const existingIndex = uniquePayments.findIndex(p => 
          `${p.bookingId || p.id}_${p.slotId}` === key
        );
        if (existingIndex !== -1 && payment.source === 'paymentHistory' && uniquePayments[existingIndex].source === 'payments') {
          uniquePayments[existingIndex] = payment;
        }
      }
    });

    // Sort by creation date (newest first)
    uniquePayments.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log('Total unique payments fetched:', uniquePayments.length);
    return uniquePayments;
  } catch (error) {
    console.error('Error getting payments from Firestore:', error);
    return [];
  }
};

// Generate payment from booking
export const generatePaymentFromBooking = async (booking) => {
  try {
    const paymentData = {
      driverName: booking.customerName,
      vehicleType: booking.vehicleType,
      vehicleNumber: booking.vehicleNumber,
      slotId: booking.slotId,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      duration: booking.duration,
      paymentMethod: 'Cash', // Default payment method
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      notes: `Payment for booking #${booking.id}`,
      bookingId: booking.id
    };

    const paymentId = await addPaymentToFirestore(paymentData);
    console.log('Payment generated from booking:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('Error generating payment from booking:', error);
    throw error;
  }
};

// Generate payments for all existing bookings (for migration)
export const generatePaymentsForExistingBookings = async (bookings) => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (!authUser.email) {
      throw new Error('No authenticated user found');
    }

    console.log('Generating payments for existing bookings:', bookings.length);
    
    for (const booking of bookings) {
      console.log('Processing booking:', booking.id, 'with data:', {
        customerName: booking.customerName,
        vehicleType: booking.vehicleType,
        vehicleNumber: booking.vehicleNumber,
        slotId: booking.slotId
      });
      
      // Check if payment already exists for this booking
      const existingPayments = await getPaymentsFromFirestore();
      const paymentExists = existingPayments.some(payment => payment.bookingId === booking.id);
      
      if (!paymentExists) {
        try {
          await generatePaymentFromBooking(booking);
          console.log(`Payment generated for booking ${booking.id}`);
        } catch (error) {
          console.error(`Error generating payment for booking ${booking.id}:`, error);
        }
      } else {
        console.log(`Payment already exists for booking ${booking.id}`);
      }
    }
  } catch (error) {
    console.error('Error generating payments for existing bookings:', error);
    throw error;
  }
};

// Update existing payments with missing vehicle data from bookings
export const updatePaymentsWithVehicleData = async (bookings) => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (!authUser.email) {
      throw new Error('No authenticated user found');
    }

    console.log('Updating payments with vehicle data from bookings...');
    
    const existingPayments = await getPaymentsFromFirestore();
    
    for (const payment of existingPayments) {
      if (payment.bookingId) {
        const booking = bookings.find(b => b.id === payment.bookingId);
        if (booking) {
          // Check if payment is missing vehicle data
          if (!payment.vehicleType || !payment.vehicleNumber || !payment.driverName) {
            console.log(`Updating payment ${payment.id} with vehicle data from booking ${booking.id}`);
            
            // Update the payment document in Firestore
            const paymentRef = doc(db, 'payments', payment.id);
            await updateDoc(paymentRef, {
              driverName: booking.customerName,
              vehicleType: booking.vehicleType,
              vehicleNumber: booking.vehicleNumber,
              slotId: booking.slotId,
              checkInTime: booking.checkInTime,
              checkOutTime: booking.checkOutTime,
              duration: booking.duration,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating payments with vehicle data:', error);
    throw error;
  }
};
