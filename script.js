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
const dropdownContainer = document.getElementById('audio-select-container');
const dropdownSelected = document.getElementById('dropdown-selected');
const selectedText = document.getElementById('selected-text');
const dropdownOptions = document.getElementById('dropdown-options');
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
let currentTrackFile = 'audio/light_rain.mp3'; // Track current selection
let isDropdownOpen = false;

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
    // Crickets
    { file: 'audio/AN_Cricket_and_Birds_at_Dusk.mp3', background: 'image/crickets_birds_bg.png', title: 'Crickets (Dusk with Birds)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Crickets', displayName: 'Dusk with Birds' },
    { file: 'audio/AN_Crickets_and_Woodpecker_at_Dusk.mp3', background: 'image/crickets_dusk_bg.png', title: 'Crickets (Dusk with Woodpecker)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Crickets', displayName: 'Dusk with Woodpecker' },
    
    // Fire
    { file: 'audio/YT_fireplace.mp3', background: 'image/fireplace.jpg', title: 'Fire (Fireplace)', artist: 'Shurooq Siddiqui', artistUrl: 'https://www.youtube.com/watch?v=HJIGwOB84pQ', category: 'Fire', displayName: 'Fireplace' },
    { file: 'audio/YT_Roaring_Campfire.mp3', background: 'image/roaring_campfire.jpg', title: 'Fire (Roaring Campfire)', artist: 'Shurooq Siddiqui', artistUrl: 'https://www.youtube.com/channel/UC8GNHHbLg6ByCN1DZcUjylQ/videos', category: 'Fire', displayName: 'Roaring Campfire' },
    
    // Lamington
    { file: 'audio/australia_lamington_national_park.mp3', background: 'image/australia_lamington_national_park_bg.png', title: 'Lamington National Park (Australia)', artist: 'Wikimedia Commons', artistUrl: 'https://commons.wikimedia.org/wiki/File:Short_nature_soundscape,_Lamington_National_Park,_Australia.ogg', category: 'Lamington', displayName: 'National Park (Australia)' },
    
    // Morning
    { file: 'audio/morning_garden.mp3', background: 'image/morning_garden_bg.png', title: 'Morning (In The Garden)', artist: 'Wikimedia Commons', artistUrl: 'https://commons.wikimedia.org/wiki/File:Morning_garden_sounds_2020-06-13_0942_1044.mp3', category: 'Morning', displayName: 'In The Garden' },
    { file: 'audio/AN_Morning_Bird_Chorus_at_Dawn_with_Bullfrogs.mp3', background: 'image/morning_river_bg.png', title: 'Morning (On The River)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Morning', displayName: 'On The River' },
    
    // Night
    { file: 'audio/AN_Night_Ambience_in_Forest_with_Stream.mp3', background: 'image/forest_night_bg.png', title: 'Night (Forest Ambience)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Night', displayName: 'Forest Ambience' },
    { file: 'audio/AN_Spring_Peeper_and_American_Toad_Chorus_at_Night.mp3', background: 'image/amphibian_night_bg.png', title: 'Night (Amphibian Chorus)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Night', displayName: 'Amphibian Chorus' },
    
    // Ocean
    { file: 'audio/AN_Underwater_Ocean_Waves_in_a_Tidepool.mp3', background: 'image/ocean_tidepool_bg.png', title: 'Ocean (Tidepool Waves)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Ocean', displayName: 'Tidepool Waves' },
    { file: 'audio/AN_Rapidly_Rising_Ocean_Tide_at_Sunset.mp3', background: 'image/ocean_tide_bg.png', title: 'Ocean (Rising Tide at Sunset)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Ocean', displayName: 'Rising Tide at Sunset' },
    { file: 'audio/AN_Powerful_Ocean_Waves_at_the_Beach.mp3', background: 'image/ocean_waves_bg.png', title: 'Ocean (Beach Waves)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Ocean', displayName: 'Beach Waves' },
    { file: 'audio/AN_Crashing_Ocean_Waves_with_Small_Pebbles.mp3', background: 'image/ocean_crashing_bg.png', title: 'Ocean (Crashing Waves)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Ocean', displayName: 'Crashing Waves' },
    { file: 'audio/AN_Crashing_Waves_in_an_Ocean_Cave.mp3', background: 'image/ocean_cave_bg.png', title: 'Ocean (Crashing Cave Waves)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Ocean', displayName: 'Crashing Cave Waves' },
    
    // Rain
    { file: 'audio/AN_Melting_Dripping_Icicles.mp3', background: 'image/icicles_bg.png', title: 'Rain (Easy)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Rain', displayName: 'Easy' },
    { file: 'audio/AN _Light_Rainfall_in_a_Swamp_with_Singing_Birds.mp3', background: 'image/marsh_rain_bg.png', title: 'Rain (Easy in Marsh with Birds)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Rain', displayName: 'Easy in Marsh with Birds' },
    { file: 'audio/AN_Light_Rain_Falling_on_Tent_with_Rolling _Thunder.mp3', background: 'image/tent_rain_bg.png', title: 'Rain (Gentle on a Tent)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Rain', displayName: 'Gentle on a Tent' },
    { file: 'audio/light_rain.mp3', background: 'image/rain_medium_bg.png', title: 'Rain (Medium)', artist: 'Wikimedia Commons', artistUrl: 'https://commons.wikimedia.org/wiki/File:Falling_Rain_SFX_1_2016-11-19.oga', category: 'Rain', displayName: 'Medium' },
    { file: 'audio/AN_Rain_Shower_with_Distant_Rolling_Thunder.mp3', background: 'image/calm_rain_bg.png', title: 'Rain (Medium with Thunder)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Rain', displayName: 'Medium with Thunder' },
    { file: 'audio/FS_heavy_rain_pink_noise.mp3', background: 'image/heavy_rain.jpg', title: 'Rain (Heavy)', artist: 'Freesound.org', artistUrl: 'https://freesound.org/people/jsuite22/sounds/751512/', category: 'Rain', displayName: 'Heavy' },
    
    // River
    { file: 'audio/AN_Medium_Flow_Stream.mp3', background: 'image/gentle_river_bg.png', title: 'River (Gentle)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'River', displayName: 'Gentle' },
    { file: 'audio/AN_Up_Close_Stream.mp3', background: 'image/easy_river_bg.png', title: 'River (Easy)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'River', displayName: 'Easy' },
    { file: 'audio/AN_Detailed_Gentle_Stream_Flow.mp3', background: 'image/medium_flow_river_bg.png', title: 'River (Medium)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'River', displayName: 'Medium' },
    { file: 'audio/AN_Turbulent_Stream_in_a_Forest.mp3', background: 'image/turbulent_stream_bg.png', title: 'River (Heavy)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'River', displayName: 'Heavy' },
    
    // Seaside
    { file: 'audio/city_seaside_port.mp3', background: 'image/city_seaside_port_bg.png', title: 'Seaside City Port', artist: 'Wikimedia Commons', artistUrl: 'https://commons.wikimedia.org/wiki/File:Sunday_in_the_city_street_noise3.ogg', category: 'Seaside', displayName: 'City Port' },
    
    // Stream
    { file: 'audio/AN_Gentle_Flowing_Stream.mp3', background: 'image/gentle_stream_bg.png', title: 'Stream (Gentle)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Stream', displayName: 'Gentle' },
    { file: 'audio/AN_Babbling_Brook.mp3', background: 'image/babbling_brook_bg.png', title: 'Stream (Easy)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Stream', displayName: 'Easy' },
    { file: 'audio/AN_Fast_Flowing_Stream_in_a_Forest_with_Birds.mp3', background: 'image/medium_stream_bg.png', title: 'Stream (Medium)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Stream', displayName: 'Medium' },
    { file: 'audio/AN_Nightfall_on_a_with_River_Birds_Fish_Frogs.mp3', background: 'image/stream_wildlife_bg.png', title: 'Stream (Wildlife at Dusk)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Stream', displayName: 'Wildlife at Dusk' },
    
    // Thunderstorm
    { file: 'audio/AN_Distant_Thunder_and_Water_Dripping_from_Forest_Canopy.mp3', background: 'image/forest_thunder_bg.png', title: 'Thunderstorm (Distant in Forest)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Thunderstorm', displayName: 'Distant in Forest' },
    { file: 'audio/AN_Thunder_Storm_Approaching.mp3', background: 'image/rain_thunder_bg.png', title: 'Thunderstorm (Approaching)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Thunderstorm', displayName: 'Approaching' },
    
    // Waterfall
    { file: 'audio/AN_Waterfall.mp3', background: 'image/waterfall_bg.png', title: 'Waterfall (Easy)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Waterfall', displayName: 'Easy' },
    { file: 'audio/relax_waterfall.mp3', background: 'image/waterfall_medium_bg.png', title: 'Waterfall (Medium)', artist: 'Wikimedia Commons', artistUrl: 'https://commons.wikimedia.org/wiki/File:Relaxing_Waterfall_ASMR_-_JD_Savanyu.webm', category: 'Waterfall', displayName: 'Medium' },
    
    // Winds
    { file: 'audio/AN_Gentle_Wind_On_A_Mountaintop.mp3', background: 'image/mountain_breeze_bg.png', title: 'Winds (Gentle Mountain Breeze)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Winds', displayName: 'Gentle Mountain Breeze' },
    { file: 'audio/AN_Empty_Winter_Wind_at_Night.mp3', background: 'image/winter_wind_bg.png', title: 'Winds (Winter Mountain Forest)', artist: 'Acoustic Nature', artistUrl: 'https://acousticnature.com', category: 'Winds', displayName: 'Winter Mountain Forest' }
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

// Function to build categorized dropdown
function buildCategorizedDropdown(currentTrackFile = null) {
    // Get current track's category to expand it by default
    const currentTrack = audioFiles.find(track => track.file === currentTrackFile);
    const currentCategory = currentTrack ? currentTrack.category : 'Rain'; // Default to Rain
    
    // Category emojis
    const categoryEmojis = {
        'Crickets': '🦗',
        'Fire': '🔥',
        'Lamington': '🇦🇺',
        'Morning': '🌅',
        'Night': '🌙',
        'Ocean': '🌊',
        'Rain': '🌧️',
        'River': '🏞️',
        'Seaside': '🏖️',
        'Stream': '💧',
        'Thunderstorm': '⛈️',
        'Waterfall': '💦',
        'Winds': '💨'
    };
    
    // Group tracks by category
    const categories = {};
    audioFiles.forEach(track => {
        if (!categories[track.category]) {
            categories[track.category] = [];
        }
        categories[track.category].push(track);
    });
    
    // Sort categories alphabetically, but put Rain first
    const sortedCategories = Object.keys(categories).sort((a, b) => {
        if (a === 'Rain') return -1;
        if (b === 'Rain') return 1;
        return a.localeCompare(b);
    });
    
    let html = '';
    sortedCategories.forEach(categoryName => {
        const isExpanded = categoryName === currentCategory;
        const emoji = categoryEmojis[categoryName] || '🎵';
        html += `
            <div class="dropdown-category">
                <div class="category-header ${isExpanded ? 'expanded' : ''}" data-category="${categoryName}">
                    <span>${emoji} ${categoryName}</span>
                    <span class="category-arrow">▶</span>
                </div>
                <div class="category-tracks ${isExpanded ? 'expanded' : ''}">
        `;
        
        categories[categoryName].forEach(track => {
            const isFavorite = favorites.includes(track.file);
            const favoriteIcon = isFavorite ? ' ❤️' : '';
            const isSelected = track.file === currentTrackFile;
            html += `<div class="dropdown-option ${isSelected ? 'selected' : ''}" data-value="${track.file}">${track.displayName}${favoriteIcon}</div>`;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    return html;
}

// Function to build favorites-only dropdown
function buildFavoritesDropdown() {
    const favoritesTracks = audioFiles.filter(track => favorites.includes(track.file));
    
    let html = `
        <div class="dropdown-category favorites-category">
            <div class="category-header expanded" data-category="Favorites">
                <span>❤️ Favorites</span>
                <span class="category-arrow">▶</span>
            </div>
            <div class="category-tracks expanded">
    `;
    
    favoritesTracks.forEach(track => {
        const isSelected = track.file === currentTrackFile;
        html += `<div class="dropdown-option ${isSelected ? 'selected' : ''}" data-value="${track.file}">${track.title} ❤️</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Custom dropdown functions
function openDropdown() {
    isDropdownOpen = true;
    dropdownSelected.classList.add('open');
    dropdownOptions.classList.add('show');
}

function closeDropdown() {
    isDropdownOpen = false;
    dropdownSelected.classList.remove('open');
    dropdownOptions.classList.remove('show');
}

function selectOption(trackFile) {
    currentTrackFile = trackFile;
    const track = audioFiles.find(t => t.file === trackFile);
    if (track) {
        selectedText.textContent = track.title;
        updateAudioSource(track);
        updateSelectOptions(); // Refresh to show selection
    }
    closeDropdown();
}

function toggleCategory(categoryName) {
    const categoryHeader = dropdownOptions.querySelector(`[data-category="${categoryName}"]`);
    const categoryTracks = categoryHeader.nextElementSibling;
    
    const isExpanded = categoryHeader.classList.contains('expanded');
    
    if (isExpanded) {
        categoryHeader.classList.remove('expanded');
        categoryTracks.classList.remove('expanded');
    } else {
        categoryHeader.classList.add('expanded');
        categoryTracks.classList.add('expanded');
    }
}

// Updated function to build dropdown based on mode
function updateSelectOptions() {
    if (favoritesOnly) {
        dropdownOptions.innerHTML = buildFavoritesDropdown();
    } else {
        dropdownOptions.innerHTML = buildCategorizedDropdown(currentTrackFile);
    }
    
    // Add event listeners to new elements
    addDropdownEventListeners();
}

function addDropdownEventListeners() {
    // Category header click handlers
    const categoryHeaders = dropdownOptions.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const categoryName = header.getAttribute('data-category');
            toggleCategory(categoryName);
        });
    });
    
    // Option click handlers
    const options = dropdownOptions.querySelectorAll('.dropdown-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackFile = option.getAttribute('data-value');
            selectOption(trackFile);
        });
    });
}

// Add heart icon to the track info section
function updateTrackInfo(newSource) {
    const trackInfo = document.querySelector('.track-info p');
    trackInfo.innerHTML = `Now Playing: <span id="track-title">${newSource.title}</span> - <a href="${newSource.artistUrl}" target="_blank" rel="noopener noreferrer" id="track-artist" class="artist-link">${newSource.artist}</a>`;
    updateFavoriteCheckbox(newSource.file);
}

// Update the updateAudioSource function
async function updateAudioSource(newSource) {
    if (isPlaying) {
        await fadeOut();
    }
    
    audioPlayer.src = newSource.file;
    audioPlayer.loop = true; // Explicitly set loop to true
    audioPlayer.load();
    body.style.backgroundImage = `url("${newSource.background}")`;

    updateTrackInfo(newSource);
    localStorage.setItem('lastTrack', newSource.file);
    
    // Update checkbox state
    updateFavoriteCheckbox(newSource.file);
    
    // Update current track and rebuild dropdown to expand the correct category
    currentTrackFile = newSource.file;
    selectedText.textContent = newSource.title;
    if (!favoritesOnly) {
        updateSelectOptions();
    }

    if (isPlaying) {
        audioPlayer.play();
        await fadeIn();
    }
}

// Main dropdown event listeners
dropdownSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isDropdownOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (isDropdownOpen && !dropdownContainer.contains(e.target)) {
        closeDropdown();
    }
});

// Event listener for previous button
prevBtn.addEventListener('click', () => {
    // Get available tracks based on favorites mode
    const availableTracks = favoritesOnly 
        ? audioFiles.filter(track => favorites.includes(track.file))
        : audioFiles;
    
    let currentIndex = availableTracks.findIndex(track => track.file === currentTrackFile);

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = availableTracks.length - 1; // Wrap around to the last track
    }
    
    const selectedTrack = availableTracks[currentIndex];
    selectOption(selectedTrack.file);
});

// Event listener for next button
nextBtn.addEventListener('click', () => {
    // Get available tracks based on favorites mode
    const availableTracks = favoritesOnly 
        ? audioFiles.filter(track => favorites.includes(track.file))
        : audioFiles;
    
    let currentIndex = availableTracks.findIndex(track => track.file === currentTrackFile);
    
    if (currentIndex < availableTracks.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // Wrap around to the first track
    }

    const selectedTrack = availableTracks[currentIndex];
    selectOption(selectedTrack.file);
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

// Add event listener for when audio ends (as a fallback)
audioPlayer.addEventListener('ended', () => {
    if (audioPlayer.loop) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        isPlaying = false;
        playPauseBtn.textContent = '▶️';
    }
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
            const currentTrack = audioFiles.find(track => track.file === currentTrackFile);
            
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
                        selectOption(firstFavoriteTrack.file);
                        if (isPlaying) {
                            audioPlayer.play();
                        }
                    }
                }
            } else {
                // When turning off favorites mode, restore categorized tracks
                updateSelectOptions();
            }
        };
    }

    if (favoriteCheckbox) {
        favoriteCheckbox.onchange = (e) => {
            e.stopPropagation();
            const currentTrack = audioFiles.find(track => track.file === currentTrackFile);
            if (currentTrack) {
                console.log('Checkbox changed for track:', currentTrack.file);
                toggleFavorite(currentTrack.file);
            }
        };
    }
});

// Update keyboard controls to include fade effects and favorites toggle
document.addEventListener('keydown', async (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
    
    switch(event.code) {
        case 'Escape':
            if (isDropdownOpen) {
                closeDropdown();
            }
            break;
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
            
            let prevIndex = prevAvailableTracks.findIndex(track => track.file === currentTrackFile);
            if (prevIndex > 0) {
                prevIndex--;
            } else {
                prevIndex = prevAvailableTracks.length - 1;
            }
            const prevTrack = prevAvailableTracks[prevIndex];
            selectOption(prevTrack.file);
            break;
            
        case 'ArrowRight':
            // Get available tracks based on favorites mode
            const nextAvailableTracks = favoritesOnly 
                ? audioFiles.filter(track => favorites.includes(track.file))
                : audioFiles;
            
            let nextIndex = nextAvailableTracks.findIndex(track => track.file === currentTrackFile);
            if (nextIndex < nextAvailableTracks.length - 1) {
                nextIndex++;
            } else {
                nextIndex = 0;
            }
            const nextTrack = nextAvailableTracks[nextIndex];
            selectOption(nextTrack.file);
            break;

        case 'KeyF':
            // Toggle favorites playlist
            const heartIcon = document.querySelector('.track-heart');
            if (heartIcon) {
                favoritesOnly = !favoritesOnly;
                heartIcon.textContent = favoritesOnly ? '💖' : '❤️';
                
                // Get current track
                const currentTrack = audioFiles.find(track => track.file === currentTrackFile);
                
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
                            selectOption(firstFavoriteTrack.file);
                            if (isPlaying) {
                                audioPlayer.play();
                            }
                        }
                    }
                } else {
                    // When turning off favorites mode, restore categorized tracks
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
    
    let selectedTrack;
    if (lastTrack) {
        selectedTrack = audioFiles.find(track => track.file === lastTrack);
    }
    
    // If no saved track or saved track not found, default to Rain (Medium)
    if (!selectedTrack) {
        selectedTrack = audioFiles.find(track => track.file === 'audio/light_rain.mp3');
    }
    
    if (selectedTrack) {
        // Initialize the dropdown and audio source
        currentTrackFile = selectedTrack.file;
        selectedText.textContent = selectedTrack.title;
        updateSelectOptions(); // Build the categorized dropdown with the correct category expanded
        updateAudioSource(selectedTrack);
        updateFavoriteCheckbox(selectedTrack.file);
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
