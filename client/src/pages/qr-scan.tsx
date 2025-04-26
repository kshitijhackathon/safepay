import React from 'react';
import { EnhancedQRScanner } from '@/components/scanner/enhanced-qr-scanner';
import { useLocation } from 'wouter';

export default function QRScan() {
  const [, setLocation] = useLocation();
  
  const handleScan = (qrData: string) => {
    console.log('QR code scanned:', qrData);
    // Store the scan data and redirect to scan page for processing
    try {
      sessionStorage.setItem('lastScannedQR', qrData);
    } catch (error) {
      console.error('Error storing QR data:', error);
    }
    setLocation('/scan?qrData=' + encodeURIComponent(qrData));
  };
  
  const handleClose = () => {
    setLocation('/home');
  };
  
  return (
    <div className="h-screen w-full">
      <EnhancedQRScanner 
        onScan={handleScan}
        onClose={handleClose}
      />
    </div>
  );
}