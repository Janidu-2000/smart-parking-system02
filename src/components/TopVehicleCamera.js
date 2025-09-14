import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, AlertCircle, CheckCircle, XCircle, Camera, Download } from 'lucide-react';
import VehicleDetectionService from '../services/vehicleDetectionService';
import PlateDetectionService from '../services/plateDetectionService';

const TopVehicleCamera = ({ onVehicleDetected }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('idle');
  const [detectedVehicles, setDetectedVehicles] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [plateApiStatus, setPlateApiStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVehicleDetails, setCapturedVehicleDetails] = useState(null);
  const [capturedPlateDetails, setCapturedPlateDetails] = useState(null);
  const canvasRef = useRef(null);

  // Initialize camera and check API status on component mount
  useEffect(() => {
    startCamera();
    checkApiStatus();
    checkPlateApiStatus();
    return () => {
      stopCamera();
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, []);

  // Check vehicle detection API connection status
  const checkApiStatus = async () => {
    try {
      const status = await VehicleDetectionService.getApiStatus();
      setApiStatus(status.accessible ? 'connected' : 'error');
    } catch (error) {
      setApiStatus('error');
    }
  };

  // Check plate detection API connection status
  const checkPlateApiStatus = async () => {
    try {
      const status = await PlateDetectionService.getApiStatus();
      setPlateApiStatus(status.accessible ? 'connected' : 'error');
    } catch (error) {
      setPlateApiStatus('error');
    }
  };

  const startCamera = async () => {
    try {
      setDetectionStatus('detecting');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setDetectionStatus('idle');
      startDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setDetectionStatus('error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    setDetectionStatus('idle');
  };

  const startDetection = () => {
    setIsRecording(true);
    startRealTimeDetection();
  };

  const startRealTimeDetection = () => {
    const interval = setInterval(async () => {
      if (!isRecording || !videoRef.current || apiStatus !== 'connected') {
        return;
      }

      try {
        setDetectionStatus('detecting');
        const result = await VehicleDetectionService.detectFromVideoFrame(videoRef.current);
        
        if (result.success && result.detected && result.primaryVehicle) {
          const detectedVehicle = {
            id: Date.now(),
            type: result.primaryVehicle.type,
            number: result.primaryVehicle.number,
            timestamp: new Date().toLocaleTimeString(),
            confidence: Math.round(result.primaryVehicle.confidence * 100)
          };

          setDetectedVehicles(prev => [detectedVehicle, ...prev.slice(0, 4)]);
          setDetectionStatus('detected');
          
          if (onVehicleDetected) {
            onVehicleDetected(detectedVehicle);
          }

          setTimeout(() => {
            setDetectionStatus('idle');
          }, 2000);
        } else {
          setDetectionStatus('idle');
        }
      } catch (error) {
        console.error('Detection error:', error);
        setDetectionStatus('error');
        setTimeout(() => {
          setDetectionStatus('idle');
        }, 2000);
      }
    }, 3000); // Check every 3 seconds

    setDetectionInterval(interval);
  };

  const getStatusColor = () => {
    switch (detectionStatus) {
      case 'detecting': return '#f59e0b';
      case 'detected': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (detectionStatus) {
      case 'detecting': return <AlertCircle size={14} />;
      case 'detected': return <CheckCircle size={14} />;
      case 'error': return <XCircle size={14} />;
      default: return <Video size={14} />;
    }
  };

  const getStatusText = () => {
    if (apiStatus === 'checking' || plateApiStatus === 'checking') return 'Checking APIs...';
    if (apiStatus === 'error' && plateApiStatus === 'error') return 'APIs Disconnected';
    if (apiStatus === 'error' || plateApiStatus === 'error') return 'Partial API Connection';
    
    switch (detectionStatus) {
      case 'detecting': return 'Detecting...';
      case 'detected': return 'Vehicle Detected!';
      case 'error': return 'Detection Error';
      default: return 'Monitoring';
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !stream) {
      alert('Camera not available');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      
       // Try to detect vehicle and plate in the captured image
       try {
         console.log('Starting vehicle and plate detection for captured image...');
         
         // Run both detections in parallel
         const [vehicleResult, plateResult] = await Promise.allSettled([
           VehicleDetectionService.detectFromVideoFrame(video),
           PlateDetectionService.detectPlateFromVideoFrame(video)
         ]);
         
         console.log('Vehicle detection result:', vehicleResult);
         console.log('Plate detection result:', plateResult);
         
         // Process vehicle detection result
         if (vehicleResult.status === 'fulfilled' && vehicleResult.value.success && vehicleResult.value.detected && vehicleResult.value.primaryVehicle) {
           console.log('Setting vehicle details:', vehicleResult.value.primaryVehicle);
           setCapturedVehicleDetails({
             type: vehicleResult.value.primaryVehicle.type,
             category: vehicleResult.value.primaryVehicle.category,
             number: vehicleResult.value.primaryVehicle.number,
             confidence: vehicleResult.value.primaryVehicle.confidence,
             timestamp: new Date().toLocaleString()
           });
         } else {
           console.log('No vehicle detected or detection failed');
           setCapturedVehicleDetails({
             type: 'Unknown',
             number: 'Not detected',
             confidence: 0,
             timestamp: new Date().toLocaleString()
           });
         }
         
         // Process plate detection result
         if (plateResult.status === 'fulfilled' && plateResult.value.success && plateResult.value.detected && plateResult.value.primaryPlate) {
           console.log('Setting plate details:', plateResult.value.primaryPlate);
           setCapturedPlateDetails({
             number: plateResult.value.primaryPlate.number,
             confidence: plateResult.value.primaryPlate.confidence,
             region: plateResult.value.primaryPlate.region,
             timestamp: new Date().toLocaleString()
           });
         } else {
           console.log('No plate detected or detection failed');
           setCapturedPlateDetails({
             number: 'Not detected',
             confidence: 0,
             region: null,
             timestamp: new Date().toLocaleString()
           });
         }
         
       } catch (error) {
         console.error('Error detecting vehicle/plate in captured image:', error);
         setCapturedVehicleDetails({
           type: 'Unknown',
           number: 'Detection failed',
           confidence: 0,
           timestamp: new Date().toLocaleString()
         });
         setCapturedPlateDetails({
           number: 'Detection failed',
           confidence: 0,
           region: null,
           timestamp: new Date().toLocaleString()
         });
       }
      
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('Failed to capture image');
    }
  };

  const downloadImage = () => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.download = `vehicle-capture-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
    link.href = capturedImage;
    link.click();
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={16} style={{ color: '#374151' }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
            Vehicle Detection Camera
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {getStatusIcon()}
            <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             fontSize: '12px',
             color: '#6b7280'
           }}>
             <span>HD</span>
             <span>•</span>
             <span>30fps</span>
             <span>•</span>
             <span style={{ 
               color: apiStatus === 'connected' ? '#10b981' : apiStatus === 'error' ? '#ef4444' : '#f59e0b' 
             }}>
               Vehicle API: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'error' ? 'Offline' : 'Checking...'}
             </span>
             <span>•</span>
             <span style={{ 
               color: plateApiStatus === 'connected' ? '#10b981' : plateApiStatus === 'error' ? '#ef4444' : '#f59e0b' 
             }}>
               Plate API: {plateApiStatus === 'connected' ? 'Connected' : plateApiStatus === 'error' ? 'Offline' : 'Checking...'}
             </span>
           </div>
          
          <button
            onClick={captureImage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Camera size={14} />
            Capture
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{
        display: 'flex',
        minHeight: '200px',
        height: '200px',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
      }}>
        {/* Captured Image - Left Side */}
        {capturedImage && (
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '200px',
            backgroundColor: '#f9fafb',
            borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #e5e7eb',
            borderBottom: window.innerWidth <= 768 ? '1px solid #e5e7eb' : 'none',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                Captured Image
              </h4>
              <button
                onClick={downloadImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
              >
                <Download size={12} />
                Save
              </button>
            </div>
            
            {/* Captured Image */}
            <div style={{
              flex: 1,
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              <img
                src={capturedImage}
                alt="Captured vehicle"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        )}

        {/* Camera Feed - Center */}
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {detectionStatus === 'error' ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#ef4444'
            }}>
              <XCircle size={32} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Camera Not Available</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Please check camera permissions
              </span>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          
          {/* Detection Overlay */}
          {detectionStatus === 'detected' && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px',
              color: 'white',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              animation: 'pulse 2s infinite'
            }}>
              <CheckCircle size={14} style={{ marginRight: '6px' }} />
              Vehicle Detected Successfully!
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              padding: '4px 8px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
              REC
            </div>
          )}
        </div>

        {/* Right Panel - Vehicle Details and Detection History */}
        <div style={{
          width: window.innerWidth <= 768 ? '100%' : capturedImage ? '280px' : '280px',
          backgroundColor: '#f9fafb',
          borderLeft: window.innerWidth <= 768 ? 'none' : '1px solid #e5e7eb',
          borderTop: window.innerWidth <= 768 ? '1px solid #e5e7eb' : 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px'
        }}>
           {/* Vehicle Details Section */}
           {capturedVehicleDetails && (
             <div style={{
               backgroundColor: '#fff',
               padding: '12px',
               borderRadius: '6px',
               border: '1px solid #e5e7eb',
               marginBottom: '16px'
             }}>
               <h4 style={{ 
                 margin: '0 0 12px 0', 
                 fontSize: '14px', 
                 fontWeight: '600', 
                 color: '#111827' 
               }}>
                 Vehicle Details
               </h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '12px', color: '#6b7280' }}>Class:</span>
                   <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                     {capturedVehicleDetails.type}
                   </span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '12px', color: '#6b7280' }}>Category:</span>
                   <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                     {capturedVehicleDetails.category || 'N/A'}
                   </span>
                 </div>
               </div>

               {/* License Plate Details Subsection */}
               {capturedPlateDetails && (
                 <div style={{
                   marginTop: '12px',
                   paddingTop: '12px',
                   borderTop: '1px solid #e5e7eb'
                 }}>
                   <h5 style={{ 
                     margin: '0 0 8px 0', 
                     fontSize: '13px', 
                     fontWeight: '600', 
                     color: '#374151' 
                   }}>
                     License Plate Details
                   </h5>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontSize: '12px', color: '#6b7280' }}>Plate Number:</span>
                       <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                         {capturedPlateDetails.number}
                       </span>
                     </div>
                     {capturedPlateDetails.region && (
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontSize: '12px', color: '#6b7280' }}>Region:</span>
                         <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                           {capturedPlateDetails.region}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
           )}

          {/* Detection History Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              Detection History
            </h4>
            
            <div style={{
              marginBottom: '12px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {detectedVehicles.length} vehicles detected today
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {detectedVehicles.length === 0 ? (
                <div style={{
                  color: '#9ca3af',
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '12px'
                }}>
                  No vehicles detected yet
                </div>
              ) : (
                detectedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    style={{
                      backgroundColor: '#fff',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                        {vehicle.type}
                      </span>
                      <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '500' }}>
                        {vehicle.confidence}%
                      </span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '13px', marginBottom: '4px' }}>
                      {vehicle.number}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {vehicle.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Image Capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default TopVehicleCamera;
