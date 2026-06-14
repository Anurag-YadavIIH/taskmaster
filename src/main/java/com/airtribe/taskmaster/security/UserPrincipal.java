package com.airtribe.taskmaster.security;

import com.airtribe.taskmaster.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapts our {@link User} entity to Spring Security's {@link UserDetails}.
 * Carries the user id so controllers can identify the caller without an extra
 * database lookup.
 */
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String passwordHash;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.passwordHash = user.getPasswordHash();
    }

    public Long getId() { return id; }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
