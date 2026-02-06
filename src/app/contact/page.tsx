'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useTranslation } from '@/i18n';
import Navigation from '../components/Navigation';
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import TrackedSection from '../components/TrackedSection';
import Link from 'next/link';

// Get or create a simple session id for rate-limiting
function getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let id = sessionStorage.getItem('whiskers_contact_sid');
    if (!id) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('whiskers_contact_sid', id);
    }
    return id;
}

type Category = 'bug' | 'feature' | 'question' | 'other';

export default function ContactPage() {
    const { t } = useTranslation();
    const submitFeedback = useMutation(api.feedback.submit);

    const [category, setCategory] = useState<Category>('bug');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Client-side rate limiting (belt & suspenders with server-side)
    const sendTimestamps = useRef<number[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmed = message.trim();
        if (!trimmed) return;

        // Client-side rate limit: max 5 in 60 seconds
        const now = Date.now();
        sendTimestamps.current = sendTimestamps.current.filter(ts => now - ts < 60_000);
        if (sendTimestamps.current.length >= 5) {
            setError(t.contact.errorRateLimit);
            return;
        }

        setSending(true);
        try {
            await submitFeedback({
                sessionId: getSessionId(),
                category,
                message: trimmed,
                email: email.trim() || undefined,
            });
            sendTimestamps.current.push(now);
            setSent(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('Too many')) {
                setError(t.contact.errorRateLimit);
            } else {
                setError(t.contact.errorGeneric);
            }
        } finally {
            setSending(false);
        }
    };

    const handleSendAnother = () => {
        setSent(false);
        setMessage('');
        setEmail('');
        setCategory('bug');
        setError('');
    };

    const categoryOptions: { value: Category; label: string }[] = [
        { value: 'bug', label: t.contact.categories.bug },
        { value: 'feature', label: t.contact.categories.feature },
        { value: 'question', label: t.contact.categories.question },
        { value: 'other', label: t.contact.categories.other },
    ];

    return (
        <AnalyticsProvider>
            <div className="support-page">
                {/* Navigation Bar */}
                <Navigation variant="landing" />

                {/* Main Content */}
                <main className="max-w-2xl mx-auto px-6 py-10">
                    <h1 className="text-3xl font-bold mb-2">{t.contact.pageTitle}</h1>
                    <p className="text-gray-400 mb-8">{t.contact.subtitle}</p>

                    {sent ? (
                        /* Success state */
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/50 rounded-lg p-8 text-center">
                            <h2 className="text-2xl font-bold text-green-400 mb-3">
                                {t.contact.successTitle}
                            </h2>
                            <p className="text-gray-300 mb-6">{t.contact.successMessage}</p>
                            <button
                                onClick={handleSendAnother}
                                className="px-6 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                {t.contact.sendAnother}
                            </button>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t.contact.categoryLabel}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {categoryOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCategory(opt.value)}
                                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                                                category === opt.value
                                                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="contact-message"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    {t.contact.messageLabel}
                                </label>
                                <textarea
                                    id="contact-message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder={t.contact.messagePlaceholder}
                                    maxLength={5000}
                                    rows={6}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                                />
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {message.length} / 5000 {t.contact.charCount}
                                </p>
                            </div>

                            {/* Email (optional) */}
                            <div>
                                <label
                                    htmlFor="contact-email"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    {t.contact.emailLabel}
                                </label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t.contact.emailPlaceholder}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {t.contact.emailHint}
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-900/30 border border-red-600/50 rounded-lg px-4 py-3 text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={sending || message.trim().length === 0}
                                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                                    sending || message.trim().length === 0
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500'
                                }`}
                            >
                                {sending ? t.contact.sending : t.contact.submit}
                            </button>
                        </form>
                    )}
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
