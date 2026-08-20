variable "project_id" {
  description = "The Google Cloud Project ID where resources will be deployed."
  type        = string
}

variable "region" {
  description = "The Google Cloud region to deploy regional resources (e.g. Cloud Run, Pub/Sub, BigQuery)."
  type        = string
  default     = "us-central1"
}

variable "bucket_name_prefix" {
  description = "Prefix for the GCS ingestion bucket. A random suffix will be appended to ensure global uniqueness."
  type        = string
  default     = "serverless-doc-ingestion"
}

variable "dataset_id" {
  description = "The BigQuery dataset ID for document metadata."
  type        = string
  default     = "document_processing"
}

variable "table_id" {
  description = "The BigQuery table ID to stream document metadata into."
  type        = string
  default     = "metadata"
}

variable "cloud_run_service_name" {
  description = "The name of the Cloud Run service."
  type        = string
  default     = "document-processor"
}

variable "image_name" {
  description = "The Docker image name for the Cloud Run service. Defaults to a placeholder until the user pushes the custom image."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello:latest"
}
