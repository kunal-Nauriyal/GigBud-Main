// AuthFlow.jsx
import { useState } from 'react';
import LoginForm from './LoginForm';
import OtpForm from './OtpForm';

function AuthFlow() {
  const [email, setEmail] = useState(null);

  return (
    <div>
      {!email ? (
        <LoginForm onOtpSent={setEmail} />
      ) : (
        <OtpForm email={email} onLogin={() => alert('Logged in!')} />
      )}
    </div>
  );
}

export default AuthFlow;
