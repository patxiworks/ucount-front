
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function AlertBox({status, onClose, severity, message}) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={status}
      autoHideDuration={5000}
      onClose={onClose}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
