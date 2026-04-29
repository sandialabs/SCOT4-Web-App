<template>
    <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <defs>
            <!-- Clip path for the circle -->
            <clipPath id="circleClip">
                <circle cx="25" cy="25" r="10" />
            </clipPath>
            <!-- Radial gradient for fading black circle -->
            <radialGradient id="fadeBlack" cx="50%" cy="50%" r="50%" fx="70%" fy="70%">
                <stop offset="0%" stop-color="black" stop-opacity="1" />
                <stop offset="100%" stop-color="black" stop-opacity="0.3" />
            </radialGradient>
            <!-- Gradient for the flame -->
            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="red" />
                <stop offset="40%" stop-color="orange" />
                <stop offset="80%" stop-color="yellow" />
                <stop offset="100%" stop-color="white" />
            </linearGradient>
        </defs>
        <!-- Fading black circle (drawn first) -->
        <circle cx="25" cy="25" r="10" fill="url(#fadeBlack)" />
    </svg>
</template>