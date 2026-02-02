'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from "@/i18n";
import Navigation from "../components/Navigation";
import { AnalyticsProvider } from "../components/AnalyticsProvider";
import TrackedSection from "../components/TrackedSection";

export default function SupportPage() {
    const { t } = useTranslation();
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnalyticsProvider>
            <div className="support-page">
                {/* Navigation Bar */}
                <Navigation variant="landing" />

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-6 py-10">
                    <h1 className="text-3xl font-bold mb-8">{t.support.pageTitle}</h1>

                    {/* TL;DR - Quick Start */}
                    <section id="quick-start" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">{t.support.quickStart.title}</h2>
                        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-lg p-6">
                            <p className="text-lg mb-4">{t.support.quickStart.intro}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1 */}
                                <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                    <span className="text-3xl">1️⃣</span>
                                    <div>
                                        <h3 className="font-bold text-green-400">{t.support.quickStart.step1Title}</h3>
                                        <p className="text-gray-300 text-sm">{t.support.quickStart.step1Text}</p>
                                    </div>
                                </div>
                                
                                {/* Step 2 */}
                                <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                    <span className="text-3xl">2️⃣</span>
                                    <div>
                                        <h3 className="font-bold text-blue-400">{t.support.quickStart.step2Title}</h3>
                                        <p className="text-gray-300 text-sm">{t.support.quickStart.step2Text}</p>
                                    </div>
                                </div>
                                
                                {/* Step 3 */}
                                <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                    <span className="text-3xl">3️⃣</span>
                                    <div>
                                        <h3 className="font-bold text-purple-400">{t.support.quickStart.step3Title}</h3>
                                        <p className="text-gray-300 text-sm">{t.support.quickStart.step3Text}</p>
                                    </div>
                                </div>
                                
                                {/* Step 4 */}
                                <div className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                                    <span className="text-3xl">4️⃣</span>
                                    <div>
                                        <h3 className="font-bold text-orange-400">{t.support.quickStart.step4Title}</h3>
                                        <p className="text-gray-300 text-sm">{t.support.quickStart.step4Text}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-5 p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                                <p className="text-sm">{t.support.quickStart.reminder}</p>
                            </div>
                        </div>
                    </section>

                    {/* How Project Saving Works */}
                    <section id="saving" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-400">{t.support.saving.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.saving.intro}</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>{t.support.saving.bullet1}</li>
                                <li>{t.support.saving.bullet2}</li>
                                <li>{t.support.saving.bullet3}</li>
                                <li>{t.support.saving.bullet4}</li>
                            </ul>
                            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded p-4 mt-4">
                                <p className="text-yellow-200">{t.support.saving.warning}</p>
                            </div>
                        </div>
                    </section>

                    {/* Download Project */}
                    <section id="download" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-green-400">{t.support.download.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.download.intro}</p>
                            <ol className="list-decimal list-inside space-y-3 ml-4">
                                <li>{t.support.download.step1}</li>
                                <li>{t.support.download.step2}</li>
                                <li>{t.support.download.step3}</li>
                            </ol>
                            <p className="text-gray-400 text-sm mt-4">{t.support.download.zipContents}</p>
                            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400 text-sm">
                                <li><code>{t.support.download.zipItem1}</code></li>
                                <li><code>{t.support.download.zipItem2}</code></li>
                            </ul>
                        </div>
                    </section>

                    {/* Upload Project */}
                    <section id="upload" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-purple-400">{t.support.upload.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.upload.intro}</p>
                            <ol className="list-decimal list-inside space-y-3 ml-4">
                                <li>{t.support.upload.step1}</li>
                                <li>{t.support.upload.step2}</li>
                                <li>{t.support.upload.step3}</li>
                                <li>{t.support.upload.step4}</li>
                            </ol>
                            <p className="text-gray-400 text-sm mt-4">{t.support.upload.dragDrop}</p>
                        </div>
                    </section>

                    {/* New Project */}
                    <section id="new-project" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-orange-400">{t.support.newProject.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.newProject.intro}</p>
                            <ol className="list-decimal list-inside space-y-3 ml-4">
                                <li>{t.support.newProject.step1}</li>
                                <li>{t.support.newProject.step2}</li>
                                <li>{t.support.newProject.step3}</li>
                            </ol>
                        </div>
                    </section>

                    {/* Sprites */}
                    <section id="sprites" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">{t.support.sprites.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.sprites.intro}</p>
                            <div className="grid gap-4 mt-4">
                                <div className="bg-gray-700/50 rounded p-4">
                                    <h4 className="font-semibold text-green-400">{t.support.sprites.adding.title}</h4>
                                    <p className="text-gray-300 text-sm mt-1">{t.support.sprites.adding.text}</p>
                                </div>
                                <div className="bg-gray-700/50 rounded p-4">
                                    <h4 className="font-semibold text-blue-400">{t.support.sprites.switching.title}</h4>
                                    <p className="text-gray-300 text-sm mt-1">{t.support.sprites.switching.text}</p>
                                </div>
                                <div className="bg-gray-700/50 rounded p-4">
                                    <h4 className="font-semibold text-red-400">{t.support.sprites.deleting.title}</h4>
                                    <p className="text-gray-300 text-sm mt-1">{t.support.sprites.deleting.text}</p>
                                </div>
                                <div className="bg-gray-700/50 rounded p-4">
                                    <h4 className="font-semibold text-purple-400">{t.support.sprites.stage.title}</h4>
                                    <p className="text-gray-300 text-sm mt-1">{t.support.sprites.stage.text}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Costumes */}
                    <section id="costumes" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-pink-400">{t.support.costumes.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.costumes.intro}</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>{t.support.costumes.adding}</li>
                                <li>{t.support.costumes.preview}</li>
                            </ul>
                            <p className="text-gray-400 text-sm mt-4">{t.support.costumes.note}</p>
                        </div>
                    </section>

                    {/* Sounds */}
                    <section id="sounds" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-indigo-400">{t.support.sounds.title}</h2>
                        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                            <p>{t.support.sounds.intro}</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>{t.support.sounds.adding}</li>
                                <li>{t.support.sounds.supported}</li>
                            </ul>
                            <p className="text-gray-400 text-sm mt-4">{t.support.sounds.note}</p>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-emerald-400">{t.support.faq.title}</h2>
                        <div className="space-y-4">
                            <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                                <summary className="font-semibold">{t.support.faq.q1}</summary>
                                <p className="mt-3 text-gray-300">{t.support.faq.a1}</p>
                            </details>
                            <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                                <summary className="font-semibold">{t.support.faq.q2}</summary>
                                <p className="mt-3 text-gray-300">{t.support.faq.a2}</p>
                            </details>
                            <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                                <summary className="font-semibold">{t.support.faq.q3}</summary>
                                <p className="mt-3 text-gray-300">{t.support.faq.a3}</p>
                            </details>
                            <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
                                <summary className="font-semibold">{t.support.faq.q4}</summary>
                                <p className="mt-3 text-gray-300">{t.support.faq.a4}</p>
                            </details>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <TrackedSection id="footer" className="landing-footer-wrapper">
                    <footer className="landing-footer">
                        <p>{t.landing.footer.developedBy} <a href='https://pcwu2022.github.io'>{t.landing.footer.authorName}</a>. {t.landing.footer.mission}</p>
                    </footer>
                </TrackedSection>

                {/* Back to Top Button */}
                {showBackToTop && (
                    <button
                        onClick={scrollToTop}
                        className="back-to-top"
                        aria-label={t.landing.backToTop}
                    >
                        ↑
                    </button>
                )}
            </div>
        </AnalyticsProvider>
    );
}
