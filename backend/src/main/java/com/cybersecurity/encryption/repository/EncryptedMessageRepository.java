package com.cybersecurity.encryption.repository;

import com.cybersecurity.encryption.entity.EncryptedMessage;
import com.cybersecurity.encryption.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EncryptedMessageRepository extends JpaRepository<EncryptedMessage, Long> {

    Page<EncryptedMessage> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<EncryptedMessage> findByUserAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(User user, String title,
            Pageable pageable);

    Long countByUser(User user);
}
