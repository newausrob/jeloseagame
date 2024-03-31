    // Chrome Dino Game Code
    document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.game-container');
    const dino = document.querySelector('.dino');
    let scoreElement = document.getElementById('score');
    let highScoreElement = document.getElementById('high-score');
    const deathScreen = document.querySelector('.death-screen');
    const restartButton = document.getElementById('restart-button');
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let isJumping = false;
    let isFalling = false;
    let isGameOver = false;
    let jumpHeight = 100;
    let fallSpeed = 2;
    let gravity = 0.6;
    let dinoBottom = 0;
    let obstacleSpeed = 5;
    let obstacleHeight = 50;
    let restarting = false; // Flag to track if the game is currently restarting
    let restartTimeout = null; // Variable to hold the setTimeout reference
    let obstacleInterval;
    let isSlowed = false;
    let canJump = false; // Flag to control jumping
    let restartTime = 0; // Variable to track restart time
    let isRestarting = false; // Flag to track if the game is restarting
    dino.style.left = '80%';
    resetDinoVerticalPosition();


    const deathSound = new Audio('death.wav'); // Replace with your death sound file path
    deathSound.volume = 0.3; // Set volume to 30%
    const scoreSound = document.getElementById('scoreSound');
    scoreSound.volume = 0.3;

    document.addEventListener('keydown', handleJump);
    document.addEventListener('click', handleJump);
    document.addEventListener('click', handleAudioPlayback);

    function handleAudioPlayback() {
        scoreSound.play().catch(() => {
            console.warn('Audio playback blocked. Please interact with the page to enable audio.');
        });
        deathSound.play().catch(() => {
            console.warn('Audio playback blocked. Please interact with the page to enable audio.');
        });
        document.removeEventListener('click', handleAudioPlayback);
    } 
   // Add event listener to the restart button
    restartButton.addEventListener('click', (event) => {
        restartGame(); // Call the restartGame function
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !isJumping && !isFalling && !isGameOver) {
            jump();
        }
    });

    function handleJump(event) {
        if (!isGameOver && (event.type === 'click' || event.code === 'Space')) {
            event.preventDefault(); // Prevent default click behavior (e.g., scrolling)
            if (!isJumping) {
                jump();
            }
        }
    }

    function jump() {
        isJumping = true;
        let jumpInterval = setInterval(() => {
            if (dinoBottom >= jumpHeight) {
                clearInterval(jumpInterval);
                isFalling = true;
                fall();
            } else {
                dinoBottom += 2;
                dino.style.bottom = dinoBottom + 'px';
                checkCollision();
            }
        }, 10);
    }

    function fall() {
        let fallInterval = setInterval(() => {
            if (dinoBottom <= 0) {
                clearInterval(fallInterval);
                isJumping = false;
                isFalling = false;

                if (isGameOver) {
                    showDeathScreen();
                }
            } else {
                dinoBottom -= fallSpeed;
                dino.style.bottom = dinoBottom + 'px';
                checkCollision();
            }
        }, 10);
    }


    function checkCollision() {
        const dinoRect = dino.getBoundingClientRect();
        const obstacles = document.querySelectorAll('.obstacle');

        obstacles.forEach((obstacle) => {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (
                dinoRect.bottom > obstacleRect.top &&
                dinoRect.top < obstacleRect.bottom &&
                dinoRect.right > obstacleRect.left &&
                dinoRect.left < obstacleRect.right
            ) {
                isGameOver = true;
                clearInterval(obstacleInterval);
                resetObstacles();
                updateHighScore();
                showDeathScreen();
            }
        });
    }

    function resetDinoVerticalPosition() {
        dinoBottom = 0;
        dino.style.bottom = 0;
        dino.style.bottom = dinoBottom + 'px';
    }


    function createObstacle() {
        dino.style.bottom = dinoBottom + 'px';
        isRestarting = false
        let obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.height = obstacleHeight + 'px';
        gameContainer.appendChild(obstacle);

        let obstaclePosition = 800;
	let randomFactor = Math.floor(Math.random() * 7); // Generate a random number between 0 and 6
	let randomFactorDecimal = 2 + Math.random() * 2.3;
	let randomFactorDecimal2 = 1.5 + Math.random() * 3;

	if (randomFactor === 0) randomFactor = 2; // Ensure randomFactor is at least 1
	let halfDistance = obstaclePosition / randomFactor;
	console.log(`Half distance: ${halfDistance}`);
	console.log(`Random Factor Decimal: ${randomFactorDecimal}`);
	console.log(`Random Factor Decimal2: ${randomFactorDecimal2}`);

        obstacleInterval = setInterval(() => {
            if (obstaclePosition < -20) {
                clearInterval(obstacleInterval);
                gameContainer.removeChild(obstacle);
                createObstacle();
            } else {
                obstaclePosition -= obstacleSpeed;
                obstacle.style.right = obstaclePosition + 'px';
                if (obstaclePosition === halfDistance && Math.random() < 0.5) {
                    if (!isSlowed) {
                        obstacleSpeed /= randomFactorDecimal;
                        isSlowed = true;
                    } else {
                        obstacleSpeed *= randomFactorDecimal2;
                        isSlowed = false;
                    }
                }
                if (obstaclePosition === 50) {
                    score++;
                    scoreElement.textContent = score;
                    scoreSound.currentTime = 0;
                    scoreSound.play();
                    if (score >= 50 && score <= 100) {
                        document.body.style.backgroundColor = 'green';
                    } else if (score > 100 && score <= 200) {
                        document.body.style.backgroundColor = 'blue';
                    } else if (score > 200 && score <= 600) {
                        document.body.style.backgroundColor = 'red';
                    } else if (score > 600) {
                        document.body.style.backgroundColor = 'white';
                    }
                }
                checkCollision();
            }
        }, 10);
    }

    function resetObstacles() {
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach((obstacle) => {
            gameContainer.removeChild(obstacle);
        });
    }

    function showDeathScreen() {
	resetDinoVerticalPosition();
        deathScreen.style.display = 'flex';
        resetDinoVerticalPosition();
        scoreElement.textContent = score;
        resetDinoVerticalPosition();
        highScoreElement.textContent = highScore;
        resetDinoVerticalPosition();
        showMessage(); // Show random message on death
        deathSound.currentTime = 0;
        resetDinoVerticalPosition();
        deathSound.play();
        resetDinoVerticalPosition();
    }

    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
    }


    function restartGame() {
 	restarting = true;
        resetDinoVerticalPosition();
        deathScreen.style.display = 'none';
        resetDinoVerticalPosition();
        isGameOver = false;
        score = 0;
        scoreElement.textContent = score;
        obstacleSpeed = 5;
        obstacleHeight = 50;
        isSlowed = false;
        createObstacle();
        hideMessage(); // Hide the message pop-up on game restart
        resetDinoVerticalPosition();

        restartTimeout = setTimeout(() => {
            jumpHeight = 0;
            resetDinoVerticalPosition();
            restarting = false; // Reset the flag after the delay
        }, 5); // 500 milliseconds = 0.5 seconds

            restartTimeout = setTimeout(() => {
            jumpHeight = 100;
            resetDinoVerticalPosition();
            restarting = false; // Reset the flag after the delay
        }, 100); // 500 milliseconds = 0.5 seconds
    }



    createObstacle();


    // Random Message Pop-up Code
    const messageContainer = document.createElement('div');
    messageContainer.id = 'messageContainer';
    messageContainer.className = 'message-container';
    document.body.appendChild(messageContainer);

    const messageBox = document.createElement('div');
    messageBox.id = 'messageBox';
    messageBox.className = 'message-box';
    messageContainer.appendChild(messageBox);

    const messageText = document.createElement('p');
    messageText.id = 'messageText';
    messageText.className = 'message-text';
    messageBox.appendChild(messageText);

    const messages = [
        'skill issue',
        'wow! ! ! !',
        'get better',
        '💀',
        '😭',
        '😆🤣🤣',
        'ded',
        '😵',
        '💀',
        '😭',
    ];

    function getRandomMessage() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    function showMessage() {
        resetDinoVerticalPosition();
        const message = getRandomMessage();
        messageText.textContent = message;
        messageContainer.style.top = '50px'; // Adjust the vertical position
        messageContainer.style.opacity = '1'; // Show the message pop-up
        setTimeout(hideMessage, 10000);
    }
    function hideMessage() {
        messageContainer.style.top = '0'; // Reset to the middle top
        messageContainer.style.opacity = '0'; // Hide the message pop-up
    }
});