'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';

export default function LandingPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="landing-page">
            {/* Navigation Bar */}
            <Navigation variant="landing" />
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">From blocks to code</h1>
                    <button 
                        onClick={() => scrollToSection('intro')}
                        className="hero-cta"
                    >
                        Real programming starts here
                        <span className="arrow">↓</span>
                    </button>
                </div>
            </section>

            {/* Intro Section */}
            <section id="intro" className="content-section intro-section">
                <h2>What is Whiskers?</h2>
                <div className="bullet-points">
                    <div className="bullet-item">
                        <span className="bullet-icon">✦</span>
                        <p>A text-based coding playground inspired by Scratch</p>
                    </div>
                    <div className="bullet-item">
                        <span className="bullet-icon">✦</span>
                        <p>Designed for learners transitioning from blocks to real programming</p>
                    </div>
                    <div className="bullet-item">
                        <span className="bullet-icon">✦</span>
                        <p>Provides intelligent guidance and feedback while you type</p>
                    </div>
                </div>
            </section>

            {/* The Gap Section */}
            <section className="content-section gap-section">
                <h2>Why Whiskers exists</h2>
                <div className="gap-content">
                    <div className="gap-card">
                        <h3>The Challenge</h3>
                        <p>
                            Block-based programming is a great start, but it hides the syntax and structure 
                            that real programming requires. Meanwhile, jumping straight into text-based 
                            languages like Python or JavaScript can feel overwhelming.
                        </p>
                    </div>
                    <div className="gap-card highlight">
                        <h3>The Solution</h3>
                        <p>
                            Whiskers bridges this gap. It introduces you to real code syntax gradually, 
                            with familiar Scratch concepts, while providing the guidance you need to 
                            build confidence and competence.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="content-section how-section">
                <h2>How Whiskers guides you</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">💡</div>
                        <h3>Smart Editor</h3>
                        <p>
                            Intelligent autocomplete and syntax highlighting help you write code 
                            correctly from the start.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Live Feedback</h3>
                        <p>
                            See instant feedback as you type, catching errors before you run your code.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Familiar Concepts</h3>
                        <p>
                            Use the same sprites, costumes, and sounds you know from Scratch, 
                            but with real code.
                        </p>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="content-section demo-section">
                <h2>See it in action</h2>
                <div className="demo-container">
                    <div className="demo-placeholder">
                        {/* Placeholder for animated GIF or interactive editor */}
                        <div className="demo-image-placeholder">
                            <p>🎬 Demo Video/GIF</p>
                            <span className="placeholder-text">
                                Show: typing code with autocomplete, running a simple animation
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who It's For Section */}
            <section className="content-section audience-section">
                <h2>Who it&apos;s for</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <div className="audience-icon">🎯</div>
                        <h3>Learners</h3>
                        <p>
                            Moving beyond Scratch and ready to write real code with guidance and support.
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">👨‍👩‍👧‍👦</div>
                        <h3>Parents</h3>
                        <p>
                            Looking for the next step after block-based programming for their children.
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">🎓</div>
                        <h3>Teachers</h3>
                        <p>
                            Bridging the gap between blocks and text in the classroom with a proven tool.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to start your journey?</h2>
                    <p>Take the leap from blocks to real code today.</p>
                    <Link 
                        href="/playground"
                        className="cta-button"
                    >
                        {isMobile ? 'Try it now (Desktop recommended)' : 'Try it now'}
                    </Link>
                    {isMobile && (
                        <p className="mobile-notice">
                            💡 For the best experience, we recommend using Whiskers on a desktop or laptop computer.
                        </p>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2026 Whiskers. Empowering the next generation of programmers.</p>
            </footer>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="back-to-top"
                    aria-label="Back to top"
                >
                    ↑
                </button>
            )}
        </div>
    );
}
