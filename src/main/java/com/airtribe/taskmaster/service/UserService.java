package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.UpdateProfileRequest;
import com.airtribe.taskmaster.dto.response.UserResponse;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.exception.ResourceNotFoundException;
import com.airtribe.taskmaster.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Profile read/update operations for the authenticated user. */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = findUser(userId);
        if (req.fullName() != null) user.setFullName(req.fullName());
        if (req.bio() != null) user.setBio(req.bio());
        return UserResponse.from(userRepository.save(user));
    }

    /** Shared lookup used by other services to resolve a user or 404. */
    public User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    public UserRepository repository() {
        return userRepository;
    }
}
