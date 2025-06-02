import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, initialCheckDone } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatar: '',
    age: '',
    profession: '',
    phone: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!initialCheckDone) return;

    const fetchProfile = async () => {
      try {
        if (user) {
          // Initialize with AuthContext user data
          const initialProfile = {
            name: user.name || 'Unnamed User',
            email: user.email || 'email@example.com',
            avatar: user.avatar || '',
            age: user.age || '',
            profession: user.profession || '',
            phone: user.phone || ''
          };
          setProfile(initialProfile);
          setForm(initialProfile);
        }

        // Fixed: Change from '/user/me' to '/users/me'
        const res = await api.get('/users/me');
        const apiUser = res.data.data;
        const updatedProfile = {
          name: user?.name || apiUser.name || 'Unnamed User',
          email: user?.email || apiUser.email || 'email@example.com',
          avatar: user?.avatar || apiUser.avatar || '',
          age: apiUser.age || user?.age || '',
          profession: apiUser.profession || user?.profession || '',
          phone: apiUser.phone || user?.phone || ''
        };
        console.log('Setting profile from API:', updatedProfile);
        setProfile(updatedProfile);
        setForm(updatedProfile);
      } catch (err) {
        console.error('Profile load error:', err);
        setMessage('Failed to load profile.');
        if (user) {
          // Fallback to AuthContext user
          const fallbackProfile = {
            name: user.name || 'Unnamed User',
            email: user.email || 'email@example.com',
            avatar: user.avatar || '',
            age: user.age || '',
            profession: user.profession || '',
            phone: user.phone || ''
          };
          setProfile(fallbackProfile);
          setForm(fallbackProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, initialCheckDone]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.email) {
        setMessage('Name and email are required.');
        return;
      }
      // Fixed: Change from '/user/me' to '/users/me'
      const res = await api.put('/users/me', form);
      setProfile({ ...profile, ...res.data.data });
      setEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Failed to update profile.');
    }
  };

  if (!initialCheckDone || loading) return <div>Loading...</div>;
  if (!profile) return <div>No user data found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Profile</h2>
      {message && <p style={{ color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}
      
      <div style={{ marginBottom: '1rem' }}>
        <img 
          src={editing ? form.avatar : profile.avatar || 'https://via.placeholder.com/150'} 
          alt="Avatar" 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        {editing && (
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            placeholder="Avatar URL"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name: </label>
          {editing ? (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          ) : (
            <div>{profile.name}</div>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email: </label>
          {editing ? (
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          ) : (
            <div>
              {profile.email}
              {profile.emailVerified && <span style={{ color: 'green', marginLeft: '0.5rem' }}>✓ Verified</span>}
            </div>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Age: </label>
          {editing ? (
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          ) : (
            <div>{profile.age || 'Not set'}</div>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Profession: </label>
          {editing ? (
            <input
              name="profession"
              value={form.profession}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          ) : (
            <div>{profile.profession || 'Not set'}</div>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone: </label>
          {editing ? (
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          ) : (
            <div>
              {profile.phone || 'Not set'}
              {profile.phoneVerified && <span style={{ color: 'green', marginLeft: '0.5rem' }}>✓ Verified</span>}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        {editing ? (
          <>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;