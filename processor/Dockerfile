# Use the official lightweight Python image.
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED=True

# Set the working directory
WORKDIR /app

# Copy and install dependencies first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from processor directory into /app/processor package directory
COPY . /app/processor

# Run the web service on container startup using Uvicorn
CMD exec uvicorn processor.main:app --host 0.0.0.0 --port ${PORT:-8080}
