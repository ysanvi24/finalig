import React from 'react';

const Footer = () => (
    <footer
        className="mt-12 py-6 text-center px-4"
        style={{
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
        }}
    >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Developed by:{' '}Chinmay Sabharwal, Anshul Jain, Sanvi Y
            <br />
            Mentored by:{' '}Vedant Singh, Jayesh Patil
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            © 2026 शाश्वतम् Institute Gathering. All rights reserved.
        </p>
    </footer>
);

export default Footer;
