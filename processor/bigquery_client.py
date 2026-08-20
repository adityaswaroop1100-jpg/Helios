import os
import logging
from typing import Dict, Any
from google.cloud import bigquery

logger = logging.getLogger("processor")

class BigQueryClientWrapper:
    def __init__(self):
        self.env = os.getenv("ENVIRONMENT", "production").lower()
        self.project_id = os.getenv("GCP_PROJECT")
        self.dataset_id = os.getenv("BQ_DATASET", "document_processing")
        self.table_id = os.getenv("BQ_TABLE", "metadata")
        
        if self.env == "local" or not self.project_id:
            logger.info("Running in LOCAL mode: BigQuery client is mocked.")
            self.client = None
        else:
            logger.info(f"Running in PRODUCTION mode: Initializing BigQuery client for project {self.project_id}.")
            # The client will automatically pick up credentials from the environment
            self.client = bigquery.Client(project=self.project_id)
            self.table_ref = f"{self.project_id}.{self.dataset_id}.{self.table_id}"

    def insert_metadata(self, metadata: Dict[str, Any]) -> bool:
        """
        Streams metadata into the BigQuery table.
        In local mode, prints metadata to the log and returns True.
        """
        if self.env == "local" or not self.client:
            logger.info(f"[Mock BQ Insert] Table: {self.dataset_id}.{self.table_id} | Row: {metadata}")
            return True
            
        try:
            row_to_insert = {
                "filename": metadata["filename"],
                "date": metadata["date"],
                "tags": metadata["tags"],
                "word_count": metadata["word_count"]
            }
            
            errors = self.client.insert_rows_json(self.table_ref, [row_to_insert])
            if errors:
                logger.error(f"Failed to insert row into BigQuery: {errors}")
                return False
                
            logger.info(f"Successfully streamed metadata for '{metadata['filename']}' to BigQuery.")
            return True
            
        except Exception as e:
            logger.error(f"Error streaming to BigQuery: {str(e)}")
            return False
