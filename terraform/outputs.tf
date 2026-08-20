output "gcs_bucket_name" {
  description = "The name of the GCS bucket created for file uploads."
  value       = google_storage_bucket.ingestion_bucket.name
}

output "pubsub_topic_name" {
  description = "The name of the Pub/Sub topic created for file upload notifications."
  value       = google_pubsub_topic.notification_topic.name
}

output "bigquery_dataset_id" {
  description = "The BigQuery dataset ID."
  value       = google_bigquery_dataset.doc_dataset.dataset_id
}

output "bigquery_table_id" {
  description = "The BigQuery table ID."
  value       = google_bigquery_table.metadata_table.table_id
}

output "cloud_run_service_url" {
  description = "The URL of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.processor_service.uri
}

output "processor_service_account_email" {
  description = "The email of the Service Account used by the Cloud Run service."
  value       = google_service_account.cloud_run_sa.email
}

output "pubsub_invoker_service_account_email" {
  description = "The email of the Service Account used by Pub/Sub to invoke the Cloud Run service."
  value       = google_service_account.pubsub_invoker_sa.email
}
