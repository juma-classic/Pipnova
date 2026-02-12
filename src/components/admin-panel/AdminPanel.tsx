import React, { useState, useEffect } from 'react';
import './AdminPanel.scss';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
    const [adminAccounts, setAdminAccounts] = useState<string[]>([]);
    const [newAccount, setNewAccount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAdminAccounts();
    }, []);

    const loadAdminAccounts = () => {
        try {
            const stored = localStorage.getItem('pipnova_admin_accounts');
            if (stored) {
                setAdminAccounts(JSON.parse(stored));
            } else {
                // Initialize with default admins
                const defaultAdmins = [
                    'CR5186289',
                    'VRTC90460',
                    'VRTC10463082',
                    'CR7005911',
                    'CR2371589',
                    'VRTC4143924',
                ];
                setAdminAccounts(defaultAdmins);
                localStorage.setItem('pipnova_admin_accounts', JSON.stringify(defaultAdmins));
            }
        } catch (error) {
            console.error('Error loading admin accounts:', error);
        }
    };

    const saveAdminAccounts = (accounts: string[]) => {
        try {
            localStorage.setItem('pipnova_admin_accounts', JSON.stringify(accounts));
            setAdminAccounts(accounts);
        } catch (error) {
            console.error('Error saving admin accounts:', error);
        }
    };

    const addAccount = () => {
        const trimmed = newAccount.trim().toUpperCase();
        
        if (!trimmed) {
            alert('Please enter an account number');
            return;
        }

        // Validate format (CR or VRTC followed by numbers)
        if (!trimmed.match(/^(CR|VRTC)\d+$/)) {
            alert('Invalid format. Use CR##### or VRTC##### format');
            return;
        }

        if (adminAccounts.includes(trimmed)) {
            alert('This account is already in the admin list');
            return;
        }

        const updated = [...adminAccounts, trimmed];
        saveAdminAccounts(updated);
        setNewAccount('');
    };

    const removeAccount = (account: string) => {
        if (confirm(`Remove ${account} from admin access?`)) {
            const updated = adminAccounts.filter(acc => acc !== account);
            saveAdminAccounts(updated);
        }
    };

    const filteredAccounts = adminAccounts.filter(acc =>
        acc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="admin-panel-overlay" onClick={onClose}>
            <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
                <div className="admin-panel-header">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>
                        </svg>
                        Admin Access Control
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="admin-panel-content">
                    <div className="add-section">
                        <h3>Add Admin Account</h3>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Enter CR or VRTC number (e.g., CR1234567)"
                                value={newAccount}
                                onChange={(e) => setNewAccount(e.target.value.toUpperCase())}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addAccount();
                                    }
                                }}
                            />
                            <button className="add-btn" onClick={addAccount}>
                                Add Account
                            </button>
                        </div>
                        <p className="hint">Format: CR followed by numbers or VRTC followed by numbers</p>
                    </div>

                    <div className="list-section">
                        <div className="list-header">
                            <h3>Admin Accounts ({adminAccounts.length})</h3>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search accounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="accounts-list">
                            {filteredAccounts.length === 0 ? (
                                <div className="empty-state">
                                    {searchTerm ? 'No accounts match your search' : 'No admin accounts added yet'}
                                </div>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <div key={account} className="account-item">
                                        <div className="account-info">
                                            <span className={`account-badge ${account.startsWith('CR') ? 'real' : 'demo'}`}>
                                                {account.startsWith('CR') ? 'REAL' : 'DEMO'}
                                            </span>
                                            <span className="account-number">{account}</span>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeAccount(account)}
                                            title="Remove admin access"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="info-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3b82f6"/>
                            </svg>
                            <p>Admin accounts have full access to all features and settings.</p>
                        </div>
                        <div className="info-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#f59e0b"/>
                            </svg>
                            <p>Changes take effect immediately after page refresh.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
