package com.coliving.common.comment.adapter.out.jpa;

import com.coliving.common.CommunityJpaTestConfiguration;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.global.config.JpaConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({JpaConfig.class, CommunityJpaTestConfiguration.class})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
        "spring.profiles.active=test",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:test_comment_fetch;DB_CLOSE_DELAY=-1",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.properties.hibernate.default_batch_fetch_size=16"
})
class CommentPostAssociationIntegrationTest {

    @Autowired
    private CommentJpaRepository commentJpaRepository;

    @Autowired
    private PostJpaRepository postJpaRepository;

    @Autowired
    private EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void findCommentsByPost_withEntityGraph_doesNotNPlusOneWhenReadingPostId() {
        PostEntity post = new PostEntity();
        post.setUserId(1L);
        post.setCategory("FREE");
        post.setTitle("t");
        post.setContent("c");
        post.setAttachments(objectMapper.createArrayNode());
        post.setLinks(objectMapper.createArrayNode());
        post = postJpaRepository.save(post);

        for (int i = 0; i < 5; i++) {
            CommentEntity c = new CommentEntity();
            c.setPost(postJpaRepository.getReferenceById(post.getPostId()));
            c.setUserId(2L);
            c.setContent("c" + i);
            commentJpaRepository.save(c);
        }
        entityManager.flush();
        entityManager.clear();

        SessionFactory sf = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        Statistics stats = sf.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        List<CommentEntity> list = commentJpaRepository.findByPost_PostId(
                post.getPostId(),
                Sort.by(Sort.Direction.ASC, "createdAt")
        );

        long afterSelect = stats.getPrepareStatementCount();
        assertThat(list).hasSize(5);
        for (CommentEntity e : list) {
            assertThat(e.getPostId()).isEqualTo(post.getPostId());
        }
        long afterIterate = stats.getPrepareStatementCount();

        assertThat(afterIterate - afterSelect).isZero();
    }
}
