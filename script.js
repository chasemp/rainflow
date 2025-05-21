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
const favoritesToggle = document.getElementById('favorites-toggle');

let isPlaying = false;
let isFadeInProgress = false;
let favoritesOnly = false;
let favorites = [];

// Load favorites from localStorage when the script starts
try {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        console.log('Loaded favorites from localStorage:', favorites);
    }
} catch (error) {
    console.error('Error loading favorites:', error);
    favorites = [];
}

// Array of audio files and corresponding background images
const audioFiles = [
    { file: 'audio/light_rain.mp3', background: 'image/light_rain_bg.png', title: 'Light Rain', artist: 'Wikimedia Commons' },
    { file: 'audio/calm_rain.mp3', background: 'image/calm_rain_bg.png', title: 'Calming Rain', artist: 'Wikimedia Commons' },
    { file: 'audio/relax_waterfall.mp3', background: 'image/waterfall_bg.png', title: 'Waterfall', artist: 'Wikimedia Commons' },
    { file: 'audio/morning_garden.mp3', background: 'image/morning_garden_bg.png', title: 'Morning Garden', artist: 'Wikimedia Commons' },
    { file: 'audio/city_seaside_port.mp3', background: 'image/city_seaside_port_bg.png', title: 'Seaside City Port', artist: 'Wikimedia Commons' },
    { file: 'audio/Dawn_Chorus.mp3', background: 'image/Dawn_Chorus_bg.png', title: 'Suburban Dawn', artist: 'Wikimedia Commons' },
    { file: 'audio/australia_lamington_national_park.mp3', background: 'image/australia_lamington_national_park_bg.png', title: 'Lamington National Park (Australia)', artist: 'Wikimedia Commons' },
    { file: 'audio/rain_song.mp3', background: 'image/rain_thunder_bg.png', title: 'Rain & Thunder', artist: 'Wikimedia Commons' }
];

// Fade effect functions
function fadeOut(duration = 500) {
    return new Promise(resolve => {
        if (isFadeInProgress) return resolve();
        isFadeInProgress = true;
        
        const startVolume = audioPlayer.volume;
        const startTime = performance.now();
        
        function fade() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            audioPlayer.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                isFadeInProgress = false;
                resolve();
            }
        }
        
        fade();
    });
}

function fadeIn(duration = 500) {
    return new Promise(resolve => {
        if (isFadeInProgress) return resolve();
        isFadeInProgress = true;
        
        const targetVolume = volumeSlider.value;
        const startTime = performance.now();
        
        function fade() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            audioPlayer.volume = targetVolume * progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                isFadeInProgress = false;
                resolve();
            }
        }
        
        fade();
    });
}

// Function to save favorites to localStorage
function saveFavorites() {
    try {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log('Saved favorites:', favorites);
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

// Function to update checkbox state
function updateFavoriteCheckbox(trackFile) {
    const favoriteCheckbox = document.querySelector('#favorite-track');
    if (favoriteCheckbox) {
        const isFavorite = favorites.includes(trackFile);
        favoriteCheckbox.checked = isFavorite;
        console.log('Updated checkbox for track:', trackFile, 'Checked:', isFavorite, 'Current favorites:', favorites);
    }
}

// Update the toggleFavorite function
function toggleFavorite(trackFile) {
    console.log('Toggling favorite for track:', trackFile);
    console.log('Current favorites before toggle:', favorites);
    
    const index = favorites.indexOf(trackFile);
    if (index === -1) {
        favorites.push(trackFile);
        console.log('Added to favorites');
    } else {
        favorites.splice(index, 1);
        console.log('Removed from favorites');
    }
    
    saveFavorites();
    updateFavoriteCheckbox(trackFile);
    updateSelectOptions();
}

function updateSelectOptions() {
    const currentValue = audioSelect.value;
    audioSelect.innerHTML = '';
    
    audioFiles.forEach(track => {
        if (!favoritesOnly || favorites.includes(track.file)) {
            const option = document.createElement('option');
            option.value = track.file;
            option.textContent = track.title;
            audioSelect.appendChild(option);
        }
    });
    
    audioSelect.value = currentValue;
}

// Add heart icon to the track info section
function updateTrackInfo(newSource) {
    const trackInfo = document.querySelector('.track-info p');
    trackInfo.innerHTML = `Now Playing: <span id="track-title">${newSource.title}</span> - <span id="track-artist">${newSource.artist}</span>`;
    updateFavoriteCheckbox(newSource.file);
}

// Update the updateAudioSource function
async function updateAudioSource(newSource) {
    if (isPlaying) {
        await fadeOut();
    }
    
    audioPlayer.src = newSource.file;
    audioPlayer.load();
    body.style.backgroundImage = `url("${newSource.background}")`;

    updateTrackInfo(newSource);
    localStorage.setItem('lastTrack', newSource.file);
    
    // Update checkbox state
    updateFavoriteCheckbox(newSource.file);

    if (isPlaying) {
        audioPlayer.play();
        await fadeIn();
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
    // Get available tracks based on favorites mode
    const availableTracks = favoritesOnly 
        ? audioFiles.filter(track => favorites.includes(track.file))
        : audioFiles;
    
    let currentIndex = availableTracks.findIndex(track => audioPlayer.src.includes(track.file));

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = availableTracks.length - 1; // Wrap around to the last track
    }
    
    const selectedTrack = availableTracks[currentIndex];
    audioSelect.value = selectedTrack.file;
    updateAudioSource(selectedTrack);
});

// Event listener for next button
nextBtn.addEventListener('click', () => {
    // Get available tracks based on favorites mode
    const availableTracks = favoritesOnly 
        ? audioFiles.filter(track => favorites.includes(track.file))
        : audioFiles;
    
    let currentIndex = availableTracks.findIndex(track => audioPlayer.src.includes(track.file));
    
    if (currentIndex < availableTracks.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // Wrap around to the first track
    }

    const selectedTrack = availableTracks[currentIndex];
    audioSelect.value = selectedTrack.file;
    updateAudioSource(selectedTrack);
});

// Update play/pause to include fade effects
playPauseBtn.addEventListener('click', async () => {
    if (isPlaying) {
        await fadeOut();
        audioPlayer.pause();
        playPauseBtn.textContent = '▶️';
    } else {
        audioPlayer.play();
        await fadeIn();
        playPauseBtn.textContent = '⏸️';
    }
    isPlaying = !isPlaying;
});

audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playPauseBtn.textContent = '▶️';
});

// Volume Control Event Listener
volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
    localStorage.setItem('volume', volumeSlider.value); // Persist Volume
});

// Add event listeners for favorites controls
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initial favorites on page load:', favorites);
    
    const heartIcon = document.querySelector('.track-heart');
    const favoriteCheckbox = document.querySelector('#favorite-track');

    if (heartIcon) {
        heartIcon.onclick = (e) => {
            e.stopPropagation();
            favoritesOnly = !favoritesOnly;
            heartIcon.textContent = favoritesOnly ? '💖' : '❤️';
            
            // Get current track
            const currentTrack = audioFiles.find(track => track.file === audioSelect.value);
            
            if (favoritesOnly) {
                if (favorites.length === 0) {
                    showNotification('No favorite tracks yet. Click the checkbox next to a track to add it to favorites.');
                    favoritesOnly = false;
                    heartIcon.textContent = '❤️';
                    return;
                }
                
                // Update select options only if we have favorites
                updateSelectOptions();
                
                // If current track is not in favorites, switch to first favorite track
                if (!favorites.includes(currentTrack.file)) {
                    const firstFavoriteTrack = audioFiles.find(track => favorites.includes(track.file));
                    if (firstFavoriteTrack) {
                        audioSelect.value = firstFavoriteTrack.file;
                        updateAudioSource(firstFavoriteTrack);
                        if (isPlaying) {
                            audioPlayer.play();
                        }
                    }
                }
            } else {
                // When turning off favorites mode, restore all tracks
                updateSelectOptions();
            }
        };
    }

    if (favoriteCheckbox) {
        favoriteCheckbox.onchange = (e) => {
            e.stopPropagation();
            const currentTrack = audioFiles.find(track => track.file === audioSelect.value);
            if (currentTrack) {
                console.log('Checkbox changed for track:', currentTrack.file);
                toggleFavorite(currentTrack.file);
            }
        };
    }

    // Add change event listener to the select element
    if (audioSelect) {
        audioSelect.addEventListener('change', () => {
            const selectedTrack = audioFiles.find(track => track.file === audioSelect.value);
            if (selectedTrack) {
                console.log('Track changed to:', selectedTrack.file);
                updateAudioSource(selectedTrack);
            }
        });
    }

    // Initialize favorites and track info
    updateSelectOptions();
    const initialTrack = audioFiles.find(track => track.file === audioSelect.value);
    if (initialTrack) {
        console.log('Initializing with track:', initialTrack.file);
        updateTrackInfo(initialTrack);
        updateFavoriteCheckbox(initialTrack.file);
    }
});

// Update keyboard controls to include fade effects and favorites toggle
document.addEventListener('keydown', async (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
    
    switch(event.code) {
        case 'Space':
            if (isPlaying) {
                await fadeOut();
                audioPlayer.pause();
                playPauseBtn.textContent = '▶️';
            } else {
                audioPlayer.play();
                await fadeIn();
                playPauseBtn.textContent = '⏸️';
            }
            isPlaying = !isPlaying;
            break;
            
        case 'ArrowLeft':
            // Get available tracks based on favorites mode
            const prevAvailableTracks = favoritesOnly 
                ? audioFiles.filter(track => favorites.includes(track.file))
                : audioFiles;
            
            let prevIndex = prevAvailableTracks.findIndex(track => audioPlayer.src.includes(track.file));
            if (prevIndex > 0) {
                prevIndex--;
            } else {
                prevIndex = prevAvailableTracks.length - 1;
            }
            const prevTrack = prevAvailableTracks[prevIndex];
            audioSelect.value = prevTrack.file;
            await updateAudioSource(prevTrack);
            break;
            
        case 'ArrowRight':
            // Get available tracks based on favorites mode
            const nextAvailableTracks = favoritesOnly 
                ? audioFiles.filter(track => favorites.includes(track.file))
                : audioFiles;
            
            let nextIndex = nextAvailableTracks.findIndex(track => audioPlayer.src.includes(track.file));
            if (nextIndex < nextAvailableTracks.length - 1) {
                nextIndex++;
            } else {
                nextIndex = 0;
            }
            const nextTrack = nextAvailableTracks[nextIndex];
            audioSelect.value = nextTrack.file;
            await updateAudioSource(nextTrack);
            break;

        case 'KeyF':
            // Toggle favorites playlist
            const heartIcon = document.querySelector('.track-heart');
            if (heartIcon) {
                favoritesOnly = !favoritesOnly;
                heartIcon.textContent = favoritesOnly ? '💖' : '❤️';
                
                // Get current track
                const currentTrack = audioFiles.find(track => track.file === audioSelect.value);
                
                if (favoritesOnly) {
                    if (favorites.length === 0) {
                        showNotification('No favorite tracks yet. Click the checkbox next to a track to add it to favorites.');
                        favoritesOnly = false;
                        heartIcon.textContent = '❤️';
                        return;
                    }
                    
                    // Update select options only if we have favorites
                    updateSelectOptions();
                    
                    // If current track is not in favorites, switch to first favorite track
                    if (!favorites.includes(currentTrack.file)) {
                        const firstFavoriteTrack = audioFiles.find(track => favorites.includes(track.file));
                        if (firstFavoriteTrack) {
                            audioSelect.value = firstFavoriteTrack.file;
                            updateAudioSource(firstFavoriteTrack);
                            if (isPlaying) {
                                audioPlayer.play();
                            }
                        }
                    }
                } else {
                    // When turning off favorites mode, restore all tracks
                    updateSelectOptions();
                }
            }
            break;
    }
});

// Load persisted track and volume on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load favorites from localStorage
    favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    const lastTrack = localStorage.getItem('lastTrack');
    const volume = localStorage.getItem('volume');

    if (lastTrack) {
        audioSelect.value = lastTrack; // Set dropdown to last track
        const selectedTrack = audioFiles.find(track => track.file === lastTrack);
        if (selectedTrack) {
            updateAudioSource(selectedTrack);
            updateFavoriteCheckbox(selectedTrack.file);
        }
    } else {
        // Initialize with the first track (Light Rain)
        const initialTrack = audioFiles[0];
        updateAudioSource(initialTrack);
        updateFavoriteCheckbox(initialTrack.file);
    }

    if (volume) {
        volumeSlider.value = volume; // Set volume slider to last volume
        audioPlayer.volume = volume;
    }
});

// Add online/offline status handling
async function checkServerConnectivity() {
    try {
        const response = await fetch('/icon.png', { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.log('Server connectivity check failed:', error);
        return false;
    }
}

async function updateOnlineStatus() {
    const wifiStatus = document.getElementById('wifi-status');
    if (!wifiStatus) return;

    const isServerReachable = await checkServerConnectivity();
    
    if (navigator.onLine && isServerReachable) {
        wifiStatus.classList.remove('offline');
        wifiStatus.title = 'Online';
        console.log('App is online and server is reachable');
    } else {
        wifiStatus.classList.add('offline');
        wifiStatus.title = 'Offline';
        console.log('App is offline or server is unreachable');
    }
}

// Add event listeners for online/offline status
window.addEventListener('online', () => {
    console.log('Network connection restored');
    updateOnlineStatus();
});

window.addEventListener('offline', () => {
    console.log('Network connection lost');
    updateOnlineStatus();
});

// Check connectivity periodically
setInterval(updateOnlineStatus, 30000); // Check every 30 seconds

// Initialize online status when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check initial online status
    updateOnlineStatus();
    
    // Rest of your existing DOMContentLoaded code...
    console.log('Initial favorites on page load:', favorites);
    
    const heartIcon = document.querySelector('.track-heart');
    const favoriteCheckbox = document.querySelector('#favorite-track');
    // ... rest of the existing code ...
});

// Function to show notification
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}
