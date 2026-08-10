package com.petzoe.api.mapper;

import com.petzoe.api.dto.*;
import com.petzoe.api.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO dto, Category category, User seller) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setShortDescription(dto.getShortDescription());
        product.setDescription(dto.getDescription());
        product.setBrand(dto.getBrand());
        product.setPrice(dto.getPrice());
        product.setMrp(dto.getMrp());
        
        if (dto.getMrp() != null && dto.getPrice() != null && dto.getMrp() > 0) {
            double discount = dto.getMrp() - dto.getPrice();
            product.setDiscountPrice(discount > 0 ? dto.getPrice() : null);
        }
        
        product.setSku(dto.getSku());
        product.setStockQuantity(dto.getStockQuantity());
        if (dto.getLowStockThreshold() != null) {
            product.setLowStockThreshold(dto.getLowStockThreshold());
        }
        product.setCategory(category);
        product.setSubcategory(dto.getSubcategory());
        product.setPetType(dto.getPetType());
        product.setLifeStage(dto.getLifeStage());
        product.setSeller(seller);
        
        product.setWeight(dto.getWeight());
        product.setPackageLength(dto.getPackageLength());
        product.setPackageWidth(dto.getPackageWidth());
        product.setPackageHeight(dto.getPackageHeight());
        product.setReturnEligible(dto.getReturnEligible() != null ? dto.getReturnEligible() : false);
        product.setReplacementEligible(dto.getReplacementEligible() != null ? dto.getReplacementEligible() : false);

        if (dto.getImages() != null) {
            product.setImages(dto.getImages().stream().map(imgDto -> {
                ProductImage img = new ProductImage();
                img.setImageUrl(imgDto.getImageUrl());
                img.setIsPrimary(imgDto.getIsPrimary());
                img.setSortOrder(imgDto.getSortOrder());
                img.setProduct(product);
                return img;
            }).collect(Collectors.toList()));
            
            // Legacy imageUrl support
            dto.getImages().stream().filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).findFirst().ifPresent(primary -> {
                product.setImageUrl(primary.getImageUrl());
            });
        }

        if (dto.getVariants() != null) {
            product.setVariants(dto.getVariants().stream().map(vDto -> {
                ProductVariant v = new ProductVariant();
                v.setSku(vDto.getSku());
                v.setSize(vDto.getSize());
                v.setColor(vDto.getColor());
                v.setFlavor(vDto.getFlavor());
                v.setPrice(vDto.getPrice());
                v.setStockQuantity(vDto.getStockQuantity());
                v.setImageUrl(vDto.getImageUrl());
                v.setProduct(product);
                return v;
            }).collect(Collectors.toList()));
        }

        return product;
    }

    public ProductSummaryDTO toSummaryDTO(Product product) {
        ProductSummaryDTO dto = new ProductSummaryDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setStatus(product.getStatus());
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        
        if (product.getStockQuantity() <= 0) {
            dto.setInventoryStatus("OUT OF STOCK");
        } else if (product.getStockQuantity() <= product.getLowStockThreshold()) {
            dto.setInventoryStatus("LOW STOCK");
        } else {
            dto.setInventoryStatus("IN STOCK");
        }
        return dto;
    }

    public ProductResponseDTO toResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setShortDescription(product.getShortDescription());
        dto.setDescription(product.getDescription());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setMrp(product.getMrp());
        dto.setSku(product.getSku());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setLowStockThreshold(product.getLowStockThreshold());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSubcategory(product.getSubcategory());
        dto.setPetType(product.getPetType());
        dto.setLifeStage(product.getLifeStage());
        dto.setStatus(product.getStatus());
        dto.setRejectionReason(product.getRejectionReason());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        if (product.getMrp() != null && product.getPrice() != null && product.getMrp() > 0) {
            dto.setDiscountPercentage(((product.getMrp() - product.getPrice()) / product.getMrp()) * 100);
        }

        if (product.getStockQuantity() <= 0) {
            dto.setInventoryStatus("OUT OF STOCK");
        } else if (product.getStockQuantity() <= product.getLowStockThreshold()) {
            dto.setInventoryStatus("LOW STOCK");
        } else {
            dto.setInventoryStatus("IN STOCK");
        }

        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream().map(img -> {
                ProductImageDTO imgDto = new ProductImageDTO();
                imgDto.setId(img.getId());
                imgDto.setImageUrl(img.getImageUrl());
                imgDto.setIsPrimary(img.getIsPrimary());
                imgDto.setSortOrder(img.getSortOrder());
                return imgDto;
            }).collect(Collectors.toList()));
        }

        if (product.getVariants() != null) {
            dto.setVariants(product.getVariants().stream().map(v -> {
                ProductVariantDTO vDto = new ProductVariantDTO();
                vDto.setId(v.getId());
                vDto.setSku(v.getSku());
                vDto.setSize(v.getSize());
                vDto.setColor(v.getColor());
                vDto.setFlavor(v.getFlavor());
                vDto.setPrice(v.getPrice());
                vDto.setStockQuantity(v.getStockQuantity());
                vDto.setImageUrl(v.getImageUrl());
                return vDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
