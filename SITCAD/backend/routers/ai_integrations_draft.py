"""
AI Router DRAFT — Report Generation (not yet ported to ai_integrations.py)
==========================================================================
Contains the student progress report generation endpoint backed by
Google Gemini and grounded in the DSKP KSPK Semakan 2026 curriculum.

NOTE: Lesson plan generation and activity generation have been ported
to the main ai_integrations.py router. This file retains only the
report generation code until it is ported as well.
"""

import os
import json
import time
import asyncio
import logging
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

# ---------------------------------------------------------------------------
# Curriculum loader
# ---------------------------------------------------------------------------

CURRICULUM_DIR = Path(__file__).parent.parent / "data" / "curriculum"

ALL_CURRICULUM_FILES: list[str] = [
    "lang_and_lit_malay.json",
    "lang_and_lit_english.json",
    "kognitif.json",
    "sosioemosi.json",
    "fizikal_dan_kemahiran.json",
    "kreativiti_dan_estetika.json",
    "knw_pendidikan_kewarganegaraan.json",
    "knw_pendidikan_moral.json",
    "knw_pendidikan_islam.json",
]


def _load_curriculum_files(file_names: list[str]) -> list[dict]:
    loaded = []
    for fname in file_names:
        fpath = CURRICULUM_DIR / fname
        if fpath.exists():
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    loaded.append(json.load(f))
            except Exception as e:
                logger.warning(f"Could not load curriculum file {fname}: {e}")
    return loaded


def _build_holistic_dskp_context() -> str:
    """
    Load ALL DSKP tunjang files to provide full curriculum coverage
    for holistic student progress reports.
    """
    curriculum_data = _load_curriculum_files(ALL_CURRICULUM_FILES)
    if not curriculum_data:
        return "No DSKP data available; apply general KSPK developmental principles."

    lines: list[str] = ["=== DSKP KSPK Semakan 2026 — Full Curriculum Standards ==="]
    for domain in curriculum_data:
        overview = domain.get("overview", {})
        domain_name = overview.get("domain", "Unknown Domain")
        lines.append(f"\n## {domain_name}")
        for kn in domain.get("domain_content", []):
            lines.append(f"  {kn.get('kn_code', '')} — {kn.get('kn_title', '')}")
            for sk in kn.get("kn_component_sks", [])[:2]:  # cap SKs for prompt size
                lines.append(f"    [{sk.get('sk_code', '')}] {sk.get('sk_title', '')}")
    return "\n".join(lines)


def _strip_json_fences(raw: str) -> str:
    """Strip markdown code fences that the model may add despite instructions."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    if raw.endswith("```"):
        raw = raw[: raw.rfind("```")].strip()
    return raw


# ---------------------------------------------------------------------------
# Pydantic schemas — Report Generation
# ---------------------------------------------------------------------------

ReportType = Literal["comprehensive", "progress", "brief"]


class ActivitySummary(BaseModel):
    type: str
    title: str
    score: Optional[int] = None
    feedback: Optional[str] = None


class StudentReportInput(BaseModel):
    student_id: str
    student_name: str
    age: int
    classroom: str
    developmental_stage: Literal["emerging", "developing", "proficient", "advanced"]
    overall_progress: int = Field(ge=0, le=100)
    needs_intervention: bool = False
    recent_activities: list[ActivitySummary] = []
    report_period: str


class ReportGenerationRequest(BaseModel):
    students: list[StudentReportInput] = Field(..., min_length=1)
    report_type: ReportType = "comprehensive"
    language: Literal["en", "bm"] = "en"


class ProgressArea(BaseModel):
    area: str
    progress: int
    comment: str


class GeneratedStudentReport(BaseModel):
    student_id: str
    student_name: str
    report_period: str
    summary: str
    strengths: list[str]
    areas_for_growth: list[str]
    recommendations: list[str]
    progress_data: list[ProgressArea]
    dskp_references: list[str]


class ReportGenerationResponse(BaseModel):
    reports: list[GeneratedStudentReport]
    generated_at: str


# ---------------------------------------------------------------------------
# Report Generation
# ---------------------------------------------------------------------------

REPORT_SYSTEM_PROMPT = """
You are SabahSprout AI, an expert Malaysian kindergarten educator writing official student progress reports
for a KSPK-accredited kindergarten in Sabah, Malaysia.

Your reports must be:
  1. Warm, encouraging, and professional in tone.
  2. Grounded in the DSKP KSPK Semakan 2026 standards (cite specific codes e.g. BM 1.2, KO 3.1).
  3. Developmentally appropriate for the child's age and stage.
  4. Actionable — parents must know exactly how to support their child at home.
  5. Honest — acknowledge areas for growth without being discouraging.

Report type is: {report_type}
  - comprehensive: full narrative with all sections (≥4 strengths, ≥3 areas for growth, ≥4 recommendations)
  - progress: focused on observable measurable progress (≥3 strengths, ≥2 areas for growth, ≥3 recommendations)
  - brief: concise snapshot (≥2 strengths, ≥1 area for growth, ≥2 recommendations)

Return ONLY a single valid raw JSON object — no markdown fences, no extra text.
Use this exact schema:
{{
  "student_id": "{student_id}",
  "student_name": "{student_name}",
  "report_period": "{report_period}",
  "summary": "<3-5 sentence overall narrative>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "areas_for_growth": ["<area1>", "<area2>", ...],
  "recommendations": ["<parent recommendation1>", ...],
  "progress_data": [
    {{"area": "Literacy (Komunikasi)", "progress": <0-100>, "comment": "<1 sentence>"}},
    {{"area": "Numeracy (Kognitif)", "progress": <0-100>, "comment": "<1 sentence>"}},
    {{"area": "Social-Emotional (Sosioemosi)", "progress": <0-100>, "comment": "<1 sentence>"}},
    {{"area": "Physical (Fizikal)", "progress": <0-100>, "comment": "<1 sentence>"}},
    {{"area": "Creative (Estetika)", "progress": <0-100>, "comment": "<1 sentence>"}}
  ],
  "dskp_references": ["<code1>", "<code2>", ...]
}}

{dskp_context}
"""


async def _generate_single_report(
    student: StudentReportInput,
    report_type: str,
    llm: ChatGoogleGenerativeAI,
    dskp_context: str,
) -> GeneratedStudentReport:
    """Generate an AI progress report for one student."""
    activities_text = "\n".join(
        f"  - [{a.type.upper()}] {a.title}: score={a.score}, feedback='{a.feedback}'"
        for a in student.recent_activities
    ) or "  No recent activity records."

    system_prompt = REPORT_SYSTEM_PROMPT.format(
        report_type=report_type,
        student_id=student.student_id,
        student_name=student.student_name,
        report_period=student.report_period,
        dskp_context=dskp_context,
    )

    user_message = (
        f"Write a {report_type} progress report for {student.student_name}.\n"
        f"Age: {student.age} years | Classroom: {student.classroom}\n"
        f"Developmental Stage: {student.developmental_stage}\n"
        f"Overall Progress: {student.overall_progress}%\n"
        f"Requires Intervention: {'Yes' if student.needs_intervention else 'No'}\n"
        f"Report Period: {student.report_period}\n"
        f"Recent Activities:\n{activities_text}\n"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message),
    ]

    response = await llm.ainvoke(messages)
    raw_text = _strip_json_fences(response.content)

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error for {student.student_name}: {e}\nRaw: {raw_text[:400]}")
        raise ValueError(f"Invalid JSON for student {student.student_name}")

    # Ensure required fields are present
    data.setdefault("student_id", student.student_id)
    data.setdefault("student_name", student.student_name)
    data.setdefault("report_period", student.report_period)
    data.setdefault("dskp_references", [])

    return GeneratedStudentReport(**data)


@router.post("/generate-report", response_model=ReportGenerationResponse)
async def generate_report(request: ReportGenerationRequest):
    """
    Generate DSKP-aligned AI progress reports for one or more students.

    The endpoint:
    - Builds holistic DSKP context covering all six tunjang.
    - Fans out a Gemini call per student concurrently (asyncio.gather).
    - Validates each response against GeneratedStudentReport schema.
    - Returns all reports in a single response.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured. Please add it to the backend .env file.",
        )

    if len(request.students) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 students per report generation batch.",
        )

    dskp_context = _build_holistic_dskp_context()

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        gemini_api_key=api_key,
        temperature=0.6,
        max_tokens=2048,
    )

    # Fan out — one Gemini call per student, all concurrent
    tasks = [
        _generate_single_report(student, request.report_type, llm, dskp_context)
        for student in request.students
    ]

    try:
        reports = await asyncio.gather(*tasks)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    return ReportGenerationResponse(
        reports=list(reports),
        generated_at=str(int(time.time())),
    )
