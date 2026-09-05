package com.railway.reservation_service.feign;

import com.railway.reservation_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "userservice")
public interface IUserClient {
    @GetMapping("/api/v1/users/getUserByUserName")
    ResponseEntity<UserDTO> getUserByUserName(@RequestParam("userName") String userName);
}
