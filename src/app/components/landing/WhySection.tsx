import React from 'react'

const WhySection = () => {
    return (
        <div>
            <section id="why" className="content-section gap-section">
                <h2 className="section-title">Why Whiskers exists</h2>
                <div className="gap-content">
                    <div className="gap-card">
                        <h3 className="card-title">The Challenge</h3>
                        <p>
                            For many young learners, block-based programming is a great start.
                            Platforms such as <b><a href="https://scratch.mit.edu">Scratch</a></b> trains logical thinking and problem-solving skills.
                            However, when transitioning to text-based programming languages,
                            learners are often overwhelmed by the complexity of syntax and structure.
                        </p>
                    </div>
                    <div className="gap-card highlight">
                        <h3 className="card-title">The Solution</h3>
                        <p>
                            Whiskers bridges this gap. 
                            Starting from drag-and-drop coding, learners can gradually get familiar with real code syntax using concepts they already know from <b><a href="https://scratch.mit.edu">Scratch</a></b>.
                            When they are ready, they can naturally shift to typing with the help of intelligent guidance and live feedback.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default WhySection
