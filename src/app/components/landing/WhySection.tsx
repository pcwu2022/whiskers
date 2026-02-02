'use client';

import React from 'react'
import { useTranslation } from '@/i18n'

const WhySection = () => {
    const { t } = useTranslation();
    
    return (
        <div>
            <section id="why" className="content-section gap-section">
                <h2 className="section-title">{t.landing.why.title}</h2>
                <div className="gap-content">
                    <div className="gap-card">
                        <h3 className="card-title">{t.landing.why.challengeTitle}</h3>
                        <p>
                            {t.landing.why.challengeText}
                        </p>
                    </div>
                    <div className="gap-card highlight">
                        <h3 className="card-title">{t.landing.why.solutionTitle}</h3>
                        <p>
                            {t.landing.why.solutionText}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default WhySection
