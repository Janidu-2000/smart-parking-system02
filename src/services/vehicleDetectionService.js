/**
 * Vehicle Detection Service
 * Handles communication with the vehicle detection model API
 */

const VEHICLE_DETECTION_API_URL = 'http://localhost:5000/predict';

class VehicleDetectionService {
  /**
   * Send image to vehicle detection model and get predictions
   * @param {File|Blob|string} imageData - Image file, blob, or base64 string
   * @returns {Promise<Object>} Prediction results from the model
   */
  static async detectVehicle(imageData) {
    try {
      console.log('Vehicle detection API called with image data');
      
      let formData;
      
      // Handle different image data types
      if (imageData instanceof File || imageData instanceof Blob) {
        formData = new FormData();
        formData.append('image', imageData, 'vehicle_image.jpg');
      } else if (typeof imageData === 'string') {
        // Handle base64 string
        formData = new FormData();
        const blob = await this.base64ToBlob(imageData);
        formData.append('image', blob, 'vehicle_image.jpg');
      } else {
        throw new Error('Invalid image data type. Expected File, Blob, or base64 string.');
      }

      console.log('Sending request to API endpoint:', VEHICLE_DETECTION_API_URL);
      const response = await fetch(VEHICLE_DETECTION_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary for FormData
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response received:', result);
      return this.processPredictionResult(result);
    } catch (error) {
      console.error('Vehicle detection API error:', error);
      throw new Error(`Vehicle detection failed: ${error.message}`);
    }
  }

  /**
   * Capture frame from video element and send for detection
   * @param {HTMLVideoElement} videoElement - Video element to capture frame from
   * @returns {Promise<Object>} Prediction results
   */
  static async detectFromVideoFrame(videoElement) {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            const result = await this.detectVehicle(blob);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Error capturing video frame:', error);
      throw new Error(`Failed to capture video frame: ${error.message}`);
    }
  }

  /**
   * Convert base64 string to Blob
   * @param {string} base64String - Base64 encoded image string
   * @returns {Promise<Blob>} Blob object
   */
  static async base64ToBlob(base64String) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      throw new Error(`Failed to convert base64 to blob: ${error.message}`);
    }
  }

  /**
   * Map class names to vehicle categories
   * @param {string} className - Raw class name from API
   * @param {number} confidence - Confidence score for the detection (not used for categories)
   * @returns {string} Vehicle category name
   */
  static mapClassNameToVehicleType(className, confidence = 0) {
    const classMapping = {
      // Cars
      'car': 'Car',
      'sedan': 'Car',
      'hatchback': 'Car',
      'coupe': 'Car',
      'convertible': 'Car',
      
      // Bikes/Motorcycles
      'bike': 'Bike',
      'motorcycle': 'Bike',
      'bicycle': 'Bike',
      'scooter': 'Bike',
      
      // Vans
      'van': 'Van',
      'minivan': 'Van',
      
      // Jeeps/SUVs
      'jeep': 'Jeep',
      'suv': 'Jeep',
      'crossover': 'Jeep',
      
      // Lorries/Trucks
      'lorry': 'Lorry',
      'truck': 'Lorry',
      'pickup': 'Lorry',
      
      // Buses
      'bus': 'Bus',
      
      // Special Vehicles
      'ambulance': 'Ambulance',
      'fire_truck': 'Fire Truck',
      'police_car': 'Police Car',
      'taxi': 'Taxi',
      'trailer': 'Trailer',
      'vehicle': 'Vehicle'
    };
    
    return classMapping[className?.toLowerCase()] || className || 'Unknown';
  }


  /**
   * Process and format prediction results from the API
   * @param {Object} rawResult - Raw result from the API
   * @returns {Object} Formatted prediction result
   */
  static processPredictionResult(rawResult) {
    try {
      // Handle different possible response formats
      let vehicles = [];
      let confidence = 0;
      let vehicleType = 'Unknown';
      let vehicleNumber = 'N/A';

      // Check if the result has detections array (new format)
      if (rawResult.detections && Array.isArray(rawResult.detections)) {
        vehicles = rawResult.detections.map(detection => ({
          type: detection.class, // Show the actual class from API
          category: this.mapClassNameToVehicleType(detection.class, detection.confidence), // Mapped category
          number: detection.number || detection.license_plate || detection.plate || 'N/A',
          confidence: detection.confidence || 0,
          bbox: detection.bbox || null,
          id: detection.id || null,
          timestamp: new Date().toISOString()
        }));
      }
      // Check if the result has predictions array (legacy format)
      else if (rawResult.predictions && Array.isArray(rawResult.predictions)) {
        vehicles = rawResult.predictions.map(pred => ({
          type: this.mapClassNameToVehicleType(pred.class || pred.vehicle_type || pred.type, pred.confidence || pred.score),
          number: pred.number || pred.license_plate || pred.plate || 'N/A',
          confidence: pred.confidence || pred.score || 0,
          bbox: pred.bbox || pred.bounding_box || null,
          timestamp: new Date().toISOString()
        }));
      } 
      // Check if result has single vehicle detection
      else if (rawResult.vehicle_type || rawResult.class) {
        vehicles = [{
          type: this.mapClassNameToVehicleType(rawResult.vehicle_type || rawResult.class, rawResult.confidence || rawResult.score),
          number: rawResult.number || rawResult.license_plate || rawResult.plate || 'N/A',
          confidence: rawResult.confidence || rawResult.score || 0,
          bbox: rawResult.bbox || rawResult.bounding_box || null,
          timestamp: new Date().toISOString()
        }];
      }
      // Check if result has detection flag
      else if (rawResult.detected !== undefined) {
        if (rawResult.detected) {
          vehicles = [{
            type: this.mapClassNameToVehicleType(rawResult.vehicle_type, rawResult.confidence) || 'Vehicle',
            number: rawResult.number || 'N/A',
            confidence: rawResult.confidence || 0.8,
            bbox: rawResult.bbox || null,
            timestamp: new Date().toISOString()
          }];
        }
      }

      // Get the highest confidence detection
      if (vehicles.length > 0) {
        const bestDetection = vehicles.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        vehicleType = bestDetection.type;
        vehicleNumber = bestDetection.number;
        confidence = bestDetection.confidence;
        
        // Debug logging
        console.log('Vehicle Detection Results:', {
          totalDetections: vehicles.length,
          bestDetection: bestDetection,
          selectedType: vehicleType,
          selectedConfidence: confidence
        });
      }

      return {
        success: rawResult.success !== undefined ? rawResult.success : true,
        detected: vehicles.length > 0,
        vehicles: vehicles,
        primaryVehicle: {
          type: vehicleType,
          number: vehicleNumber,
          confidence: confidence
        },
        annotatedImageUrl: rawResult.annotated_image_url || null,
        timestamp: new Date().toISOString(),
        rawResult: rawResult // Include raw result for debugging
      };
    } catch (error) {
      console.error('Error processing prediction result:', error);
      return {
        success: false,
        detected: false,
        vehicles: [],
        primaryVehicle: {
          type: 'Unknown',
          number: 'N/A',
          confidence: 0
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if API is accessible
   */
  static async testConnection() {
    try {
      const response = await fetch(VEHICLE_DETECTION_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Even if it returns an error, if we get a response, the API is accessible
      return response.status !== 0;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Test the processing of a specific API response
   * @param {Object} testResponse - Test API response
   * @returns {Object} Processed result
   */
  static testApiResponse(testResponse) {
    console.log('Testing API Response Processing:', testResponse);
    const result = this.processPredictionResult(testResponse);
    console.log('Processed Result:', result);
    console.log('Vehicle Details that will be displayed:');
    console.log(`Type: ${result.primaryVehicle.type}`);
    console.log(`Confidence: ${Math.round(result.primaryVehicle.confidence * 100)}%`);
    return result;
  }

  /**
   * Test with your specific API response format
   */
  static testYourApiResponse() {
    const yourApiResponse = {
      "annotated_image_url": "/images/annotated_vehicle_image.jpg",
      "detections": [
        {
          "bbox": [60, 76, 502, 338],
          "class": "car",
          "confidence": 0.5624467730522156,
          "id": 0
        }
      ],
      "success": true
    };
    
    console.log('Testing with your specific API response:');
    return this.testApiResponse(yourApiResponse);
  }

  /**
   * Test different vehicle categories
   */
  static testVehicleCategories() {
    const testCategories = [
      { class: "car", expected: "Car" },
      { class: "bike", expected: "Bike" },
      { class: "van", expected: "Van" },
      { class: "jeep", expected: "Jeep" },
      { class: "lorry", expected: "Lorry" },
      { class: "truck", expected: "Lorry" },
      { class: "suv", expected: "Jeep" },
      { class: "motorcycle", expected: "Bike" },
      { class: "bus", expected: "Bus" }
    ];

    console.log('Testing Vehicle Category Mapping:');
    testCategories.forEach(test => {
      const result = this.mapClassNameToVehicleType(test.class);
      console.log(`${test.class} -> ${result} (expected: ${test.expected})`);
    });
  }

  /**
   * Get API status and health
   * @returns {Promise<Object>} API status information
   */
  static async getApiStatus() {
    try {
      const response = await fetch(VEHICLE_DETECTION_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        accessible: true,
        status: response.status,
        statusText: response.statusText,
        url: VEHICLE_DETECTION_API_URL
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        url: VEHICLE_DETECTION_API_URL
      };
    }
  }
}

export default VehicleDetectionService;
