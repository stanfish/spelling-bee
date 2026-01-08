# Spelling Bee Practice App

A modern, interactive web application for practicing spelling bee words. Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and the Web Speech API.

[Spelling Bee App](https://spelling-bee-study.netlify.app/)

## Features

-   **Study Mode:** Listen to words and spell them out.
-   **Text-to-Speech:** Uses the browser's native Web Speech API to pronounce words.
-   **Weighted Randomness:** Adapts to your performance, showing difficult words more often.
-   **Voice Settings:** Adjustable speed and voice selection.
-   **Word Management:** Add, delete, and view statistics for your custom word list.
-   **Local Storage:** Your progress and word list are saved automatically.
-   **Responsive Design:** Works seamlessly on desktop and mobile.
-   **Keyboard Support:** Fully navigable using the keyboard for a smooth study flow.

## Getting Started

### Prerequisites

-   Node.js 18+ installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/spelling-bee.git
    cd spelling-bee
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Netlify

1.  Push your code to a GitHub repository.
2.  Log in to [Netlify](https://www.netlify.com/).
3.  Click **"Add new site"** > **"Import an existing project"**.
4.  Connect to GitHub and select your repository.
5.  Netlify will automatically detect the Next.js settings:
    -   **Build command:** `npm run build`
    -   **Publish directory:** `.next` (or leave default)
    *Note: Next.js on Netlify usually requires the `@netlify/plugin-nextjs` package or just works out of the box with their framework detection.*
6.  Click **"Deploy site"**.

### Deploy to Vercel

As a Next.js application, it is optimized for [Vercel](https://vercel.com). Just import your Git repository and click Deploy.

## Tech Stack

-   **Framework:** Next.js (App Router)
-   **Styling:** Tailwind CSS
-   **State Management:** React Hooks & Context
-   **Persistence:** LocalStorage
-   **Audio:** Web Speech API

## License

This project is open source and available under the [MIT License](LICENSE).
