# Serverless Document Processing Pipeline on Google Cloud

An event-driven document processing pipeline that automatically ingests files from Cloud Storage, triggers processing via Pub/Sub, runs simulated OCR (FastAPI on Cloud Run), and streams extracted metadata to BigQuery.

---

## Architecture

```
[User Upload] -> [GCS Bucket]
                    | (Object Finalize)
                    v
             [Pub/Sub Topic]
                    | (Push Subscription with OIDC Auth)
                    v
         [FastAPI on Cloud Run]
             - Downloads document from GCS
             - Performs simulated OCR (word count, keyword tagging)
             - Streams metadata to BigQuery
```

---

## Folder Structure

- `/processor`: FastAPI service code (OCR engine, BigQuery client wrapper, Dockerfile).
- `/simulation`: Local CLI script (`simulate.py`) to run and test the complete pipeline locally without GCP resources.
- `/terraform`: Terraform configurations to provision all Google Cloud resources and configure security roles.

---

## 1. Local Simulation

Test the application locally without active Google Cloud resources. The local simulation runs a local FastAPI instance, mocks GCS downloads, generates mock file content based on filenames, and stub-inserts metadata into console logs.

### Prerequisites
- Python 3.10+
- `pip` (Python package installer)

### Setup & Run
1. Create a Python virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r processor/requirements.txt
   ```

3. Run the simulation script:
   ```bash
   python simulation/simulate.py
   ```

The script will launch FastAPI, trigger three different simulated file upload notifications (PDF, text, image), process them, and shut down gracefully. You will see mock BigQuery insert logs with file attributes (word counts and custom tags) in stdout.

---

## 2. Google Cloud Deployment

Deploy the infrastructure and processor service to your GCP Project.

### Step 2.1: Initializing Terraform
1. Install the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) and [Google Cloud SDK](https://cloud.google.com/sdk).
2. Authenticate with Google Cloud:
   ```bash
   gcloud auth application-default login
   ```
3. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```
4. Create a `terraform.tfvars` file and add your GCP project ID:
   ```hcl
   project_id = "your-gcp-project-id"
   region     = "us-central1"
   ```
5. Initialize and apply Terraform:
   ```bash
   terraform init
   terraform apply
   ```
   *Note: On the first apply, Terraform will deploy Cloud Run using a placeholder hello-world container image, which we will update in the next steps.*

### Step 2.2: Building and Pushing the Docker Image
To deploy the actual processing code to Cloud Run:
1. Create an Artifact Registry Repository to host your Docker image:
   ```bash
   gcloud artifacts repositories create document-pipeline-repo \
       --repository-format=docker \
       --location=us-central1 \
       --description="Docker repository for document processor"
   ```
2. Build and submit your Docker image using Cloud Build:
   ```bash
   cd ../processor
   gcloud builds submit --tag us-central1-docker.pkg.dev/your-gcp-project-id/document-pipeline-repo/processor:latest .
   ```

### Step 2.3: Update Cloud Run Service via Terraform
Now that the Docker image is in Artifact Registry, update Terraform with the new image tag.
1. Open `terraform/terraform.tfvars` and add the new image path:
   ```hcl
   image_name = "us-central1-docker.pkg.dev/your-gcp-project-id/document-pipeline-repo/processor:latest"
   ```
2. Re-apply the Terraform configurations:
   ```bash
   cd ../terraform
   terraform apply
   ```

---

## 3. Testing the Live Pipeline on GCP

To test the live end-to-end pipeline:
1. Upload a file containing keywords (e.g. including "invoice" or "report") to your GCS bucket. You can find the bucket name in the Terraform output variables.
   ```bash
   gcloud storage cp sample.txt gs://<your-gcs-bucket-name>/
   ```
2. Watch the logs of your Cloud Run service to verify it received the event and ran simulated OCR.
3. Query the BigQuery table to inspect the streamed metadata:
   ```bash
   bq query --use_legacy_sql=false \
   "SELECT * FROM \`your-gcp-project-id.document_processing.metadata\` LIMIT 10"
   ```
