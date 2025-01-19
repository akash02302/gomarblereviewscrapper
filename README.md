# Gormarble Assignment

## Overview

Gormarble Assignment is a web application designed to extract and display product reviews from various e-commerce platforms. The project consists of two main components: a client application built with React and an API server built with Node.js and Express. This README provides a detailed solution approach, system architecture, instructions on how to run the project, and examples demonstrating API usage.

## Solution Approach

The solution is divided into two main parts:

1. **API Server**: 
   - The API server is responsible for scraping reviews from specified URLs using Puppeteer, a headless browser automation tool. 
   - It exposes endpoints for fetching reviews and performing health checks.
   - The server uses CORS to allow requests from the client application and integrates with Google Generative AI for enhanced review processing.

2. **Client Application**: 
   - The client application provides a user interface for users to input product URLs and view the extracted reviews.
   - It communicates with the API server to fetch reviews and display them in a user-friendly format.
   - The application is built using Create React App, ensuring a smooth development experience.

### System Architecture

Below is a diagram illustrating the system architecture of the Gormarble Assignment:

+-------------------+ +---------------------+
| | | |
| Client (React) | <-----> | API Server (Node) |
| | | |
+-------------------+ +---------------------+

### Workflow

1. The user enters a product URL in the client application.
2. The client sends a request to the API server to fetch reviews.
3. The API server scrapes the reviews from the provided URL using Puppeteer.
4. The server processes the reviews and sends them back to the client.
5. The client displays the reviews to the user.

## Instructions to Run the Project

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)
- A modern web browser (for the client application)

### Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/akash02302/gormarbleassignment.git
   cd gormarbleassignment
   ```

2. **Install Dependencies**:
   - For the API server:
     cd apiserver
     npm install

   - For the client application:
     cd ../client
     npm install

### Running the API Server

1. Navigate to the API server directory:
   ```bash
   cd apiserver
   ```

2. Start the server:

```bash
   npm start
   ```

   The server will run on `http://localhost:5000`.

### Running the Client Application

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Start the client application:
   ```bash
   npm start
   ```

   The client will run on `http://localhost:3000`.

## API Usage

### Endpoints

1. **Health Check**
   - **Endpoint**: `GET /health`

2. **Fetch Reviews**
   - **Endpoint**: `GET /api/reviews`
   - **Description**: Fetches reviews from the specified product URL.
   - **Sample Request**:
     ```bash
     curl "http://localhost:5000/api/reviews?page=https://example.com/product"
     ```
   - **Sample Response**:
     ```json
     {
       "reviews": [
         {
           "author": "John Doe",
        "rating": 5,
           "text": "Great product! Highly recommend."
         },
         {
           "author": "Jane Smith",
           "rating": 4,
           "text": "Good value for money."
         }
       ]
     }
     ```

## Conclusion

The Gormarble Assignment provides a comprehensive solution for extracting and displaying product reviews. With a clear separation of concerns between the client and server, the application is both scalable and maintainable. For further questions or contributions, please refer to the project's GitHub repository or contact the project maintainer.
