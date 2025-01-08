import React from 'react'
import './humburger.css'

const Hamburger = ({ setIsMenuOpen, isMenuOpen }) => {
    return (
        <>
            <input onClick={() => setIsMenuOpen(!isMenuOpen)} id="checkbox" type="checkbox" />
            <label className="toggle" htmlFor="checkbox">
                <div id="bar1" class="bars"></div>
                <div id="bar2" class="bars"></div>
                <div id="bar3" class="bars"></div>
            </label>
        </>
    )
}

export default Hamburger