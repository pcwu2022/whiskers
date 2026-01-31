'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';

import DemoSection from './components/landing/DemoSection';
import WhySection from './components/landing/WhySection';
import HowSection from './components/landing/HowSection';
import WhoSection from './components/landing/WhoSection';
import WhatsNextSection from './components/landing/WhatsNextSection';

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
                    <DemoSection isMobile={isMobile} />

                    {/* How It Works */}
                    <HowSection />
                </>
            )}

            {/* Parent Path: Problem → Solution */}
            {userRole === 'parent' && (
                <>
                    {/* Why Section */}
                    <WhySection />

                    {/* What */}
                    <DemoSection isMobile={isMobile} />

                    {/* How It Works */}
                    <HowSection />

                    {/* What's Next? */}
                    <WhatsNextSection role="parent" />

                    {/* Who Benefits */}
                    <WhoSection />
                </>
            )}

            {/* Teacher Path: Problem → Solution */}
            {userRole === 'teacher' && (
                <>
                    {/* Why Section */}
                    <WhySection />

                    {/* What */}
                    <DemoSection isMobile={isMobile} />

                    {/* How It Works */}
                    <HowSection />

                    {/* What's Next? */}
                    <WhatsNextSection role="teacher" />

                    {/* Who Benefits */}
                    <WhoSection />
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
