#!/usr/bin/env python3
"""
PetZoe Veterinary AI - LLM Fine-Tuning Pipeline
Supports:
1. Google AI Studio / Vertex AI Gemini Supervised Fine-Tuning
2. Open-Source QLoRA Fine-Tuning (LLaMA-3-8B-Instruct / Mistral-7B) via Unsloth & HuggingFace TRL
"""

import os
import sys
import json
import argparse

def validate_dataset(jsonl_path):
    print(f"[*] Validating veterinary dataset: {jsonl_path}")
    if not os.path.exists(jsonl_path):
        print(f"[!] Error: Dataset file not found at {jsonl_path}")
        sys.exit(1)

    count = 0
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                messages = data.get("messages", [])
                if len(messages) < 2:
                    print(f"[!] Line {idx}: Conversation has fewer than 2 messages.")
                    continue
                roles = [m.get("role") for m in messages]
                if "user" not in roles or "assistant" not in roles:
                    print(f"[!] Line {idx}: Missing user or assistant role.")
                    continue
                count += 1
            except Exception as e:
                print(f"[!] Error parsing line {idx}: {e}")
                sys.exit(1)

    print(f"[OK] Successfully validated {count} multi-turn veterinary clinical instruction pairs.")
    return count

def run_qlora_training(dataset_path, base_model, output_dir, epochs=3, batch_size=2):
    try:
        import torch
        from unsloth import FastLanguageModel
        from datasets import load_dataset
        from trl import SFTTrainer
        from transformers import TrainingArguments
    except ImportError:
        print("\n[!] PyTorch / Unsloth / TRL are not installed in the local environment.")
        print("[*] To run QLoRA training on an NVIDIA GPU or Google Colab, execute:")
        print("    pip install unsloth \"transformers==4.40.0\" trl datasets torch torchvision\n")
        print("[*] You can upload 'petzoe_veterinary_fine_tuning.jsonl' directly to Google Colab or Kaggle GPU!")
        return

    print(f"\n[*] Initializing QLoRA fine-tuning with base model: {base_model}")
    max_seq_length = 2048
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=base_model,
        max_seq_length=max_seq_length,
        dtype=None,
        load_in_4bit=True,
    )

    model = FastLanguageModel.get_peft_model(
        model,
        r=16,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_alpha=16,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
    )

    dataset = load_dataset("json", data_files=dataset_path, split="train")

    def format_prompts(batch):
        convos = batch["messages"]
        texts = [tokenizer.apply_chat_template(c, tokenize=False, add_generation_prompt=False) for c in convos]
        return {"text": texts}

    dataset = dataset.map(format_prompts, batched=True)

    training_args = TrainingArguments(
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        num_train_epochs=epochs,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=5,
        output_dir=output_dir,
        optim="adamw_8bit"
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        args=training_args,
    )

    print("[*] Launching training loop...")
    trainer.train()

    merged_path = os.path.join(output_dir, "merged_16bit")
    print(f"[*] Saving merged model to {merged_path}...")
    model.save_pretrained_merged(merged_path, tokenizer, save_method="merged_16bit")
    print("[OK] Model successfully fine-tuned and merged!")

def prepare_gemini_format(input_jsonl, output_jsonl):
    print(f"[*] Converting {input_jsonl} to Google Gemini Fine-Tuning format...")
    gemini_data = []
    with open(input_jsonl, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            messages = item.get("messages", [])
            contents = []
            for msg in messages:
                role = msg.get("role")
                text = msg.get("content")
                if role == "system":
                    continue  # Gemini tuning includes system prompt via instruction or prepends to user
                gemini_role = "user" if role == "user" else "model"
                contents.append({
                    "role": gemini_role,
                    "parts": [{"text": text}]
                })
            if contents:
                gemini_data.append({"contents": contents})

    with open(output_jsonl, "w", encoding="utf-8") as out:
        for row in gemini_data:
            out.write(json.dumps(row) + "\n")

    print(f"[OK] Converted {len(gemini_data)} examples to Gemini tuning format: {output_jsonl}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PetZoe Veterinary LLM Fine-Tuning Pipeline")
    parser.add_argument("--data", default="backend/src/main/resources/data/petzoe_veterinary_fine_tuning.jsonl", help="Path to jsonl dataset")
    parser.add_argument("--model", default="unsloth/llama-3-8b-Instruct-bnb-4bit", help="Base model identifier")
    parser.add_argument("--output", default="petzoe-llama3-veterinary", help="Output directory")
    parser.add_argument("--convert-gemini", action="store_true", help="Convert dataset to Google Gemini format")

    args = parser.parse_args()
    validate_dataset(args.data)

    if args.convert_gemini:
        gemini_out = args.data.replace(".jsonl", "_gemini.jsonl")
        prepare_gemini_format(args.data, gemini_out)
    else:
        run_qlora_training(args.data, args.model, args.output)
