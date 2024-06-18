"use client";

import Image from "next/image";
import logov2 from "/public/logov2.webp";



export default function Home() {

  const loginOnPlex = () => {
    const clientID = '38c35482-5611-4b25-9b17-ab5e1d3fad01';
    const bodyData = new URLSearchParams({
      'X-Plex-Product': 'Plex roulette',
      'strong': 'true',
      'X-Plex-Client-Identifier': clientID
    });

    fetch('https://plex.tv/api/v2/pins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: bodyData
    })
    .then(response => response.json())
    .then(data => {
        const pin = {
            id: data.id,
            code: data.code
        };
        storePinAndRedirect(pin, clientID);
    })
  }

  const storePinAndRedirect = (pin, clientID) => {
      localStorage.setItem('plex_pin_id', pin.id);
      localStorage.setItem('plex_pin_code', pin.code);
      const redirectUrl = `https://app.plex.tv/auth/#?clientID=${clientID}&code=${pin.code}&forwardUrl=http://localhost:3000/callback`;
     {/* const redirectUrl = `https://app.plex.tv/auth/#?clientID=${clientID}&code=${pin.code}&forwardUrl=https://plex-roulette.com/callback`; */}
      window.location.href = redirectUrl;
  }


  return (
    <main className="p-4">
        <div className="flex flex-col md:flex-row justify-around items-center w-full space-y-5 xs:space-y-2">
            <div className="xs:py-0 lg:py-4">
                <Image src={logov2} alt="Logo" width={150} height={150} />
            </div>
    
            <h1 className="xs:py-0 md:py-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-poppins md:text-6xl xs:text-3xl text-center">
            TV roulette for Plex
            </h1>
            <div className="xs:py-2 lg:py-10">
            </div>
        </div>
        <div className="relative place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        </div>
      <div className="h-96 flex items-center justify-center">
          <button className="border border-grey-500 p-3 rounded  cursor-pointer hover:bg-[#ECB100] " onClick={() => {
            loginOnPlex();
          }}>
            Login with plex
          </button>
        </div>
    </main>
  );
}

