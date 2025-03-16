import React, { useState, useEffect } from 'react';
import './FeedbackSection.css';


const FeedbackSection = () => {
  const feedbacks = [
    {
      id: 1,
      name: 'Ravi Kumar',
      title: 'College Student',
      feedback: 'GigBud.in has been a lifesaver during my college years. I pick up small tasks between classes and make enough to cover my daily expenses!',
      rating: 5,
    },
    {
      id: 2,
      name: 'Priya Sharma',
      title: 'Working Professional',
      feedback: 'As someone with a busy schedule, I love how easy it is to get help with errands. The local connection makes everything feel safer and more reliable.',
      rating: 4,
    },
    {
      id: 3,
      name: 'Ankit Patel',
      title: 'Freelancer',
      feedback: 'The platform is intuitive and payment is always prompt. I have built a small network of regular clients through GigBud.in!',
      rating: 5,
    },
    {
      id: 4,
      name: 'Neha Gupta',
      title: 'Homemaker',
      feedback: 'GigBud.in lets me earn extra income while managing my home. The flexibility is perfect for my lifestyle.',
      rating: 5,
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % feedbacks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [feedbacks.length]);

  return (
    <section id="feedback" className="feedback-section">
      <div className="container">
        <h2 className="section-title">What People Say</h2>
        <div className="feedback-carousel">
          <div className="feedback-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {feedbacks.map((item) => (
              <div key={item.id} className="feedback-card">
                <div className="feedback-avatar">
                  <img src={`/api/placeholder/100/100`} alt={item.name} />
                </div>
                <h3 className="feedback-name">{item.name}</h3>
                <p className="feedback-title">{item.title}</p>
                <div className="feedback-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < item.rating ? 'star active' : 'star'}>★</span>
                  ))}
                </div>
                <p className="feedback-text">"{item.feedback}"</p>
              </div>
            ))}
          </div>
        </div>
        <div className="feedback-dots">
          {feedbacks.map((_, index) => (
            <button
              key={index}
              className={`dot ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;