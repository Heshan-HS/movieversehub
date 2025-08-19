document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav .close-btn');

    if (hamburgerMenu && mobileNav && closeBtn) {
        hamburgerMenu.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    }

    // Ensure movieList is loaded
    if (typeof movieList === 'undefined' || !movieList) {
        console.error('movieList is not defined. Make sure movies.js is loaded correctly.');
        return;
    }

    // Initial setup
    populateGenres(); // Use the new function
    handleInitialPageLoad();

    // Setup event listeners
    setupEventListeners();
});

function handleInitialPageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const genreFromUrl = urlParams.get('genre');
    const currentPage = window.location.pathname;

    // Remove active class from all links first
    document.querySelectorAll('.nav-menu a, #genre-list a, #mobile-genre-list a').forEach(a => a.classList.remove('active'));

    if (currentPage.includes('index.html') || currentPage === '/') {
        if (genreFromUrl) {
            const decodedGenre = decodeURIComponent(genreFromUrl);
            filterResults({ genre: decodedGenre });

            // Highlight the active genre link in both desktop and mobile menus
            const genreLinks = document.querySelectorAll(`a[href="index.html?genre=${encodeURIComponent(decodedGenre)}"]`);
            genreLinks.forEach(link => link.classList.add('active'));
        } else {
            displayAllMovies();
            // Highlight the Home link if no genre is selected on the index page
            const homeLinks = document.querySelectorAll('a[href="index.html"]');
            homeLinks.forEach(link => {
                if (!link.href.includes('?genre=')) {
                    link.classList.add('active');
                }
            });
        }
    } else {
        // For other pages like movie.html, you can decide what to highlight
        // For now, we'll leave nothing active
    }
}

function setupEventListeners() {
    const homeButtons = document.querySelectorAll('.nav-menu a[href="index.html"]');
    const logoLinks = document.querySelectorAll('.logo-link');
    const heroSection = document.getElementById('hero-section');
    const searchInput = document.getElementById('search-input');
    const trailerModal = document.getElementById('trailer-modal');
    const trailerIframe = document.getElementById('trailer-iframe');
    const closeModalButton = trailerModal.querySelector('.close-button');

    const onHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

    if (onHomePage) {
        homeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                displayAllMovies();
            });
        });

        logoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                displayAllMovies();
            });
        });
    }

    if (heroSection) {
        heroSection.addEventListener('click', (e) => {
            const trailerButton = e.target.closest('.btn-primary');
            const infoButton = e.target.closest('.btn-secondary');

            if (trailerButton) {
                e.preventDefault();
                const movieTitle = heroSection.dataset.movieTitle;
                const movie = findMovieByTitle(movieTitle);
                if (movie && movie.trailerLink) {
                    const videoId = getYouTubeVideoId(movie.trailerLink);
                    if (videoId) {
                        trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                        trailerModal.classList.add('show');
                    }
                }
            } else if (infoButton) {
                e.preventDefault();
                const movieTitle = heroSection.dataset.movieTitle;
                const movie = findMovieByTitle(movieTitle);
                if (movie) {
                    window.location.href = `movie.html?title=${encodeURIComponent(movie.title)}`;
                }
            } else {
                // Allow default behavior for the main banner click, which is handled by the info button's href
            }
        });
    }

    // Event listeners for closing the trailer modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            trailerModal.classList.remove('show');
            trailerIframe.src = ''; // Stop video playback
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            trailerModal.classList.remove('show');
            trailerIframe.src = ''; // Stop video playback
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
            displaySearchHistory();
        });
    }

    // Hide suggestions when clicking outside the search area
    document.addEventListener('click', (event) => {
        const searchBar = document.querySelector('.search-bar');
        if (!searchBar.contains(event.target)) {
            const suggestionsBox = document.getElementById('suggestions-box');
            const historyBox = document.getElementById('search-history-box');
            if (suggestionsBox) {
                suggestionsBox.style.display = 'none';
            }
            if (historyBox) {
                historyBox.style.display = 'none';
            }
        }
    });
}

function populateGenres() {
    const desktopGenreList = document.getElementById('genre-list');
    const mobileGenreList = document.getElementById('mobile-genre-list');

    if (!desktopGenreList && !mobileGenreList) return;

    const genres = [...new Set(movieList.flatMap(movie => movie.genre.filter(g => g)))].sort();
    
    const populateList = (list) => {
        if (!list) return;
        list.innerHTML = ''; // Clear the list

    genres.forEach(genre => {
        if (!genre) return;
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `index.html?genre=${encodeURIComponent(genre)}`;
        // For mobile, we don't need the link-text span as it's handled differently
        const linkHTML = list.id === 'mobile-genre-list' ? `<i class="fas fa-video"></i> ${genre}` : `<i class="fas fa-video"></i> <span class="link-text">${genre}</span>`;
        link.innerHTML = linkHTML;

        link.addEventListener('click', (e) => {
            // On mobile, close the nav after clicking
            const mobileNav = document.getElementById('mobile-nav');
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
            }

            // If we are on the main page, prevent navigation and filter in-place
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                e.preventDefault();
                filterResults({ genre });

                // Update active state for all nav links
                document.querySelectorAll('.nav-menu a, #genre-list a, #mobile-genre-list a').forEach(a => a.classList.remove('active'));
                
                // Add active class to the clicked link and its counterpart
                const allLinks = document.querySelectorAll(`a[href="index.html?genre=${encodeURIComponent(genre)}"]`);
                allLinks.forEach(l => l.classList.add('active'));

                // Also set the main home link to inactive
                document.querySelectorAll('.nav-menu a[href="index.html"]').forEach(a => a.classList.remove('active'));
            }
            // Otherwise, allow the default navigation to the index page with the genre query
        });

        listItem.appendChild(link);
        list.appendChild(listItem);
    });
    }

    populateList(desktopGenreList);
    populateList(mobileGenreList);
}

function filterResults(options) {
    const { genre, searchTerm } = options;
    const allSections = document.querySelectorAll('.movies-section');
    const mainGrid = document.getElementById('trending-grid');
    const mainHeader = allSections[0].querySelector('.section-header');

    // Hide all sections except the first one which will display results
    allSections.forEach((section, index) => {
        section.style.display = index === 0 ? 'block' : 'none';
    });

    // Display skeleton loaders immediately
    displaySkeletonLoaders(mainGrid, 6);

    // Simulate a delay for filtering
    setTimeout(() => {
        let filteredMovies = [];
        if (genre) {
            filteredMovies = movieList.filter(movie => movie.genre.includes(genre));
            mainHeader.textContent = `${genre} Movies`;
        } else if (searchTerm) {
            filteredMovies = movieList.filter(movie => movie.title.toLowerCase().includes(searchTerm));
            mainHeader.textContent = `Search Results for "${searchTerm}"`;
        }

        mainGrid.innerHTML = ''; // Clear skeletons
        if (filteredMovies.length > 0) {
            filteredMovies.forEach(movie => {
                mainGrid.appendChild(createMovieCard(movie));
            });
        } else {
            mainGrid.innerHTML = '<p class="no-results">No movies found.</p>';
        }
    }, 1000); // 1-second delay
}

function handleSearch(query, fromHistory = false) {
    const suggestionsBox = document.getElementById('suggestions-box');
    const searchTerm = query.trim().toLowerCase();

    if (!fromHistory && searchTerm) {
        addSearchToHistory(searchTerm);
    }

    if (searchTerm === '') {
        suggestionsBox.style.display = 'none';
        displayAllMovies();
        return;
    }

    // Update the main grid with live search results
    filterResults({ searchTerm });

    // Populate and show the suggestions box
    const matchingMovies = movieList.filter(movie => movie.title.toLowerCase().includes(searchTerm));
    suggestionsBox.innerHTML = '';
    if (matchingMovies.length > 0) {
        matchingMovies.forEach(movie => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = movie.title;
            suggestionItem.addEventListener('click', () => {
                const searchInput = document.getElementById('search-input');
                searchInput.value = movie.title;
                suggestionsBox.style.display = 'none';
                filterResults({ searchTerm: movie.title.toLowerCase() });
            });
            suggestionsBox.appendChild(suggestionItem);
        });
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

function displayAllMovies() {
    startHeroBannerAutoChange();
    const allSections = document.querySelectorAll('.movies-section');
    allSections.forEach(section => section.style.display = 'block');

    // Reset headers
    allSections[0].querySelector('.section-header').textContent = 'Trending Movies';
    allSections[1].querySelector('.section-header').textContent = 'New Releases';
    allSections[2].querySelector('.section-header').textContent = 'Featured Movies';
    if (allSections[3]) {
        allSections[3].querySelector('.section-header').textContent = 'Recommended For You';
    }

    // Get all grids
    const trendingGrid = document.getElementById('trending-grid');
    const newReleasesGrid = document.getElementById('new-releases-grid');
    const featuredMoviesGrid = document.getElementById('featured-movies-grid');
    const recommendedMoviesGrid = document.getElementById('recommended-movies-grid');
    const grids = [trendingGrid, newReleasesGrid, featuredMoviesGrid, recommendedMoviesGrid];

    // Display skeleton loaders immediately
    grids.forEach(grid => {
        if (grid) {
            const count = grid.id === 'featured-movies-grid' ? 12 : 6;
            displaySkeletonLoaders(grid, count);
        }
    });

    // Simulate a network delay, then populate with real data
    setTimeout(() => {
        if (newReleasesGrid) {
            newReleasesGrid.innerHTML = '';
            movieList.slice(0, 6).forEach(movie => newReleasesGrid.appendChild(createMovieCard(movie)));
        }
        if (trendingGrid) {
            trendingGrid.innerHTML = '';
            movieList.slice(6, 12).forEach(movie => trendingGrid.appendChild(createMovieCard(movie)));
        }
        if (featuredMoviesGrid) {
            featuredMoviesGrid.innerHTML = '';

            // Movies displayed in other sections
            const newReleasesMovies = movieList.slice(0, 6);
            const trendingMovies = movieList.slice(6, 12);
            const recommendedMovies = movieList.slice(18, 24);

            const displayedMovies = [...newReleasesMovies, ...trendingMovies, ...recommendedMovies];
            const displayedMovieTitles = new Set(displayedMovies.map(movie => movie.title));

            // Filter out displayed movies to get the remaining ones for the featured section
            const remainingMovies = movieList.filter(movie => !displayedMovieTitles.has(movie.title));

            remainingMovies.forEach(movie => featuredMoviesGrid.appendChild(createMovieCard(movie)));
            remainingMovies.forEach(movie => featuredMoviesGrid.appendChild(createMovieCard(movie))); // Duplicate for seamless scroll
        }
        if (recommendedMoviesGrid) {
            recommendedMoviesGrid.innerHTML = '';
            const recommendedMovies = movieList.slice(18, 24);
            recommendedMovies.forEach(movie => recommendedMoviesGrid.appendChild(createMovieCard(movie)));
        }
    }, 1500); // 1.5 second delay

    // Reset active sidebar link
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    const homeLink = document.querySelector('.nav-menu a[href="index.html"]');
    if (homeLink) {
        homeLink.classList.add('active');
    }
}

function startHeroBannerAutoChange() {
    if (!movieList || movieList.length === 0) return;

    const heroMovie = movieList[0]; // Get only the first movie
    if (!heroMovie) return;

    // Update the hero section with the first movie
    updateHeroSection(heroMovie);
}

function updateHeroSection(heroMovie) {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection || !heroMovie) return;

    heroSection.dataset.movieTitle = heroMovie.title;

    const heroContent = heroSection.querySelector('.hero-content');
    const bgImage = heroSection.querySelector('.background-image-container img');

    // 1. Fade out
    if (heroContent) heroContent.style.opacity = 0;
    if (bgImage) bgImage.style.opacity = 0;

    // 2. Wait for fade-out transition, then update content
    setTimeout(() => {
        if (bgImage && heroMovie.banner) {
            bgImage.src = heroMovie.banner;
        } else if (bgImage) {
            bgImage.src = heroMovie.poster; // Fallback
        }

        const titleH1 = heroSection.querySelector('h1');
        const detailsContainer = document.getElementById('hero-details-container');
        const trailerLink = heroSection.querySelector('.btn-primary');
        const infoLink = heroSection.querySelector('.btn-secondary');

        if (titleH1) titleH1.textContent = `${heroMovie.title} ${heroMovie.year}`;

        if (detailsContainer) {
            detailsContainer.innerHTML = `
                ${heroMovie.englishDescription ? `<p class="banner-description">${heroMovie.englishDescription}</p>` : ''}
                <div class="movie-info-list">
                    ${heroMovie.releaseDate ? `<div class="info-item"><strong>Release Date:</strong> ${heroMovie.releaseDate}</div>` : ''}
                    ${heroMovie.rating ? `<div class="info-item"><strong>Rating:</strong> ${heroMovie.rating} <span class="imdb-tag">IMDb</span></div>` : ''}
                    ${heroMovie.cast && heroMovie.cast.length > 0 ? `
                        <div class="info-item cast-section">
                            <strong>Cast</strong>
                            <p class="cast-list">${heroMovie.cast.join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        if (trailerLink) {
            trailerLink.href = heroMovie.trailerLink || '#';
            trailerLink.target = '_blank';
        }
        if (infoLink) {
            infoLink.href = `movie.html?title=${encodeURIComponent(heroMovie.title)}`;
        }

        // 3. Fade in
        if (heroContent) heroContent.style.opacity = 1;
        if (bgImage) bgImage.style.opacity = 1;
    }, 500); // Must match the CSS transition duration
}

function createSkeletonCard() {
    const card = document.createElement('div');
    card.classList.add('skeleton-card');
    card.innerHTML = `
        <div class="skeleton-image">
            <div class="shimmer-wrapper"></div>
        </div>
    `;
    return card;
}

function displaySkeletonLoaders(gridElement, count) {
    if (!gridElement) return;
    gridElement.innerHTML = ''; // Clear the grid first
    for (let i = 0; i < count; i++) {
        gridElement.appendChild(createSkeletonCard());
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="card-background-image">
        <div class="card-overlay">
            <span class="movie-card-category">${movie.genre.join(' / ')}</span>
            <div class="card-footer">
                <h3>${movie.title} (${movie.year})</h3>
                <p>${movie.genre.join(', ')}</p>
            </div>
        </div>
    `;
    card.addEventListener('click', () => {
        // Open the Monetag link in a new tab
        window.open('https://otieu.com/4/9740588', '_blank');
        // Navigate to the movie page in the current tab
        window.location.href = `movie.html?title=${encodeURIComponent(movie.title)}`;
    });
    return card;
}

function getYouTubeVideoId(url) {
    let videoId = '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.substring(1);
        }
    } catch (e) {
        console.error('Invalid URL for YouTube video ID extraction', e);
    }
    return videoId;
}

function getSearchHistory() {
    return JSON.parse(localStorage.getItem('movieSearchHistory')) || [];
}

function addSearchToHistory(term) {
    let history = getSearchHistory();
    // Remove existing instance of the term to move it to the top
    history = history.filter(item => item.toLowerCase() !== term.toLowerCase());
    // Add new term to the beginning
    history.unshift(term);
    // Keep history to a reasonable size, e.g., 10 items
    if (history.length > 10) {
        history.pop();
    }
    localStorage.setItem('movieSearchHistory', JSON.stringify(history));
}

function clearSearchHistory() {
    localStorage.removeItem('movieSearchHistory');
    displaySearchHistory(); // Refresh the display
}

function displaySearchHistory() {
    const historyBox = document.getElementById('search-history-box');
    const history = getSearchHistory();
    historyBox.innerHTML = '';

    if (history.length > 0) {
        const header = document.createElement('div');
        header.classList.add('history-header');
        header.innerHTML = '<span>Recent Searches</span><button class="clear-history-btn">Clear</button>';
        historyBox.appendChild(header);

        header.querySelector('.clear-history-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from bubbling up
            clearSearchHistory();
            historyBox.style.display = 'none';
        });

        history.forEach(term => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.textContent = term;
            historyItem.addEventListener('click', () => {
                const searchInput = document.getElementById('search-input');
                searchInput.value = term;
                handleSearch(term, true);
                historyBox.style.display = 'none';
            });
            historyBox.appendChild(historyItem);
        });

        historyBox.style.display = 'block';
    } else {
        historyBox.style.display = 'none';
    }
}

function findMovieByTitle(title) {
    if (typeof movieList === 'undefined' || !movieList) {
        console.error('movieList is not defined. Make sure movies.js is loaded correctly.');
        return null;
    }
    return movieList.find(movie => movie.title === title);
}
