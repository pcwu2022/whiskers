import React from 'react'

const HowSection = () => {
  return (
    <div>
        <section className="content-section how-section">
            <h2>How Whiskers guides you</h2>
            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <h3>Familiar Concepts</h3>
                    <p>
                        Bring the masterpiece you built in <b><a href="https://scratch.mit.edu">Scratch</a></b> to life, 
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
    </div>
  )
}

export default HowSection   
