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

router = APIRouter(prefix="/ai-integrations", tags=["ai-integrations"])

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/health")
async def ai_health_check():
    """
    Verify that the Gemini API key is configured and that a round-trip to the model works. Returns the model name and a short echo response.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not set."
        )
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            api_key=gemini_api_key,
            temperature=0,
            max_tokens=64,
        )
        response = await llm.ainvoke([HumanMessage(content="Reply with this phrase: Hello there.")])
        return {
            "status": "ok",
            "model": "gemini-2.5-flash",
            "echo": response.content.strip(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini connectivity error: {str(exc)}"
        )
        