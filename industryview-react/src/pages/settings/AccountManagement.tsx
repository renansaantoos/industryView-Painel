import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { authApi, usersApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import { User, Lock, Globe, Save, Shield } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, LANGUAGES } from '../../i18n';

export default function AccountManagement() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();

  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'language'>('profile');

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await usersApi.patchUser(user.id, {
        name: profileName.trim(),
        phone: profilePhone.trim() || undefined,
      });
      updateUser({ name: profileName.trim(), phone: profilePhone.trim() });
      setProfileSuccess(t('account.profileUpdated'));
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('account.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('account.passwordTooShort'));
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('ff_token') || '';
      await authApi.changePassword(token, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(t('account.passwordChanged'));
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleChangeLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    changeLanguage(lang);
  };

  const sections = [
    { key: 'profile' as const, label: t('account.profile'), icon: <User size={18} /> },
    { key: 'password' as const, label: t('account.changePassword'), icon: <Lock size={18} /> },
    { key: 'language' as const, label: t('account.language'), icon: <Globe size={18} /> },
  ];

  return (
    <div>
      <PageHeader
        title={t('account.title')}
        subtitle={t('account.subtitle')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        {/* Sidebar navigation */}
        <div className="card" style={{ padding: '8px' }}>
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                background: activeSection === section.key ? 'var(--color-tertiary-bg)' : 'transparent',
                color: activeSection === section.key ? 'var(--color-primary)' : 'var(--color-primary-text)',
                fontWeight: activeSection === section.key ? 500 : 400,
                fontSize: '14px',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="card">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div variants={staggerParent} initial="initial" animate="animate">
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>
                {t('account.profile')}
              </h3>

              {profileSuccess && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)', fontSize: '13px' }}>
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="auth-error" style={{ marginBottom: '16px' }}>{profileError}</div>
              )}

              <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.name')}</label>
                  <input className="input-field" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </motion.div>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.email')}</label>
                  <input className="input-field" value={user?.email || ''} disabled />
                </motion.div>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.phone')}</label>
                  <input className="input-field" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                </motion.div>
                <motion.div variants={fadeUpChild}>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={profileSaving} style={{ alignSelf: 'flex-start' }}>
                    {profileSaving ? <span className="spinner" /> : <><Save size={18} /> {t('common.save')}</>}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <motion.div variants={staggerParent} initial="initial" animate="animate">
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>
                {t('account.changePassword')}
              </h3>

              {passwordSuccess && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)', fontSize: '13px' }}>
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="auth-error" style={{ marginBottom: '16px' }}>{passwordError}</div>
              )}

              <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.currentPassword')}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </motion.div>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.newPassword')}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </motion.div>
                <motion.div variants={fadeUpChild} className="input-group">
                  <label>{t('account.confirmPassword')}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </motion.div>
                <motion.div variants={fadeUpChild}>
                  <button className="btn btn-primary" onClick={handleChangePassword} disabled={passwordSaving} style={{ alignSelf: 'flex-start' }}>
                    {passwordSaving ? <span className="spinner" /> : <><Lock size={18} /> {t('account.changePassword')}</>}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Language Section */}
          {activeSection === 'language' && (
            <motion.div variants={staggerParent} initial="initial" animate="animate">
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '24px' }}>
                {t('account.language')}
              </h3>
              <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
                {LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang.code}
                    variants={fadeUpChild}
                    onClick={() => handleChangeLanguage(lang.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `2px solid ${selectedLanguage === lang.code ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
                      backgroundColor: selectedLanguage === lang.code ? 'var(--color-tertiary-bg)' : 'transparent',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === lang.code ? 500 : 400,
                      color: 'var(--color-primary-text)',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{lang.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{lang.nativeName}</div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Shield size={16} color="var(--color-primary)" style={{ marginLeft: 'auto' }} />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
