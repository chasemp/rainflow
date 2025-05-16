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
const volumeSlider = document.getElementById('volume-slider'); // Volume slider
const currentTrackTitle = document.getElementById('track-title'); // Track title
const currentTrackArtist = document.getElementById('track-artist'); // Track artist

let isPlaying = false;

// Array of audio files and corresponding background images
const audioFiles = [
    { file: 'audio/light_rain.mp3', background: 'image/light_rain_bg.png', title: 'Light Rain', artist: 'Wikimedia Commons' },
    { file: 'audio/calm_rain.mp3', background: 'image/calm_rain_bg.png', title: 'Calming Rain', artist: 'Wikimedia Commons' },
    { file: 'audio/relax_waterfall.mp3', background: 'image/waterfall_bg.png', title: 'Waterfall', artist: 'Wikimedia Commons' },
    { file: 'audio/morning_garden.mp3', background: 'image/morning_garden_bg.png', title: 'Morning Garden', artist: 'Wikimedia Commons' },
    { file: 'audio/city_seaside_port.mp3', background: 'image/city_seaside_port_bg.png', title: 'Seaside City Port', artist: 'Wikimedia Commons' },
    { file: 'audio/australia_lamington_national_park.mp3', background: 'image/australia_lamington_national_park_bg.png', title: 'Lamington National Park (Australia)', artist: 'Wikimedia Commons' },
    { file: 'audio/rain_song.mp3', background: 'image/rain_thunder_bg.png', title: 'Rain & Thunder', artist: 'Wikimedia Commons' }
];

// Function to update the audio source and background
function updateAudioSource(newSource) {
    audioPlayer.src = newSource.file;
    audioPlayer.load();
    body.style.backgroundImage = `url("${newSource.background}")`;

    // Update track title and artist
    currentTrackTitle.textContent = newSource.title;
    currentTrackArtist.textContent = newSource.artist;

    localStorage.setItem('lastTrack', newSource.file); // Persist track selection

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

// Volume Control Event Listener
volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
    localStorage.setItem('volume', volumeSlider.value); // Persist Volume
});

// Load persisted track and volume on page load
document.addEventListener('DOMContentLoaded', () => {
    const lastTrack = localStorage.getItem('lastTrack');
    const volume = localStorage.getItem('volume');

    if (lastTrack) {
        audioSelect.value = lastTrack; // Set dropdown to last track
        const selectedTrack = audioFiles.find(track => track.file === lastTrack);
        if (selectedTrack) {
            updateAudioSource(selectedTrack);
        }
    }

    if (volume) {
        volumeSlider.value = volume; // Set volume slider to last volume
        audioPlayer.volume = volume;
    }
});
