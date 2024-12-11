// Aranjaza PC
// Arata link citate gresite la final          
// Pe mobile e prea la dreapta

import React, { useState, useEffect } from "react";
import "./App.css";

const backgroundImages = [
  "CG1 crop.jpg",  // 1068x712
  "CG2 crop.jpg",  // 800x533
  "CG3 crop.jpg",  // 800x533
  "CG4 crop.jpg",  // 1024x576
  "CG5 crop.jpg",  // 1600x900
  "CG6 crop.jpg",  // 2480x1653
  "CG7 crop.jpg",  // 1119x630
  "CG8 crop.jpg",  // 1200x573
  "CG9 crop.jpg",  // 1771x906
  "CG10 crop.jpg",  // 1200x861
  "CG11 crop.jpg",  // 1200x646
];

const App = () => {
  const [randomItem, setRandomItem] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [wrongData, setWrongData] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState([]);

  const [quotes, setQuotes] = useState([]);
  const [satireArticles, setSatireArticles] = useState([]);

  // Fetch the JSON data
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const realQuotesResponse = await fetch("/georgescu.json");
        const satireQuotesResponse = await fetch("/bad.json");
        const realQuotes = await realQuotesResponse.json();
        const satireQuotes = await satireQuotesResponse.json();

        // Update state
        setQuotes(realQuotes.map((item) => item.title)); // Extract the "title" field for real quotes
        setSatireArticles(
          satireQuotes.map((item) => ({
            title: item.title,
            link: item.source, // Use "source" as the link
          }))
        );
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();
  }, []);

  const getRandomItem = () => {
    const isQuote = Math.random() < 0.5;
    if (isQuote && quotes.length > 0) {
      return {
        type: "quote",
        content: quotes[Math.floor(Math.random() * quotes.length)],
      };
    } else if (satireArticles.length > 0) {
      const article =
        satireArticles[Math.floor(Math.random() * satireArticles.length)];
      return {
        type: "article",
        content: article.title,
        link: article.link,
      };
    }
    return null; // Fallback if arrays are empty
  };

  const getRandomBackgroundImage = () => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return `images/calinhappy/${backgroundImages[randomIndex]}`;
  };

  useEffect(() => {
    setRandomItem(getRandomItem());
    setBackgroundImage(getRandomBackgroundImage());
  }, [quotes, satireArticles]); // Ensure it updates after data fetch

  const handleButtonClick = (choice) => {
    if (!randomItem) return;

    let isCorrect = false;

    if (choice === "yes") {
      isCorrect = randomItem.type === "quote";
    } else if (choice === "no") {
      isCorrect = randomItem.type === "article";
    }

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      setShowCorrect(true);

      setTimeout(() => {
        setShowCorrect(false);
      }, 1500);
    } else {
      setWrongCount((prevCount) => prevCount + 1);
      setWrongGuesses((prevGuesses) => [...prevGuesses, "X"]);

      if (wrongCount === 2) {
        setHighScore((prevHighScore) => Math.max(prevHighScore, score));
        setWrongData({
          message: "Ai pierdut!",
          score,
          highScore: Math.max(highScore, score),
          link: randomItem.type === "article" ? randomItem.link : null,
        });
        setShowPopup(true);
        setScore(0);
        setWrongCount(0);
        setWrongGuesses([]);
      } else {
        setShowWrong(true);
        setTimeout(() => {
          setShowWrong(false);
        }, 1500);
      }
    }

    setTimeout(() => {
      setFeedback("");
      setRandomItem(getRandomItem());
      setBackgroundImage(getRandomBackgroundImage()); // Update background image
    }, 500);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="main-container">
      <div className="title">Călin Or Not?</div>

      <div className="image-container">
        <img src={backgroundImage} alt="Background" className="background-image"/>
        <div className="quote-text">
          {randomItem ? (
            randomItem.type === "quote"
              ? randomItem.content
              : `${randomItem.content}`
          ) : (
            "Se încarcă..."
          )}
        </div>
      </div>

      <div className="score-container">
        <div className="score">Scor: {score}</div>
        <div className="wrong-indicator">
          {wrongGuesses.map((guess, index) => (
            <span key={index} className="wrong-x">
              {guess}
            </span>
          ))}
        </div>
        <div className="high-score">High Score: {highScore}</div>
      </div>

      {feedback && <div className="feedback">{feedback}</div>}

      {showCorrect && <div className="correct-feedback">Corect!</div>}
      {showWrong && <div className="wrong-feedback">Greșit!</div>}

      <div className="buttons-container">
        <button
          className="button no-button"
          onClick={() => handleButtonClick("no")}
        >
          X
        </button>
        <button
          className="button yes-button"
          onClick={() => handleButtonClick("yes")}
        >
          ✔
        </button>
      </div>

      {showPopup && wrongData && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img
              src="images/calinsad/CG sad.jpg"
              alt="Sad Calin"
              className="sad-image"
            />
            <div className="popup-message">{wrongData.message}</div>
            <div className="popup-score">Scor actual: {wrongData.score}</div>
            <div className="popup-highscore">
              Highscore: {wrongData.highScore}
            </div>
            {wrongData.link && (
              <div className="popup-link">
                
                <a href={wrongData.link} target="_blank" rel="noopener noreferrer">
                    Sursă citat  
                </a>
              </div>
            )}
            <button className="close-button" onClick={closePopup}>
              Mai încearcă
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
