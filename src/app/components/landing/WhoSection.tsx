import React from 'react'

const WhoSection = () => {
    return (
        <div>
            <section className="content-section audience-section">
                <h2 className="section-title">Perfect for</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <div className="audience-icon">🎯</div>
                        <h3 className="card-title">Learners</h3>
                        <p>
                            Moving beyond Scratch and ready to write real code with guidance and support.
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">🏫</div>
                        <h3 className="card-title">Classrooms</h3>
                        <p>
                            Easy integration into curriculum with familiar concepts and structured progression.
                        </p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon">🏠</div>
                        <h3 className="card-title">Home Learning</h3>
                        <p>
                            Self-paced learning with clear guidance, perfect for independent exploration.
                        </p>
                    </div>
                </div>
            </section>         
        </div>
    )
}

export default WhoSection
