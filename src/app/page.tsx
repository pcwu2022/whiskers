'use client';

import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import ConsentBanner from './components/ConsentBanner';
import TrackedSection from './components/TrackedSection';

import DemoSection from './components/landing/DemoSection';
import WhySection from './components/landing/WhySection';
import HowSection from './components/landing/HowSection';
import WhoSection from './components/landing/WhoSection';
import WhatsNextSection from './components/landing/WhatsNextSection';

import {
    trackRoleSelected,
    trackCTAClick,
    setCurrentRole,
    UserRole,
} from '@/lib/analytics';

export default function LandingPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

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

    const handleHeroCTAClick = () => {
        trackCTAClick('hero-cta', 'hero');
        scrollToSection('role-selection');
    };

    const handleRoleSelection = (role: UserRole) => {
        setUserRole(role);
        setCurrentRole(role);
        trackRoleSelected(role);
        
        setTimeout(() => {
            if (role === 'student') {
                scrollToSection('demo');
            } else {
                scrollToSection('why');
            }
        }, 100);
    };

    return (
        <AnalyticsProvider trackLanding={true}>
            <div className="landing-page">
                {/* Navigation Bar */}
                <Navigation variant="landing" />
                
                {/* Hero Section */}
                <TrackedSection id="hero" className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">From blocks to code</h1>
                        <button 
                            onClick={handleHeroCTAClick}
                            className="hero-cta"
                        >
                            Real programming starts here
                            <span className="arrow">↓</span>
                        </button>
                    </div>
                </TrackedSection>

                {/* Role Selection Section */}
                <TrackedSection id="role-selection" className="role-selection-section">
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
                </TrackedSection>

                {/* Student Path: Demo First */}
                {userRole === 'student' && (
                    <>
                        <TrackedSection id="demo">
                            <DemoSection isMobile={isMobile} />
                        </TrackedSection>

                        <TrackedSection id="how">
                            <HowSection />
                        </TrackedSection>
                    </>
                )}

                {/* Parent Path: Problem → Solution */}
                {userRole === 'parent' && (
                    <>
                        <TrackedSection id="why">
                            <WhySection />
                        </TrackedSection>

                        <TrackedSection id="demo">
                            <DemoSection isMobile={isMobile} />
                        </TrackedSection>

                        <TrackedSection id="how">
                            <HowSection />
                        </TrackedSection>

                        <TrackedSection id="whats-next">
                            <WhatsNextSection role="parent" />
                        </TrackedSection>

                        <TrackedSection id="who">
                            <WhoSection />
                        </TrackedSection>
                    </>
                )}

                {/* Teacher Path: Problem → Solution */}
                {userRole === 'teacher' && (
                    <>
                        <TrackedSection id="why">
                            <WhySection />
                        </TrackedSection>

                        <TrackedSection id="demo">
                            <DemoSection isMobile={isMobile} />
                        </TrackedSection>

                        <TrackedSection id="how">
                            <HowSection />
                        </TrackedSection>

                        <TrackedSection id="whats-next">
                            <WhatsNextSection role="teacher" />
                        </TrackedSection>

                        <TrackedSection id="who">
                            <WhoSection />
                        </TrackedSection>
                    </>
                )}

                {/* Footer */}
                <TrackedSection id="footer" className="landing-footer-wrapper">
                    <footer className="landing-footer">
                        <p>Developed by <a href='https://pcwu2022.github.io'>Po-Chun Wu</a>. Empowering the next generation of programmers.</p>
                    </footer>
                </TrackedSection>

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

                {/* Consent Banner */}
                <ConsentBanner />
            </div>
        </AnalyticsProvider>
    );
}
