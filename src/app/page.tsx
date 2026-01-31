'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';

type UserRole = 'student' | 'parent' | 'teacher' | null;

export default function LandingPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null);

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

    const handleRoleSelection = (role: UserRole) => {
        setUserRole(role);
        setTimeout(() => {
            if (role === 'student') {
                scrollToSection('demo');
            } else {
                scrollToSection('why');
            }
        }, 100);
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
                        onClick={() => scrollToSection('role-selection')}
                        className="hero-cta"
                    >
                        Real programming starts here
                        <span className="arrow">↓</span>
                    </button>
                </div>
            </section>

            {/* Role Selection Section */}
            <section id="role-selection" className="role-selection-section">
                <div className="role-selection-content">
                    <h2>I&apos;m a...</h2>
                    <div className="role-buttons">
                        <button
                            onClick={() => handleRoleSelection('student')}
                            className={`role-button ${userRole === 'student' ? 'active' : ''}`}
                        >
                            <span className="role-icon"><img src="ip/student.png" alt="student icon" /></span>
                            <span className="role-label">Student</span>
                            <span className="role-desc">Ready to write real code</span>
                        </button>
                        <button
                            onClick={() => handleRoleSelection('parent')}
                            className={`role-button ${userRole === 'parent' ? 'active' : ''}`}
                        >
                            <span className="role-icon"><img src="ip/parent.png" alt="parent icon" /></span>
                            <span className="role-label">Parent</span>
                            <span className="role-desc">Helping my child learn</span>
                        </button>
                        <button
                            onClick={() => handleRoleSelection('teacher')}
                            className={`role-button ${userRole === 'teacher' ? 'active' : ''}`}
                        >
                            <span className="role-icon"><img src="ip/teacher.png" alt="teacher icon" /></span>
                            <span className="role-label">Teacher</span>
                            <span className="role-desc">Bridging blocks to text</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Student Path: Demo First */}
            {userRole === 'student' && (
                <>
                    {/* Demo Section */}
                    <section id="demo" className="content-section demo-section">
                        <h2>What is Whiskers?</h2>
                        <div className="demo-container">
                            <div className="demo-placeholder">
                                <div className="demo-image-placeholder">
                                    <p>🎬 Demo Video/GIF</p>
                                    <span className="placeholder-text">
                                        Show: typing code with autocomplete, running a simple animation
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="demo-cta-container">
                            <Link 
                                href="/playground"
                                className="demo-cta-button"
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

                    {/* How It Works */}
                    <section className="content-section how-section">
                        <h2>How Whiskers guides you</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Familiar Concepts</h3>
                                <p>
                                    Bring the masterpiece you built in Scratch to life, 
                                    but with <i>real code</i>.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">💡</div>
                                <h3>Smart Editor</h3>
                                <p>
                                    Start by dragging code from the toolbox, 
                                    then naturally shift to typing as confidence grows.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Live Feedback</h3>
                                <p>
                                    See how your code works (or doesn't work) in real time. 
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Parent/Teacher Path: Problem → Solution */}
            {(userRole === 'parent' || userRole === 'teacher') && (
                <>
                    {/* The Gap Section */}
                    <section id="why" className="content-section gap-section">
                        <h2>Why Whiskers exists</h2>
                        <div className="gap-content">
                            <div className="gap-card">
                                <h3>The Challenge</h3>
                                <p>
                                    For many young learners, block-based programming is a great start.
                                    Platforms such as <b><a href="https://scratch.mit.edu">Scratch</a></b> trains logical thinking and problem-solving skills.
                                    However, when transitioning to text-based programming languages,
                                    learners are often overwhelmed by the complexity of syntax and structure.
                                </p>
                            </div>
                            <div className="gap-card highlight">
                                <h3>The Solution</h3>
                                <p>
                                    Whiskers bridges this gap. 
                                    Starting from drag-and-drop coding, learners can gradually get familiar with real code syntax using concepts they already know from <b><a href="https://scratch.mit.edu">Scratch</a></b>.
                                    When they are ready, they can naturally shift to typing with the help of intelligent guidance and live feedback.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* What */}
                    <section id="demo" className="content-section demo-section">
                        <h2>See it in action</h2>
                        <div className="demo-container">
                            <div className="demo-placeholder">
                                <div className="demo-image-placeholder">
                                    <p>🎬 Demo Video/GIF</p>
                                    <span className="placeholder-text">
                                        Show: typing code with autocomplete, running a simple animation
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="demo-cta-container">
                            <Link 
                                href="/playground"
                                className="demo-cta-button"
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

                    {/* How It Works */}
                    <section className="content-section how-section">
                        <h2>How Whiskers guides you</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Familiar Concepts</h3>
                                <p>
                                    Bring the masterpiece you built in Scratch to life, 
                                    but with <i>real code</i>.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">💡</div>
                                <h3>Smart Editor</h3>
                                <p>
                                    Start by dragging code from the toolbox, 
                                    then naturally shift to typing as confidence grows.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Live Feedback</h3>
                                <p>
                                    See how your code works (or doesn't work) in real time. 
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Who Benefits */}
                    <section className="content-section audience-section">
                        <h2>Perfect for</h2>
                        <div className="audience-grid">
                            <div className="audience-card">
                                <div className="audience-icon">🎯</div>
                                <h3>Learners</h3>
                                <p>
                                    Moving beyond Scratch and ready to write real code with guidance and support.
                                </p>
                            </div>
                            <div className="audience-card">
                                <div className="audience-icon">🏫</div>
                                <h3>Classrooms</h3>
                                <p>
                                    Easy integration into curriculum with familiar concepts and structured progression.
                                </p>
                            </div>
                            <div className="audience-card">
                                <div className="audience-icon">🏠</div>
                                <h3>Home Learning</h3>
                                <p>
                                    Self-paced learning with clear guidance, perfect for independent exploration.
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Footer */}
            <footer className="landing-footer">
                <p>Developed by <a href='https://pcwu2022.github.io'>Po-Chun Wu</a>. Empowering the next generation of programmers.</p>
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
