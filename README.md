# Repo Pulse Insights

Create a multi-page enterprise web application named 'RepoPulse: BA Portfolio & Impact Suite' using a high-tech modern dark theme (Deep slate background #0B0F19, glassmorphism cards #161B26, and Neon Cyan #00F2FE and Electric Purple branding accents). 



Implement a persistent left sidebar with 3 distinct navigation tabs that control the main workspace view:



1. '📊 BA Performance Overview' (Default View): Display a management dashboard containing 3-4 clean visual metric charts. Include charts for 'Impact Analyses Executed Over Time', 'Most Volatile System Modules' (e.g., Payments vs Authentication), and a 'Hours Saved Tracker' counter widget.



2. '⚡ Impact Analysis Task': The core analysis interface. 

   - At the top, include a dropdown labeled 'Select Repository' (pre-populate with mock repos like: ecommerce-frontend, payment-service, core-auth-api). 

   - Below it, add a dependent dropdown labeled 'Select Branch' that simulates changing options based on the chosen repo.

   - Include a large text area for a BA to type a 'Proposed Business Requirement Change' and a glowing 'Run Impact Analysis' button.

   - The results component should display a dynamic radial Risk Score gauge, highlighted Impacted Business Features, an interactive checkbox toggle to 'Show Affected Technical Files', and a button to 'Download Impact Report'.



3. '🔗 Connected Repositories': A system configuration page. Show a grid of cards representing currently connected repositories with metadata (Last Scanned, Total Branches, Connection Status: Connected/Healthy). Include an obvious '+ Connect New Repository' button that opens a clean modal setup form.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe22a975-1e58-4cf2-a18e-5899899ffd16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
