if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
}

window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');

    // Simulate a delay to show the splash screen for a minimum time
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.style.display = 'block'; // Show the main content
    }, 2000); // Adjust the delay as needed (in milliseconds)
});

const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
let isPlaying = false;

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
    } else {
        audioPlayer.play();
        playPauseBtn.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
});

audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
});