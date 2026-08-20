terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# 1. Enable Required GCP APIs
# -----------------------------------------------------------------------------
resource "google_project_service" "services" {
  for_each = toset([
    "storage.googleapis.com",
    "pubsub.googleapis.com",
    "bigquery.googleapis.com",
    "run.googleapis.com",
    "iam.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# 2. Cloud Storage Ingestion Bucket
# -----------------------------------------------------------------------------
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "ingestion_bucket" {
  name                        = "${var.bucket_name_prefix}-${random_id.bucket_suffix.hex}"
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30 # Auto-delete uploaded raw documents after 30 days to save cost
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.services]
}

# -----------------------------------------------------------------------------
# 3. Pub/Sub Topic and GCS Notification Trigger
# -----------------------------------------------------------------------------
resource "google_pubsub_topic" "notification_topic" {
  name       = "gcs-file-upload-topic"
  depends_on = [google_project_service.services]
}

# Fetch the GCS service account system agent to grant publish permission
data "google_storage_project_service_account" "gcs_account" {
  depends_on = [google_project_service.services]
}

# Grant GCS service agent permission to publish to our Pub/Sub topic
resource "google_pubsub_topic_iam_member" "gcs_publisher" {
  topic  = google_pubsub_topic.notification_topic.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${data.google_storage_project_service_account.gcs_account.email_address}"
}

# Configure GCS to send notifications to Pub/Sub on upload (OBJECT_FINALIZE)
resource "google_storage_notification" "gcs_notification" {
  bucket         = google_storage_bucket.ingestion_bucket.name
  payload_format = "JSON_API_V1"
  topic          = google_pubsub_topic.notification_topic.id
  event_types    = ["OBJECT_FINALIZE"]

  depends_on = [google_pubsub_topic_iam_member.gcs_publisher]
}

# -----------------------------------------------------------------------------
# 4. BigQuery Dataset & Metadata Table
# -----------------------------------------------------------------------------
resource "google_bigquery_dataset" "doc_dataset" {
  dataset_id  = var.dataset_id
  location    = var.region
  description = "Dataset containing metadata extracted from documents"

  depends_on = [google_project_service.services]
}

resource "google_bigquery_table" "metadata_table" {
  dataset_id          = google_bigquery_dataset.doc_dataset.dataset_id
  table_id            = var.table_id
  deletion_protection = false

  schema = jsonencode([
    {
      name        = "filename",
      type        = "STRING",
      mode        = "REQUIRED",
      description = "The name of the processed document."
    },
    {
      name        = "date",
      type        = "TIMESTAMP",
      mode        = "REQUIRED",
      description = "The timestamp when the metadata was processed."
    },
    {
      name        = "tags",
      type        = "STRING",
      mode        = "REPEATED",
      description = "Extracted keywords/tags from simulated OCR."
    },
    {
      name        = "word_count",
      type        = "INTEGER",
      mode        = "NULLABLE",
      description = "Simulated document word count."
    }
  ])
}

# -----------------------------------------------------------------------------
# 5. Cloud Run Service Setup
# -----------------------------------------------------------------------------

# Create a dedicated Service Account for the Cloud Run Processor Service
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-processor-sa"
  display_name = "Cloud Run Document Processor Service Account"
  depends_on   = [google_project_service.services]
}

# Grant GCS Read Access to Cloud Run Service Account
resource "google_storage_bucket_iam_member" "gcs_reader" {
  bucket = google_storage_bucket.ingestion_bucket.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant BigQuery Data Editor to Cloud Run Service Account
resource "google_bigquery_dataset_iam_member" "bq_editor" {
  dataset_id = google_bigquery_dataset.doc_dataset.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Deploy Cloud Run service
resource "google_cloud_run_v2_service" "processor_service" {
  name     = var.cloud_run_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    containers {
      image = var.image_name

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }
      env {
        name  = "GCP_PROJECT"
        value = var.project_id
      }
      env {
        name  = "BQ_DATASET"
        value = var.dataset_id
      }
      env {
        name  = "BQ_TABLE"
        value = var.table_id
      }

      ports {
        container_port = 8080
      }
    }
  }

  depends_on = [google_project_service.services]
}

# -----------------------------------------------------------------------------
# 6. Pub/Sub Push Subscription & Authentication
# -----------------------------------------------------------------------------

# Create a dedicated Service Account for the Pub/Sub Subscription to invoke Cloud Run
resource "google_service_account" "pubsub_invoker_sa" {
  account_id   = "pubsub-invoker-sa"
  display_name = "PubSub Invoker Service Account"
  depends_on   = [google_project_service.services]
}

# Grant the Pub/Sub Service Account permission to invoke the Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "pubsub_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.processor_service.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.pubsub_invoker_sa.email}"
}

# Create a Pub/Sub push subscription routing events to Cloud Run webhook
resource "google_pubsub_subscription" "cloud_run_subscription" {
  name  = "cloud-run-processor-subscription"
  topic = google_pubsub_topic.notification_topic.name

  ack_deadline_seconds = 60

  push_config {
    push_endpoint = "${google_cloud_run_v2_service.processor_service.uri}/pubsub"

    oidc_token {
      service_account_email = google_service_account.pubsub_invoker_sa.email
    }
  }

  depends_on = [
    google_cloud_run_v2_service.processor_service,
    google_cloud_run_v2_service_iam_member.pubsub_invoker
  ]
}
