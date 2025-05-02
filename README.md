# Firebase Studio - Chubby Skewers Daily Report

This is a Next.js application built with Firebase Studio for generating daily reports for Chubby Skewers restaurant.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Google Maps API key. You need to enable the **Places API** for this key in your Google Cloud Console.
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    ```
    Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at http://localhost:9002 (or the specified port).

## Features

*   Input fields for various sales data (Total Sales, Net Sales, Cash, Credit Card, Gift Card, etc.).
*   Calculated fields for Alcohol Sales Percentage, Alcohol Sales per Guest, Total Tips, Tips Percentage, Sales per Guest, Scan Rate.
*   Date picker for selecting the report date (defaults to yesterday).
*   Input fields for Shift Lead, Total Tables, Total Guests.
*   Fields for tracking cancellations and discounts.
*   Dynamic fields for adding custom discount/reason entries.
*   Integration with Google Places API to fetch and display Google review count and rating for Chubby Skewers (Place ID: `ChIJZTsojhArw4ARTryXnAQbjqs`).
*   Input fields for Yelp review count and rating.
*   "Save Locally" button to download the generated report as a `.txt` file.

## Development Notes

*   The application uses Next.js App Router and Server Components.
*   Styling is done using Tailwind CSS and ShadCN UI components.
*   The `useEffect` hook fetches Google reviews on component mount. Ensure your API key is correctly configured and has the Places API enabled.
*   The `generateReportText` function compiles all the input and calculated data into a formatted string for the report.
*   The `handleSaveLocal` function creates a text file blob and initiates a download.
