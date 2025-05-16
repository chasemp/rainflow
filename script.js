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
const audioSelect = document.getElementById('audio-select'); // Get the select element
const prevBtn = document.getElementById('prev-btn'); // Previous button
const nextBtn = document.getElementById('next-btn'); // Next button
const body = document.querySelector('body'); // Get the body element
let isPlaying = false;

// Array of audio files and corresponding background images
const audioFiles = [
    { file: 'audio1.mp3', background: 'background1.png' },
    { file: 'audio2.mp3', background: 'background2.png' },
    { file: 'audio3.mp3', background: 'background3.png' }
];

// Function to update the audio source and background
function updateAudioSource(newSource) {
    audioPlayer.src = newSource.file;
    audioPlayer.load();
    body.style.backgroundImage = `url("${newSource.background}")`;

    if (isPlaying) {
        audioPlayer.play();
    }
}

// Event listener for audio selection changes
audioSelect.addEventListener('change', () => {
    const selectedAudio = audioSelect.value;
    const selectedTrack = audioFiles.find(track => track.file === selectedAudio);
    if (selectedTrack) {
        updateAudioSource(selectedTrack);
    }
});

// Event listener for previous button
prevBtn.addEventListener('click', () => {
    let currentIndex = audioFiles.findIndex(track => audioPlayer.src.includes(track.file));

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = audioFiles.length - 1; // Wrap around to the last track
    }
    audioSelect.value = audioFiles[currentIndex].file;
    updateAudioSource(audioFiles[currentIndex]);
});

// Event listener for next button
nextBtn.addEventListener('click', () => {
    let currentIndex = audioFiles.findIndex(track => audioPlayer.src.includes(track.file));
    if (currentIndex < audioFiles.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // Wrap around to the first track
    }

    audioSelect.value = audioFiles[currentIndex].file;
    updateAudioSource(audioFiles[currentIndex]);
});

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
