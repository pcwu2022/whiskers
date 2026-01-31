import React from 'react'
import Link from 'next/link'

interface DemoSectionProps {
    isMobile: boolean
}

const DemoSection: React.FC<DemoSectionProps> = ({ isMobile }) => {
    return (
        <section id="demo" className="content-section demo-section">
            <h2>What is Whiskers?</h2>
            <div className="demo-container">
                {/* <div className="demo-placeholder">
                    <div className="demo-image-placeholder">
                        <p>🎬 Demo Video/GIF</p>
                        <span className="placeholder-text">
                            Show: typing code with autocomplete, running a simple animation
                        </span>
                    </div>
                </div> */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <iframe
                        width="640"
                        height="360"
                        src="https://www.youtube.com/embed/8qW1R7OqQgE"
                        title="Whiskers - From Blocks to Code"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{ maxWidth: '100%' }}
                    />
                </div></div>
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
    )
}

export default DemoSection
