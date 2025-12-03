package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.eventease251.entity.Event;
import org.minhtrinh.eventease251.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
public class EventController {


}

