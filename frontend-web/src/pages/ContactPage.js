import React, { useState } from 'react';
import '../App.css';

const ContactPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.message) {
        setError('Please fill in all fields.');
        return;
    }
    setSending(true);
    try {
        const res = await fetch('http://localhost:8000/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                content: form.message 
            })
        });
        if (!res.ok) {
            const data = await res.json();
            setError(data.message || 'Failed to send contact.');
        } else {
            setForm({ name: '', email: '', message: '' });
        }
    } catch (err) {
        setError('Server error');
    }
    setSending(false);
};


    return (
        <div className="contact-page" style={{
            maxWidth: 420,
            margin: '48px auto',
            padding: 32,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1.5px 4px rgba(40,167,69,0.10)'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: 28,
                color: '#28a745',
                letterSpacing: 1
            }}>Contact Us</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500, color: '#333' }}>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginTop: 6,
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 16,
                            background: '#f9f9f9'
                        }}
                        placeholder="Your name"
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500, color: '#333' }}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginTop: 6,
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 16,
                            background: '#f9f9f9'
                        }}
                        placeholder="email"
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500, color: '#333' }}>Message</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginTop: 6,
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 16,
                            background: '#f9f9f9',
                            resize: 'vertical'
                        }}
                        placeholder="Type your message here"
                    />
                </div>
                {error && <div style={{
                    color: '#dc3545',
                    marginBottom: 16,
                    textAlign: 'center',
                    fontWeight: 500
                }}>{error}</div>}
                <button
                    type="submit"
                    disabled={sending}
                    style={{
                        width: '100%',
                        padding: '12px 0',
                        background: sending ? '#218838' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: 1,
                        cursor: sending ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {sending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ContactPage;