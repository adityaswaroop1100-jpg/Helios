# HELIOS SCADA — Next-Gen AI Solar PV Digital Twin & MLOps Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-2dd4a8.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](https://adityaswaroop1100-jpg.github.io/Helios/)
[![Pitch Deck](https://img.shields.io/badge/Pitch%20Deck-Interactive%20Slides-c9973e.svg?style=for-the-badge&logo=revealjs&logoColor=white)](https://adityaswaroop1100-jpg.github.io/Helios/presentation/)
[![Release](https://img.shields.io/badge/Release-v2.4.0-4dd0e1.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/adityaswaroop1100-jpg/Helios/releases/tag/v2.4.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black.svg?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-v2.0-orange.svg?logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28.svg?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3.4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🌐 Live Web Access & Releases

* **🚀 Launch Live SCADA Digital Twin**: [https://adityaswaroop1100-jpg.github.io/Helios/](https://adityaswaroop1100-jpg.github.io/Helios/)
* **📊 Open Interactive Pitch Deck**: [https://adityaswaroop1100-jpg.github.io/Helios/presentation/](https://adityaswaroop1100-jpg.github.io/Helios/presentation/)
* **📥 Download Official Pitch Deck (PPTX)**: [Download `.pptx` File](https://github.com/adityaswaroop1100-jpg/Helios/raw/main/HELIOS_ORION_1.0_Pitch_Deck.pptx)
* **🏷️ GitHub Release Tag**: [Release v2.4.0 (Production)](https://github.com/adityaswaroop1100-jpg/Helios/releases/tag/v2.4.0)

---

**HELIOS** is an industrial-grade Solar Photovoltaic (PV) Supervisory Control and Data Acquisition (**SCADA**) platform and **3D WebGL Digital Twin**. Designed for utility-scale and commercial microgrids, HELIOS combines real-time satellite irradiance telemetry, physics-based single-axis tracker kinematics, gradient-boosted decision tree ML forecasting (**XGBoost $R^2 = 99.89\%$**), sub-second anomaly isolation, and **Google Firebase Firestore** cloud streaming.

---

## ⚡ Core Capabilities

- **🌐 Interactive 3D Digital Twin**: High-fidelity WebGL solar array (32 monocrystalline modules, $8\times4$ grid) with dynamic sun positioning, single-axis tracker kinematics, real-time shadow casting, and individual panel inspection.
- **🏢 3D Photorealistic NOC Control Room**: Immersive 3D SCADA command center featuring a massive $6\times2$ curved telemetry video wall, multi-operator workstations, and Edge AI server racks with live telemetry indicators.
- **🧠 Production XGBoost Forecasting**: 15-dimensional solar feature regression model trained on 35,040 timestamped SCADA records for 24-hour yield prediction with **P10–P90 quantile uncertainty confidence intervals**.
- **🔥 Firebase Firestore Cloud Pipeline**: 100% serverless, zero-local-disk cloud streaming architecture for high-frequency telemetry logs (`telemetry_logs`) and automated event ledgers (`scada_events`).
- **⚡ Autonomous Anomaly Response & BESS Dispatch**: Sub-second ML anomaly classification (soiling, diode failure, cloud transients) with automated electronic DC isolation and Battery Energy Storage System (**BESS**) dynamic power substitution.
- **📈 Comprehensive Financial & ESG Cockpit**: Real-time monetary savings tracking ($0.18/kWh commercial benchmark), grid peak arbitrage, and Scope-2 carbon avoidance metrics.

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │ Open-Meteo Satellite Weather  │
                                  │ GHI, DNI, DHI, Temp, Clouds   │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
┌───────────────────────────┐      ┌───────────────────────────────┐      ┌──────────────────────────────┐
│ Modbus RTU / MLPE Sensors │ ───► │  15-D Solar Physics Engine    │ ───► │ XGBoost Predictive Regressor │
│ String Voltage & Current  │      │  NOCT Thermal & Tracking Kin. │      │ R²: 99.89% · RMSE: 0.334 kW  │
└───────────────────────────┘      └───────────────┬───────────────┘      └──────────────┬───────────────┘
                                                  │                                      │
                                                  ▼                                      ▼
                                   ┌───────────────────────────────┐      ┌──────────────────────────────┐
                                   │ Google Firebase Firestore     │ ◄─── │ Autonomous SCADA Dispatch    │
                                   │ telemetry_logs & scada_events │      │ DC Isolation & BESS Inject   │
                                   └───────────────┬───────────────┘      └──────────────────────────────┘
                                                  │
                                                  ▼
                                   ┌───────────────────────────────┐
                                   │ React 18 + Three.js 3D Twin   │
                                   │ SCADA Cockpit & Virtual NOC   │
                                   └───────────────────────────────┘
```

---

## 📊 Plant Technical Specifications

| Parameter | Specification | Standard / Model |
| :--- | :--- | :--- |
| **Nameplate Capacity** | 48.0 kW Peak | 32 $\times$ 1.5 kW Monocrystalline Units |
| **Array Layout** | $8 \times 4$ Matrix (4 Strings) | Single-Axis Horizontal Tracker ($\pm 45^\circ$) |
| **Nominal STC Efficiency** | 20.5% | $1000\text{ W/m}^2$, $25^\circ\text{C}$, AM 1.5G |
| **Temperature Coefficient** | $-0.35\% / ^\circ\text{C}$ | NOCT: $T_{cell} = T_{amb} + 0.0256 \times \text{GHI}$ |
| **BESS Storage Bank** | 50.0 kWh / 42.0 kW Discharge | LiFePO4 Online Static Transfer (0 ms) |
| **Inverter Topology** | Central MPPT Grid-Tie | 98.4% Euro Efficiency |

---

## 🧠 Machine Learning & MLOps Pipeline

HELIOS uses an ensemble of gradient-boosted decision trees trained on multi-spectral solar irradiance, geometrical sun angles, and NOCT cell temperatures:

- **Mean Power Regressor**: Objective `reg:squarederror`, Depth 6, 350 Estimators.
- **P10 Lower Bound**: Objective `reg:quantileerror` ($\alpha = 0.10$).
- **P90 Upper Bound**: Objective `reg:quantileerror` ($\alpha = 0.90$).
- **Feature Vector (15-D)**: Solar Zenith, Solar Elevation, GHI, DNI, DHI, Ambient Temp, Cell Temp, Cloud Cover %, Relative Humidity %, and Cyclical Diurnal/Seasonal Encodings (`hour_sin`, `hour_cos`, `doy_sin`, `doy_cos`).

```
Model Evaluation Metrics (Out-of-Sample Test Split):
├── Overall R² Score:         0.9989 (99.89%)
├── Daytime R² Score:         0.9991 (99.91%)
├── Root Mean Squared Error:  0.334 kW (0.69% of Peak)
└── Mean Absolute Error:      0.184 kW
```

---

## 📂 Repository Structure

```
HElioss/
├── frontend/                     # React 18 + Vite + Three.js WebGL Application
│   ├── src/
│   │   ├── api/                  # Physics engine, Firebase REST client, XGBoost API
│   │   │   ├── cloudScadaDatabase.js
│   │   │   ├── energyEngine.js
│   │   │   ├── firebaseService.js
│   │   │   ├── forecastApi.js
│   │   │   └── xgboostModel.js
│   │   ├── components/
│   │   │   ├── 3d/               # Three.js 3D Solar Twin & Virtual Control Room
│   │   │   │   ├── ControlRoomInterior3D.jsx
│   │   │   │   ├── PanelInspectorHtml.jsx
│   │   │   │   ├── SceneControls.jsx
│   │   │   │   ├── Solar3DScene.jsx
│   │   │   │   └── SolarPanel3D.jsx
│   │   │   └── dashboard/        # Industrial SCADA UI Components
│   │   │       ├── AnomalyPanel.jsx
│   │   │       ├── CostEstimate.jsx
│   │   │       ├── EnergyComputePanel.jsx
│   │   │       ├── FeatureImportance.jsx
│   │   │       ├── ForecastChart.jsx
│   │   │       ├── HistorianView.jsx
│   │   │       ├── LocationModal.jsx
│   │   │       └── RecommendationBanner.jsx
│   │   ├── App.jsx               # Main Application Orchestrator
│   │   └── index.css             # Obsidian Glass Design System Tokens
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── ml/                           # Python Machine Learning & MLOps Pipeline
│   ├── models/                   # Serialized XGBoost model artifacts
│   │   ├── xgboost_solar_mean.json
│   │   ├── xgboost_solar_p10.json
│   │   └── xgboost_solar_p90.json
│   ├── train_xgboost.py          # Primary training pipeline with evaluation
│   ├── train_with_firebase.py    # Firebase continuous retraining script
│   └── metrics_report.json       # Benchmark metrics & feature importances
│
├── processor/                    # FastAPI Ingestion Service & Satellite Client
│   ├── main.py
│   ├── weather_client.py
│   └── requirements.txt
│
└── simulation/                   # Local pipeline simulation utilities
    └── simulate.py
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **Python**: 3.10+ (for standalone ML training)

---

### 1. Frontend Setup & Launch

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`** (or the port indicated in your terminal).

To build the production-optimized bundle:
```bash
npm run build
```

---

### 2. Machine Learning Training & MLOps

To retrain the production XGBoost models or verify benchmark metrics:

```bash
# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install ML dependencies
pip install numpy pandas scikit-learn xgboost httpx fastapi uvicorn

# Run the primary training script
python ml/train_xgboost.py

# Run the continuous Firebase training pipeline
python ml/train_with_firebase.py
```

---

## 🔥 Firebase Cloud Integration

HELIOS streams all real-time telemetry and SCADA incident logs directly to **Google Cloud Firestore**.

1. Navigate to the **`🔥 Firebase Sync`** tab in the dashboard.
2. Click **`Firebase Config`** to link your Firebase project ID.
3. Live documents will stream into:
   - `telemetry_logs`: Timestamped sensor records (GHI, active kW, cell temp, anomaly flag).
   - `scada_events`: Automated RTU decisions and BESS dispatch events.
   - `ml_model_versions`: Deployed model version artifacts and accuracy metrics.

---

## 🛠️ Tech Stack

- **Frontend & 3D**: React 18, Three.js, `@react-three/fiber`, `@react-three/drei`, Recharts, Lucide Icons, Vite
- **Styling**: Tailwind CSS, Plus Jakarta Sans, JetBrains Mono, Custom Obsidian Glassmorphism
- **Machine Learning**: Python 3.10+, XGBoost, Scikit-Learn, NumPy, Pandas
- **Cloud & Ingestion**: Google Firebase Firestore REST, FastAPI, Open-Meteo API
- **Standards Compliance**: IEC 61724 (PV Performance Monitoring) & IEEE 1547 (Grid Interconnection)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
