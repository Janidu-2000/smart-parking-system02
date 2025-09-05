import React, { useState } from 'react';
import { Download, Search, FileText, Eye, X } from 'lucide-react';
import { updateBookingStatusInFirestore } from '../services/bookingService';
import { updateSlotStatus } from '../services/slotService';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useResponsive, getResponsiveStyles, getTabStyles } from '../utils/responsive';

const PaymentsPage = ({ payments = [], bookings = [], onRefreshData = null }) => {
  const screenSize = useResponsive();
  const responsiveStyles = getResponsiveStyles(screenSize);
  const tabStyles = getTabStyles(screenSize);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Modal handling functions
  const handleViewFullRecord = (payment) => {
    console.log('Opening modal for payment:', payment);
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal - showPaymentModal:', showPaymentModal, 'selectedPayment:', selectedPayment);
    setShowPaymentModal(false);
    setSelectedPayment(null);
    console.log('Modal closed successfully');
  };

  const handleMakePayment = (reservation) => {
    console.log('Make payment clicked for reservation:', reservation);
    console.log('Reservation ID:', reservation.id);
    console.log('Reservation slotId:', reservation.slotId);
    console.log('Reservation status:', reservation.status);
    console.log('Full reservation object:', JSON.stringify(reservation, null, 2));
    setSelectedReservation(reservation);
    setShowBillModal(true);
  };

  const handleCloseBillModal = () => {
    console.log('Close bill modal called');
    setShowBillModal(false);
    setSelectedReservation(null);
  };

  const handleProcessPayment = async () => {
    console.log('🔥 Process Payment button clicked!');
    console.log('🚀 Starting payment processing...');
    console.log('Selected reservation:', selectedReservation);
    console.log('Available bookings:', bookings.length);
    
    // Check if we have the required data
    if (!selectedReservation) {
      alert('❌ No reservation selected. Please try again.');
      return;
    }
    
    // Show initial confirmation
    const confirmPayment = window.confirm(
      `Process payment for ${selectedReservation.customerName}?\n\n` +
      `Slot: ${selectedReservation.slotId}\n` +
      `Amount: Rs.${selectedReservation.calculatedAmount || 0}\n\n` +
      `This will make the slot available for new bookings.`
    );
    
    if (!confirmPayment) {
      console.log('❌ Payment processing cancelled by user');
      return;
    }
    
    try {
      // Show loading state
      const processButton = document.querySelector('[data-process-payment]');
      if (processButton) {
        processButton.disabled = true;
        processButton.textContent = 'Processing...';
        console.log('✅ Button disabled and text changed');
      } else {
        console.warn('⚠️ Process button not found');
      }

      // Step 1: Update booking status to 'completed' (paid) in Firebase
      const bookingId = selectedReservation.id || selectedReservation.bookingId || selectedReservation._id;
      
      if (bookingId) {
        console.log('🔄 Updating booking status to completed for ID:', bookingId);
        
        try {
          // Direct Firebase update for booking
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, {
            status: 'completed',
            checkOutTime: new Date().toISOString(),
            paymentCompleted: true,
            paymentDate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Booking status updated to completed in Firebase');
        } catch (bookingError) {
          console.error('❌ Error updating booking in Firebase:', bookingError);
          // Fallback to service function
          await updateBookingStatusInFirestore(bookingId, 'completed');
          console.log('✅ Booking status updated using service fallback');
        }
      } else {
        console.warn('⚠️ No booking ID found in selectedReservation. Available fields:', Object.keys(selectedReservation));
        console.warn('⚠️ Full reservation object:', selectedReservation);
        
        // Try to find the booking by slot and customer info as fallback
        const matchingBooking = bookings.find(booking => 
          booking.slotId === selectedReservation.slotId && 
          booking.customerName === selectedReservation.customerName &&
          (booking.status === 'approved' || booking.status === 'Approved')
        );
        
        if (matchingBooking && (matchingBooking.id || matchingBooking.bookingId || matchingBooking._id)) {
          const fallbackId = matchingBooking.id || matchingBooking.bookingId || matchingBooking._id;
          console.log('Found matching booking with fallback ID:', fallbackId);
          
          try {
            // Direct Firebase update for fallback booking
            const bookingRef = doc(db, 'bookings', fallbackId);
            await updateDoc(bookingRef, {
              status: 'completed',
              checkOutTime: new Date().toISOString(),
              paymentCompleted: true,
              paymentDate: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            console.log('✅ Fallback booking status updated to completed in Firebase');
          } catch (fallbackError) {
            console.error('❌ Error updating fallback booking:', fallbackError);
            await updateBookingStatusInFirestore(fallbackId, 'completed');
            console.log('✅ Fallback booking status updated using service');
          }
        } else {
          throw new Error('Could not find booking ID to update. Please try again.');
        }
      }

      // Step 2: Update slot status to available in Firebase
      const slotId = selectedReservation.slotId;
      if (slotId) {
        console.log('🔄 Updating slot status to available for slot:', slotId);
        
        try {
          // Direct Firebase update for slot
          const slotRef = doc(db, 'parkingSlots', slotId);
          await updateDoc(slotRef, {
            status: 'available',
            bookingId: null,
            customerName: null,
            vehicleNumber: null,
            vehicleType: null,
            checkInTime: null,
            checkOutTime: new Date().toISOString(),
            userEmail: null,
            parkId: null,
            uniqueSlotId: null,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Slot status updated to available in Firebase');
          
          // Also try the service function as backup
          try {
            await updateSlotStatus(slotId, 'available', null);
            console.log('✅ Slot status also updated via service');
          } catch (serviceError) {
            console.warn('⚠️ Service update failed, but Firebase update succeeded:', serviceError);
          }
        } catch (slotError) {
          console.error('❌ Error updating slot in Firebase:', slotError);
          
          // Fallback to service function
          try {
            await updateSlotStatus(slotId, 'available', null);
            console.log('✅ Slot status updated using service fallback');
          } catch (serviceError) {
            console.error('❌ Both Firebase and service updates failed:', serviceError);
            // Continue with the process even if slot update fails
          }
        }
      } else {
        console.warn('⚠️ No slot ID found in selectedReservation');
      }

      // Step 3: Create payment record in paymentHistory collection
      try {
        console.log('🔄 Creating payment record in paymentHistory collection...');
        
        const paymentData = {
          // Booking Information
          bookingId: bookingId || selectedReservation.id || selectedReservation.bookingId || selectedReservation._id,
          
          // Customer Information
          customerName: selectedReservation.customerName || selectedReservation.name || 'N/A',
          driverName: selectedReservation.customerName || selectedReservation.name || 'N/A', // For compatibility
          phoneNumber: selectedReservation.phoneNumber || selectedReservation.phone || 'N/A',
          
          // Vehicle Information
          vehicleNumber: selectedReservation.vehicleNumber || 'N/A',
          vehicleType: selectedReservation.vehicleType || 'N/A',
          
          // Parking Information
          slotId: slotId || selectedReservation.slotId || selectedReservation.slot || 'N/A',
          
          // Time Information
          checkInTime: selectedReservation.checkInTime || selectedReservation.startTime || new Date().toISOString(),
          checkOutTime: new Date().toISOString(),
          duration: selectedReservation.activeTimeHours || selectedReservation.duration || 0,
          
          // Payment Information
          baseAmount: selectedReservation.amount || 0,
          overtimeAmount: selectedReservation.isOvertime ? (selectedReservation.overtimeHours * 300) : 0,
          totalAmount: selectedReservation.calculatedAmount || 0,
          amount: selectedReservation.calculatedAmount || 0, // For compatibility
          paymentMethod: 'Cash', // Default payment method
          paymentStatus: 'completed',
          status: 'completed', // For compatibility
          
          // Overtime Information
          isOvertime: selectedReservation.isOvertime || false,
          overtimeHours: selectedReservation.overtimeHours || 0,
          requestedDuration: selectedReservation.duration || 1,
          
          // System Information
          paymentDate: serverTimestamp(),
          date: serverTimestamp(), // For compatibility
          parkId: JSON.parse(localStorage.getItem('authUser') || '{}').uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const paymentRef = await addDoc(collection(db, 'paymentHistory'), paymentData);
        console.log('✅ Payment record created in paymentHistory with ID:', paymentRef.id);
        
        // Also save to payments collection for backward compatibility
        try {
          await addDoc(collection(db, 'payments'), paymentData);
          console.log('✅ Payment record also saved to payments collection');
        } catch (backupError) {
          console.warn('⚠️ Failed to save to payments collection:', backupError);
        }
        
      } catch (paymentError) {
        console.error('❌ Error creating payment record:', paymentError);
        // Continue with the process even if payment record creation fails
      }

      // Step 4: Refresh the main data to update UI
      if (onRefreshData && typeof onRefreshData === 'function') {
        console.log('Refreshing main data...');
        await onRefreshData();
        console.log('✅ Main data refreshed');
      } else {
        console.warn('⚠️ No refresh function provided');
      }

      // Step 5: Show success message
      const displaySlotId = selectedReservation.slotId || 'Unknown';
      console.log('🎉 Payment processing completed successfully!');
      alert(`✅ Payment processed successfully!\n\nSlot ${displaySlotId} is now available for new reservations.\n\nThe page will refresh to show updated data.`);
      
      // Step 6: Close modal
      setShowBillModal(false);
      setSelectedReservation(null);
      
      // Step 7: Refresh the page to ensure UI is updated
      setTimeout(() => {
        console.log('🔄 Refreshing page...');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      alert(`❌ Error processing payment: ${error.message}\n\nPlease try again or contact support.`);
      
      // Reset button state
      const processButton = document.querySelector('[data-process-payment]');
      if (processButton) {
        processButton.disabled = false;
        processButton.innerHTML = '💳 Process Payment';
      }
    }
  };

  // Download functionality
  const downloadPaymentsData = () => {
    const dataToExport = filteredCompletedPayments.map(payment => ({
      'Payment ID': payment.id || 'N/A',
      'Driver Name': payment.driverName || payment.customerName || 'N/A',
      'Phone Number': payment.phoneNumber || 'N/A',
      'Vehicle Type': payment.vehicleType || 'N/A',
      'Vehicle Number': payment.vehicleNumber || 'N/A',
      'Slot ID': payment.slotId || 'N/A',
      'Requested Duration (Hours)': payment.requestedDuration || payment.duration || 'N/A',
      'Overtime Hours': payment.overtimeHours || '0',
      'Is Overtime': payment.isOvertime ? 'Yes' : 'No',
      'Base Amount (Rs.)': payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00',
      'Overtime Amount (Rs.)': payment.overtimeAmount ? payment.overtimeAmount.toFixed(2) : '0.00',
      'Total Amount (Rs.)': payment.totalAmount ? payment.totalAmount.toFixed(2) : payment.amount ? payment.amount.toFixed(2) : '0.00',
      'Check-In Time': payment.checkInTime ? new Date(payment.checkInTime).toLocaleString() : 'N/A',
      'Check-Out Time': payment.checkOutTime ? new Date(payment.checkOutTime).toLocaleString() : 'N/A',
      'Payment Method': payment.paymentMethod || 'N/A',
      'Payment Date': payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : payment.date ? new Date(payment.date).toLocaleString() : 'N/A',
      'Booking ID': payment.bookingId || 'N/A',
      'Park ID': payment.parkId || 'N/A',
      'Status': payment.status || 'N/A'
    }));

    // Create CSV content
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter approved bookings for "Need to Payment" tab and calculate active time
  const approvedBookings = bookings.filter(booking => 
    booking.status === 'approved' || booking.status === 'Approved'
  ).map(booking => {
    // Calculate active time and amount
    const checkInTime = new Date(booking.checkInTime);
    const currentTime = new Date();
    const activeTimeHours = (currentTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
    
    // Calculate amount based on active time
    const baseRate = 200; // Rs.200 per hour
    const overtimeRate = 300; // Rs.300 per hour for overtime
    const requestedDuration = booking.duration || 1;
    
    let calculatedAmount = 0;
    if (activeTimeHours <= requestedDuration) {
      // Within requested time
      calculatedAmount = activeTimeHours * baseRate;
    } else {
      // Overtime
      const regularAmount = requestedDuration * baseRate;
      const overtimeHours = activeTimeHours - requestedDuration;
      const overtimeAmount = overtimeHours * overtimeRate;
      calculatedAmount = regularAmount + overtimeAmount;
    }
    
    return {
      ...booking,
      activeTimeHours: Math.round(activeTimeHours * 100) / 100, // Round to 2 decimal places
      calculatedAmount: Math.round(calculatedAmount * 100) / 100,
      currentCheckOutTime: currentTime.toISOString(),
      isOvertime: activeTimeHours > requestedDuration,
      overtimeHours: activeTimeHours > requestedDuration ? Math.round((activeTimeHours - requestedDuration) * 100) / 100 : 0
    };
  });

  // Filter and sort approved bookings
  const filteredApprovedBookings = approvedBookings
    .filter(booking => {
      const matchesSearch = 
        (booking.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.slot || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.startTime || 0);
          bValue = new Date(b.startTime || 0);
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Filter completed payments for "Payment Successful" tab - using ONLY paymentHistory collection data
  const completedPayments = payments.filter(payment => {
    // Only show payments that have the exact structure created in paymentHistory collection
    // These records are created via handleProcessPayment function and have specific field combinations
    return (
      // Must have paymentHistory-specific fields
      payment.paymentDate && 
      payment.bookingId && 
      payment.parkId &&
      // Must have the amount breakdown structure from paymentHistory
      (payment.baseAmount !== undefined || payment.totalAmount !== undefined) &&
      // Must have the overtime structure from paymentHistory
      (payment.isOvertime !== undefined && payment.overtimeHours !== undefined) &&
      // Must have the duration structure from paymentHistory
      payment.requestedDuration !== undefined &&
      // Must have the customer info structure from paymentHistory
      payment.driverName && payment.customerName && payment.phoneNumber &&
      // Must have the system timestamps from paymentHistory
      (payment.createdAt || payment.updatedAt)
    );
  });

  // Filter and sort completed payments
  const filteredCompletedPayments = completedPayments
    .filter(payment => {
      const matchesSearch = 
        (payment.driverName || payment.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.slotId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount || a.totalAmount || 0;
          bValue = b.amount || b.totalAmount || 0;
          break;
        case 'date':
          aValue = new Date(a.paymentDate || a.checkInTime || 0);
          bValue = new Date(b.paymentDate || b.checkInTime || 0);
          break;
        case 'name':
          aValue = (a.driverName || a.customerName || '').toLowerCase();
          bValue = (b.driverName || b.customerName || '').toLowerCase();
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Status badge style function
  const statusBadgeStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: responsiveStyles.th.fontSize,
    fontWeight: '500',
    backgroundColor: status === 'completed' ? '#dcfce7' : status === 'pending' ? '#fef3c7' : '#fee2e2',
    color: status === 'completed' ? '#166534' : status === 'pending' ? '#92400e' : '#dc2626',
    display: 'inline-block',
    minWidth: screenSize.isMobile ? 60 : 70,
    textAlign: 'center'
  });

  // Mobile card view for reservations
  const renderReservationMobileCard = (booking, index) => (
    <div key={index} style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s ease'
    }}>
      {/* Header Section */}
      <div style={{ 
    display: 'flex',
    justifyContent: 'space-between',
        alignItems: 'flex-start', 
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
            {booking.customerName || booking.name || 'N/A'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {booking.vehicleNumber || 'N/A'} • {booking.vehicleType || 'N/A'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 20, 
    fontWeight: 700,
            color: booking.isOvertime ? '#dc2626' : '#059669',
            marginBottom: 4
          }}>
            Rs.{booking.calculatedAmount ? booking.calculatedAmount.toFixed(2) : '0.00'}
          </div>
          {booking.isOvertime && (
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: 11,
              fontWeight: '600',
              backgroundColor: '#fef2f2',
              color: '#dc2626'
            }}>
              Overtime
            </div>
          )}
        </div>
      </div>
      
      {/* Important Details Only */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Slot</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#059669' }}>
            {booking.slotId || booking.slot || 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Phone</p>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1e293b' }}>
            {booking.phoneNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Active Time</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: booking.isOvertime ? '#dc2626' : '#059669' }}>
            {booking.activeTimeHours} hours
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Requested Duration</p>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1e293b' }}>
            {booking.duration ? `${booking.duration} hour${booking.duration > 1 ? 's' : ''}` : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
        <button
          onClick={() => handleViewFullRecord(booking)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: 13,
            fontWeight: '600',
            cursor: 'pointer',
    display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <Eye size={14} />
          View Full
        </button>
        <button
          onClick={() => handleMakePayment(booking)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#059669',
              color: 'white',
              border: 'none',
            borderRadius: '8px',
            fontSize: 13,
            fontWeight: '600',
              cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease',
            flex: 1
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
        >
          💳 Make Payment
        </button>
      </div>
    </div>
  );

  // Mobile card view for payments (simplified)
  const renderMobileCard = (payment, index) => (
    <div key={index} style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.2s ease'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
            {payment.driverName || payment.customerName || 'N/A'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {payment.vehicleNumber || 'N/A'} • {payment.vehicleType || 'N/A'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: payment.isOvertime ? '#dc2626' : '#059669',
            marginBottom: 4
          }}>
            Rs.{payment.totalAmount ? payment.totalAmount.toFixed(2) : payment.amount ? payment.amount.toFixed(2) : '0.00'}
          </div>
          {payment.isOvertime && (
            <div style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: 11,
              fontWeight: '600',
              backgroundColor: '#fef2f2',
              color: '#dc2626'
            }}>
              Overtime
            </div>
          )}
          <div style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: 11,
            fontWeight: '600',
            backgroundColor: payment.paymentMethod === 'Cash' ? '#fef3c7' : 
                           payment.paymentMethod === 'Credit Card' ? '#dbeafe' : 
                           payment.paymentMethod === 'Digital Wallet' ? '#f3e8ff' : '#f3f4f6',
            color: payment.paymentMethod === 'Cash' ? '#92400e' : 
                   payment.paymentMethod === 'Credit Card' ? '#1e40af' : 
                   payment.paymentMethod === 'Digital Wallet' ? '#7c3aed' : '#374151'
          }}>
            {payment.paymentMethod || 'N/A'}
          </div>
        </div>
      </div>
      
      {/* Important Details Only */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Payment ID</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#3b82f6', fontFamily: 'monospace' }}>
            {payment.id ? `#${payment.id.slice(-6)}` : 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Slot</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#059669' }}>
            {payment.slotId || 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Duration</p>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1e293b' }}>
            {payment.requestedDuration ? `${payment.requestedDuration} hour${payment.requestedDuration > 1 ? 's' : ''}` : payment.duration ? `${payment.duration} hour${payment.duration > 1 ? 's' : ''}` : 'N/A'}
          </p>
          {payment.isOvertime && (
            <p style={{ fontSize: 11, color: '#dc2626', margin: '2px 0 0 0', fontWeight: '500' }}>
              +{payment.overtimeHours}h overtime
            </p>
          )}
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Base Amount</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#059669' }}>
            Rs.{payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Payment Date</p>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1e293b' }}>
            {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* View Full Record Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => handleViewFullRecord(payment)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: 13,
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <Eye size={14} />
          View Full Record
        </button>
        </div>
    </div>
  );

  return (
    <div style={responsiveStyles.container}>
      {/* Header */}
      <div style={responsiveStyles.header}>
        <div>
          <h2 style={responsiveStyles.title}>Payment Records</h2>
          <p style={responsiveStyles.subtitle}>
            {activeTab === 'pending' 
              ? `${filteredApprovedBookings.length} of ${approvedBookings.length} approved reservation(s)`
              : `${filteredCompletedPayments.length} of ${completedPayments.length} completed payment(s)`
            }
          </p>
        </div>
        
        {/* Download Button */}
        <div style={responsiveStyles.buttonContainer}>
          <button
            onClick={downloadPaymentsData}
            style={{ ...responsiveStyles.button, backgroundColor: '#059669' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            disabled={filteredCompletedPayments.length === 0}
          >
            <FileText size={screenSize.isMobile ? 14 : 16} />
            {screenSize.isMobile ? 'Download' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabStyles.tabContainer}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            ...tabStyles.tab,
            ...(activeTab === 'pending' ? tabStyles.activeTab : {})
          }}
        >
          <span>Need to Payment</span>
          <span style={tabStyles.tabBadge}>
            {approvedBookings.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            ...tabStyles.tab,
            ...(activeTab === 'completed' ? tabStyles.activeTab : {})
          }}
        >
          <span>Payment Successful</span>
          <span style={tabStyles.tabBadge}>
            {completedPayments.length}
          </span>
        </button>
      </div>

      {/* Search and Filter */}
      <div style={responsiveStyles.searchContainer}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af' 
            }} 
          />
          <input
            type="text"
            placeholder={activeTab === 'pending' ? "Search by name, vehicle, or slot..." : "Search by name, vehicle, slot, or payment ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...responsiveStyles.input, paddingLeft: 40 }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={responsiveStyles.select}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={responsiveStyles.select}
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="name">Sort by Name</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '10px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        // Show approved reservations in "Need to Payment" tab
        filteredApprovedBookings.length === 0 ? (
          <div style={{ 
            color: '#6b7280', 
            textAlign: 'center', 
            padding: screenSize.isMobile ? 40 : 60,
            fontSize: screenSize.isMobile ? 14 : 16
          }}>
            {approvedBookings.length === 0 ? 'No approved reservations found.' : 'No approved reservations match your search criteria.'}
          </div>
        ) : (
          <div style={responsiveStyles.tableContainer}>
            {screenSize.isMobile ? (
              // Mobile card view for reservations
              <div style={{ padding: screenSize.isMobile ? 16 : 24 }}>
                {filteredApprovedBookings.map((booking, index) => renderReservationMobileCard(booking, index))}
              </div>
            ) : (
              // Desktop table view for reservations
              <div style={{ overflowX: 'auto' }}>
                <table style={responsiveStyles.table}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={responsiveStyles.th}>Customer</th>
                      <th style={responsiveStyles.th}>Vehicle</th>
                      <th style={responsiveStyles.th}>Slot</th>
                      <th style={responsiveStyles.th}>Active Time</th>
                      <th style={responsiveStyles.th}>Amount</th>
                      <th style={responsiveStyles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovedBookings.map((booking, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #f3f4f6', 
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}>
                        <td style={{ ...responsiveStyles.td, fontWeight: '500' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {booking.customerName || booking.name || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {booking.phoneNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td style={responsiveStyles.td}>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>
                              {booking.vehicleNumber || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                              {booking.vehicleType || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...responsiveStyles.td, fontWeight: '600', color: '#059669' }}>
                          {booking.slotId || booking.slot || 'N/A'}
                        </td>
                        <td style={{ ...responsiveStyles.td, fontWeight: '600', color: booking.isOvertime ? '#dc2626' : '#059669' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                              {booking.activeTimeHours} hours
                            </div>
                            {booking.isOvertime && (
                              <div style={{ fontSize: '11px', color: '#dc2626' }}>
                                +{booking.overtimeHours}h overtime
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...responsiveStyles.td, fontWeight: '700', color: booking.isOvertime ? '#dc2626' : '#059669', fontSize: '16px' }}>
                          Rs.{booking.calculatedAmount ? booking.calculatedAmount.toFixed(2) : '0.00'}
                        </td>
                        <td style={responsiveStyles.td}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewFullRecord(booking)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                              <Eye size={14} />
                              View Full
                            </button>
                            <button
                              onClick={() => handleMakePayment(booking)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
                            >
                              💳 Make Payment
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ) : (
        // Show completed payments in "Payment Successful" tab
        filteredCompletedPayments.length === 0 ? (
        <div style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          padding: screenSize.isMobile ? 40 : 60,
          fontSize: screenSize.isMobile ? 14 : 16
        }}>
          {completedPayments.length === 0 ? 'No completed payment records found.' : 'No completed payments match your search criteria.'}
        </div>
      ) : (
        <div style={responsiveStyles.tableContainer}>
          {screenSize.isMobile ? (
              // Mobile card view for payments
            <div style={{ padding: screenSize.isMobile ? 16 : 24 }}>
              {filteredCompletedPayments.map((payment, index) => renderMobileCard(payment, index))}
    </div>
    ) : (
              // Desktop table view for payments
        <div style={{ overflowX: 'auto' }}>
              <table style={responsiveStyles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                       <th style={responsiveStyles.th}>Payment ID</th>
                       <th style={responsiveStyles.th}>Customer</th>
                       <th style={responsiveStyles.th}>Vehicle</th>
                       <th style={responsiveStyles.th}>Slot</th>
                       <th style={responsiveStyles.th}>Duration</th>
                       <th style={responsiveStyles.th}>Base Amount</th>
                       <th style={responsiveStyles.th}>Overtime</th>
                    <th style={responsiveStyles.th}>Total Amount</th>
                    <th style={responsiveStyles.th}>Payment Method</th>
                       <th style={responsiveStyles.th}>Payment Date</th>
                       <th style={responsiveStyles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
                  {filteredCompletedPayments.map((payment, idx) => (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid #f3f4f6', 
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}>
                        <td style={{ ...responsiveStyles.td, fontWeight: '600', color: '#3b82f6', fontFamily: 'monospace' }}>
                          {payment.id ? `#${payment.id.slice(-6)}` : 'N/A'}
                        </td>
                        <td style={{ ...responsiveStyles.td, fontWeight: '500' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                    {payment.driverName || payment.customerName || 'N/A'}
                            </div>
                          </div>
                  </td>
                      <td style={responsiveStyles.td}>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>
                              {payment.vehicleNumber || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                    {payment.vehicleType || 'N/A'}
                            </div>
                          </div>
                  </td>
                                                 <td style={{ ...responsiveStyles.td, fontWeight: '600', color: '#059669' }}>
                    {payment.slotId || 'N/A'}
                  </td>
                  <td style={responsiveStyles.td}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1e293b' }}>
                        {payment.requestedDuration ? `${payment.requestedDuration} hour${payment.requestedDuration > 1 ? 's' : ''}` : payment.duration ? `${payment.duration} hour${payment.duration > 1 ? 's' : ''}` : 'N/A'}
                      </div>
                      {payment.isOvertime && (
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '500' }}>
                          +{payment.overtimeHours}h overtime
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ ...responsiveStyles.td, fontWeight: '600', color: '#059669', fontSize: '14px' }}>
                    Rs.{payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00'}
                  </td>
                  <td style={responsiveStyles.td}>
                    {payment.isOvertime ? (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>
                          Rs.{payment.overtimeAmount ? payment.overtimeAmount.toFixed(2) : '0.00'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#dc2626' }}>
                          {payment.overtimeHours}h
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>No overtime</div>
                    )}
                  </td>
                         <td style={{ ...responsiveStyles.td, fontWeight: '700', color: payment.isOvertime ? '#dc2626' : '#059669', fontSize: '16px' }}>
                           Rs.{payment.totalAmount ? payment.totalAmount.toFixed(2) : payment.amount ? payment.amount.toFixed(2) : '0.00'}
                  </td>
                      <td style={responsiveStyles.td}>
                           <span style={{
                             padding: '4px 8px',
                             borderRadius: '6px',
                             fontSize: '12px',
                             fontWeight: '500',
                             backgroundColor: payment.paymentMethod === 'Cash' ? '#fef3c7' : 
                                            payment.paymentMethod === 'Credit Card' ? '#dbeafe' : 
                                            payment.paymentMethod === 'Digital Wallet' ? '#f3e8ff' : '#f3f4f6',
                             color: payment.paymentMethod === 'Cash' ? '#92400e' : 
                                    payment.paymentMethod === 'Credit Card' ? '#1e40af' : 
                                    payment.paymentMethod === 'Digital Wallet' ? '#7c3aed' : '#374151'
                           }}>
                             {payment.paymentMethod || 'N/A'}
                           </span>
                  </td>
                      <td style={responsiveStyles.td}>
                           <div style={{ fontSize: '13px', fontWeight: '500' }}>
                             {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                           </div>
                  </td>
                      <td style={responsiveStyles.td}>
                           <button
                             onClick={() => handleViewFullRecord(payment)}
                             style={{
                               padding: '6px 12px',
                               backgroundColor: '#3b82f6',
                               color: 'white',
                               border: 'none',
                               borderRadius: '6px',
                               fontSize: '12px',
                               fontWeight: '500',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '4px',
                               transition: 'background-color 0.2s ease'
                             }}
                             onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                             onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                           >
                             <Eye size={14} />
                             View Full
                           </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
      </div>
         )
       )}

       {/* Payment Details Modal */}
       {console.log('Modal state:', { showPaymentModal, selectedPayment })}
       {showPaymentModal && selectedPayment && (
                    <div style={responsiveStyles.modal}
           onClick={() => {
             console.log('X button clicked');
             setShowPaymentModal(false);
             setSelectedPayment(null);
           }}
           >
           <div style={responsiveStyles.modalContent}
           onClick={(e) => e.stopPropagation()}
           >
             {/* Modal Header */}
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '24px',
               paddingBottom: '16px',
               borderBottom: '1px solid #e5e7eb'
             }}>
               <div>
                 <h2 style={{
                   fontSize: '24px',
                   fontWeight: '700',
                   color: '#1e293b',
                   margin: 0
                 }}>
                   {selectedPayment.id ? 'Payment Details' : 'Reservation Details'}
                 </h2>
                 <div style={{
                   fontSize: '12px',
                   color: '#6b7280',
                   marginTop: '4px'
                 }}>
                   Modal State: {showPaymentModal ? 'OPEN' : 'CLOSED'} | Selected: {selectedPayment ? 'YES' : 'NO'}
                 </div>
               </div>
               <button
                 onClick={() => {
                   console.log('X button clicked');
                   setShowPaymentModal(false);
                   setSelectedPayment(null);
                 }}
                 style={{
                   backgroundColor: 'transparent',
                   border: 'none',
                   cursor: 'pointer',
                   padding: '8px',
                   borderRadius: '6px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}
                 onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
               >
                 <X size={20} color="#6b7280" />
               </button>
             </div>

             {/* Details - Compact Layout */}
             <div style={{ 
               flex: 1, 
               display: 'grid', 
               gridTemplateColumns: '1fr 1fr', 
               gap: '16px',
               overflow: 'hidden'
             }}>
               {/* Left Column */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {/* Customer Info */}
                 <div style={{
                   backgroundColor: '#f8fafc',
                   padding: '12px',
                   borderRadius: '8px',
                   border: '1px solid #e2e8f0'
                 }}>
                   <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                     Customer Information
                   </h4>
                   <div style={{ display: 'grid', gap: '6px' }}>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Name: </span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                         {selectedPayment.driverName || selectedPayment.customerName || selectedPayment.name || 'N/A'}
                       </span>
                     </div>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Phone: </span>
                       <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                         {selectedPayment.phoneNumber || 'N/A'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Vehicle Info */}
                 <div style={{
                   backgroundColor: '#f0f9ff',
                   padding: '12px',
                   borderRadius: '8px',
                   border: '1px solid #bae6fd'
                 }}>
                   <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                     Vehicle Information
                   </h4>
                   <div style={{ display: 'grid', gap: '6px' }}>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Number: </span>
                       <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                         {selectedPayment.vehicleNumber || 'N/A'}
                       </span>
                     </div>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Type: </span>
                       <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                         {selectedPayment.vehicleType || 'N/A'}
                       </span>
                     </div>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Slot: </span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>
                         {selectedPayment.slotId || selectedPayment.slot || 'N/A'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Time Info */}
                 <div style={{
                   backgroundColor: '#fefce8',
                   padding: '12px',
                   borderRadius: '8px',
                   border: '1px solid #fde047'
                 }}>
                   <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                     Time Information
                   </h4>
                   <div style={{ display: 'grid', gap: '6px' }}>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Check-In: </span>
                       <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                         {selectedPayment.checkInTime ? new Date(selectedPayment.checkInTime).toLocaleString() : 'N/A'}
                       </span>
                     </div>
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                         {selectedPayment.id ? 'Check-Out:' : 'Check-Out (Current):'}
                       </span>
                       <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                         {selectedPayment.checkOutTime 
                           ? new Date(selectedPayment.checkOutTime).toLocaleString()
                           : selectedPayment.currentCheckOutTime 
                             ? new Date(selectedPayment.currentCheckOutTime).toLocaleString() 
                             : 'N/A'
                         }
                       </span>
                     </div>
                                            <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Requested Duration: </span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                          {selectedPayment.requestedDuration ? `${selectedPayment.requestedDuration} hour${selectedPayment.requestedDuration > 1 ? 's' : ''}` : selectedPayment.duration ? `${selectedPayment.duration} hour${selectedPayment.duration > 1 ? 's' : ''}` : 'N/A'}
                        </span>
                      </div>
                   </div>
                 </div>
               </div>

               {/* Right Column */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {/* Payment/Reservation Info */}
                 <div style={{
                   backgroundColor: selectedPayment.id ? '#f0fdf4' : '#fef2f2',
                   padding: '12px',
                   borderRadius: '8px',
                   border: selectedPayment.id ? '1px solid #bbf7d0' : '1px solid #fecaca'
                 }}>
                   <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                     {selectedPayment.id ? 'Payment Information' : 'Reservation Information'}
                   </h4>
                   <div style={{ display: 'grid', gap: '6px' }}>
                     {selectedPayment.id && (
                       <div>
                         <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Payment ID: </span>
                         <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', fontFamily: 'monospace' }}>
                           {selectedPayment.id || 'N/A'}
                         </span>
                       </div>
                     )}
                                           <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Base Amount: </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                          Rs.{selectedPayment.baseAmount ? selectedPayment.baseAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      {selectedPayment.isOvertime && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Overtime Amount: </span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
                            Rs.{selectedPayment.overtimeAmount ? selectedPayment.overtimeAmount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Amount: </span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: selectedPayment.isOvertime ? '#dc2626' : '#059669' }}>
                          Rs.{selectedPayment.totalAmount ? selectedPayment.totalAmount.toFixed(2) : selectedPayment.amount ? selectedPayment.amount.toFixed(2) : selectedPayment.calculatedAmount ? selectedPayment.calculatedAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                     {selectedPayment.id && (
                       <div>
                         <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Method: </span>
                         <span style={{
                           padding: '2px 6px',
                           borderRadius: '4px',
                           fontSize: '11px',
                           fontWeight: '600',
                           backgroundColor: selectedPayment.paymentMethod === 'Cash' ? '#fef3c7' : 
                                          selectedPayment.paymentMethod === 'Credit Card' ? '#dbeafe' : 
                                          selectedPayment.paymentMethod === 'Digital Wallet' ? '#f3e8ff' : '#f3f4f6',
                           color: selectedPayment.paymentMethod === 'Cash' ? '#92400e' : 
                                  selectedPayment.paymentMethod === 'Credit Card' ? '#1e40af' : 
                                  selectedPayment.paymentMethod === 'Digital Wallet' ? '#7c3aed' : '#374151'
                         }}>
                           {selectedPayment.paymentMethod || 'N/A'}
                         </span>
                       </div>
                     )}
                     {selectedPayment.isOvertime && (
                       <div>
                         <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Overtime: </span>
                         <span style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>
                           {selectedPayment.overtimeHours} hours
                         </span>
                       </div>
                     )}
                     <div>
                       <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                         {selectedPayment.id ? 'Payment Date:' : 'Active Time:'}
                       </span>
                       <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                         {selectedPayment.id 
                           ? (selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : 'N/A')
                           : `${selectedPayment.activeTimeHours} hours`
                         }
                       </span>
                     </div>
                                           {selectedPayment.bookingId && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Booking ID: </span>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                            {selectedPayment.bookingId}
                          </span>
                        </div>
                      )}
                      {selectedPayment.parkId && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Park ID: </span>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>
                            {selectedPayment.parkId}
                          </span>
                        </div>
                      )}
                   </div>
                 </div>

                 {/* Notes Section */}
                 {selectedPayment.notes && (
                   <div style={{
                     backgroundColor: '#f3f4f6',
                     padding: '12px',
                     borderRadius: '8px',
                     border: '1px solid #d1d5db'
                   }}>
                     <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                       Notes
                     </h4>
                     <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>
                       {selectedPayment.notes}
                     </p>
                   </div>
                 )}
               </div>
             </div>

             {/* Modal Footer */}
             <div style={{
               marginTop: '16px',
               paddingTop: '12px',
               borderTop: '1px solid #e5e7eb',
               display: 'flex',
               justifyContent: 'flex-end'
             }}>
               <button
                 onClick={() => {
                   console.log('X button clicked');
                   setShowPaymentModal(false);
                   setSelectedPayment(null);
                 }}
                 style={{
                   padding: '10px 20px',
                   backgroundColor: '#dc2626',
                   color: 'white',
                   border: 'none',
                   borderRadius: '6px',
                   fontSize: '14px',
                   fontWeight: '600',
                   cursor: 'pointer',
                   transition: 'background-color 0.2s ease',
                   minWidth: '80px'
                 }}
                 onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                 onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
               >
                 Close
               </button>
             </div>
           </div>
      </div>
    )}

    {/* Bill Modal for Payment */}
    {showBillModal && selectedReservation && (
      <div style={responsiveStyles.modal}
      onClick={() => {
        console.log('X button clicked');
        setShowBillModal(false);
        setSelectedReservation(null);
      }}
      >
        <div style={{
          ...responsiveStyles.modalContent,
          maxWidth: screenSize.isMobile ? '95vw' : '600px',
          maxHeight: screenSize.isMobile ? '90vh' : '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              💳 Payment Bill
            </h2>
            <button
              onClick={() => {
                console.log('X button clicked');
                setShowBillModal(false);
                setSelectedReservation(null);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>

          {/* Bill Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {/* Customer Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Name:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.customerName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Phone:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Vehicle Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Number:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.vehicleNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Type:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.vehicleType || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Parking Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Parking Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Slot:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.slotId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Active Time:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                    {selectedReservation.activeTimeHours ? `${selectedReservation.activeTimeHours.toFixed(1)} hours` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Payment Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Base Amount:</span>
                <span style={{ fontWeight: '600' }}>
                  Rs.{selectedReservation.amount ? selectedReservation.amount.toFixed(2) : '0.00'}
                </span>
              </div>
              {selectedReservation.isOvertime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#dc2626' }}>Overtime ({selectedReservation.overtimeHours?.toFixed(1)}h):</span>
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>
                    Rs.{selectedReservation.overtimeAmount ? selectedReservation.overtimeAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '2px solid #e5e7eb',
                fontSize: '18px',
                fontWeight: '700',
                color: '#059669'
              }}>
                <span>Total Amount:</span>
                <span>Rs.{selectedReservation.calculatedAmount ? selectedReservation.calculatedAmount.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => {
                console.log('X button clicked');
                setShowBillModal(false);
                setSelectedReservation(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              Cancel
            </button>
            <button
              onClick={handleProcessPayment}
              data-process-payment
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
            >
              💳 Process Payment
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default PaymentsPage;
