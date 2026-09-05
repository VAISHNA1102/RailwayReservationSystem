package com.railway.api_gateway.feign;

import com.railway.api_gateway.dto.UserClientDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Component


@FeignClient(name = "userservice")
public interface UserClient {

    @GetMapping("/api/v1/users/getUserByEmail")
    ResponseEntity<UserClientDTO> getUserByEmail(@RequestParam("email") String email);
}

