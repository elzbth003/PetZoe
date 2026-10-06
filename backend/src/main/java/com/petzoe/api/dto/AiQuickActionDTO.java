package com.petzoe.api.dto;

public class AiQuickActionDTO {
    private String label;
    private String prompt;
    private String actionType; // "PROMPT", "NAVIGATE", "CALL_TOOL"
    private String targetUrl;

    public AiQuickActionDTO() {}

    public AiQuickActionDTO(String label, String prompt, String actionType, String targetUrl) {
        this.label = label;
        this.prompt = prompt;
        this.actionType = actionType;
        this.targetUrl = targetUrl;
    }

    public static AiQuickActionDTO promptAction(String label, String prompt) {
        return new AiQuickActionDTO(label, prompt, "PROMPT", null);
    }

    public static AiQuickActionDTO navigateAction(String label, String targetUrl) {
        return new AiQuickActionDTO(label, null, "NAVIGATE", targetUrl);
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
}
