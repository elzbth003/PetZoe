package com.petzoe.api.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers Hibernate6Module so Jackson can serialize entities with un-initialized
 * lazy associations (e.g. Order.user) safely, instead of trying to serialize the raw
 * Hibernate proxy and failing on its internal fields (ByteBuddyInterceptor).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        // spring.jpa.open-in-view keeps the session open through serialization, so it's
        // safe to force-load lazy associations here rather than silently nulling them out.
        module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}
