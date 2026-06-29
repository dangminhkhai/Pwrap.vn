'use client';

import { useState } from 'react';

export default function ActionButtons({ carName, serviceName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const validatePhone = (p) => {
    // Regex kiểm tra số điện thoại Việt Nam chuẩn (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
    const regex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    return regex.test(p.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Số điện thoại không hợp lệ (Phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('http://localhost:1337/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            name: name.trim(),
            phone: phone.trim(),
            serviceName: serviceName,
            carName: carName || 'Tất cả dòng xe'
          }
        })
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setPhone('');
        // Tự động đóng popup sau khi đăng ký thành công
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 2000);
      } else {
        throw new Error('Lỗi gửi thông tin');
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg('Hệ thống đang bận. Vui lòng thử lại sau.');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-action"
          style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase' }}
        >
          NHẬN TƯ VẤN
        </button>
        <a
          href="tel:0833698888"
          className="btn-outline"
          style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem', borderRadius: '12px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          LIÊN HỆ NGAY
        </a>
      </div>

      {/* POPUP MODAL NHẬN TƯ VẤN */}
      {isOpen && (
        <div className="popup-overlay" onClick={() => setIsOpen(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2ecc71' }}>Đăng Ký Thành Công!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>Chúng tôi đã ghi nhận yêu cầu tư vấn gói <strong>{serviceName}</strong> cho xe <strong>{carName}</strong> của bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '0.35rem' }}>Nhận Tư Vấn Miễn Phí</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Gói dịch vụ: <strong style={{ color: 'var(--text-main)' }}>{serviceName}</strong><br/>
                    Dòng xe áp dụng: <strong style={{ color: 'var(--text-main)' }}>{carName}</strong>
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(231, 76, 60, 0.12)', color: '#e74c3c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                    {errorMsg}
                  </div>
                )}

                <div className="form-group">
                  <label>Họ và tên <span style={{ color: 'var(--primary-light)' }}>*</span></label>
                  <input
                    type="text"
                    className="popup-input"
                    placeholder="Nhập họ và tên của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span style={{ color: 'var(--primary-light)' }}>*</span></label>
                  <input
                    type="tel"
                    className="popup-input"
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={status === 'submitting'}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-action"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'ĐANG GỬI YÊU CẦU...' : 'GỬI YÊU CẦU NGAY'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
