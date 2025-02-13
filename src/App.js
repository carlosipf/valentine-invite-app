import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

/**
 * Helper function to check if two rectangles overlap.
 */
function rectOverlap(r1, r2) {
  return !(
    r1.left + r1.width < r2.left ||
    r1.left > r2.left + r2.width ||
    r1.top + r1.height < r2.top ||
    r1.top > r2.top + r2.height
  );
}

/**
 * RandomDecorations divides the screen into four quadrants.
 * Each decoration is assigned a quadrant (using round-robin per type)
 * and placed randomly within that quadrant's boundaries with extra margin.
 * Overlap is avoided both in general and between similar emojis (with extra spacing).
 */
const RandomDecorations = () => {
  const [decorations, setDecorations] = useState([]);

  useEffect(() => {
    const margin = 40; // margin from the container's edges
    const extraSpacing = 40; // extra spacing between similar emojis
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const halfWidth = containerWidth / 2;
    const halfHeight = containerHeight / 2;

    // Given a quadrant index (0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right)
    // and a decoration size, return the allowed boundaries.
    const getQuadrantBounds = (quadIndex, size) => {
      switch (quadIndex) {
        case 0:
          return {
            leftMin: margin,
            leftMax: halfWidth - margin - size,
            topMin: margin,
            topMax: halfHeight - margin - size,
          };
        case 1:
          return {
            leftMin: halfWidth + margin,
            leftMax: containerWidth - margin - size,
            topMin: margin,
            topMax: halfHeight - margin - size,
          };
        case 2:
          return {
            leftMin: margin,
            leftMax: halfWidth - margin - size,
            topMin: halfHeight + margin,
            topMax: containerHeight - margin - size,
          };
        case 3:
          return {
            leftMin: halfWidth + margin,
            leftMax: containerWidth - margin - size,
            topMin: halfHeight + margin,
            topMax: containerHeight - margin - size,
          };
        default:
          return null;
      }
    };

    // We'll store decorations per quadrant for overlap checking.
    const quadrants = [[], [], [], []];

    // Configuration for each type.
    const config = [
      { type: 'heart', count: 20, size: 32, emoji: '♥' },
      { type: 'arrow', count: 10, size: 32, emoji: '🏹' },
      { type: 'teddy', count: 10, size: 48, emoji: '🧸' },
    ];

    config.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        // Assign quadrant in a round-robin way.
        const quadIndex = i % 4;
        const bounds = getQuadrantBounds(quadIndex, item.size);
        let attempts = 0;
        let placed = false;
        let left, top;
        while (!placed && attempts < 100) {
          attempts++;
          left = Math.random() * (bounds.leftMax - bounds.leftMin) + bounds.leftMin;
          top = Math.random() * (bounds.topMax - bounds.topMin) + bounds.topMin;
          const newRect = { left, top, width: item.size, height: item.size };
          let overlap = false;
          // Only check against decorations in the same quadrant.
          for (let existing of quadrants[quadIndex]) {
            // If same type, enlarge the existing rectangle by extraSpacing.
            const requiredExtra = existing.type === item.type ? extraSpacing : 0;
            const existingRect = {
              left: existing.left - requiredExtra,
              top: existing.top - requiredExtra,
              width: existing.size + 2 * requiredExtra,
              height: existing.size + 2 * requiredExtra,
            };
            if (rectOverlap(newRect, existingRect)) {
              overlap = true;
              break;
            }
          }
          if (!overlap) {
            quadrants[quadIndex].push({
              ...item,
              left,
              top,
              key: `${item.type}-${i}-${attempts}`,
            });
            placed = true;
          }
        }
        // Fallback: if we couldn't place without overlapping.
        if (!placed) {
          left = Math.random() * (bounds.leftMax - bounds.leftMin) + bounds.leftMin;
          top = Math.random() * (bounds.topMax - bounds.topMin) + bounds.topMin;
          quadrants[quadIndex].push({
            ...item,
            left,
            top,
            key: `${item.type}-${i}-fallback`,
          });
        }
      }
    });

    // Combine decorations from all quadrants.
    const newDecorations = quadrants.flat();
    setDecorations(newDecorations);
  }, []);

  return (
    <>
      {decorations.map((deco) => (
        <span
          key={deco.key}
          className={deco.type}
          style={{
            position: 'absolute',
            left: deco.left,
            top: deco.top,
            fontSize: `${deco.size}px`,
          }}
        >
          {deco.emoji}
        </span>
      ))}
    </>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [noButtonStyle, setNoButtonStyle] = useState({
    position: 'absolute',
    right: '20px',
    top: '0px',
  });
  const [noButtonMessage, setNoButtonMessage] = useState('');
  const [noButtonClickCount, setNoButtonClickCount] = useState(0);
  const noMessages = [
    "haha you can't catch me 🤣🫵",
    "nope, not this time ❌",
    "no?! 😵",
    "seriously? 💔"
  ];

  const handleNoClick = () => {
    const newCount = noButtonClickCount + 1;
    setNoButtonClickCount(newCount);
    // After 10 clicks, remove the button and show "say yes 🤠"
    if (newCount >= 10) {
      setNoButtonMessage("say yes 🤠");
      return;
    }
    // Otherwise, randomly show one of the messages and move the button.
    const randomIndex = Math.floor(Math.random() * noMessages.length);
    setNoButtonMessage(noMessages[randomIndex]);
    if (cardRef.current) {
      const containerWidth = cardRef.current.offsetWidth;
      const containerHeight = cardRef.current.offsetHeight;
      const buttonWidth = 120;
      const buttonHeight = 45;
      const maxLeft = containerWidth - buttonWidth;
      const maxTop = containerHeight - buttonHeight;
      const newLeft = Math.random() * maxLeft;
      const newTop = Math.random() * maxTop;
      setNoButtonStyle({
        position: 'absolute',
        left: `${newLeft}px`,
        top: `${newTop}px`,
        transition: 'all 0.1s ease-in-out',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Reusable background decorations */}
      <div className="decorations">
        <RandomDecorations />
      </div>

      <div className="card" ref={cardRef}>
        <h1 className="title">Solomiya, be my Valentine?</h1>
        <h2 className="subtitle">let's not go solo 👩🏼‍❤️‍👨🏻</h2>
        <div className="button-container">
          <button className="btn yes-btn" onClick={() => navigate('/invite')}>
            Yes 💖
          </button>
          {noButtonClickCount < 10 && (
            <button
              className="btn no-btn"
              onClick={handleNoClick}
              style={noButtonStyle}
            >
              No
            </button>
          )}
        </div>
        {noButtonMessage && <div className="message">{noButtonMessage}</div>}
      </div>
    </div>
  );
}

function InvitePage() {
    // Updated Google Calendar link for a chill evening from 5–7pm,
    // automatically adding cipf7009@gmail.com to the event.
    const googleCalendarLink = "https://calendar.google.com/calendar/r/eventedit?text=valentine%27s+date&dates=20250213T170000/20250213T190000&details=let+me+know+if+this+works+or+if+another+time+is+better.+otherwise%2C+ill+meet+you+at+yours+%3A%29&add=cipf7009%40gmail.com&add=spaste3%40illinois.edu";
    const handleAccept = () => {
      window.open(googleCalendarLink, '_blank');
    };
  
    return (
      <div className="page-container">
        {/* Reusable background decorations */}
        <div className="decorations">
          <RandomDecorations />
        </div>
  
        <div className="card">
          <h1 className="title">hey, sexy. let's hang 🥰</h1>
          <p className="description">
            good food, good music, and even better company.
          </p>
          <button className="btn accept-btn" onClick={handleAccept}>
            accept 💌
          </button>
        </div>
      </div>
    );
  }
  

function App() {
    const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch((error) => console.log(error));
    }
  }, []);
  return (
    <>
      {/* Background song (ensure the audio file is in your public folder) */}
      <audio ref={audioRef} src="/Lou Val - Eternal Sunshine (Official Visualizer).mp3" autoPlay loop muted />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/invite" element={<InvitePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
