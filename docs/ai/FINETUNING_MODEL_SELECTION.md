# PetZoe — Veterinary LLM Fine-Tuning Model Selection

**Document Version:** 1.0  
**Verification Date:** 2026-10-23  
**Status:** Approved Architectural Decision  
**Target System:** PetZoe Veterinary Healthcare AI Assistant  

---

## 1. Candidate Models and Providers

| Dimension | Route A: Managed Google Gemini Tuning | Route B: Open-Weight QLoRA (LLaMA-3 / Qwen-2.5) |
| :--- | :--- | :--- |
| **Primary Base Model** | `gemini-1.5-flash-001` (or `gemini-1.5-flash-002`) | `meta-llama/Meta-Llama-3-8B-Instruct` (alt: `Qwen/Qwen2.5-7B-Instruct`) |
| **Provider / Platform** | Google AI Studio & Google Cloud Vertex AI | Self-hosted via vLLM / Ollama (trained via Unsloth/TRL) |
| **Official Documentation** | [Google AI Studio Model Tuning](https://ai.google.dev/gemini-api/docs/model-tuning)<br>[Vertex AI Gemini Supervised Tuning](https://cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-supervised-tuning) | [Meta Llama 3 Community License](https://llama.meta.com/llama3/license/)<br>[Hugging Face TRL SFTTrainer](https://huggingface.co/docs/trl/sft_trainer) |
| **License & Commercial Terms** | Commercial use permitted under Google Cloud API Terms of Service. Customer data is not used to train Google foundation models. | Meta Llama 3 Community License (Permitted for commercial use up to 700M monthly active users). Apache 2.0 for Qwen 2.5. |
| **Hardware Requirements** | **Zero local GPU required.** Managed training on Google Cloud TPU infrastructure. | Requires $\ge 16\text{ GB}$ VRAM for QLoRA 4-bit (NVIDIA RTX 3090/4090 or Google Colab T4/A100). |
| **Training Format** | JSONL: `{"contents": [{"role": "user", "parts": [...]}, {"role": "model", "parts": [...]}]}` | JSONL: `{"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}` |
| **Inference Cost** | Standard Gemini API inference pricing: ~$0.075 / 1M input tokens, ~$0.30 / 1M output tokens. Free tier available. | Self-hosted VM or GPU instance ($0.40–$1.20 / hour) or local server power/maintenance. |
| **Backend Integration** | Direct drop-in via existing `GeminiChatModelService.java` using `tunedModels/{modelName}` resource path. | Requires OpenAI-compatible adapter (`/v1/chat/completions`) or local Ollama proxy. |

---

## 2. Compatibility and Licensing Findings

### Route A: Managed Gemini Fine-Tuning (Google Cloud Vertex AI / AI Studio)
- **Lifecycle & Deprecation Notice (2026 Status):**
  - Supervised fine-tuning (SFT) for `gemini-1.5-flash-001` in the public web-based **Google AI Studio was officially deprecated in mid-2025**.
  - Current managed tuning for Gemini models is hosted on **Google Cloud Vertex AI** (Gemini Enterprise Agent Platform) supporting newer model architectures (`gemini-2.0-flash`, `gemini-2.5-flash`, etc.).
  - Legacy inference against pre-existing `tunedModels/` remains accessible via API keys, but new managed tuning jobs must target Vertex AI or compatible endpoints.
- **Modality Support:** Multi-turn text conversation and clinical Q&A. System instructions and safety threshold configurations are supported.
- **Hyperparameter Limits:**
  - Epochs: $1$ to $10$ (recommended: $3$ to $5$ for veterinary clinical instructions to prevent catastrophic forgetting).
  - Learning Rate Multiplier: $0.1$ to $10.0$ (default: $1.0$).
  - Batch Size: Automatic or configurable ($4$ to $16$).
- **Resource Naming:** Tuned models are assigned a canonical URI:
  - Google AI Studio (legacy/compatible): `tunedModels/{custom-model-id}`
  - Vertex AI: `projects/{PROJECT_NUMBER}/locations/{REGION}/models/{MODEL_ID}` or `endpoints/{ENDPOINT_ID}`
- **Authentication & Endpoints:**
  - AI Studio: Invoked via standard API key at `https://generativelanguage.googleapis.com/v1beta/tunedModels/{modelName}:generateContent?key={apiKey}`.
  - Vertex AI: Invoked via Google Cloud OAuth2 Bearer Token at `https://{REGION}-aiplatform.googleapis.com/v1/projects/...`.

### Route B: Open-Weight QLoRA (LLaMA-3-8B-Instruct)
- **Local Developer Environment Verification:**
  - Inspection of the current development workstation confirmed: Windows OS, no NVIDIA CUDA toolkit, and no PyTorch installation (`nvidia-smi` not found).
  - Local GPU training is **not feasible on this machine**.
  - However, the training script `backend/src/main/resources/scripts/fine_tune_petzoe_llm.py` can be executed on a cloud GPU (Google Colab T4/A100, RunPod, or AWS EC2 `g5.xlarge`).
- **Serving Architecture:**
  - A merged 16-bit or 4-bit GGUF model must be served via **Ollama** (`http://localhost:11434/v1`) or **vLLM** (`http://localhost:8000/v1`).
  - Spring Boot backend requires an HTTP adapter to serialize requests to `/v1/chat/completions` and parse OpenAI-compatible JSON responses.

---

## 3. Recommended Route and Architectural Rationale

### **Primary Recommendation: Route A (Managed Gemini 1.5 Flash Supervised Fine-Tuning)**

**Rationale:**
1. **Zero Infrastructure Overhead:** Eliminates the need to maintain, monitor, and pay for 24/7 dedicated GPU hosting for an academic/production environment.
2. **Native PetZoe Architecture Alignment:** PetZoe's `GeminiChatModelService.java` is already wired to the Google Gemini API. Enabling the tuned model only requires pointing the model name to `tunedModels/{tunedModelName}` without introducing new microservices.
3. **Low Latency & High Concurrency:** Managed Google infrastructure handles auto-scaling, rate limiting, and zero-maintenance uptime.
4. **Safety Filter Integration:** Gemini provides native safety threshold filters (Hate Speech, Harassment, Sexual Content, Dangerous Content) which complement PetZoe's `ChatSafetyService`.

### **Secondary Fallback: Route B (Open-Weight Adapter via vLLM / Ollama)**
To ensure PetZoe avoids vendor lock-in, the backend is enhanced with an OpenAI-compatible adapter supporting `petzoe.ai.provider=LOCAL_LLM` pointing to any self-hosted vLLM/Ollama instance.

---

## 4. Known Limitations and Unresolved Prerequisites

1. **Dataset Volume:** Fine-tuning requires at least 100+ vetted conversational pairs (and ideally 500+) to produce statistically significant behavioral improvement over prompt engineering alone.
2. **Evaluation Gates:** A tuned model must not be deployed directly to users without passing automated safety, citation, and factual accuracy gates.
3. **Rollback Mechanism:** The Spring Boot backend must maintain an automated circuit-breaker that falls back to the base `gemini-1.5-flash` model or local rule engine if the tuned model returns an error.
