import React from 'react';

type Props = { role: 'teacher' | 'parent' };

const WhatsNextSection = ({ role }: Props) => {
    return (
        <div>
            <section id="whats-next" className="content-section gap-section">
                <h2 className="section-title">What’s Next</h2>
                <div className="gap-content">
                    {role === 'parent' && (
                        <div className="gap-card parent-card">
                            <h3 className="card-title">Supporting Your Child’s Learning</h3>
                            <ol className="styled-list">
                                <li className="list-item">
                                    <h4 className="list-title">Start with what feels familiar</h4>
                                    <p>
                                        Let your child begin by recreating simple Scratch projects they already enjoy.
                                        Using the toolbox to drag and explore code helps them understand structure without pressure.
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">Encourage the natural shift to typing</h4>
                                    <p>
                                        As confidence grows, dragging blocks may start to feel slow — that’s a good sign.
                                        Let your child begin typing small parts of the code on their own, supported by hints and autocomplete.
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">Talk about code, not just outcomes</h4>
                                    <p>
                                        Ask questions that help your child reflect on what they wrote: <br />
                                        <i>
                                            What changed when you edited this line? <br />
                                            Why do you think this worked? <br />
                                            What happens if we try something else? <br />
                                        </i>
                                    </p>
                                </li>
                            </ol>
                            <p className="card-footer">Whiskers is designed to grow with your child. There’s no need to rush — just support exploration and confidence.</p>
                        </div>
                    )}
                    {role === 'teacher' && (
                        <div className="gap-card highlight teacher-card">
                            <h3 className="card-title">Bringing Text-Based Coding into the Classroom</h3>
                            <ol className="styled-list">
                                <li className="list-item">
                                    <h4 className="list-title">Bridge from Scratch, don’t replace it</h4>
                                    <p>
                                        Introduce Whiskers after students are comfortable with Scratch.
                                        Encourage them to start with the toolbox so they can connect familiar ideas to real code.
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">Normalize typing code gradually</h4>
                                    <p>
                                        Allow students to mix dragging and typing as they work.
                                        Autocomplete, hints, and live feedback act as scaffolding, not shortcuts.
                                    </p>
                                </li>
                                <li className="list-item">
                                    <h4 className="list-title">Build habits that transfer to real languages</h4>
                                    <p>
                                        Use Whiskers to reinforce core programming habits:
                                        Reading and responding to feedback, understanding structure, and thinking step by step.
                                    </p>
                                </li>
                            </ol>
                            <p className="card-footer">Whiskers supports structured progression without overwhelming learners, making it easier to move from blocks to real programming in a classroom setting.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WhatsNextSection;
