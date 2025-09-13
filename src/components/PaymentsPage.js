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
          activeTimeHours: selectedReservation.activeTimeHours || 0,
          
          // Payment Information
          baseAmount: selectedReservation.amount || 0,
          regularAmount: selectedReservation.regularAmount || 0,
          overtimeAmount: selectedReservation.isOvertime ? (selectedReservation.overtimeHours * 300) : 0,
          totalAmount: selectedReservation.calculatedAmount || 0,
          amount: selectedReservation.calculatedAmount || 0, // For compatibility
          paymentMethod: 'Cash', // Default payment method
          paymentStatus: 'completed',
          status: 'completed', // For compatibility
          
          // Overtime Information
          isOvertime: selectedReservation.isOvertime || false,
          overtimeHours: selectedReservation.overtimeHours || 0,
          requestedDuration: selectedReservation.requestedDuration || selectedReservation.duration || 1,
          
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
      'Active Time (Hours)': payment.activeTimeHours ? payment.activeTimeHours.toFixed(2) : 'N/A',
      'Overtime Hours': payment.overtimeHours || '0',
      'Is Overtime': payment.isOvertime ? 'Yes' : 'No',
      'Reservation Amount (Rs.)': payment.regularAmount ? payment.regularAmount.toFixed(2) : (payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00'),
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

  // Filter approved bookings for "Need to Payment" tab and calculate charges
  const approvedBookings = bookings.filter(booking => 
    booking.status === 'approved' || booking.status === 'Approved'
  ).map(booking => {
    // Use approval time (actualCheckInTime) for duration calculation instead of checkInTime
    const approvalTime = booking.actualCheckInTime || booking.approvedAt || booking.checkInTime;
    const currentTime = new Date();
    const activeTimeHours = (currentTime - new Date(approvalTime)) / (1000 * 60 * 60); // Convert to hours
    
    // Calculate charges: Customer pays FULL reservation duration + overtime
    const baseRate = 200; // Rs.200 per hour
    const overtimeRate = 300; // Rs.300 per hour for overtime
    const requestedDuration = booking.duration || 1;
    
    // Customer always pays for the FULL requested duration
    const regularAmount = requestedDuration * baseRate;
    let overtimeAmount = 0;
    let overtimeHours = 0;
    let isOvertime = false;
    
    if (activeTimeHours > requestedDuration) {
      // Overtime - charge additional overtime rate
      isOvertime = true;
      overtimeHours = activeTimeHours - requestedDuration;
      overtimeAmount = overtimeHours * overtimeRate;
    }
    
    const calculatedAmount = regularAmount + overtimeAmount;
    
    return {
      ...booking,
      activeTimeHours: Math.round(activeTimeHours * 100) / 100, // Round to 2 decimal places
      calculatedAmount: Math.round(calculatedAmount * 100) / 100,
      regularAmount: Math.round(regularAmount * 100) / 100,
      overtimeAmount: Math.round(overtimeAmount * 100) / 100,
      currentCheckOutTime: currentTime.toISOString(),
      isOvertime: isOvertime,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      requestedDuration: requestedDuration,
      approvalTime: approvalTime // Store the approval time for reference
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
                                padding: screenSize.isMobile ? '6px 12px' : '8px 16px',
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
                                padding: screenSize.isMobile ? '6px 12px' : '8px 16px',
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
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Active Time</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: payment.isOvertime ? '#dc2626' : '#059669' }}>
            {payment.activeTimeHours ? `${payment.activeTimeHours.toFixed(1)}h` : 'N/A'}
          </p>
          {payment.isOvertime && (
            <p style={{ fontSize: 10, color: '#dc2626', margin: '2px 0 0 0', fontWeight: '500' }}>
              Actual usage
            </p>
          )}
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px 0', fontWeight: '500' }}>Reservation Amount</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#059669' }}>
            Rs.{payment.regularAmount ? payment.regularAmount.toFixed(2) : (payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00')}
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
                                padding: screenSize.isMobile ? '6px 12px' : '8px 16px',
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
    <div style={{
      ...responsiveStyles.container,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Professional Header */}
      <div style={{
        ...responsiveStyles.header,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: screenSize.isMobile ? '16px 20px' : screenSize.isSmallTablet ? '20px 24px' : '24px 32px',
        borderRadius: screenSize.isMobile ? '12px' : '16px',
        marginBottom: screenSize.isMobile ? '16px' : '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <h2 style={{
            ...responsiveStyles.title,
            color: 'white',
            fontSize: screenSize.isMobile ? '20px' : screenSize.isSmallTablet ? '24px' : '28px',
            fontWeight: '700',
            marginBottom: screenSize.isMobile ? '6px' : '8px',
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💳 Payment Management
          </h2>
          <p style={{
            ...responsiveStyles.subtitle,
            color: 'rgba(255,255,255,0.8)',
            fontSize: screenSize.isMobile ? '13px' : screenSize.isSmallTablet ? '14px' : '16px',
            fontWeight: '500'
          }}>
            {activeTab === 'pending' 
              ? `${filteredApprovedBookings.length} of ${approvedBookings.length} pending payment(s)`
              : `${filteredCompletedPayments.length} of ${completedPayments.length} completed payment(s)`
            }
          </p>
        </div>
        
        {/* Professional Download Button */}
        <div style={responsiveStyles.buttonContainer}>
          <button
            onClick={downloadPaymentsData}
            style={{
              ...responsiveStyles.button,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              padding: screenSize.isMobile ? '10px 16px' : '12px 24px',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              fontSize: screenSize.isMobile ? '13px' : '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: screenSize.isMobile ? '6px' : '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
            }}
            disabled={filteredCompletedPayments.length === 0}
          >
            <FileText size={screenSize.isMobile ? 14 : 16} />
            {screenSize.isMobile ? 'Download' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div style={{
        ...tabStyles.tabContainer,
        background: 'white',
        borderRadius: screenSize.isMobile ? '12px' : '16px',
        padding: screenSize.isMobile ? '6px' : '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: screenSize.isMobile ? '16px' : '24px'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            ...tabStyles.tab,
            background: activeTab === 'pending' 
              ? 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)' 
              : 'transparent',
            color: activeTab === 'pending' ? '#92400e' : '#64748b',
            border: activeTab === 'pending' ? '1px solid #f59e0b' : '1px solid transparent',
            borderRadius: screenSize.isMobile ? '8px' : '12px',
            padding: screenSize.isMobile ? '10px 16px' : '12px 20px',
            fontWeight: '600',
            fontSize: screenSize.isMobile ? '13px' : '14px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'pending' ? '0 2px 8px rgba(245, 158, 11, 0.2)' : 'none'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⏳ Pending Payments
            <span style={{
              ...tabStyles.tabBadge,
              background: activeTab === 'pending' ? '#92400e' : '#e2e8f0',
              color: activeTab === 'pending' ? 'white' : '#64748b',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              padding: screenSize.isMobile ? '2px 6px' : '2px 8px',
              fontSize: screenSize.isMobile ? '11px' : '12px',
              fontWeight: '700'
            }}>
            {approvedBookings.length}
            </span>
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            ...tabStyles.tab,
            background: activeTab === 'completed' 
              ? 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)' 
              : 'transparent',
            color: activeTab === 'completed' ? '#166534' : '#64748b',
            border: activeTab === 'completed' ? '1px solid #22c55e' : '1px solid transparent',
            borderRadius: screenSize.isMobile ? '8px' : '12px',
            padding: screenSize.isMobile ? '10px 16px' : '12px 20px',
            fontWeight: '600',
            fontSize: screenSize.isMobile ? '13px' : '14px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'completed' ? '0 2px 8px rgba(34, 197, 94, 0.2)' : 'none'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ Completed Payments
            <span style={{
              ...tabStyles.tabBadge,
              background: activeTab === 'completed' ? '#166534' : '#e2e8f0',
              color: activeTab === 'completed' ? 'white' : '#64748b',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              padding: screenSize.isMobile ? '2px 6px' : '2px 8px',
              fontSize: screenSize.isMobile ? '11px' : '12px',
              fontWeight: '700'
            }}>
            {completedPayments.length}
            </span>
          </span>
        </button>
      </div>

      {/* Professional Search and Filter */}
      <div style={{
        ...responsiveStyles.searchContainer,
        background: 'white',
        borderRadius: screenSize.isMobile ? '12px' : '16px',
        padding: screenSize.isMobile ? '16px' : '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: screenSize.isMobile ? '16px' : '24px'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={screenSize.isMobile ? 16 : 18} 
            style={{ 
              position: 'absolute', 
              left: screenSize.isMobile ? 12 : 16, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#6b7280' 
            }} 
          />
          <input
            type="text"
            placeholder={activeTab === 'pending' ? "🔍 Search by name, vehicle, or slot..." : "🔍 Search by name, vehicle, slot, or payment ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              ...responsiveStyles.input, 
              paddingLeft: screenSize.isMobile ? 40 : 48,
              padding: screenSize.isMobile ? '12px 14px 12px 40px' : '14px 16px 14px 48px',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              border: '2px solid #e2e8f0',
              fontSize: screenSize.isMobile ? '13px' : '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              background: '#f8fafc'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.background = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            ...responsiveStyles.select,
            padding: screenSize.isMobile ? '12px 14px' : '14px 16px',
            borderRadius: screenSize.isMobile ? '8px' : '12px',
            border: '2px solid #e2e8f0',
            fontSize: screenSize.isMobile ? '13px' : '14px',
            fontWeight: '500',
            background: '#f8fafc',
            transition: 'all 0.3s ease'
          }}
        >
          <option value="all">📊 All Status</option>
          <option value="completed">✅ Completed</option>
          <option value="pending">⏳ Pending</option>
          <option value="failed">❌ Failed</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            ...responsiveStyles.select,
            padding: screenSize.isMobile ? '12px 14px' : '14px 16px',
            borderRadius: screenSize.isMobile ? '8px' : '12px',
            border: '2px solid #e2e8f0',
            fontSize: screenSize.isMobile ? '13px' : '14px',
            fontWeight: '500',
            background: '#f8fafc',
            transition: 'all 0.3s ease'
          }}
        >
          <option value="date">📅 Sort by Date</option>
          <option value="amount">💰 Sort by Amount</option>
          <option value="name">👤 Sort by Name</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: screenSize.isMobile ? '12px 14px' : '14px 16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: screenSize.isMobile ? '8px' : '12px',
            cursor: 'pointer',
            fontSize: screenSize.isMobile ? '14px' : '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            minWidth: screenSize.isMobile ? '40px' : '50px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
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
            background: 'white',
            borderRadius: '16px',
            padding: screenSize.isMobile ? 40 : 60,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ 
              color: '#374151', 
              fontSize: screenSize.isMobile ? 18 : 24,
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {approvedBookings.length === 0 ? 'No Pending Payments' : 'No Matching Results'}
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: screenSize.isMobile ? 14 : 16,
              margin: 0
            }}>
              {approvedBookings.length === 0 
                ? 'All payments have been processed successfully.' 
                : 'Try adjusting your search criteria to find pending payments.'
              }
            </p>
          </div>
        ) : (
          <div style={{
            ...responsiveStyles.tableContainer,
            background: 'white',
            borderRadius: screenSize.isMobile ? '12px' : '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {screenSize.isMobile ? (
              // Mobile card view for reservations
              <div style={{ padding: screenSize.isMobile ? 16 : 24 }}>
                {filteredApprovedBookings.map((booking, index) => renderReservationMobileCard(booking, index))}
              </div>
            ) : (
              // Professional Desktop table view for reservations
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  ...responsiveStyles.table,
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderBottom: '2px solid #cbd5e1'
                    }}>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderRight: '1px solid #e2e8f0'
                      }}>👤 Customer</th>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderRight: '1px solid #e2e8f0'
                      }}>🚗 Vehicle</th>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderRight: '1px solid #e2e8f0'
                      }}>🅿️ Slot</th>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderRight: '1px solid #e2e8f0'
                      }}>⏱️ Active Time</th>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderRight: '1px solid #e2e8f0'
                      }}>💰 Amount</th>
                      <th style={{
                        ...responsiveStyles.th,
                        padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '700',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>⚡ Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovedBookings.map((booking, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #f1f5f9', 
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <td style={{ 
                          ...responsiveStyles.td, 
                          padding: screenSize.isMobile ? '12px 16px' : '16px 20px',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1e293b',
                              fontSize: screenSize.isMobile ? '13px' : '14px',
                              marginBottom: '4px'
                            }}>
                              {booking.customerName || booking.name || 'N/A'}
                            </div>
                            <div style={{ 
                              fontSize: screenSize.isMobile ? '11px' : '12px', 
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              📞 {booking.phoneNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          ...responsiveStyles.td,
                          padding: '16px 20px',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1e293b',
                              fontSize: screenSize.isMobile ? '13px' : '14px',
                              marginBottom: '4px'
                            }}>
                              {booking.vehicleNumber || 'N/A'}
                            </div>
                            <div style={{ 
                              fontSize: screenSize.isMobile ? '11px' : '12px', 
                              color: '#64748b', 
                              textTransform: 'capitalize',
                              fontWeight: '500'
                            }}>
                              🚗 {booking.vehicleType || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          ...responsiveStyles.td, 
                          fontWeight: '700', 
                          color: '#059669',
                          padding: '16px 20px',
                          borderRight: '1px solid #f1f5f9',
                          fontSize: '16px'
                        }}>
                          🅿️ {booking.slotId || booking.slot || 'N/A'}
                        </td>
                        <td style={{ 
                          ...responsiveStyles.td, 
                          fontWeight: '600', 
                          color: booking.isOvertime ? '#dc2626' : '#059669',
                          padding: '16px 20px',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          <div>
                            <div style={{ 
                              fontSize: screenSize.isMobile ? '13px' : '14px', 
                              fontWeight: '700',
                              marginBottom: '2px'
                            }}>
                              ⏱️ {booking.activeTimeHours} hours
                            </div>
                            {booking.isOvertime && (
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#dc2626',
                                fontWeight: '600',
                                background: '#fef2f2',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}>
                                ⚠️ +{booking.overtimeHours}h overtime
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ 
                          ...responsiveStyles.td, 
                          fontWeight: '700', 
                          color: booking.isOvertime ? '#dc2626' : '#059669', 
                          fontSize: '18px',
                          padding: '16px 20px',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          💰 Rs.{booking.calculatedAmount ? booking.calculatedAmount.toFixed(2) : '0.00'}
                        </td>
                        <td style={{ 
                          ...responsiveStyles.td,
                          padding: '16px 20px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewFullRecord(booking)}
                              style={{
                                padding: '8px 12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: screenSize.isMobile ? '11px' : '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              onClick={() => handleMakePayment(booking)}
                              style={{
                                padding: '8px 12px',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: screenSize.isMobile ? '11px' : '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.3)';
                              }}
                            >
                              💳 Pay
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
          background: 'white',
          borderRadius: '16px',
          padding: screenSize.isMobile ? 40 : 60,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ 
            color: '#374151', 
            fontSize: screenSize.isMobile ? 18 : 24,
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            {completedPayments.length === 0 ? 'No Payment Records' : 'No Matching Results'}
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: screenSize.isMobile ? 14 : 16,
            margin: 0
          }}>
            {completedPayments.length === 0 
              ? 'Payment records will appear here once transactions are completed.' 
              : 'Try adjusting your search criteria to find payment records.'
            }
          </p>
        </div>
      ) : (
        <div style={{
          ...responsiveStyles.tableContainer,
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {screenSize.isMobile ? (
              // Mobile card view for payments
            <div style={{ padding: screenSize.isMobile ? 16 : 24 }}>
              {filteredCompletedPayments.map((payment, index) => renderMobileCard(payment, index))}
    </div>
    ) : (
              // Professional Desktop table view for payments
        <div style={{ overflowX: 'auto' }}>
              <table style={{
                ...responsiveStyles.table,
                borderCollapse: 'separate',
                borderSpacing: 0
              }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: '2px solid #bbf7d0'
              }}>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>👤 Customer</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>🚗 Vehicle</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>🅿️ Slot</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>⏱️ Duration</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>⏰ Active Time</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>💰 Reservation Amount</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>⚠️ Overtime</th>
                    <th style={{
                      ...responsiveStyles.th,
                      padding: '16px 20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#166534',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderRight: '1px solid #bbf7d0'
                    }}>💳 Total Amount</th>
                    <th style={{
                      ...responsiveStyles.th,
                      padding: '16px 20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#166534',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderRight: '1px solid #bbf7d0'
                    }}>💳 Method</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px',
                         borderRight: '1px solid #bbf7d0'
                       }}>📅 Payment Date</th>
                       <th style={{
                         ...responsiveStyles.th,
                         padding: '16px 20px',
                         fontSize: '14px',
                         fontWeight: '700',
                         color: '#166534',
                         textTransform: 'uppercase',
                         letterSpacing: '0.5px'
                       }}>⚡ Action</th>
              </tr>
            </thead>
            <tbody>
                  {filteredCompletedPayments.map((payment, idx) => (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                        <td style={{ 
                          ...responsiveStyles.td, 
                          fontWeight: '500',
                          padding: '16px 20px',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1e293b',
                              fontSize: '14px'
                            }}>
                              👤 {payment.driverName || payment.customerName || 'N/A'}
                            </div>
                          </div>
                  </td>
                      <td style={{
                        ...responsiveStyles.td,
                        padding: '16px 20px',
                        borderRight: '1px solid #f1f5f9'
                      }}>
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1e293b',
                              fontSize: screenSize.isMobile ? '13px' : '14px',
                              marginBottom: '4px'
                            }}>
                              {payment.vehicleNumber || 'N/A'}
                            </div>
                            <div style={{ 
                              fontSize: screenSize.isMobile ? '11px' : '12px', 
                              color: '#64748b', 
                              textTransform: 'capitalize',
                              fontWeight: '500'
                            }}>
                              🚗 {payment.vehicleType || 'N/A'}
                            </div>
                          </div>
                  </td>
                                                 <td style={{ 
                                                   ...responsiveStyles.td, 
                                                   fontWeight: '700', 
                                                   color: '#059669',
                                                   padding: '16px 20px',
                                                   borderRight: '1px solid #f1f5f9',
                                                   fontSize: '16px'
                                                 }}>
                    🅿️ {payment.slotId || 'N/A'}
                  </td>
                  <td style={{
                    ...responsiveStyles.td,
                    padding: '16px 20px',
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>
                        ⏱️ {payment.requestedDuration ? `${payment.requestedDuration} hour${payment.requestedDuration > 1 ? 's' : ''}` : payment.duration ? `${payment.duration} hour${payment.duration > 1 ? 's' : ''}` : 'N/A'}
                      </div>
                      {payment.isOvertime && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#dc2626', 
                          fontWeight: '600',
                          background: '#fef2f2',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          ⚠️ +{payment.overtimeHours}h overtime
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{
                    ...responsiveStyles.td,
                    padding: '16px 20px',
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: payment.isOvertime ? '#dc2626' : '#059669',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ⏰ {payment.activeTimeHours ? `${payment.activeTimeHours.toFixed(1)}h` : 'N/A'}
                    </div>
                    {payment.isOvertime && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#dc2626', 
                        fontWeight: '600',
                        marginTop: '2px'
                      }}>
                        Actual usage
                      </div>
                    )}
                  </td>
                  <td style={{ 
                    ...responsiveStyles.td, 
                    fontWeight: '700', 
                    color: '#059669', 
                    fontSize: '16px',
                    padding: '16px 20px',
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    💰 Rs.{payment.regularAmount ? payment.regularAmount.toFixed(2) : (payment.baseAmount ? payment.baseAmount.toFixed(2) : '0.00')}
                  </td>
                  <td style={{
                    ...responsiveStyles.td,
                    padding: '16px 20px',
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    {payment.isOvertime ? (
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700', 
                          color: '#dc2626',
                          marginBottom: '2px'
                        }}>
                          ⚠️ Rs.{payment.overtimeAmount ? payment.overtimeAmount.toFixed(2) : '0.00'}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#dc2626',
                          fontWeight: '600'
                        }}>
                          {payment.overtimeHours}h
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                                fontSize: screenSize.isMobile ? '11px' : '12px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>✅ No overtime</div>
                    )}
                  </td>
                         <td style={{ 
                           ...responsiveStyles.td, 
                           fontWeight: '700', 
                           color: payment.isOvertime ? '#dc2626' : '#059669', 
                           fontSize: '18px',
                           padding: '16px 20px',
                           borderRight: '1px solid #f1f5f9'
                         }}>
                           💳 Rs.{payment.totalAmount ? payment.totalAmount.toFixed(2) : payment.amount ? payment.amount.toFixed(2) : '0.00'}
                  </td>
                      <td style={{
                        ...responsiveStyles.td,
                        padding: '16px 20px',
                        borderRight: '1px solid #f1f5f9'
                      }}>
                           <span style={{
                             padding: '6px 12px',
                             borderRadius: '8px',
                                fontSize: screenSize.isMobile ? '11px' : '12px',
                             fontWeight: '600',
                             backgroundColor: payment.paymentMethod === 'Cash' ? '#fef3c7' : 
                                            payment.paymentMethod === 'Credit Card' ? '#dbeafe' : 
                                            payment.paymentMethod === 'Digital Wallet' ? '#f3e8ff' : '#f3f4f6',
                             color: payment.paymentMethod === 'Cash' ? '#92400e' : 
                                    payment.paymentMethod === 'Credit Card' ? '#1e40af' : 
                                    payment.paymentMethod === 'Digital Wallet' ? '#7c3aed' : '#374151',
                             border: '1px solid',
                             borderColor: payment.paymentMethod === 'Cash' ? '#f59e0b' : 
                                        payment.paymentMethod === 'Credit Card' ? '#3b82f6' : 
                                        payment.paymentMethod === 'Digital Wallet' ? '#8b5cf6' : '#d1d5db'
                           }}>
                             💳 {payment.paymentMethod || 'N/A'}
                           </span>
                  </td>
                      <td style={{
                        ...responsiveStyles.td,
                        padding: '16px 20px',
                        borderRight: '1px solid #f1f5f9'
                      }}>
                           <div style={{ 
                             fontSize: '13px', 
                             fontWeight: '600',
                             color: '#1e293b'
                           }}>
                             📅 {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                           </div>
                  </td>
                      <td style={{
                        ...responsiveStyles.td,
                        padding: '16px 20px'
                      }}>
                           <button
                             onClick={() => handleViewFullRecord(payment)}
                             style={{
                               padding: '8px 12px',
                               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                               color: 'white',
                               border: 'none',
                               borderRadius: '8px',
                               fontSize: screenSize.isMobile ? '11px' : '12px',
                               fontWeight: '600',
                               cursor: 'pointer',
                               display: 'flex',
                               alignItems: 'center',
                               gap: '4px',
                               transition: 'all 0.3s ease',
                               boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                             }}
                             onMouseEnter={(e) => {
                               e.target.style.transform = 'translateY(-2px)';
                               e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                             }}
                             onMouseLeave={(e) => {
                               e.target.style.transform = 'translateY(0)';
                               e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                             }}
                           >
                             <Eye size={14} />
                             View
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

       {/* Professional Payment Details Modal */}
       {showPaymentModal && selectedPayment && (
                    <div style={{
                      ...responsiveStyles.modal,
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(8px)'
                    }}
           onClick={() => {
             setShowPaymentModal(false);
             setSelectedPayment(null);
           }}
           >
           <div style={{
             ...responsiveStyles.modalContent,
             background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
             borderRadius: screenSize.isMobile ? '16px' : '20px',
             boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             maxWidth: screenSize.isMobile ? '95vw' : screenSize.isSmallTablet ? '90vw' : '900px',
             maxHeight: '95vh',
             overflow: 'visible'
           }}
           onClick={(e) => e.stopPropagation()}
           >
             {/* Professional Modal Header */}
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: screenSize.isMobile ? '20px' : '32px',
               paddingBottom: screenSize.isMobile ? '16px' : '20px',
               borderBottom: '2px solid #e2e8f0',
               background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
               margin: screenSize.isMobile ? '-16px -16px 16px -16px' : '-24px -24px 24px -24px',
               padding: screenSize.isMobile ? '16px' : '24px',
               borderRadius: screenSize.isMobile ? '16px 16px 0 0' : '20px 20px 0 0'
             }}>
               <div>
                 <h2 style={{
                   fontSize: screenSize.isMobile ? '20px' : screenSize.isSmallTablet ? '24px' : '28px',
                   fontWeight: '700',
                   color: 'white',
                   margin: 0,
                   display: 'flex',
                   alignItems: 'center',
                   gap: screenSize.isMobile ? '8px' : '12px'
                 }}>
                   {selectedPayment.id ? '💳 Payment Details' : '📋 Reservation Details'}
                 </h2>
                 <div style={{
                   fontSize: screenSize.isMobile ? '12px' : '14px',
                   color: 'rgba(255, 255, 255, 0.8)',
                   marginTop: '8px',
                   fontWeight: '500'
                 }}>
                   {selectedPayment.id ? 'Completed Payment Record' : 'Pending Payment Request'}
                 </div>
               </div>
               <button
                 onClick={() => {
                   setShowPaymentModal(false);
                   setSelectedPayment(null);
                 }}
                 style={{
                   backgroundColor: 'rgba(255, 255, 255, 0.1)',
                   border: '1px solid rgba(255, 255, 255, 0.2)',
                   cursor: 'pointer',
                   padding: screenSize.isMobile ? '8px' : '12px',
                   borderRadius: screenSize.isMobile ? '8px' : '12px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.3s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                   e.target.style.transform = 'scale(1.05)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                   e.target.style.transform = 'scale(1)';
                 }}
               >
                 <X size={screenSize.isMobile ? 20 : 24} color="white" />
               </button>
             </div>

             {/* Professional Details Layout */}
             <div style={{ 
               flex: 1, 
               display: 'grid', 
               gridTemplateColumns: '1fr 1fr', 
               gap: '24px',
               overflow: 'visible',
               padding: '0 8px'
             }}>
               {/* Left Column */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {/* Customer Info */}
                 <div style={{
                   background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                   padding: '20px',
                   borderRadius: '16px',
                   border: '2px solid #0ea5e9',
                   boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)'
                 }}>
                   <h4 style={{ 
                     fontSize: '16px', 
                     fontWeight: '700', 
                     color: '#0c4a6e', 
                     margin: '0 0 16px 0',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}>
                     👤 Customer Information
                   </h4>
                   <div style={{ display: 'grid', gap: '12px' }}>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(14, 165, 233, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>Name:</span>
                       <span style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e' }}>
                         {selectedPayment.driverName || selectedPayment.customerName || selectedPayment.name || 'N/A'}
                       </span>
                     </div>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(14, 165, 233, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>Phone:</span>
                       <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                         {selectedPayment.phoneNumber || 'N/A'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Vehicle Info */}
                 <div style={{
                   background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                   padding: '20px',
                   borderRadius: '16px',
                   border: '2px solid #22c55e',
                   boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
                 }}>
                   <h4 style={{ 
                     fontSize: '16px', 
                     fontWeight: '700', 
                     color: '#166534', 
                     margin: '0 0 16px 0',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}>
                     🚗 Vehicle Information
                   </h4>
                   <div style={{ display: 'grid', gap: '12px' }}>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Number:</span>
                       <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                         {selectedPayment.vehicleNumber || 'N/A'}
                       </span>
                     </div>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Type:</span>
                       <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534', textTransform: 'capitalize' }}>
                         {selectedPayment.vehicleType || 'N/A'}
                       </span>
                     </div>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Slot:</span>
                       <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                         {selectedPayment.slotId || selectedPayment.slot || 'N/A'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Time Info */}
                 <div style={{
                   background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                   padding: '20px',
                   borderRadius: '16px',
                   border: '2px solid #f59e0b',
                   boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                 }}>
                   <h4 style={{ 
                     fontSize: '16px', 
                     fontWeight: '700', 
                     color: '#92400e', 
                     margin: '0 0 16px 0',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}>
                     ⏰ Time Information
                   </h4>
                   <div style={{ display: 'grid', gap: '12px' }}>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(245, 158, 11, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>Check-In:</span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                         {selectedPayment.checkInTime ? new Date(selectedPayment.checkInTime).toLocaleString() : 'N/A'}
                       </span>
                     </div>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(245, 158, 11, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                         {selectedPayment.id ? 'Check-Out:' : 'Check-Out (Current):'}
                       </span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                         {selectedPayment.checkOutTime 
                           ? new Date(selectedPayment.checkOutTime).toLocaleString()
                           : selectedPayment.currentCheckOutTime 
                             ? new Date(selectedPayment.currentCheckOutTime).toLocaleString() 
                             : 'N/A'
                         }
                       </span>
                     </div>
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(245, 158, 11, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>Requested Duration:</span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                          {selectedPayment.requestedDuration ? `${selectedPayment.requestedDuration} hour${selectedPayment.requestedDuration > 1 ? 's' : ''}` : selectedPayment.duration ? `${selectedPayment.duration} hour${selectedPayment.duration > 1 ? 's' : ''}` : 'N/A'}
                        </span>
                      </div>
                   </div>
                 </div>
               </div>

               {/* Right Column */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {/* Payment/Reservation Info */}
                 <div style={{
                   background: selectedPayment.id 
                     ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
                     : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                   padding: '20px',
                   borderRadius: '16px',
                   border: selectedPayment.id ? '2px solid #22c55e' : '2px solid #ef4444',
                   boxShadow: selectedPayment.id 
                     ? '0 4px 12px rgba(34, 197, 94, 0.1)' 
                     : '0 4px 12px rgba(239, 68, 68, 0.1)'
                 }}>
                   <h4 style={{ 
                     fontSize: '16px', 
                     fontWeight: '700', 
                     color: selectedPayment.id ? '#166534' : '#dc2626', 
                     margin: '0 0 16px 0',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}>
                     {selectedPayment.id ? '💳 Payment Information' : '📋 Reservation Information'}
                   </h4>
                   <div style={{ display: 'grid', gap: '12px' }}>
                     {selectedPayment.id && (
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(34, 197, 94, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Payment ID:</span>
                         <span style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', fontFamily: 'monospace' }}>
                           {selectedPayment.id || 'N/A'}
                         </span>
                       </div>
                     )}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Reservation Amount:</span>
                       <span style={{ fontSize: '16px', fontWeight: '700', color: '#166534' }}>
                          Rs.{selectedPayment.regularAmount ? selectedPayment.regularAmount.toFixed(2) : (selectedPayment.baseAmount ? selectedPayment.baseAmount.toFixed(2) : '0.00')}
                        </span>
                      </div>
                      {selectedPayment.isOvertime && (
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(239, 68, 68, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>Overtime Amount:</span>
                         <span style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>
                            Rs.{selectedPayment.overtimeAmount ? selectedPayment.overtimeAmount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      )}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '12px 16px',
                       background: 'rgba(255, 255, 255, 0.9)',
                       borderRadius: '12px',
                       border: '2px solid',
                       borderColor: selectedPayment.isOvertime ? '#ef4444' : '#22c55e',
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                     }}>
                       <span style={{ fontSize: '14px', color: selectedPayment.isOvertime ? '#dc2626' : '#166534', fontWeight: '700' }}>Total Amount:</span>
                       <span style={{ fontSize: '20px', fontWeight: '800', color: selectedPayment.isOvertime ? '#dc2626' : '#166534' }}>
                          Rs.{selectedPayment.totalAmount ? selectedPayment.totalAmount.toFixed(2) : selectedPayment.amount ? selectedPayment.amount.toFixed(2) : selectedPayment.calculatedAmount ? selectedPayment.calculatedAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                     {selectedPayment.id && (
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(34, 197, 94, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Method:</span>
                         <span style={{
                           padding: '4px 8px',
                           borderRadius: '6px',
                                fontSize: screenSize.isMobile ? '11px' : '12px',
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
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(239, 68, 68, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>Overtime:</span>
                         <span style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>
                           {selectedPayment.overtimeHours} hours
                         </span>
                       </div>
                     )}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       padding: '8px 12px',
                       background: 'rgba(255, 255, 255, 0.7)',
                       borderRadius: '8px',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                       <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                         {selectedPayment.id ? 'Payment Date:' : 'Active Time:'}
                       </span>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
                         {selectedPayment.id 
                           ? (selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : 'N/A')
                           : `${selectedPayment.activeTimeHours} hours`
                         }
                       </span>
                     </div>
                                           {selectedPayment.bookingId && (
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(34, 197, 94, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Booking ID:</span>
                         <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
                            {selectedPayment.bookingId}
                          </span>
                        </div>
                      )}
                      {selectedPayment.parkId && (
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '8px 12px',
                         background: 'rgba(255, 255, 255, 0.7)',
                         borderRadius: '8px',
                         border: '1px solid rgba(34, 197, 94, 0.2)'
                       }}>
                         <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Park ID:</span>
                         <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
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

             {/* Professional Modal Footer */}
             <div style={{
               marginTop: '24px',
               paddingTop: '20px',
               borderTop: '2px solid #e2e8f0',
               display: 'flex',
               justifyContent: 'flex-end',
               background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
               margin: '24px -24px -24px -24px',
               padding: '20px 24px',
               borderRadius: '0 0 20px 20px'
             }}>
               <button
                 onClick={() => {
                   setShowPaymentModal(false);
                   setSelectedPayment(null);
                 }}
                 style={{
                   padding: '12px 24px',
                   background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   fontSize: '14px',
                   fontWeight: '600',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease',
                   minWidth: '100px',
                   boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.transform = 'translateY(-2px)';
                   e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.transform = 'translateY(0)';
                   e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                 }}
               >
                 ✕ Close
               </button>
             </div>
           </div>
      </div>
    )}

    {/* Professional Bill Modal for Payment */}
    {showBillModal && selectedReservation && (
      <div style={{
        ...responsiveStyles.modal,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={() => {
        setShowBillModal(false);
        setSelectedReservation(null);
      }}
      >
        <div style={{
          ...responsiveStyles.modalContent,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: screenSize.isMobile ? '95vw' : '700px',
          maxHeight: screenSize.isMobile ? '90vh' : '85vh'
        }}
        onClick={(e) => e.stopPropagation()}
        >
          {/* Professional Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e2e8f0',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            margin: '-24px -24px 24px -24px',
            padding: '24px',
            borderRadius: '20px 20px 0 0'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              💳 Payment Bill
            </h2>
            <button
              onClick={() => {
                setShowBillModal(false);
                setSelectedReservation(null);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <X size={24} color="white" />
            </button>
          </div>

          {/* Professional Bill Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Customer Info */}
            <div style={{ 
              marginBottom: '24px',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👤 Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>Name:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#0c4a6e', fontSize: '16px' }}>
                    {selectedReservation.customerName || 'N/A'}
                  </span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '14px' }}>Phone:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#0c4a6e', fontSize: '16px' }}>
                    {selectedReservation.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div style={{ 
              marginBottom: '24px',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚗 Vehicle Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '8px',
                  border: '1px solid #22c55e'
                }}>
                  <span style={{ fontWeight: '600', color: '#15803d', fontSize: '14px' }}>Number:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#166534', fontSize: '16px' }}>
                    {selectedReservation.vehicleNumber || 'N/A'}
                  </span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '8px',
                  border: '1px solid #22c55e'
                }}>
                  <span style={{ fontWeight: '600', color: '#15803d', fontSize: '14px' }}>Type:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#166534', fontSize: '16px' }}>
                    {selectedReservation.vehicleType || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Parking Info */}
            <div style={{ 
              marginBottom: '24px',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🅿️ Parking Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <span style={{ fontWeight: '600', color: '#b45309', fontSize: '14px' }}>Slot:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#92400e', fontSize: '16px' }}>
                    {selectedReservation.slotId || 'N/A'}
                  </span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <span style={{ fontWeight: '600', color: '#b45309', fontSize: '14px' }}>Requested Duration:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#92400e', fontSize: '16px' }}>
                    {selectedReservation.requestedDuration || selectedReservation.duration || 1} hours
                  </span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <span style={{ fontWeight: '600', color: '#b45309', fontSize: '14px' }}>Actual Time Used:</span>
                  <span style={{ marginLeft: '8px', fontWeight: '700', color: '#92400e', fontSize: '16px' }}>
                    {selectedReservation.activeTimeHours ? `${selectedReservation.activeTimeHours.toFixed(1)} hours` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Payment Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '3px solid #059669',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.15)'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💰 Payment Summary
              </h3>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '8px',
                border: '1px solid #22c55e'
              }}>
                <div>
                  <span style={{ color: '#15803d', fontWeight: '600', fontSize: '16px' }}>Reservation Duration ({selectedReservation.requestedDuration || selectedReservation.duration || 1}h):</span>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    Customer pays for FULL reservation time
                  </div>
                </div>
                <span style={{ fontWeight: '700', color: '#166534', fontSize: '18px' }}>
                  Rs.{selectedReservation.regularAmount ? selectedReservation.regularAmount.toFixed(2) : (selectedReservation.amount ? selectedReservation.amount.toFixed(2) : '0.00')}
                </span>
              </div>
              {selectedReservation.isOvertime && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                  borderRadius: '8px',
                  border: '1px solid #ef4444'
                }}>
                  <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '16px' }}>
                    Overtime ({selectedReservation.overtimeHours?.toFixed(1)}h):
                  </span>
                  <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '18px' }}>
                    Rs.{selectedReservation.overtimeAmount ? selectedReservation.overtimeAmount.toFixed(2) : '0.00'}
                  </span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '800',
                color: 'white',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                border: '2px solid #22c55e'
              }}>
                <span>Total Amount:</span>
                <span>Rs.{selectedReservation.calculatedAmount ? selectedReservation.calculatedAmount.toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Professional Modal Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '2px solid #e2e8f0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            margin: '24px -24px -24px -24px',
            padding: '20px 24px',
            borderRadius: '0 0 20px 20px'
          }}>
            <button
              onClick={() => {
                setShowBillModal(false);
                setSelectedReservation(null);
              }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
              }}
            >
              ✕ Cancel
            </button>
            <button
              onClick={handleProcessPayment}
              data-process-payment
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
              }}
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
