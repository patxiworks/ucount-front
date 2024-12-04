
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import '@/styles/attendance.css';

const handleScanQRCode = (router) => {
  // Navigate to the QR code scanner page
  router.push("/scanner");
};

export function ValidateMessage({ router }) {
  return (
    <div className="validate-message">
      <p className="text-lg text-gray-700 my-6 mx-[20px]">
        Please scan the QR code to validate your attendance.
      </p>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleScanQRCode(router)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Scan QR Code
      </Button>
    </div>
  );
}

// Loading component for better UX
export function LoadingSpinner() {
  return (
    <div style={{textAlign: 'center', marginTop: '5rem'}}>
      <CircularProgress color='secondary' />
    </div>
  );
}
