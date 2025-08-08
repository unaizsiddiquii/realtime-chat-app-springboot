package com.chat.app.service;

import com.chat.app.model.ChatMessage;
import com.chat.app.repository.ChatMessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    private final ChatMessageRepository repo;

    public ChatService(ChatMessageRepository repo) {
        this.repo = repo;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        if (message.getTimestamp() == null) message.setTimestamp(LocalDateTime.now());
        return repo.save(message);
    }

    public List<ChatMessage> getRecentMessage(int limit) {
        if (limit <= 0) limit = 50;
        return repo.findAll(PageRequest.of(0, limit, Sort.by("timestamp").ascending())).getContent();
    }
}
