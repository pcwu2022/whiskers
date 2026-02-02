'use client';

import React from 'react';
import { useTranslation } from '@/i18n';

type Props = { role: 'teacher' | 'parent' };

const WhatsNextSection = ({ role }: Props) => {
    const { t } = useTranslation();
    
    return (
        <div>
            <section id="whats-next" className="content-section gap-section">
                <h2 className="section-title">{t.landing.whatsNext.title}</h2>
                <div className="gap-content">
                    {role === 'parent' && (
                        <div className="gap-card parent-card">
                            <h3 className="card-title">{t.landing.whatsNext.parent.title}</h3>
                            <ol className="styled-list">
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.parent.step1Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.parent.step1Text}
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.parent.step2Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.parent.step2Text}
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.parent.step3Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.parent.step3Text}
                                    </p>
                                </li>
                            </ol>
                            <p className="card-footer">{t.landing.whatsNext.parent.footer}</p>
                        </div>
                    )}
                    {role === 'teacher' && (
                        <div className="gap-card highlight teacher-card">
                            <h3 className="card-title">{t.landing.whatsNext.teacher.title}</h3>
                            <ol className="styled-list">
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.teacher.step1Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.teacher.step1Text}
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.teacher.step2Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.teacher.step2Text}
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">{t.landing.whatsNext.teacher.step3Title}</h4>
                                    <p>
                                        {t.landing.whatsNext.teacher.step3Text}
                                    </p>
                                </li>
                            </ol>
                            <p className="card-footer">{t.landing.whatsNext.teacher.footer}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WhatsNextSection;
