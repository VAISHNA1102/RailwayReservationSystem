package com.railway.payment_service.feign;

import com.railway.payment_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "userservice")
public interface UserClient {

    @GetMapping("/api/v1/users/getUserByUserName")
    ResponseEntity<UserDTO> getUserByUserName(@RequestParam("userName") String userName);
}