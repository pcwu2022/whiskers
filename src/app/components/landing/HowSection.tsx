'use client';

import React from 'react'
import { useTranslation } from '@/i18n'

const HowSection = () => {
    const { t } = useTranslation();
    
    return (
        <div>
            <section className="content-section how-section">
                <h2>{t.landing.how.title}</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>{t.landing.how.familiarTitle}</h3>
                        <p>
                            {t.landing.how.familiarText}
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💡</div>
                        <h3>{t.landing.how.smartEditorTitle}</h3>
                        <p>
                            {t.landing.how.smartEditorText}
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>{t.landing.how.liveFeedbackTitle}</h3>
                        <p>
                            {t.landing.how.liveFeedbackText}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HowSection   
