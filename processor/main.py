import os
import base64
import json
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel

from processor.ocr import perform_ocr
from processor.bigquery_client import BigQueryClientWrapper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("processor")

app = FastAPI(
    title="Serverless Document Processor",
    description="Processes file uploads from GCS via Pub/Sub and streams metadata to BigQuery.",
    version="1.0.0"
)

# Initialize BigQuery Client wrapper (handles local mock vs production)
bq_client = BigQueryClientWrapper()

# Pydantic models for request validation
class PubSubMessage(BaseModel):
    attributes: Dict[str, str] = {}
    data: str
    messageId: str

class PubSubPayload(BaseModel):
    message: PubSubMessage
    subscription: str

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/pubsub", status_code=status.HTTP_202_ACCEPTED)
async def handle_pubsub_message(payload: PubSubPayload):
    """
    Endpoint that receives Pub/Sub push notifications.
    """
    logger.info(f"Received Pub/Sub message ID: {payload.message.messageId}")
    
    # 1. Check Event Type
    event_type = payload.message.attributes.get("eventType")
    if event_type and event_type != "OBJECT_FINALIZE":
        logger.info(f"Ignoring non-finalize event: {event_type}")
        return Response(status_code=status.HTTP_200_OK, content="Ignored event type")

    # 2. Decode GCS event data
    try:
        decoded_data = base64.b64decode(payload.message.data).decode("utf-8")
        gcs_event = json.loads(decoded_data)
    except Exception as e:
        logger.error(f"Failed to decode or parse Pub/Sub data payload: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Pub/Sub base64 payload"
        )

    bucket_name = gcs_event.get("bucket")
    filename = gcs_event.get("name")
    
    if not bucket_name or not filename:
        logger.error(f"Missing bucket or name in decapsulated payload: {gcs_event}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload missing bucket or object name"
        )

    logger.info(f"Processing file: gs://{bucket_name}/{filename}")

    # 3. Retrieve document contents (GCS or Mock)
    env = os.getenv("ENVIRONMENT", "production").lower()
    try:
        if env == "local":
            logger.info("Local environment: Mocking file download from GCS.")
            # Generate mock contents based on filename to simulate OCR classification
            content_str = f"This is a simulated local file. The filename is {filename}. "
            if "invoice" in filename.lower():
                content_str += "It is an invoice for a payment amount of $500.00."
            elif "report" in filename.lower():
                content_str += "It contains the quarterly report analysis and annual forecast."
            else:
                content_str += "This document holds generic content."
            content = content_str.encode("utf-8")
        else:
            from google.cloud import storage
            storage_client = storage.Client()
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(filename)
            if not blob.exists():
                logger.warning(f"File gs://{bucket_name}/{filename} does not exist (may have been deleted).")
                # Return 200/202 to avoid infinite Pub/Sub retries for deleted files
                return {"status": "skipped", "reason": "file_not_found"}
            content = blob.download_as_bytes()
            
    except Exception as e:
        logger.error(f"Error downloading file from GCS: {str(e)}")
        # Raise HTTP 500 so Pub/Sub can retry the message if it's a transient download error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading file from GCS: {str(e)}"
        )

    # 4. Perform Simulated OCR
    try:
        metadata = perform_ocr(content, filename)
        logger.info(f"OCR completed successfully: {metadata}")
    except Exception as e:
        logger.error(f"Error performing OCR: {str(e)}")
        # Raise HTTP 500 for retries
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing OCR: {str(e)}"
        )

    # 5. Stream Metadata to BigQuery
    success = bq_client.insert_metadata(metadata)
    if not success:
        # Raise HTTP 500 so Pub/Sub retries if the database stream fails
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert metadata into BigQuery"
        )

    return {"status": "success", "metadata": metadata}
