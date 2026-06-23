#!/usr/bin/env python3
"""
Servicio local de matching de huellas - DigitalPersona dpfj.dll
===============================================================
Corre en la PC del gimnasio (Windows) en http://localhost:3002
El navegador le envía la muestra capturada + candidatos y devuelve el match.

Requisitos:
    pip install flask flask-cors

Uso:
    python fingerprint_service.py
"""

import ctypes
import base64
import json
import os
import platform
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Cargar dpfj.dll ──────────────────────────────────────────────────────────

IS_64BIT = platform.architecture()[0] == "64bit"
DLL_CANDIDATES = [
    r"C:\Program Files\DigitalPersona\U.are.U SDK\Windows\Lib\x64\dpfj.dll",
    r"C:\Program Files\DigitalPersona\U.are.U RTE\Windows\Lib\x64\dpfj.dll",
    r"C:\Windows\System32\dpfj.dll" if IS_64BIT else r"C:\Windows\SysWOW64\dpfj.dll",
    r"C:\Windows\SysWOW64\dpfj.dll",
]

DLL_PATH = next((path for path in DLL_CANDIDATES if os.path.exists(path)), None)

if not DLL_PATH:
    print("[ERROR] No se encontró dpfj.dll. Instala DigitalPersona U.are.U SDK/RTE.")
    print("        Rutas revisadas:")
    for path in DLL_CANDIDATES:
        print(f"        - {path}")
    sys.exit(1)

try:
    dpfj = ctypes.WinDLL(DLL_PATH)
    print(f"[OK] dpfj.dll cargado desde: {DLL_PATH}")
except OSError as e:
    print(f"[ERROR] No se pudo cargar dpfj.dll: {e}")
    sys.exit(1)

# ── Constantes SDK ───────────────────────────────────────────────────────────

DPFJ_FMD_ANSI_378_2004 = 0x001B0001
DPFJ_SUCCESS           = 0
MAX_FMD_SIZE           = 1600
THRESHOLD              = 21474836   # FAR ~0.001 %

# ── Firmas ctypes ────────────────────────────────────────────────────────────

dpfj.dpfj_create_fmd_from_raw.restype  = ctypes.c_int
dpfj.dpfj_create_fmd_from_raw.argtypes = [
    ctypes.c_char_p,
    ctypes.c_uint,
    ctypes.c_uint,
    ctypes.c_uint,
    ctypes.c_uint,
    ctypes.c_int,
    ctypes.c_uint,
    ctypes.c_int,
    ctypes.c_char_p,
    ctypes.POINTER(ctypes.c_uint),
]

dpfj.dpfj_compare.restype  = ctypes.c_int
dpfj.dpfj_compare.argtypes = [
    ctypes.c_int,
    ctypes.c_char_p,
    ctypes.c_uint,
    ctypes.c_uint,
    ctypes.c_int,
    ctypes.c_char_p,
    ctypes.c_uint,
    ctypes.c_uint,
    ctypes.POINTER(ctypes.c_uint),
]

# ── Helpers ──────────────────────────────────────────────────────────────────

def raw_to_fmd(raw: dict) -> bytes | None:
    """Convierte {data, width, height, dpi} a FMD ANSI."""
    try:
        img   = base64.b64decode(raw["data"])
        w     = int(raw.get("width",  0))
        h     = int(raw.get("height", 0))
        dpi   = int(raw.get("dpi",  500))

        if not img or w == 0 or h == 0:
            return None

        buf  = ctypes.create_string_buffer(MAX_FMD_SIZE)
        size = ctypes.c_uint(MAX_FMD_SIZE)

        ret = dpfj.dpfj_create_fmd_from_raw(
            img, len(img), w, h, dpi,
            0, 0,
            DPFJ_FMD_ANSI_378_2004,
            buf, ctypes.byref(size),
        )

        if ret != DPFJ_SUCCESS:
            print(f"  [WARN] create_fmd ret={ret} ({w}x{h}@{dpi}dpi, {len(img)}B)")
            return None

        return buf.raw[: size.value]
    except Exception as e:
        print(f"  [ERROR] raw_to_fmd: {e}")
        return None


def parse_template(tmpl_str: str) -> bytes | None:
    """Template puede ser JSON raw o base64 de FMD puro."""
    try:
        obj = json.loads(tmpl_str)
        if isinstance(obj, dict):
            return raw_to_fmd(obj)
    except Exception:
        pass
    try:
        return base64.b64decode(tmpl_str)
    except Exception:
        return None


def compare(fmd1: bytes, fmd2: bytes) -> int | None:
    score = ctypes.c_uint(0)
    ret   = dpfj.dpfj_compare(
        DPFJ_FMD_ANSI_378_2004, fmd1, len(fmd1), 0,
        DPFJ_FMD_ANSI_378_2004, fmd2, len(fmd2), 0,
        ctypes.byref(score),
    )
    return score.value if ret == DPFJ_SUCCESS else None

# ── Flask ────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=["https://cosmogym.tech", "http://localhost:5173", "http://localhost:5143"])


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.errorhandler(Exception)
def handle_error(e):
    print(f"  [ERROR] {e}")
    return jsonify({"member_id": None, "error": str(e)}), 500


@app.post("/match")
def match():
    body       = request.get_json(force=True)
    sample     = body.get("sample")
    candidates = body.get("candidates", [])

    if isinstance(candidates, str):
        candidates = json.loads(candidates)

    if isinstance(candidates, dict):
        candidates = list(candidates.values())

    if not sample or not candidates:
        return jsonify({"member_id": None, "error": "Faltan datos"}), 400

    if isinstance(sample, str):
        sample = json.loads(sample)

    probe_fmd = raw_to_fmd(sample)
    if probe_fmd is None:
        return jsonify({"member_id": None, "error": "No se pudo procesar la muestra"}), 422

    best_score = None
    best_id    = None

    for c in candidates:
        if isinstance(c, str):
            c = json.loads(c)

        if not isinstance(c, dict):
            continue

        cand_fmd = parse_template(c.get("template", ""))
        if cand_fmd is None:
            continue

        score = compare(probe_fmd, cand_fmd)
        if score is None:
            continue

        print(f"  candidate {c['id']}: score={score}")

        if best_score is None or score < best_score:
            best_score = score
            best_id    = c["id"]

    print(f"  best -> id={best_id} score={best_score} threshold={THRESHOLD}")

    if best_id is None or best_score >= THRESHOLD:
        return jsonify({"member_id": None, "score": best_score})

    return jsonify({"member_id": best_id, "score": best_score})


if __name__ == "__main__":
    print("[OK] Servicio de matching en http://localhost:3002")
    print("     Presiona Ctrl+C para detener.\n")
    app.run(host="127.0.0.1", port=3002, debug=False)
