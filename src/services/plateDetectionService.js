/**
 * License Plate Detection Service
 * Handles communication with the license plate detection model API
 */

const PLATE_DETECTION_API_URL = 'http://localhost:5001/detect_plate';
const PLATE_DETECTION_API_URL_2 = 'http://localhost:5002/detect_plate';

class PlateDetectionService {
  /**
   * Send image to license plate detection model and get predictions
   * @param {File|Blob|string} imageData - Image file, blob, or base64 string
   * @returns {Promise<Object>} Prediction results from the plate detection model
   */
  static async detectPlate(imageData) {
    try {
      console.log('License plate detection API called with image data');
      
      let formData = new FormData();
      
      // Handle different image data types - ensure field name is exactly 'image' to match the curl command
      if (imageData instanceof File || imageData instanceof Blob) {
        formData.append('image', imageData, 'plate_image.jpg');
        console.log('Appended image as Blob/File');
      } else if (typeof imageData === 'string') {
        // Handle base64 string
        const blob = await this.base64ToBlob(imageData);
        formData.append('image', blob, 'plate_image.jpg');
        console.log('Converted base64 to blob and appended as image');
      } else {
        throw new Error('Invalid image data type. Expected File, Blob, or base64 string.');
      }

      console.log('Sending request to plate detection API endpoint:', PLATE_DETECTION_API_URL);
      const response = await fetch(PLATE_DETECTION_API_URL, {
        method: 'POST',
        body: formData,
        // Explicitly don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Plate Detection API Response received:', result);
      
      // Check if we have plate_text in the response
      if (result.plate_text) {
        console.log('Detected plate text:', result.plate_text);
      } else {
        console.warn('No plate_text found in API response:', result);
      }
      
      return this.processPlateDetectionResult(result);
    } catch (error) {
      console.error('License plate detection API error:', error);
      throw new Error(`License plate detection failed: ${error.message}`);
    }
  }

  /**
   * Capture frame from video element and send for plate detection
   * @param {HTMLVideoElement} videoElement - Video element to capture frame from
   * @returns {Promise<Object>} Plate detection results
   */
  static async detectPlateFromVideoFrame(videoElement) {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      console.log('Video frame captured to canvas for plate detection');
      
      // Convert canvas to blob with high quality to ensure text is readable
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            console.log('Canvas converted to blob, size:', blob.size, 'bytes');
            
            // Create a File object with appropriate filename to better match curl command
            const file = new File([blob], 'plate_image.jpg', { type: 'image/jpeg' });
            
            // Send for plate detection
            const result = await this.detectPlate(file);
            console.log('Plate detection from video frame result:', result);
            resolve(result);
          } catch (error) {
            console.error('Failed to detect plate from video frame:', error);
            reject(error);
          }
        }, 'image/jpeg', 0.95); // Higher quality (0.95) to ensure text is readable
      });
    } catch (error) {
      console.error('Error capturing video frame for plate detection:', error);
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
   * Process and format plate detection results from the API
   * @param {Object} rawResult - Raw result from the API
   * @returns {Object} Formatted plate detection result
   */
  static processPlateDetectionResult(rawResult) {
    try {
      console.log('Processing plate detection result:', rawResult);
      
      let plates = [];
      let primaryPlate = null;
      let confidence = 0;

      // Handle different possible response formats
      if (rawResult.plate_text) {
        console.log('Using new API format with plate_text:', rawResult.plate_text);
        // New API format with plate_text field - given highest priority
        plates = [{
          number: rawResult.plate_text,
          confidence: 0.98, // Very high confidence for the new API
          bbox: null,
          region: null,
          timestamp: new Date().toISOString()
        }];
      }
      else if (rawResult.plates && Array.isArray(rawResult.plates)) {
        // Multiple plates detected
        plates = rawResult.plates.map(plate => ({
          number: plate.number || plate.text || plate.plate_number || 'N/A',
          confidence: plate.confidence || plate.score || 0,
          bbox: plate.bbox || plate.bounding_box || null,
          region: plate.region || null,
          timestamp: new Date().toISOString()
        }));
      } 
      else if (rawResult.plate_number || rawResult.text || rawResult.number) {
        // Single plate detected
        plates = [{
          number: rawResult.plate_number || rawResult.text || rawResult.number || 'N/A',
          confidence: rawResult.confidence || rawResult.score || 0,
          bbox: rawResult.bbox || rawResult.bounding_box || null,
          region: rawResult.region || null,
          timestamp: new Date().toISOString()
        }];
      }
      else if (rawResult.detections && Array.isArray(rawResult.detections)) {
        // Detections array format
        plates = rawResult.detections.map(detection => ({
          number: detection.text || detection.number || detection.plate_number || 'N/A',
          confidence: detection.confidence || detection.score || 0,
          bbox: detection.bbox || detection.bounding_box || null,
          region: detection.region || null,
          timestamp: new Date().toISOString()
        }));
      }
      else if (rawResult.detected !== undefined) {
        // Detection flag format
        if (rawResult.detected) {
          plates = [{
            number: rawResult.plate_number || rawResult.text || rawResult.number || 'N/A',
            confidence: rawResult.confidence || 0.8,
            bbox: rawResult.bbox || null,
            region: rawResult.region || null,
            timestamp: new Date().toISOString()
          }];
        }
      }

      // Get the highest confidence plate
      if (plates.length > 0) {
        primaryPlate = plates.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        confidence = primaryPlate.confidence;
      }

      const result = {
        success: rawResult.success !== undefined ? rawResult.success : true,
        detected: plates.length > 0,
        plates: plates,
        primaryPlate: primaryPlate ? {
          number: primaryPlate.number,
          confidence: primaryPlate.confidence,
          bbox: primaryPlate.bbox,
          region: primaryPlate.region
        } : null,
        annotatedImageUrl: rawResult.annotated_image_url || rawResult.result_image || null,
        plateImageBase64: rawResult.plate_image_base64 || null,
        timestamp: new Date().toISOString(),
        rawResult: rawResult // Include raw result for debugging
      };

      console.log('Processed plate detection result:', result);
      return result;
    } catch (error) {
      console.error('Error processing plate detection result:', error);
      return {
        success: false,
        detected: false,
        plates: [],
        primaryPlate: null,
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
      const response = await fetch(PLATE_DETECTION_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Even if it returns an error, if we get a response, the API is accessible
      return response.status !== 0;
    } catch (error) {
      console.error('Plate detection API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API status and health
   * @returns {Promise<Object>} API status information
   */
  static async getApiStatus() {
    try {
      const response = await fetch(PLATE_DETECTION_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        accessible: true,
        status: response.status,
        statusText: response.statusText,
        url: PLATE_DETECTION_API_URL
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        url: PLATE_DETECTION_API_URL
      };
    }
  }

  /**
   * Test the processing of a specific API response
   * @param {Object} testResponse - Test API response
   * @returns {Object} Processed result
   */
  static testApiResponse(testResponse) {
    console.log('Testing Plate Detection API Response Processing:', testResponse);
    const result = this.processPlateDetectionResult(testResponse);
    console.log('Processed Plate Detection Result:', result);
    if (result.primaryPlate) {
      console.log('Primary Plate Details:');
      console.log(`Number: ${result.primaryPlate.number}`);
      console.log(`Confidence: ${Math.round(result.primaryPlate.confidence * 100)}%`);
    }
    return result;
  }

  /**
   * Test with common plate detection API response formats
   */
  static testCommonPlateFormats() {
    const testFormats = [
      // Format 1: Multiple plates
      {
        "success": true,
        "plates": [
          {
            "number": "ABC-1234",
            "confidence": 0.95,
            "bbox": [100, 200, 300, 50]
          }
        ]
      },
      // Format 2: Single plate
      {
        "success": true,
        "plate_number": "XYZ-5678",
        "confidence": 0.87
      },
      // Format 3: Detections array
      {
        "success": true,
        "detections": [
          {
            "text": "DEF-9012",
            "confidence": 0.92,
            "bbox": [150, 250, 280, 45]
          }
        ]
      },
      // Format 4: New API format with plate_text and plate_image_base64
      {
        "success": true,
        "plate_text": "WP CBC 5068",
        "plate_image_base64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCABCATIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQR"
      },
      // Format 5: Secondary API format with plate_text
      {
        "success": true,
        "plate_text": "BP99 NPC",
        "plate_image_base64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAB1AeEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoECAxEFBgcJCglLDRITEhUXJ0BwInRVZQaGBkSHB0cZCNLR2AUfD/8QAH9EAUgcJRAQEBAQEBAQEAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoECAxEFBgcJCglLDRITEhUXJ0BwInRVZQaGBkSHB0cZCNLR2AUfD"
      }
    ];

    console.log('Testing Common Plate Detection API Response Formats:');
    testFormats.forEach((format, index) => {
      console.log(`\n--- Testing Format ${index + 1} ---`);
      this.testApiResponse(format);
    });
  }

  /**
   * Send image to the secondary license plate detection model API
   * @param {File|Blob|string} imageData - Image file, blob, or base64 string
   * @returns {Promise<Object>} Prediction results from the secondary plate detection model
   */
  static async detectPlateSecondary(imageData) {
    try {
      console.log('Secondary license plate detection API called with image data');
      
      let formData = new FormData();
      
      // Handle different image data types - ensure field name is exactly 'image' to match the curl command
      if (imageData instanceof File || imageData instanceof Blob) {
        formData.append('image', imageData, 'plate_image.jpg');
        console.log('Appended image as Blob/File to secondary API');
      } else if (typeof imageData === 'string') {
        // Handle base64 string
        const blob = await this.base64ToBlob(imageData);
        formData.append('image', blob, 'plate_image.jpg');
        console.log('Converted base64 to blob and appended as image to secondary API');
      } else {
        throw new Error('Invalid image data type. Expected File, Blob, or base64 string.');
      }

      console.log('Sending request to secondary plate detection API endpoint:', PLATE_DETECTION_API_URL_2);
      const response = await fetch(PLATE_DETECTION_API_URL_2, {
        method: 'POST',
        body: formData,
        // Explicitly don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Secondary Plate Detection API Response received:', result);
      
      // Check if we have plate_text in the response
      if (result.plate_text) {
        console.log('Secondary API detected plate text:', result.plate_text);
      } else {
        console.warn('No plate_text found in secondary API response:', result);
      }
      
      return this.processPlateDetectionResult(result);
    } catch (error) {
      console.error('Secondary license plate detection API error:', error);
      throw new Error(`Secondary license plate detection failed: ${error.message}`);
    }
  }

  /**
   * Capture frame from video element and send for plate detection using secondary API
   * @param {HTMLVideoElement} videoElement - Video element to capture frame from
   * @returns {Promise<Object>} Plate detection results
   */
  static async detectPlateFromVideoFrameSecondary(videoElement) {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      console.log('Video frame captured to canvas for secondary plate detection');
      
      // Convert canvas to blob with high quality to ensure text is readable
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            console.log('Canvas converted to blob for secondary API, size:', blob.size, 'bytes');
            
            // Create a File object with appropriate filename to better match curl command
            const file = new File([blob], 'plate_image.jpg', { type: 'image/jpeg' });
            
            // Send for plate detection
            const result = await this.detectPlateSecondary(file);
            console.log('Secondary plate detection from video frame result:', result);
            resolve(result);
          } catch (error) {
            console.error('Failed to detect plate from video frame with secondary API:', error);
            reject(error);
          }
        }, 'image/jpeg', 0.95); // Higher quality (0.95) to ensure text is readable
      });
    } catch (error) {
      console.error('Error capturing video frame for secondary plate detection:', error);
      throw new Error(`Failed to capture video frame for secondary API: ${error.message}`);
    }
  }

  /**
   * Test secondary API connection
   * @returns {Promise<boolean>} True if API is accessible
   */
  static async testSecondaryConnection() {
    try {
      const response = await fetch(PLATE_DETECTION_API_URL_2, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Even if it returns an error, if we get a response, the API is accessible
      return response.status !== 0;
    } catch (error) {
      console.error('Secondary plate detection API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get secondary API status and health
   * @returns {Promise<Object>} API status information
   */
  static async getSecondaryApiStatus() {
    try {
      const response = await fetch(PLATE_DETECTION_API_URL_2, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        accessible: true,
        status: response.status,
        statusText: response.statusText,
        url: PLATE_DETECTION_API_URL_2
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        url: PLATE_DETECTION_API_URL_2
      };
    }
  }
}

export default PlateDetectionService;
