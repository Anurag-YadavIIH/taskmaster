package com.airtribe.taskmaster.security;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * JWTs are stateless, so a token stays valid until it expires. To support an
 * explicit "logout", we keep an in-memory set of revoked tokens and reject any
 * request that presents one.
 *
 * Note: an in-memory store resets on restart and does not span multiple
 * instances. For production this would be backed by Redis with a TTL equal to
 * the token's remaining lifetime — the interface here stays the same.
 */
@Component
public class TokenBlacklist {

    private final Set<String> revoked = Collections.synchronizedSet(new HashSet<>());

    public void revoke(String token) {
        revoked.add(token);
    }

    public boolean isRevoked(String token) {
        return revoked.contains(token);
    }
}
