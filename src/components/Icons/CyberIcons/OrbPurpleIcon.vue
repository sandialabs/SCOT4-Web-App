<template>
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" transform="scale(2.5, 2.5)">
        <defs>
            <!-- Radial gradient for darker purple ghostly fade -->
            <radialGradient id="darkPurpleGhostFade" cx="50%" cy="50%" r="50%" fx="70%" fy="70%">
                <stop offset="0%" stop-color="#4B0082" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#4B0082" stop-opacity="0.1" />
            </radialGradient>
        </defs>
        <!-- Circle with darker purple ghostly fade -->
        <circle cx="25" cy="25" r="10" fill="url(#darkPurpleGhostFade)" />
        <!-- Tiny white corner in the bottom-right -->
        <path d="M 33 33 Q 35 35 33 35 Q 34 34 33 33 Z" fill="white" />
    </svg>
</template>
