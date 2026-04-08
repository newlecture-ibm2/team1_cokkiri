package com.coliving.common.notification.config;

import com.coliving.common.notification.application.service.NotificationRealtimeFanoutService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class NotificationRedisSubscriberConfig {

    @Bean
    public MessageListenerAdapter notificationMessageListenerAdapter(
            NotificationRealtimeFanoutService fanoutService
    ) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(fanoutService, "onMessage");
        adapter.setSerializer(StringRedisSerializer.UTF_8);
        return adapter;
    }

    @Bean
    public RedisMessageListenerContainer notificationRedisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter notificationMessageListenerAdapter
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(
                notificationMessageListenerAdapter,
                new PatternTopic(NotificationRealtimeFanoutService.CHANNEL)
        );
        return container;
    }
}
