package com.petzoe.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path rootUploads = Paths.get("uploads").toAbsolutePath().normalize();
        Path backendUploads = Paths.get("backend/uploads").toAbsolutePath().normalize();
        Path parentUploads = Paths.get("../uploads").toAbsolutePath().normalize();

        List<String> locations = new ArrayList<>();
        addLocationIfValid(locations, rootUploads);
        addLocationIfValid(locations, backendUploads);
        addLocationIfValid(locations, parentUploads);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]))
                .setCachePeriod(3600);
    }

    private void addLocationIfValid(List<String> locations, Path path) {
        String uri = path.toUri().toString();
        if (!uri.endsWith("/")) {
            uri += "/";
        }
        if (!locations.contains(uri)) {
            locations.add(uri);
        }
    }
}
