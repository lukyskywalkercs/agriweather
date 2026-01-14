"""
AgriLogistics PRO - Dashboard de decisión para logística de cítricos
Reescritura completa conforme a los requisitos del usuario.
"""

import datetime as dt
from typing import Dict, Optional

import pandas as pd
import requests
import streamlit as st


# ===================== CONFIGURACIÓN GLOBAL =====================
st.set_page_config(
    page_title="AgriLogistics PRO",
    page_icon="🍊",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ===================== ESTILO =====================
st.markdown(
    """
    <style>
    body, .main, .block-container {
        background-color: #f8f9fa;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header[data-testid="stHeader"] { background: transparent; }
    footer { visibility: hidden; }
    .block-container { padding-top: 1.5rem; padding-bottom: 0.8rem; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 20px rgba(15,23,42,0.06); padding: 18px; margin-bottom: 14px; }
    .hero { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 10px 26px rgba(15,23,42,0.08); padding: 24px; height: 240px; margin-bottom: 14px; }
    .status-circle { width: 150px; height: 150px; border-radius: 999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: 800; font-size: 28px; color: #0f172a; box-shadow: inset 0 0 0 10px rgba(0,0,0,0.03); }
    .metric-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 6px 14px rgba(15,23,42,0.05); padding: 14px 16px; margin-bottom: 12px; }
    .banner { width: 100%; background: linear-gradient(135deg, #0b1f3a, #123a73); color: white; text-align: center; padding: 18px 12px; border-radius: 12px; margin-top: 18px; font-weight: 600; letter-spacing: 0.2px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
    .progress-wrapper { background: #eef2ff; border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0; }
    .section-title { font-weight: 700; font-size: 15px; color: #1e293b; margin-bottom: 8px; }
    </style>
    """,
    unsafe_allow_html=True,
)


# ===================== FUNCIONES DE DATOS =====================
def fetch_weather(lat: float, lon: float) -> Optional[Dict]:
    """Obtiene datos de Open-Meteo. Devuelve None si falla."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "precipitation_probability",
                "rain",
                "shortwave_radiation",
            ]
        ),
        "timezone": "Europe/Madrid",
        "forecast_days": 2,
    }
    try:
        resp = requests.get(url, params=params, timeout=12)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return None


def build_hourly_df(data: Dict) -> pd.DataFrame:
    hourly = data.get("hourly", {})
    df = pd.DataFrame(hourly)
    df["time"] = pd.to_datetime(df["time"])
    return df


def simulate_leaf_humidity(df: pd.DataFrame) -> pd.DataFrame:
    """
    Reglas solicitadas:
    - Si HR > 90% o llueve → humedad hoja = 100%.
    - En caso contrario, baja 10% por hora con sol/viento (viento >5 km/h o radiación >100 W/m²).
    """
    df = df.copy()
    leaf_values = []
    current_leaf = 100.0
    for _, row in df.iterrows():
        rh = row.get("relative_humidity_2m", 0) or 0
        rain = row.get("rain", 0) or 0
        wind = row.get("wind_speed_10m", 0) or 0
        rad = row.get("shortwave_radiation", 0) or 0

        if rh > 90 or rain > 0:
            current_leaf = 100.0
        else:
            reduction = 0.10 if (wind > 5 or rad > 100) else 0.05
            current_leaf = max(0.0, current_leaf * (1 - reduction))

        leaf_values.append(current_leaf)

    df["leaf_humidity"] = leaf_values
    return df


def compute_status(df: pd.DataFrame) -> Dict:
    now_row = df.iloc[0]
    leaf = now_row["leaf_humidity"]
    status = "RECOGER" if leaf <= 30 else "BLOQUEADO"
    color = "#16a34a" if status == "RECOGER" else "#dc2626"

    entry_time = None
    for _, row in df.iterrows():
        if row["leaf_humidity"] <= 30:
            entry_time = row["time"]
            break

    progress = max(0.0, min(1.0, (100 - leaf) / 100))
    return {"status": status, "color": color, "leaf": leaf, "entry_time": entry_time, "progress": progress}


# ===================== ESTADO INICIAL =====================
if "lat" not in st.session_state:
    st.session_state.lat = 39.4699  # Valencia
if "lon" not in st.session_state:
    st.session_state.lon = -0.3763
if "name" not in st.session_state:
    st.session_state.name = "Huerto Principal"


# ===================== SIDEBAR =====================
st.sidebar.header("📍 Configuración del Huerto")
lat_input = st.sidebar.number_input("Latitud", value=float(st.session_state.lat), format="%.6f")
lon_input = st.sidebar.number_input("Longitud", value=float(st.session_state.lon), format="%.6f")
name_input = st.sidebar.text_input("Nombre del Huerto", value=st.session_state.name)
refresh = st.sidebar.button("Actualizar Ubicación", use_container_width=True)

if refresh:
    st.session_state.lat = lat_input
    st.session_state.lon = lon_input
    st.session_state.name = name_input


# ===================== OBTENCIÓN DE DATOS =====================
data = fetch_weather(st.session_state.lat, st.session_state.lon)
if data is None:
    st.warning("Cargando datos meteorológicos...")
    st.stop()

df_raw = build_hourly_df(data)
now = pd.Timestamp.now(tz=df_raw["time"].dt.tz)
df_next = df_raw[df_raw["time"] >= now].copy().head(24)

if df_next.empty:
    st.warning("Cargando datos meteorológicos...")
    st.stop()

df_leaf = simulate_leaf_humidity(df_next)
status = compute_status(df_leaf)

df_chart = df_leaf.head(12).copy()
df_chart_display = df_chart[["time", "leaf_humidity"]].set_index("time")


# ===================== HEADER =====================
st.markdown(
    """
    <div style="margin-bottom:12px;">
        <div style="font-size:24px;font-weight:800;color:#0f172a;">AgriLogistics PRO</div>
        <div style="color:#475569;">Sistema de Inteligencia Logística para Cítricos</div>
    </div>
    """,
    unsafe_allow_html=True,
)


# ===================== HERO =====================
col_estado, col_secado = st.columns(2)

with col_estado:
    st.markdown(
        f"""
        <div class="hero">
            <div style="font-weight:700;color:#475569;font-size:14px;margin-bottom:6px;">ESTADO OPERATIVO</div>
            <div class="status-circle" style="background:{'rgba(34,197,94,0.15)' if status['status']=='RECOGER' else 'rgba(239,68,68,0.15)'};color:{status['color']};">
                {status['status']}
            </div>
            <div style="text-align:center;color:#475569;font-weight:600;">Humedad hoja: {status['leaf']:.0f}%</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_secado:
    entry_label = status["entry_time"].strftime("%H:%M") + "h" if status["entry_time"] else "En espera"
    st.markdown(
        f"""
        <div class="hero">
            <div style="font-weight:700;color:#475569;font-size:14px;margin-bottom:6px;">VENTANA DE SECADO</div>
            <div style="font-size:34px;font-weight:800;color:#0f172a;margin-bottom:10px;">Entrada: {entry_label}</div>
            <div class="progress-wrapper">
                <div style="font-size:13px;color:#475569;margin-bottom:6px;">Secado estimado</div>
                <div style="background:#e2e8f0;border-radius:999px;height:12px;overflow:hidden;">
                    <div style="width:{status['progress']*100:.0f}%;height:100%;background:#22c55e;"></div>
                </div>
                <div style="margin-top:6px;font-size:13px;color:#475569;">Humedad hoja actual: {status['leaf']:.0f}%</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ===================== MÉTRICAS =====================
col_m1, col_m2, col_m3, col_m4 = st.columns(4)
metrics = [
    ("🌡️ Temp", f"{df_leaf.iloc[0]['temperature_2m']:.1f} °C"),
    ("💧 Humedad", f"{df_leaf.iloc[0]['relative_humidity_2m']:.0f}%"),
    ("🌬️ Viento", f"{df_leaf.iloc[0]['wind_speed_10m']:.1f} km/h"),
    ("🌦️ Lluvia 1h", f"{df_leaf.iloc[0]['precipitation_probability']:.0f}%"),
]
for col, (label, value) in zip([col_m1, col_m2, col_m3, col_m4], metrics):
    with col:
        st.markdown(
            f"""
            <div class="metric-card">
                <div style="color:#64748b;font-size:13px;font-weight:600;margin-bottom:4px;">{label}</div>
                <div style="font-size:24px;font-weight:800;color:#0f172a;">{value}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )


# ===================== MAPA Y GRÁFICO =====================
col_map, col_chart = st.columns(2)

with col_map:
    st.markdown('<div class="section-title">🗺️ Ubicación del Huerto</div>', unsafe_allow_html=True)
    map_df = pd.DataFrame({"lat": [st.session_state.lat], "lon": [st.session_state.lon]})
    try:
        import folium
        from streamlit_folium import folium_static

        mapa = folium.Map(location=[st.session_state.lat, st.session_state.lon], zoom_start=13, tiles="CartoDB Positron")
        folium.Marker(
            [st.session_state.lat, st.session_state.lon],
            popup=st.session_state.name,
            tooltip=st.session_state.name,
            icon=folium.Icon(color="red", icon="info-sign"),
        ).add_to(mapa)
        folium_static(mapa, height=340)
    except Exception:
        st.map(map_df, zoom=12, use_container_width=True)

with col_chart:
    st.markdown('<div class="section-title">🌿 Evolución humedad de hoja (12h)</div>', unsafe_allow_html=True)
    # Sanitizar datos para evitar infinitos/NaN
    df_chart_sanitized = df_chart.copy()
    df_chart_sanitized = df_chart_sanitized[["time", "leaf_humidity"]].dropna()
    df_chart_sanitized = df_chart_sanitized[
        df_chart_sanitized["leaf_humidity"].apply(lambda x: pd.notna(x) and pd.isfinite(x))
    ]

    if not df_chart_sanitized.empty:
        import altair as alt

        df_chart_sanitized["hora"] = df_chart_sanitized["time"].dt.strftime("%H:%M")
        chart = (
            alt.Chart(df_chart_sanitized)
            .mark_area(color="#10B981", opacity=0.6, line={"color": "#059669"})
            .encode(
                x=alt.X("hora:N", title="", axis=alt.Axis(labelAngle=0)),
                y=alt.Y("leaf_humidity:Q", title="Humedad %", scale=alt.Scale(domain=[0, 100])),
            )
            .properties(height=300)
            .configure_view(strokeWidth=0)
        )
        threshold = alt.Chart(pd.DataFrame({"y": [30]})).mark_rule(
            color="#EF4444", strokeDash=[5, 5], strokeWidth=2
        ).encode(y="y:Q")
        st.altair_chart(chart + threshold, use_container_width=True)
    else:
        st.info("Sin datos de pronóstico")


# ===================== BANNER =====================
st.markdown(
    """
    <div class="banner">
        AgriLogistics PRO: Plataforma centralizada para Gerentes y Capataces. Coordina 50+ huertos, predice ventanas de carga y elimina pérdidas logísticas por clima.
    </div>
    """,
    unsafe_allow_html=True,
)
