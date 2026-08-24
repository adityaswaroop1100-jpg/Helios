import time
import subprocess
import os
import sys
import base64
import json
import requests

def run_simulation():
    print("=" * 60)
    print("STARTING SERVERLESS PIPELINE LOCAL SIMULATION")
    print("=" * 60)

    # Set environment variables for local mocking
    os.environ["ENVIRONMENT"] = "local"
    os.environ["GCP_PROJECT"] = "mock-project-id"
    os.environ["BQ_DATASET"] = "mock_dataset"
    os.environ["BQ_TABLE"] = "mock_table"

    # Start FastAPI server via uvicorn in a subprocess
    # We point PYTHONPATH to the parent directory of processor (the root workspace directory)
    env = os.environ.copy()
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    env["PYTHONPATH"] = root_dir
    
    print(f"Launching FastAPI app from root: {root_dir}")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "processor.main:app", "--host", "127.0.0.1", "--port", "8001", "--log-level", "info"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    # Give server a moment to start and check health
    url = "http://127.0.0.1:8001"
    health_url = f"{url}/health"
    pubsub_url = f"{url}/pubsub"

    print("Waiting for FastAPI server to start...")
    max_retries = 15
    started = False
    for i in range(max_retries):
        try:
            r = requests.get(health_url, timeout=2)
            if r.status_code == 200:
                print("FastAPI server started successfully!")
                started = True
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(0.5)

    if not started:
        print("Error: FastAPI server failed to start. Logs:")
        # Read whatever output is available to print to debug
        try:
            stdout, _ = server_process.communicate(timeout=2)
            print(stdout)
        except Exception as e:
            print(f"Could not read logs: {e}")
        sys.exit(1)

    # Define mock files to simulate GCS events
    mock_files = [
        {
            "bucket": "my-ingestion-bucket",
            "name": "invoice_google_cloud_2026.pdf",
            "description": "Simulated invoice file"
        },
        {
            "bucket": "my-ingestion-bucket",
            "name": "q3_financial_report.txt",
            "description": "Simulated report file"
        },
        {
            "bucket": "my-ingestion-bucket",
            "name": "photo_vacation.jpg",
            "description": "Simulated image/binary file"
        }
    ]

    success_count = 0

    try:
        for index, file_info in enumerate(mock_files):
            print("-" * 50)
            print(f"Simulating event {index + 1}: Uploading {file_info['name']} to GCS bucket '{file_info['bucket']}'")
            
            # 1. Construct the inner GCS event message
            gcs_event = {
                "kind": "storage#object",
                "id": f"{file_info['bucket']}/{file_info['name']}/1234567890",
                "name": file_info["name"],
                "bucket": file_info["bucket"],
                "size": "5000",
                "timeCreated": "2026-06-15T20:00:00Z"
            }
            
            # 2. Encode to base64
            event_json = json.dumps(gcs_event)
            encoded_data = base64.b64encode(event_json.encode("utf-8")).decode("utf-8")
            
            # 3. Construct Pub/Sub envelope
            pubsub_payload = {
                "message": {
                    "attributes": {
                        "eventType": "OBJECT_FINALIZE",
                        "bucketId": file_info["bucket"],
                        "objectId": file_info["name"]
                    },
                    "data": encoded_data,
                    "messageId": f"msg-id-{(index + 1) * 1000}"
                },
                "subscription": "projects/mock-project-id/subscriptions/mock-subscription"
            }
            
            # 4. Post message to local FastAPI app
            print(f"Sending Pub/Sub Push request to {pubsub_url}...")
            response = requests.post(pubsub_url, json=pubsub_payload, headers={"Content-Type": "application/json"})
            
            print(f"Response Status: {response.status_code}")
            try:
                response_json = response.json()
                print(f"Response Body: {json.dumps(response_json, indent=2)}")
            except Exception:
                print(f"Response Text: {response.text}")
            
            if response.status_code == 202:
                success_count += 1
            else:
                print(f"WARNING: Request failed with status code {response.status_code}")
                
            time.sleep(0.5)

    finally:
        print("=" * 60)
        print("Shutting down FastAPI server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=3)
            print("Server terminated clean.")
        except subprocess.TimeoutExpired:
            print("Killing server forcibly...")
            server_process.kill()
            server_process.wait()

    print("=" * 60)
    print(f"SIMULATION COMPLETED: {success_count}/{len(mock_files)} events processed successfully!")
    print("=" * 60)
    
    if success_count == len(mock_files):
        print("ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    run_simulation()
