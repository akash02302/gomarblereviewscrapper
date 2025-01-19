# Review Extractor Client

This is the client application for the Review Extractor API, built using React. The client allows users to fetch and display product reviews from various e-commerce websites.

## Getting Started

To get started with the client application, follow these steps:

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   git clone https://github.com/akashkumar02302/client.git
   cd client

2. Install the dependencies:
   npm install

## LLM Integration

The Review Extractor Client can communicate with the Review Scraper API, which integrates with Gemini AI for enhanced review processing. To configure the integration, follow these steps:

1. **Obtain Your Gemini API Key**:
   - Sign up for a Gemini AI account and obtain your API key from the dashboard.

2. **Set Up Environment Variables**:
   - Create a `.env` file in the `client` directory if it doesn't exist.
   - Add the following line to the `.env` file:
     ```
     REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. **Using the API Key**:
   - The API key can be accessed in your React application using `process.env.REACT_APP_GEMINI_API_KEY`.

Make sure to keep your API key secure and do not share it publicly.

### Running the Application

To run the application in development mode, use the following command:

npm start

The build files will be generated in the `build` folder.

## Features

- Fetch product reviews by entering a product URL.
- Display reviews in a user-friendly format.
- Responsive design for optimal viewing on various devices.

## API Integration

The client communicates with the Review Extractor API. Ensure the API is running and accessible at the specified endpoint.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
