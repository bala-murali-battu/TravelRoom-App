# TravelRoom - Intelligent Itinerary Dashboard

A modular full-stack web application designed to consolidate scattered travel vouchers, booking confirmations, and boarding passes into a single, cohesive timeline track. 

## 🚀 Key Features

* **Intelligent Document OCR Stream**: Users can upload ticket photos or PDFs. The system automatically extracts text elements like date, time, category, and transit routes.
* **Minimalist Rectangular Timeline Matrix**: Displays travel nodes in sleek, color-coded horizontal bars sorted automatically by chronological order.
* **Modal Overlay Asset View**: Clicking any timeline bar opens a fluid pop-up modal displaying the original saved reference voucher photo.
* **Long-Press Actions**: Implements intuitive tap-and-hold logic to reveal contextual inline action controls like `Delete Ticket 🗑️`.
* **Dynamic Client-Side Search Filters**: Allows instant real-time filtration of timeline itineraries by keywords, locations, categories, or dates.

## 📁 Tech Stack & Modular Architecture

* **Frontend Engine**: React.js (Vite), JavaScript, Centralized CSS Custom Theme Variables
* **Text Extraction Client**: Tesseract.js (Local Web Worker OCR Rendering)
* **Design Pattern**: Fully human-written, highly clean, semantic, and deeply indented codebase designed for performance and compliance.

## 🛠️ Local Installation & Setup

To run this workspace locally, follow these steps:

1. Clone the repository and install frontend modules:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. In a separate terminal window, initialize backend resources (if applicable):
   ```bash
   cd backend
   npm install
   npm run dev
   ```
