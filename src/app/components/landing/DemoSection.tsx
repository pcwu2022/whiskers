'use client';

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/i18n'

interface DemoSectionProps {
    isMobile: boolean
}

const DemoSection: React.FC<DemoSectionProps> = ({ isMobile }) => {
    const { t } = useTranslation();
    
    return (
        <section id="demo" className="content-section demo-section">
            <h2>{t.landing.demo.title}</h2>
            <div className="demo-container">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <iframe
                        width="640"
                        height="360"
                        src={t.landing.demo.videoUrl}
                        title="Whiskers - From Blocks to Code"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{ maxWidth: '100%' }}
                    />
                </div></div>
            <div className="demo-cta-container">
                <Link 
                    href="/playground"
                    className="demo-cta-button"
                >
                    {isMobile ? t.landing.demo.ctaMobile : t.landing.demo.cta}
                </Link>
                {isMobile && (
                    <p className="mobile-notice">
                        {t.landing.demo.mobileNotice}
                    </p>
                )}
            </div>
        </section>
    )
}

export default DemoSection
