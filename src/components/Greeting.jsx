import React, { useState, useEffect } from 'react';

const Greeting = () => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateGreeting = () => {
            // Get the current time in Israel
            const israelTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
            const hours = new Date(israelTime).getHours();

            // Determine the greeting based on the time
            let newGreeting = '';
            if (hours >= 0 && hours < 12) {
                newGreeting = 'בוקר טוב'; // Good Morning
            } else if (hours >= 12 && hours < 18) {
                newGreeting = 'צהריים טובים'; // Good Afternoon
            } else {
                newGreeting = 'ערב טוב'; // Good Evening
            }

            setGreeting(newGreeting);
        };

        updateGreeting(); // Set initial greeting
        const intervalId = setInterval(updateGreeting, 60000); // Update every minute

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    return (
        <>
            <p className='font-normal px-1'>{greeting}</p>
        </>
    );
};

export default Greeting;
