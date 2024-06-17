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
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    
];

const CallbackComponent = () => {
    const [authToken, setAuthToken] = useState(null);
    const [servers, setServers] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedLibraryKey, setSelectedLibraryKey] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showSpinButton, setShowSpinButton] = useState(false);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchLibraries = async (server) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchMovies = async (libraryKey, genreKeys = []) => {
        setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }
    };

    const displayRandomMovie = async (movies) => {
        if (typeof window !== 'undefined') {
            const randomIndex = Math.floor(Math.random() * movies.length);
            const randomMovie = movies[randomIndex];
            const { title, thumb, summary, year, audienceRating, rating, guid, Genre, duration } = randomMovie;
    
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
                const genres = Genre ? Genre.map(g => g.tag) : ['Unknown'];
                const formattedDuration = formatDuration(duration);
                setSelectedMovie({ title, summary, imageObjectURL, year, audienceRating, rating, genres, duration: formattedDuration });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };
    

    const formatDuration = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };
    

    const handleServerChange = (selectedOption) => {
        const selectedServer = servers.find(server => server.name === selectedOption.value);
        setSelectedServer(selectedServer);
        fetchLibraries(selectedServer);
    };

    const handleLibraryChange = (selectedOption) => {
        const libraryKey = selectedOption.value;
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
            displayRandomMovie(selectedMovies);
        }
    };

    const handleStopSpinning = () => {
        setMustSpin(false);
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
        <main className="p-4">
        <div className="flex flex-col md:flex-row justify-around items-center w-full space-y-5 xs:space-y-2">
            <div className="xs:py-0 lg:py-4">
                <Image src={logov2} alt="Logo" width={150} height={150} />
            </div>
    
            <h1 className="xs:py-0 md:py-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-poppins md:text-6xl xs:text-3xl text-center">
                Plex Roulette
            </h1>
    
            <div className="xs:py-2 lg:py-10">
                <button onClick={handleLogout} className="border border-red-500 p-3 rounded-lg hover:bg-red-800 cursor-pointer w-36">
                    Logout
                </button>
            </div>
        </div>
    
        <div className="relative place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        </div>
    
        {loading && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-75">
                <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-4 border-t-blue-600 animate-spin"></div>
            </div>
        )}
    
        {!loading && (
            <>
                <div className="flex flex-col md:flex-row justify-center w-full space-y-5 md:space-y-0 md:space-x-10">
                    <div id="servers" className="flex flex-col">
                        <label className="mb-2">First, chose your server</label>
                        {servers.length > 0 ? (
                            <Select
                                options={servers.map(server => ({ value: server.name, label: server.name }))}
                                value={selectedServer ? { value: selectedServer.name, label: selectedServer.name } : null}
                                onChange={handleServerChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
                            />
                        ) : (
                            <div>Loading servers...</div>
                        )}
                    </div>
                    {libraries.length > 0 && (
                        <div id="libraries" className="flex flex-col">
                            <label className="mb-2">Now, chose your library</label>
                            <Select
                                options={libraries.map(library => ({ value: library.key, label: library.title }))}
                                value={selectedLibraryKey ? { value: selectedLibraryKey, label: libraries.find(lib => lib.key === selectedLibraryKey).title } : null}
                                onChange={handleLibraryChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
                            />
                        </div>
                    )}
                    {genres.length > 0 && (
                        <div id="genres" className="flex flex-col">
                            <label className="mb-2">Optionally, choose genres</label>
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
    
                <div className="flex flex-col md:flex-row mt-10 justify-around space-y-10 md:space-y-0">
                    <div className="relative flex justify-center items-center w-full md:w-1/3 md:mr-10">
                        {showSpinButton && (
                            <div id="spin" className="w-full max-w-[400px] h-auto aspect-square flex justify-center items-center">
                                <Wheel
                                    mustStartSpinning={mustSpin}
                                    spinDuration={0.1}
                                    prizeNumber={prizeNumber}
                                    data={data}
                                    outerBorderWidth={5}
                                    outerBorderColor="grey"
                                    innerRadius={40}
                                    innerBorderColor="grey"
                                    radiusLineColor="grey"
                                    radiusLineWidth={4}
                                    innerBorderWidth={5}
                                    perpendicularText={true}
                                    onStopSpinning={handleStopSpinning}
                                />
                                <button className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white border-4 animate-pulse text-black flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={handleSpinClick}>
                                    Click Here
                                </button>
                            </div>
                        )}
                    </div>
    
                    <div className="flex flex-col w-full md:w-1/3 md:ml-10">
                        {selectedMovie && (
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-bold">{selectedMovie.title}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start mt-4">
                                    {selectedMovie.genres.map((genre, index) => (
                                        <span key={index} className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-lg m-1 text-sm">{genre}</span>
                                    ))}
                                </div>
                                <p className="leading-relaxed mt-5">
                                    {showFullSummary ? selectedMovie.summary : `${selectedMovie.summary.slice(0, 300)}...`}
                                    <button onClick={toggleSummary} className="text-blue-500 ml-2">
                                        {showFullSummary ? 'Lire moins' : 'Lire plus'}
                                    </button>
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start mt-4">
                                    <span className="inline-block bg-white bg-opacity-50 text-gray-800 px-3 py-1 rounded-lg m-1 text-sm">Year: {selectedMovie.year}</span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start mt-2">
                                    <span className="inline-block bg-white bg-opacity-50 text-gray-800 px-3 py-1 rounded-lg m-1 text-sm">Time: {selectedMovie.duration}</span>
                                </div>
                            </div>
                        )}
                    </div>
    
                    {selectedMovie && (
                        <div className="flex flex-col items-center w-full md:w-1/3 space-y-5 ">
                            <img src={selectedMovie.imageObjectURL} alt={selectedMovie.title} className="max-w-full w-[300px] shadow-xl rounded-lg" />
                            <div className="flex justify-evenly w-full">
                                <div className="flex items-center space-x-2">
                                    <Image src={imdblogo} width={30} alt="imdblogo" />
                                    <p className="leading-relaxed">{selectedMovie.audienceRating}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Image src={rottenlogo} width={30} alt="rottenlogo"/>
                                    <p className="leading-relaxed">{selectedMovie.rating}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        )}
    </main>
    
    );
};

export default CallbackComponent;
