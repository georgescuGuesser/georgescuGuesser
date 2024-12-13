// cum vezi cati oameni au intra pe sait

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
  const [previousPerson, setPreviousPerson] = useState(null);


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
          by: item.by,
        })
        )); 
        setSatireArticles(
          satireQuotes.map((item) => ({
            title: item.title,
            link: item.source,
            by: item.by,
          }))
        );
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();
  }, []);
  
  const getRandomItem = () => {
    const maxHistory = 3; // Keep track of the last 3 sources
    const sourceHistory = []; // Store source history
    let streakCount = 0; // Track the current streak of the same type
    let lastSourceType = null; // Track the last source type for streak detection
  
    // Helper to pick a random item from an array
    const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];
  
    const chooseSourceType = () => {
      const recentQuotes = sourceHistory.filter((source) => source === "quote").length;
      const recentArticles = sourceHistory.filter((source) => source === "article").length;
  
      // Detect streaks
      if (lastSourceType) {
        streakCount = lastSourceType === sourceHistory[sourceHistory.length - 1] ? streakCount + 1 : 1;
      }
      lastSourceType = sourceHistory[sourceHistory.length - 1];
  
      // If streak is more than 3, force the other type
      if (streakCount >= 3) {
        return lastSourceType === "quote" ? "article" : "quote";
      }
  
      // Otherwise, use weighted randomness
      if (recentQuotes > recentArticles) {
        return Math.random() < 0.7 ? "article" : "quote";
      } else if (recentArticles > recentQuotes) {
        return Math.random() < 0.7 ? "quote" : "article";
      } else {
        return Math.random() < 0.5 ? "quote" : "article";
      }
    };
  
    const sourceType = chooseSourceType();
  
    let item;
    if (sourceType === "quote" && quotes.length > 0) {
      const element = Math.floor(Math.random() * quotes.length);
      item = {
        type: "quote",
        content: quotes[element].title,
        link: quotes[element].link,
        by: quotes[element].by,
      };
    } else if (satireArticles.length > 0) {
      const article = pickRandom(satireArticles);
      item = {
        type: "article",
        content: article.title,
        link: article.link,
        by: article.by,
      };
    }
  
    if (item) {
      // Update source history, keeping it within maxHistory
      sourceHistory.push(item.type);
      if (sourceHistory.length > maxHistory) {
        sourceHistory.shift(); // Remove oldest source from history
      }
      setLastSource(item.type); // Update last source
    }
  
    return item || null; // Fallback to null if no item is available
  };
  

  useEffect(() => {
    setRandomItem(getRandomItem());
    setBackgroundImage(getRandomBackgroundImage());
  }, [quotes, satireArticles]); 

  

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
                Chiar a spus Georgescu acest lucru?<br/>Sau e doar un articol din Times New Roman? 
            </div>
            <div className="start-text2">
                Ghiceste! Ai 3 încercari!
            </div>
            <button className="start-button" onClick={startGame}>Start</button>
      </div>
    );
  }

  const handleButtonClick = (choice) => {
    if (buttonsDisabled || !randomItem) return;
  
    setButtonsDisabled(true);
  
    let isCorrect = false;
  
    // Save the current item's link before updating the state
    const currentLink = randomItem.link; // Store the link of the current item
    const currentPerson = randomItem.by; // Store the current item type (quote or article)
  
    // Set the link of the previous quote or article
    setPreviousLink(currentLink);
    setPreviousSource(lastSource);
    setPreviousPerson(currentPerson);
  
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
      setRandomItem(getRandomItem()); // Generate the new random item after saving the previous state
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
          <span>
            Sursa anterioara: {previousLink ? (
              <a href={previousLink} target="_blank" rel="noopener noreferrer">{previousPerson}</a>
            ) : (
              "Not found :("
            )}
          </span>
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
            <button className="retry-button" onClick={closePopup}>Mai încearcă</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
