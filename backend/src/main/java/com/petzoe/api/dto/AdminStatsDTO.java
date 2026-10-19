package com.petzoe.api.dto;

public class AdminStatsDTO {
    private long totalUsers;
    private long totalPetOwners;
    private long pendingVets;
    private long verifiedVets;
    private long pendingShelters;
    private long pendingSellers;
    private long pendingProducts;
    private long activeAdoptionPets;
    private long totalShelters;
    private long totalAdopters;
    private long totalAdoptionApplications;
    private long pendingAdoptionListings;

    // Additional genuine platform operational metrics
    private long totalPets;
    private long totalAppointments;
    private long completedAppointments;
    private long pendingAppointments;
    private long cancelledAppointments;
    private long totalOrders;
    private double grossOrderRevenue;
    private long totalAiConversations;
    private long totalAiMessages;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalPetOwners() { return totalPetOwners; }
    public void setTotalPetOwners(long totalPetOwners) { this.totalPetOwners = totalPetOwners; }

    public long getPendingVets() { return pendingVets; }
    public void setPendingVets(long pendingVets) { this.pendingVets = pendingVets; }

    public long getVerifiedVets() { return verifiedVets; }
    public void setVerifiedVets(long verifiedVets) { this.verifiedVets = verifiedVets; }

    public long getPendingShelters() { return pendingShelters; }
    public void setPendingShelters(long pendingShelters) { this.pendingShelters = pendingShelters; }

    public long getPendingSellers() { return pendingSellers; }
    public void setPendingSellers(long pendingSellers) { this.pendingSellers = pendingSellers; }

    public long getPendingProducts() { return pendingProducts; }
    public void setPendingProducts(long pendingProducts) { this.pendingProducts = pendingProducts; }

    public long getActiveAdoptionPets() { return activeAdoptionPets; }
    public void setActiveAdoptionPets(long activeAdoptionPets) { this.activeAdoptionPets = activeAdoptionPets; }

    public long getTotalShelters() { return totalShelters; }
    public void setTotalShelters(long totalShelters) { this.totalShelters = totalShelters; }

    public long getTotalAdopters() { return totalAdopters; }
    public void setTotalAdopters(long totalAdopters) { this.totalAdopters = totalAdopters; }

    public long getTotalAdoptionApplications() { return totalAdoptionApplications; }
    public void setTotalAdoptionApplications(long totalAdoptionApplications) { this.totalAdoptionApplications = totalAdoptionApplications; }

    public long getPendingAdoptionListings() { return pendingAdoptionListings; }
    public void setPendingAdoptionListings(long pendingAdoptionListings) { this.pendingAdoptionListings = pendingAdoptionListings; }

    public long getTotalPets() { return totalPets; }
    public void setTotalPets(long totalPets) { this.totalPets = totalPets; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getPendingAppointments() { return pendingAppointments; }
    public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }

    public long getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public double getGrossOrderRevenue() { return grossOrderRevenue; }
    public void setGrossOrderRevenue(double grossOrderRevenue) { this.grossOrderRevenue = grossOrderRevenue; }

    public long getTotalAiConversations() { return totalAiConversations; }
    public void setTotalAiConversations(long totalAiConversations) { this.totalAiConversations = totalAiConversations; }

    public long getTotalAiMessages() { return totalAiMessages; }
    public void setTotalAiMessages(long totalAiMessages) { this.totalAiMessages = totalAiMessages; }
}
