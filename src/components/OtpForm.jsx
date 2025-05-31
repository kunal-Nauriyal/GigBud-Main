// OtpForm.jsx
import { useState } from 'react';
import axios from 'axios';

function OtpForm({ email, onLogin }) {
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    const res = await axios.post('/api/login/verify-otp', { email, otp });
    localStorage.setItem('token', res.data.token);
    onLogin();
  };

  return (
    <div>
      <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}

export default OtpForm;
