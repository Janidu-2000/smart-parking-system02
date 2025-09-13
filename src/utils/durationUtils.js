/**
 * Utility functions for calculating time duration after admin reservation approval
 */

/**
 * Calculate the duration since admin approved the reservation
 * @param {string|Date} approvedAt - The timestamp when admin approved the reservation
 * @param {string|Date} checkOutTime - Optional check-out time (if null, uses current time)
 * @returns {Object} Duration object with hours, minutes, and formatted string
 */
export const calculateDurationSinceApproval = (approvedAt, checkOutTime = null) => {
  if (!approvedAt) {
    return {
      hours: 0,
      minutes: 0,
      totalHours: 0,
      formatted: '0h 0m',
      isActive: false
    };
  }

  const approvalTime = new Date(approvedAt);
  const endTime = checkOutTime ? new Date(checkOutTime) : new Date();
  
  // Calculate difference in milliseconds
  const diffMs = endTime - approvalTime;
  
  // If checkOutTime is provided, the booking is completed
  const isActive = !checkOutTime;
  
  // Convert to hours and minutes
  const totalHours = diffMs / (1000 * 60 * 60);
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  
  // Format the duration string
  let formatted = '';
  if (hours > 0) {
    formatted += `${hours}h`;
  }
  if (minutes > 0) {
    formatted += ` ${minutes}m`;
  }
  if (formatted === '') {
    formatted = '0h 0m';
  }
  
  return {
    hours,
    minutes,
    totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
    formatted: formatted.trim(),
    isActive
  };
};

/**
 * Calculate parking charges based on duration since approval
 * Customer pays for FULL reservation duration + any overtime
 * @param {string|Date} approvedAt - The timestamp when admin approved the reservation
 * @param {number} requestedDuration - The originally requested duration in hours
 * @param {number} baseRate - Base rate per hour (default: 200)
 * @param {number} overtimeRate - Overtime rate per hour (default: 300)
 * @param {string|Date} checkOutTime - Optional check-out time
 * @returns {Object} Charge calculation object
 */
export const calculateParkingCharges = (
  approvedAt, 
  requestedDuration = 1, 
  baseRate = 200, 
  overtimeRate = 300,
  checkOutTime = null
) => {
  const duration = calculateDurationSinceApproval(approvedAt, checkOutTime);
  
  let calculatedAmount = 0;
  let isOvertime = false;
  let overtimeHours = 0;
  let regularAmount = 0;
  let overtimeAmount = 0;
  
  // Customer always pays for the FULL requested duration
  regularAmount = requestedDuration * baseRate;
  
  if (duration.totalHours > requestedDuration) {
    // Overtime - charge additional overtime rate
    isOvertime = true;
    overtimeHours = duration.totalHours - requestedDuration;
    overtimeAmount = overtimeHours * overtimeRate;
  }
  
  calculatedAmount = regularAmount + overtimeAmount;
  
  return {
    totalAmount: Math.round(calculatedAmount * 100) / 100,
    isOvertime,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    regularHours: requestedDuration, // Always the full requested duration
    actualHours: Math.round(duration.totalHours * 100) / 100, // Actual time used
    regularAmount: Math.round(regularAmount * 100) / 100,
    overtimeAmount: Math.round(overtimeAmount * 100) / 100,
    baseRate,
    overtimeRate,
    duration: duration
  };
};

/**
 * Format duration for display in different contexts
 * @param {Object} duration - Duration object from calculateDurationSinceApproval
 * @param {boolean} showSeconds - Whether to include seconds in the format
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, showSeconds = false) => {
  if (!duration) return '0h 0m';
  
  let formatted = duration.formatted;
  
  if (showSeconds && duration.isActive) {
    const currentTime = new Date();
    const approvalTime = new Date(duration.approvedAt || new Date());
    const diffMs = currentTime - approvalTime;
    const seconds = Math.floor((diffMs / 1000) % 60);
    formatted += ` ${seconds}s`;
  }
  
  return formatted;
};

/**
 * Get status color based on duration and requested time
 * @param {Object} duration - Duration object from calculateDurationSinceApproval
 * @param {number} requestedDuration - The originally requested duration in hours
 * @returns {string} CSS color code
 */
export const getDurationStatusColor = (duration, requestedDuration = 1) => {
  if (!duration || !duration.isActive) return '#6b7280'; // Gray for inactive
  
  if (duration.totalHours <= requestedDuration * 0.8) {
    return '#10b981'; // Green - within 80% of requested time
  } else if (duration.totalHours <= requestedDuration) {
    return '#f59e0b'; // Yellow - approaching limit
  } else {
    return '#ef4444'; // Red - overtime
  }
};

/**
 * Get status text based on duration and requested time
 * @param {Object} duration - Duration object from calculateDurationSinceApproval
 * @param {number} requestedDuration - The originally requested duration in hours
 * @returns {string} Status text
 */
export const getDurationStatusText = (duration, requestedDuration = 1) => {
  if (!duration || !duration.isActive) return 'Completed';
  
  if (duration.totalHours <= requestedDuration * 0.8) {
    return 'On Time';
  } else if (duration.totalHours <= requestedDuration) {
    return 'Approaching Limit';
  } else {
    return 'Overtime';
  }
};
