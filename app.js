// API avain ja muuttujat
const omdbApiKey = '51218801';
const theaterSelect = document.getElementById('theater-select');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const moviesContainer = document.getElementById('movies-container');

// Lataa teatterit Finnkinon xml:stä
function loadTheaters() {
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => {
            const theaters = data.getElementsByTagName('TheatreArea');
            theaterSelect.innerHTML = '<option value="">Valitse teatteri</option>';
            Array.from(theaters).forEach(theater => {
                const option = document.createElement('option');
                option.value = theater.getElementsByTagName('ID')[0].textContent;
                option.textContent = theater.getElementsByTagName('Name')[0].textContent;
                theaterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Virhe teattereiden hakemisessa:', error);
            theaterSelect.innerHTML = '<option>Teatterit eivät ole saatavilla</option>';
        });
}

// Haetaan elokuvat valitun teatterin perusteella
function fetchMoviesByTheater(theaterId) {
    if (!theaterId) {
        moviesContainer.innerHTML = '<p>Valitse teatteri nähdäksesi elokuvat.</p>';
        return;
    }

    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => {
            const shows = data.getElementsByTagName('Show');
            moviesContainer.innerHTML = '';
            if (shows.length === 0) {
                moviesContainer.innerHTML = '<p>Ei näytöksiä valitussa teatterissa.</p>';
                return;
            }
            Array.from(shows).forEach(show => {
                const title = show.getElementsByTagName('Title')[0].textContent;
                const imageUrl = show.getElementsByTagName('EventMediumImagePortrait')[0].textContent;
                const startTime = show.getElementsByTagName('dttmShowStart')[0].textContent;

                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie');

                const titleElement = document.createElement('h3');
                titleElement.textContent = title;

                const imageElement = document.createElement('img');
                imageElement.src = imageUrl;
                imageElement.alt = title;

                const timeElement = document.createElement('p');
                timeElement.textContent = `Näytös alkaa: ${new Date(startTime).toLocaleString()}`;
                movieDiv.appendChild(timeElement);

                movieDiv.appendChild(titleElement);
                movieDiv.appendChild(imageElement);
                movieDiv.appendChild(timeElement);
                moviesContainer.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error('Virhe elokuvien hakemisessa:', error);
            moviesContainer.innerHTML = '<p>Virhe elokuvien hakemisessa.</p>';
        });
}

// haetaan elokuvat hakutermin perusteella omdb API:sta
function fetchMovies(searchTerm) {
    if (!searchTerm) {
        moviesContainer.innerHTML = '<p>Anna hakutermi löytääksesi elokuvia.</p>';
        return;
    }

    fetch(`https://www.omdbapi.com/?apikey=${omdbApiKey}&s=${searchTerm}&type=movie`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                moviesContainer.innerHTML = '<p>Ei löytynyt elokuvia hakusanalla.</p>';
                return;
            }
            moviesContainer.innerHTML = '';
            data.Search.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie');

                const titleElement = document.createElement('h3');
                titleElement.textContent = movie.Title;

                const imageElement = document.createElement('img');
                imageElement.src = movie.Poster;
                imageElement.alt = movie.Title;

                movieDiv.appendChild(titleElement);
                movieDiv.appendChild(imageElement);
                moviesContainer.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error('Virhe elokuvien hakemisessa:', error);
            moviesContainer.innerHTML = '<p>Virhe elokuvien hakemisessa.</p>';
        });
}

// tapahtumien kuuntelu
searchButton.addEventListener('click', () => fetchMovies(searchInput.value));
theaterSelect.addEventListener('change', (event) => fetchMoviesByTheater(event.target.value));

// Lataa teatterit aloituksessa
loadTheaters();
