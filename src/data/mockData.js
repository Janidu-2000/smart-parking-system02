// Mock data generation
export const generateMockData = () => {
  const slots = [];
  const statuses = ['available', 'occupied', 'reserved'];
  
  for (let i = 1; i <= 50; i++) {
    slots.push({
      id: i,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      price: 5 + Math.floor(Math.random() * 10),
      reservedBy: Math.random() > 0.7 ? `Driver ${Math.floor(Math.random() * 100)}` : null,
      occupiedSince: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000) : null
    });
  }
  return slots;
};

// Enhanced booking structure with customer details
export const mockBookings = [
  { 
    id: 1, 
    slotId: 15, 
    customerName: "John Doe", 
    phoneNumber: "123-456-7890",
    vehicleNumber: "ABC-1234",
    vehicleType: "car",
    duration: 2,
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    checkOutTime: null,
    amount: 15, 
    status: "active",
    notes: "Regular customer"
  },
  { 
    id: 2, 
    slotId: 23, 
    customerName: "Jane Smith", 
    phoneNumber: "987-654-3210",
    vehicleNumber: "XYZ-5678",
    vehicleType: "motorcycle",
    duration: 1,
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    amount: 10, 
    status: "completed",
    notes: ""
  },
  { 
    id: 3, 
    slotId: 7, 
    customerName: "Bob Johnson", 
    phoneNumber: "555-123-4567",
    vehicleNumber: "DEF-9012",
    vehicleType: "truck",
    duration: 4,
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    checkInTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    checkOutTime: null,
    amount: 20, 
    status: "pending",
    notes: "Large vehicle"
  },
  { 
    id: 4, 
    slotId: 12, 
    customerName: "Alice Brown", 
    phoneNumber: "111-222-3333",
    vehicleNumber: "GHI-5678",
    vehicleType: "car",
    duration: 3,
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    checkInTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    checkOutTime: null,
    amount: 25, 
    status: "pending",
    notes: "VIP customer"
  }
];

// Booking management functions
let nextBookingId = 4; // Start after existing mock bookings

export const addBooking = (bookingData) => {
  const newBooking = {
    id: nextBookingId++,
    slotId: bookingData.slot.id,
    customerName: bookingData.customerName,
    phoneNumber: bookingData.phoneNumber,
    vehicleNumber: bookingData.vehicleNumber,
    vehicleType: bookingData.vehicleType,
    duration: bookingData.actualDuration || bookingData.duration,
    startDate: bookingData.effectiveStartDate,
    endDate: bookingData.effectiveEndDate,
    checkInTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    checkOutTime: null,
    amount: (bookingData.actualDuration || bookingData.duration) * 5, // $5 per hour
    status: "active",
    notes: bookingData.notes || ""
  };
  
  mockBookings.push(newBooking);
  return newBooking;
};

export const getBookings = () => {
  return mockBookings;
};

export const updateBookingStatus = (bookingId, status) => {
  const booking = mockBookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = status;
    if (status === "completed" && !booking.checkOutTime) {
      booking.checkOutTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  }
  return booking;
};

export const mockAnalytics = {
  totalSlots: 50,
  occupiedSlots: 32,
  revenue: 1250,
  avgOccupancy: 78
};

export const mockMessages = [
  { 
    fullName: 'Alice Brown', 
    mobile: '123-456-7890', 
    message: 'I have an issue with my reservation. The slot I booked is occupied by another vehicle.',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
  },
  { 
    fullName: 'David Green', 
    mobile: '987-654-3210', 
    message: 'Can I extend my parking time? I need an extra hour.',
    read: false,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
  },
  { 
    fullName: 'Maria Lopez', 
    mobile: '555-123-4567', 
    message: 'Payment not going through. Getting an error message.',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  { 
    fullName: 'John Wilson', 
    mobile: '444-555-6666', 
    message: 'Is there any discount for long-term parking?',
    read: true,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  },
];

export const mockPayments = [
  { 
    id: 'PAY001', 
    driverName: 'John Doe', 
    vehicleType: 'Car',
    vehicleNumber: 'ABC-1234',
    slotId: 'S15',
    checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    checkOutTime: null,
    amount: 400.00, 
    paymentMethod: 'Credit Card', 
    status: 'completed', 
    date: new Date().toISOString().split('T')[0], 
    bookingId: 'BK001' 
  },
  { 
    id: 'PAY002', 
    driverName: 'Jane Smith', 
    vehicleType: 'Motorcycle',
    vehicleNumber: 'XYZ-5678',
    slotId: 'S23',
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    amount: 200.00, 
    paymentMethod: 'Cash', 
    status: 'completed', 
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().split('T')[0], 
    bookingId: 'BK002' 
  },
  { 
    id: 'PAY003', 
    driverName: 'Bob Wilson', 
    vehicleType: 'Truck',
    vehicleNumber: 'DEF-9012',
    slotId: 'S7',
    checkInTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    checkOutTime: null,
    amount: 800.00, 
    paymentMethod: 'Digital Wallet', 
    status: 'pending', 
    date: new Date().toISOString().split('T')[0], 
    bookingId: 'BK003' 
  },
  { 
    id: 'PAY004', 
    driverName: 'Alice Brown', 
    vehicleType: 'Car',
    vehicleNumber: 'GHI-3456',
    slotId: 'S12',
    checkInTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    checkOutTime: null,
    amount: 400.00, 
    paymentMethod: 'Credit Card', 
    status: 'failed', 
    date: new Date().toISOString().split('T')[0], 
    bookingId: 'BK004' 
  },
  { 
    id: 'PAY005', 
    driverName: 'Charlie Davis', 
    vehicleType: 'SUV',
    vehicleNumber: 'JKL-7890',
    slotId: 'S8',
    checkInTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    amount: 400.00, 
    paymentMethod: 'Cash', 
    status: 'completed', 
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().split('T')[0], 
    bookingId: 'BK005' 
  }
];