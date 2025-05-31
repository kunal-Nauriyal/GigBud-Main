import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', avatar: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axios.get('/api/user/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(res => {
      setUser(res.data.data);
      setForm(res.data.data);
    })
    .catch(err => console.error('Profile load error:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put('/api/user/me', form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(res => {
      setUser(res.data.data);
      setEditing(false);
    })
    .catch(err => console.error('Profile update error:', err));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profile</h2>
      <img src={form.avatar || user.avatar} alt="Avatar" width={100} />
      <div>
        <label>Name: </label>
        {editing ? (
          <input name="name" value={form.name} onChange={handleChange} />
        ) : (
          <span>{user.name}</span>
        )}
      </div>
      <div>
        <label>Email: </label>
        {editing ? (
          <input name="email" value={form.email} onChange={handleChange} />
        ) : (
          <span>{user.email}</span>
        )}
      </div>
      <div>
        <label>Avatar URL: </label>
        {editing ? (
          <input name="avatar" value={form.avatar} onChange={handleChange} />
        ) : (
          <span>{user.avatar}</span>
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {editing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
};

export default Profile;
