import React, { useState } from 'react';

interface SignalsPasswordModalProps {
    onAuthenticate: (password: string) => Promise<boolean>;
    errorMessage?: string | null;
}

export const SignalsPasswordModal: React.FC<SignalsPasswordModalProps> = ({
    onAuthenticate,
    errorMessage
}) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password.trim()) return;
        
        setIsLoading(true);
        try {
            await onAuthenticate(password);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
            }}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3
                    style={{
                        margin: '0 0 1rem 0',
                        color: '#1f2937',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                    }}
                >
                    Access Signals Center
                </h3>

                <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '14px' }}>
                    Enter your access code to unlock the signals center
                </p>

                <input
                    type='password'
                    placeholder='Enter access code'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#fbbf24')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                    onKeyPress={handleKeyPress}
                />

                {errorMessage && (
                    <p style={{ 
                        margin: '0 0 1rem 0', 
                        color: '#ef4444', 
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        {errorMessage}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !password.trim()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: isLoading || !password.trim() 
                            ? '#d1d5db' 
                            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
                        marginBottom: '1rem',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => {
                        if (!isLoading && password.trim()) {
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }
                    }}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isLoading ? 'Verifying Access...' : 'Unlock Signals'}
                </button>

                <div
                    style={{
                        textAlign: 'center',
                        margin: '1rem 0',
                        color: '#9ca3af',
                        fontSize: '12px',
                    }}
                >
                    OR
                </div>

                <a
                    href='https://wa.me/254799094649'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s',
                        boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='white'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                    </svg>
                    Contact Admin for Access
                </a>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'transparent',
                        color: '#6b7280',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '1rem',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};