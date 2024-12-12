// Arata sursa undeva in jos dupa fiecare           IN PRGORES
// Pe mobile e prea la dreapta
// Aranjeaza mobile
// Citate verifica (mai ales ala cu divinitati)

import React, { useState, useEffect } from "react";
import "./App.css";

let rank;

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
  const [previousImageIndex, setPreviousImageIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [wrongData, setWrongData] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [satireArticles, setSatireArticles] = useState([]);
  const [isStartPage, setIsStartPage] = useState(true);
  const [lastSource, setLastSource] = useState(null); // Track the last source
  const [previousSource, setPreviousSource] = useState(null); // Track the previous source for the quote
  const [previousLink, setPreviousLink] = useState(null); // New state for storing the previous link


  const getRandomBackgroundImage = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * backgroundImages.length);
    } while (randomIndex === previousImageIndex); // Ensure it's different from the previous index

    setPreviousImageIndex(randomIndex); // Update the previous index
    return `images/calinhappy/${backgroundImages[randomIndex]}`;
  };

  useEffect(() => {
    setBackgroundImage(getRandomBackgroundImage());
  }, []);
  
  // Fetch the JSON data
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const realQuotesResponse = await fetch(`${process.env.PUBLIC_URL}/georgescu.json`);
        const satireQuotesResponse = await fetch(`${process.env.PUBLIC_URL}/bad.json`);

        const realQuotes = await realQuotesResponse.json();
        const satireQuotes = await satireQuotesResponse.json();

        setQuotes(realQuotes.map((item) => 
        ({
          title: item.title,
          link: item.source,
        })
        )); 
        setSatireArticles(
          satireQuotes.map((item) => ({
            title: item.title,
            link: item.source,
          }))
        );
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();
  }, []);

  const getRandomItem = () => {
    const isQuoteSource = lastSource === "quote";
    const isArticleSource = lastSource === "article";

    let isQuote;
    if (isQuoteSource) {
      isQuote = false; 
    } else if (isArticleSource) {
      isQuote = true; 
    } else {
      isQuote = Math.random() < 0.5; 
    }

    let item;
    if (isQuote && quotes.length > 0) {
      let element = Math.floor(Math.random() * quotes.length);
      item = {
        type: "quote",
        content: quotes[element].title,
        link: quotes[element].link,
      };
      setLastSource("quote"); // Set source for a real quote
    } else if (satireArticles.length > 0) {
      const article = satireArticles[Math.floor(Math.random() * satireArticles.length)];
      item = {
        type: "article",
        content: article.title,
        link: article.link,
      };
      setLastSource("article"); // Set source for an article
    }

    return item || null; 
  };

  useEffect(() => {
    setRandomItem(getRandomItem());
    setBackgroundImage(getRandomBackgroundImage());
  }, [quotes, satireArticles]); 

  useEffect(() => {
    if (randomItem) {
      if (randomItem.type === "quote") {
        setPreviousLink(randomItem.link); // No link for quotes
      } else if (randomItem.type === "article") {
        setPreviousLink(randomItem.link); // Store the link if it's an article
      }
    }
  }, [randomItem]);

  const startGame = () => {
    setIsStartPage(false); 
  };

  if (isStartPage) {
    return (
        <div className="main-container">
            <div className="title">Călin Or Not?</div>
  
            <div className="image-container">
            <img src={backgroundImage} alt="Background" className="background-image"/>
            </div>
            <div className="start-text1">
                A spus Georgescu întradevăr acest lucru?<br/>Sau E doar un articol din Times New Roman? 
            </div>
            <div className="start-text2">
                Ai 3 încercări!
            </div>
            <button className="start-button" onClick={startGame}>Start</button>
      </div>
    );
  }

  const handleButtonClick = (choice) => {
    if (buttonsDisabled || !randomItem) return;
  
    setButtonsDisabled(true);
  
    let isCorrect = false;
    setPreviousLink(randomItem.link);
    console.log("S-a setat", randomItem.link, previousLink)

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
  
        // Correctly set the link based on whether it was a quote or article
        const link = randomItem.type === "article" ? randomItem.link : null;
  
        setWrongData({
          message: "Ai pierdut!",
          score,
          highScore: Math.max(highScore, score),
          link: link,
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
      setPreviousSource(lastSource); // Save the current source for the previous quote
      setRandomItem(getRandomItem());
      setBackgroundImage(getRandomBackgroundImage()); 
      setButtonsDisabled(false);
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

      <div className="source-container">
        {previousSource && (
            
            (
              <span>
                  Sursa anterioară: {previousLink ? (
                  <a href={previousLink} target="_blank" rel="noopener noreferrer">link</a>
                  ) : (
                  "not found :("
                  )}
              </span>
              )
            
            
        )}
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
            <img src="images/calinsad/CG sad.jpg" alt="Sad Calin" className="sad-image"/>
            <div className="popup-message">{wrongData.message}</div>
            <div className="popup-score">Scor actual: {wrongData.score}</div>
            <div className="popup-highscore">Highscore: {wrongData.highScore}</div>
            <div className="rank">Rang: {wrongData.score >= 15 
                    ? "Geto-Dac" 
                    : wrongData.score >= 10 
                        ? "Adept al apei divine" 
                        : wrongData.score >= 5 
                            ? "Agricultor" 
                            : "Cetățean din Schengen"}</div>
            {wrongData.link && (
              <div className="popup-link">
                Sursa citat anterior: <a href={wrongData.link} target="_blank" rel="noopener noreferrer">link</a>
              </div>
            )}
            <button className="retry-button" onClick={closePopup}>Mai încearcă</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
