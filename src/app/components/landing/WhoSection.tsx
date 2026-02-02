'use client';

import React from 'react'
import { useTranslation } from '@/i18n'

const WhoSection = () => {
    const { t } = useTranslation();
    
    return (
        <div>
            <section className="content-section audience-section">
                <h2 className="section-title">{t.landing.who.title}</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <div className="audience-icon">🎯</div>
                        <h3 className="card-title">{t.landing.who.learnersTitle}</h3>
                        <p>
                            {t.landing.who.learnersText}
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">🏫</div>
                        <h3 className="card-title">{t.landing.who.classroomsTitle}</h3>
                        <p>
                            {t.landing.who.classroomsText}
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">🏠</div>
                        <h3 className="card-title">{t.landing.who.homeLearningTitle}</h3>
                        <p>
                            {t.landing.who.homeLearningText}
                        </p>
                    </div>
                </div>
            </section>         
        </div>
    )
}

export default WhoSection
