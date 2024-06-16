"use client";
import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import Image from "next/image";
import Select from 'react-select';
import imdblogo from "/public/imdb.png";
import rottenlogo from "/public/rotten.png";
import logov2 from "/public/logov2.webp";

const data = [
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
];

const styles = `
  @keyframes borderChange {
    0% { border-color: red; }
    25% { border-color: orange; }
    50% { border-color: yellow; }
    75% { border-color: green; }
    100% { border-color: blue; }
  }
  .border-animation {
    animation: borderChange 3s infinite;
  }
`;


const CallbackComponent = () => {
    const [authToken, setAuthToken] = useState(null);
    const [servers, setServers] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedServer, setSelectedServer] = useState('');
    const [selectedLibraryKey, setSelectedLibraryKey] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showSpinButton, setShowSpinButton] = useState(false);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [showFullSummary, setShowFullSummary] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('plex_auth_token');
            setAuthToken(token);

            if (token) {
                fetchServers(token);
            } else {
                fetchAuthToken();
            }
        }
    }, []);

    const fetchAuthToken = async () => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('plex_pin_id');
            const code = localStorage.getItem('plex_pin_code');
            const clientIdentifier = '38c35482-5611-4b25-9b17-ab5e1d3fad01';

            try {
                const response = await fetch(`https://plex.tv/api/v2/pins/${id}?code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'X-Plex-Client-Identifier': clientIdentifier
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const token = data.authToken;
                console.log('Token:', token);
                
                localStorage.setItem('plex_auth_token', token);
                setAuthToken(token);
                fetchServers(token);
            } catch (error) {
                console.error('Error fetching auth token:', error);
            }
        }
    };

    const fetchServers = async (token) => {
        try {
            const response = await fetch(`https://clients.plex.tv/api/v2/resources?X-Plex-Client-Identifier=null&X-Plex-Token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const serverList = data.map(server => {
                const { name, publicAddress, connections, accessToken } = server;
                const connection = connections.find(conn => conn.address === publicAddress);
                const port = connection ? connection.port : null;
                const address = publicAddress.replace(/\./g, '-');
                return { name, address, port, accessToken };
            });
            
            localStorage.setItem('plex_server_list', JSON.stringify(serverList));
            setServers(serverList);
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    };

    const fetchLibraries = async (server) => {
        const { address, port, accessToken } = server;
        
        localStorage.setItem('plex_server_address', address);
        localStorage.setItem('plex_server_port', port);
        localStorage.setItem('plex_access_Token', accessToken);

        try {
            const response = await fetch(`https://${address}-${port}.plex-roulette.com/library/sections`, {
                method: 'GET',
                headers: {
                    'X-Plex-Token': accessToken,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLibraries(data.MediaContainer.Directory);
        } catch (error) {
            console.error('Error fetching libraries:', error);
        }
    };

    const fetchGenres = async () => {
        const serverAddress = localStorage.getItem('plex_server_address');
        const serverPort = localStorage.getItem('plex_server_port');
        const accessToken = localStorage.getItem('plex_access_Token');

        try {
            const response = await fetch(`https://${serverAddress}-${serverPort}.plex-roulette.com/library/sections/1/genre`, {
                method: 'GET',
                headers: {
                    'X-Plex-Token': accessToken,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setGenres(data.MediaContainer.Directory);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const fetchMovies = async (libraryKey, genreKeys = []) => {
        if (typeof window !== 'undefined') {
            const serverAddress = localStorage.getItem('plex_server_address');
            const serverPort = localStorage.getItem('plex_server_port');
            const accessToken = localStorage.getItem('plex_access_Token');

            let url = `https://${serverAddress}-${serverPort}.plex-roulette.com/library/sections/${libraryKey}/unwatched`;
            if (genreKeys.length > 0) {
                const genreQuery = genreKeys.map(key => `genre=${key}`).join('&');
                url += `?${genreQuery}`;
            }

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Plex-Token': accessToken,
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSelectedMovies(data.MediaContainer.Metadata);
                setShowSpinButton(true);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        }
    };

    const displayRandomMovie = async (movies) => {
        if (typeof window !== 'undefined') {
            const randomIndex = Math.floor(Math.random() * movies.length);
            const randomMovie = movies[randomIndex];
            const { title, thumb, summary, year, audienceRating, rating, guid } = randomMovie;
            
            const serverAddress = localStorage.getItem('plex_server_address');
            const serverPort = localStorage.getItem('plex_server_port');
            const authToken = localStorage.getItem('plex_access_Token');
            const imageUrl = `https://${serverAddress}-${serverPort}.plex-roulette.com${thumb}`;

            try {
                const response = await fetch(imageUrl, {
                    headers: { 'X-Plex-Token': authToken }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                const imageObjectURL = URL.createObjectURL(blob);
                setSelectedMovie({ title, summary, imageObjectURL, year, audienceRating, rating });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleServerChange = (event) => {
        const selectedServer = servers.find(server => server.name === event.target.value);
        setSelectedServer(selectedServer.name);
        fetchLibraries(selectedServer);
    };

    const handleLibraryChange = (event) => {
        const libraryKey = event.target.value;
        setSelectedLibraryKey(libraryKey);
        fetchGenres();
        fetchMovies(libraryKey, selectedGenres);
    };

    const handleGenreChange = (selectedOptions) => {
        const selectedKeys = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedGenres(selectedKeys);
        fetchMovies(selectedLibraryKey, selectedKeys);
    };

    const handleSpinClick = () => {
        if (!mustSpin) {
            const newPrizeNumber = Math.floor(Math.random() * data.length);
            setPrizeNumber(newPrizeNumber);
            setMustSpin(true);
        }
    };

    const handleStopSpinning = () => {
        setMustSpin(false);
        displayRandomMovie(selectedMovies);
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = 'https://plex-roulette.com/';
        }
    };

    const toggleSummary = () => {
        setShowFullSummary(!showFullSummary);
    };
    return (
        <main className="p-4 font-poppins">
          <style>{styles}</style>
          <div className="flex flex-col md:flex-row justify-around items-center w-full">
            {/* Logo en haut à gauche */}
            <div className="py-4">
              <Image src={logov2} alt="Logo" width={150} height={150} />
            </div>
    
            {/* Title en haut au centre */}
            <div className="py-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-black text-4xl md:text-6xl text-center">
              Plex Roulette
            </div>
    
            {/* Logout en haut à droite */}
            <div className="py-10">
              <button onClick={handleLogout} className="border border-red-500 p-3 rounded hover:bg-red-800 cursor-pointer">
                Logout
              </button>
            </div>
          </div>
    
          {/* Dropdown menus en haut */}
          <div className="flex flex-col md:flex-row justify-center w-full space-y-5 md:space-y-0 md:space-x-10">
            <div id="servers" className="flex flex-col">
              <label className="mb-2">First, chose your server</label>
              {servers.length > 0 ? (
                <select value={selectedServer} onChange={handleServerChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <option value="">Select a server</option>
                  {servers.map(server => (
                    <option key={server.name} value={server.name}>
                      {server.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>Loading servers...</div>
              )}
            </div>
            {libraries.length > 0 && (
              <div id="libraries" className="flex flex-col">
                <label className="mb-2">Now, chose your library</label>
                <select value={selectedLibraryKey} onChange={handleLibraryChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <option value="">Select a library</option>
                  {libraries.map(library => (
                    <option key={library.key} value={library.key}>
                      {library.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {genres.length > 0 && (
              <div id="genres" className="flex flex-col">
                <label className="mb-2">Choose genres</label>
                <Select
                  isMulti
                  options={genres.map(genre => ({ value: genre.key, label: genre.title }))}
                  value={selectedGenres.map(key => genres.find(genre => genre.key === key)).filter(Boolean).map(genre => ({ value: genre.key, label: genre.title }))}
                  onChange={handleGenreChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
                />
              </div>
            )}
          </div>
    
          <div className="relative place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
          </div>
    
          <div className="flex flex-col md:flex-row mt-10 justify-around space-y-10 md:space-y-0">
            {/* Roulette à gauche */}
            <div className="relative flex justify-center items-center w-full md:w-1/3 md:mr-10">
              {showSpinButton && (
                <div id="spin" className="relative">
                  <Wheel
                    mustStartSpinning={mustSpin}
                    spinDuration={0.1}
                    prizeNumber={prizeNumber}
                    data={data}
                    outerBorderWidth={3}
                    outerBorderColor="grey"
                    innerRadius={40}
                    innerBorderColor="grey"
                    radiusLineColor="grey"
                    radiusLineWidth={3}
                    innerBorderWidth={3}
                    perpendicularText={true}
                    onStopSpinning={handleStopSpinning}
                  />
                  <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white border-4 border-animation text-black flex items-center justify-center" onClick={handleSpinClick}>
                    Click Here to Spin
                  </button>
                </div>
              )}
            </div>
    
            {/* Infos movies */}
            <div className="flex flex-col w-full md:w-1/3 md:ml-10">
              {selectedMovie && (
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold">{selectedMovie.title}</h1>
                  <p className="leading-relaxed mt-10">{selectedMovie.genres}</p>
                  <p className="leading-relaxed mt-10">
                    {showFullSummary ? selectedMovie.summary : `${selectedMovie.summary.slice(0, 300)}...`}
                    <button onClick={toggleSummary} className="text-blue-500 ml-2">
                      {showFullSummary ? 'Lire moins' : 'Lire plus'}
                    </button>
                  </p>
                  <p className="leading-relaxed mt-10">Release date: {selectedMovie.year}</p>
                </div>
              )}
            </div>
    
            {/* Selected movie à droite */}
            {selectedMovie && (
              <div className="flex flex-col items-center w-full md:w-1/3 space-y-5">
                <img src={selectedMovie.imageObjectURL} alt={selectedMovie.title} className="max-w-full w-[300px]" />
                <div className="flex justify-evenly w-full">
                  <div className="flex items-center space-x-2">
                    <Image src={imdblogo} width={30} />
                    <p className="leading-relaxed">{selectedMovie.audienceRating}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image src={rottenlogo} width={30} />
                    <p className="leading-relaxed">{selectedMovie.rating}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      );
    
};

export default CallbackComponent;
